import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const UPESIPAY_AUTH_HEADER =
  process.env.UPESIPAY_AUTH_HEADER ||
  'Basic OHNqTUVmZlhaVDUzNS1vemQwYVc6Y1o1WmNyOEpDMU9TVTk5VVZrYlNwSjdHUElOTU9FUi1MRHhVazFibA==';
const UPESIPAY_CHANNEL_ID = Number(process.env.UPESIPAY_CHANNEL_ID) || 99;

// In-memory store for active payment requests and callbacks
interface TransactionRecord {
  checkout_request_id?: string;
  merchant_request_id?: string;
  reference_id?: string;
  phone_number: string;
  amount: number;
  status: 'sent' | 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout';
  message?: string;
  created_at: string;
  updated_at: string;
  raw_callback?: any;
}

const transactionStore = new Map<string, TransactionRecord>();

/**
 * Standardize phone number to Kenya 254XXXXXXXXX format
 */
function normalizeKenyanPhone(input: string): string {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '254' + digits.substring(1);
  }
  if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) {
    return '254' + digits;
  }
  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }
  return digits;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get active channel info
  app.get('/api/payments/channels', async (_req: Request, res: Response) => {
    try {
      const response = await fetch('https://upesipay.com/api/v2/payment_channels/', {
        headers: {
          Authorization: UPESIPAY_AUTH_HEADER,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.json({
        success: true,
        data: [{ id: UPESIPAY_CHANNEL_ID, channel_type: 'till', short_code: '1604117' }]
      });
    }
  });

  // Initiate real STK push via UpesiPay
  app.post('/api/payments/stk-push', async (req: Request, res: Response) => {
    try {
      const { phone_number, amount, loan_amount, customer_name, external_reference } = req.body;

      if (!phone_number) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required.'
        });
      }

      const normalizedPhone = normalizeKenyanPhone(phone_number);
      if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('254')) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Safaricom phone number (e.g. 0712345678 or 254712345678).'
        });
      }

      const payAmount = Number(amount) || 99;
      const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const callbackUrl = `${baseUrl}/api/payments/callback`;

      const payload = {
        channel_id: UPESIPAY_CHANNEL_ID,
        phone_number: normalizedPhone,
        amount: payAmount,
        callback_url: callbackUrl
      };

      console.log('Initiating STK push with UpesiPay:', JSON.stringify(payload));

      const upesiResponse = await fetch('https://upesipay.com/api/v2/collections/initiate/', {
        method: 'POST',
        headers: {
          Authorization: UPESIPAY_AUTH_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await upesiResponse.json();
      console.log('UpesiPay response:', JSON.stringify(data));

      if (data.success && data.data) {
        const checkoutRequestId = data.data.checkout_request_id || '';
        const merchantRequestId = data.data.merchant_request_id || '';

        const record: TransactionRecord = {
          checkout_request_id: checkoutRequestId,
          merchant_request_id: merchantRequestId,
          phone_number: normalizedPhone,
          amount: payAmount,
          status: 'sent',
          message: data.message || 'STK push sent successfully.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (checkoutRequestId) {
          transactionStore.set(checkoutRequestId, record);
        }
        if (merchantRequestId) {
          transactionStore.set(merchantRequestId, record);
        }
        transactionStore.set(normalizedPhone, record);

        return res.json({
          success: true,
          status_code: data.status_code || 200,
          message: data.message || 'STK push sent successfully. Enter your M-PESA PIN on your phone.',
          data: {
            checkout_request_id: checkoutRequestId,
            merchant_request_id: merchantRequestId,
            phone_number: normalizedPhone,
            amount: payAmount,
            status: 'sent',
            short_code: '1604117',
            channel_type: 'till'
          }
        });
      } else {
        return res.status(upesiResponse.status || 400).json({
          success: false,
          status_code: data.status_code || upesiResponse.status,
          message: data.message || 'Unable to initiate STK push at this time. Please try again.',
          error_code: data.error_code,
          details: data.details
        });
      }
    } catch (error: any) {
      console.error('Error initiating STK push:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error processing payment.'
      });
    }
  });

  // UpesiPay Payment Webhook Callback
  app.post('/api/payments/callback', (req: Request, res: Response) => {
    try {
      const { merchant_request_id, checkout_request_id, reference_id, status } = req.body;
      console.log('Payment callback received:', JSON.stringify(req.body));

      const key = checkout_request_id || reference_id || merchant_request_id;
      if (key && transactionStore.has(key)) {
        const existing = transactionStore.get(key)!;
        existing.status = status === 'success' ? 'success' : status || 'failed';
        existing.updated_at = new Date().toISOString();
        existing.raw_callback = req.body;
      } else if (key) {
        transactionStore.set(key, {
          checkout_request_id,
          merchant_request_id,
          reference_id,
          phone_number: '',
          amount: 0,
          status: status === 'success' ? 'success' : status || 'failed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          raw_callback: req.body
        });
      }

      res.status(200).json({ success: true, message: 'Callback processed' });
    } catch (err) {
      console.error('Callback error:', err);
      res.status(200).json({ success: true });
    }
  });

  // Query transaction status by checkout_request_id or phone
  app.get('/api/payments/status', async (req: Request, res: Response) => {
    try {
      const checkoutId = (req.query.checkoutId as string) || '';
      const phone = normalizeKenyanPhone((req.query.phone as string) || '');

      let localRecord = checkoutId ? transactionStore.get(checkoutId) : undefined;
      if (!localRecord && phone) {
        localRecord = transactionStore.get(phone);
      }

      if (localRecord && localRecord.status === 'success') {
        return res.json({
          success: true,
          status: 'success',
          data: localRecord
        });
      }

      // Check UpesiPay recent transactions list
      try {
        const upesiResponse = await fetch('https://upesipay.com/api/v2/transactions/', {
          headers: {
            Authorization: UPESIPAY_AUTH_HEADER,
            'Content-Type': 'application/json'
          }
        });
        const upesiData = await upesiResponse.json();

        if (upesiData.success && Array.isArray(upesiData.data)) {
          // Look for matching transaction
          const match = upesiData.data.find((tx: any) => {
            const txPhone = normalizeKenyanPhone(tx.phone_number || '');
            const phoneMatch = phone && txPhone === phone;
            const refMatch =
              (checkoutId && (tx.id === checkoutId || tx.reference === checkoutId)) ||
              (localRecord?.merchant_request_id && tx.merchant_request_id === localRecord.merchant_request_id);
            return phoneMatch || refMatch;
          });

          if (match && (match.status === 'success' || match.status === 'completed')) {
            if (localRecord) {
              localRecord.status = 'success';
              localRecord.updated_at = new Date().toISOString();
            }
            return res.json({
              success: true,
              status: 'success',
              data: {
                ...match,
                status: 'success'
              }
            });
          }
        }
      } catch (e) {
        // Fallback to local record status if external check fails
      }

      return res.json({
        success: true,
        status: localRecord?.status || 'pending',
        data: localRecord || { status: 'pending' }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Manual payment verification endpoint
  app.post('/api/payments/verify-manual', async (req: Request, res: Response) => {
    try {
      const { phone_number, checkout_request_id } = req.body;
      const normalized = normalizeKenyanPhone(phone_number || '');

      // Check UpesiPay transactions
      const upesiResponse = await fetch('https://upesipay.com/api/v2/transactions/', {
        headers: {
          Authorization: UPESIPAY_AUTH_HEADER,
          'Content-Type': 'application/json'
        }
      });
      const upesiData = await upesiResponse.json();

      if (upesiData.success && Array.isArray(upesiData.data)) {
        const match = upesiData.data.find((tx: any) => {
          const txPhone = normalizeKenyanPhone(tx.phone_number || '');
          return (
            (normalized && txPhone === normalized) ||
            (checkout_request_id && (tx.id === checkout_request_id || tx.reference === checkout_request_id))
          );
        });

        if (match && (match.status === 'success' || match.status === 'completed')) {
          return res.json({
            success: true,
            verified: true,
            status: 'success',
            data: match
          });
        }
      }

      // If no confirmed payment in gateway records yet
      return res.json({
        success: true,
        verified: false,
        status: 'pending',
        message: 'No completed transaction detected yet. Please ensure you entered your M-PESA PIN on your phone.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
