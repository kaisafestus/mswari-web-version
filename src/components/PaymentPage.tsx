import React, { useState, useEffect, useRef } from 'react';
import { LoanApplication } from '../types';
import { formatKES, formatPhoneDisplay } from '../data';
import { RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

interface PaymentPageProps {
  application: LoanApplication;
  onPaymentSuccess: (reference: string) => void;
  onPaymentFailure: (errorMsg: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  application,
  onPaymentSuccess,
  onPaymentFailure: _onPaymentFailure
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [stkSent, setStkSent] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll payment status while STK push is active (server-side verification)
  useEffect(() => {
    if (!stkSent) return;

    const checkStatus = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (checkoutRequestId) queryParams.append('checkoutId', checkoutRequestId);
        if (application.formData.phone) queryParams.append('phone', application.formData.phone);

        const res = await fetch(`/api/payments/status?${queryParams.toString()}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && (data.status === 'success' || data.status === 'completed')) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          const finalRef =
            data.data?.reference ||
            data.data?.id ||
            checkoutRequestId ||
            'MPESA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '9X';
          onPaymentSuccess(finalRef);
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    };

    // Check status every 3 seconds
    pollIntervalRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [stkSent, checkoutRequestId, application.formData.phone, onPaymentSuccess]);

  // Initiate real STK push via server endpoint
  const handleInitiateSTK = async () => {
    setLoading(true);
    setStatusMessage(null);
    setIsErrorMessage(false);

    try {
      const response = await fetch('/api/payments/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: application.formData.phone,
          amount: application.serviceFee,
          loan_amount: application.amount,
          customer_name: application.formData.fullName,
          id: application.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const reqId = data.data?.checkout_request_id || data.data?.merchant_request_id || '';
        setCheckoutRequestId(reqId);
        setStkSent(true);
        setStatusMessage(
          data.message ||
            `Ombi halisi la M-PESA STK Push limetumwa kwa ${formatPhoneDisplay(application.formData.phone)}. Tafadhali angalia skrini ya simu yako na uweke PIN yako.`
        );
        setIsErrorMessage(false);
      } else {
        setIsErrorMessage(true);
        setStatusMessage(
          data.message || 'Imeshindwa kutuma STK push. Tafadhali kagua nambari yako ya simu au ujaribu tena.'
        );
      }
    } catch (err: any) {
      console.error('STK push error:', err);
      setIsErrorMessage(true);
      setStatusMessage('Hitilafu ya mtandao katika kuwasiliana na mfumo wa malipo. Tafadhali jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h1>Kamilisha Malipo Yako</h1>
        <p>Tazama simu yako kupokea ujumbe rasmi wa malipo ya M-Pesa.</p>
      </div>

      <div className="payment-notice" id="payment-notice">
        <Smartphone className="w-5 h-5 text-emerald-700 shrink-0" />
        <div>
          Ombi la M-Pesa STK push litatumwa kwa{' '}
          <strong>{formatPhoneDisplay(application.formData.phone)}</strong>.
        </div>
      </div>

      <div className="payment-summary" id="payment-summary">
        <div className="summary-row">
          <span className="summary-label">Kiasi cha Malipo</span>
          <span className="summary-value font-bold text-emerald-800">{formatKES(application.serviceFee)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Nambari ya Simu</span>
          <span className="summary-value font-medium">{formatPhoneDisplay(application.formData.phone)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Nambari ya Kumbukumbu / Ombi</span>
          <span className="summary-value font-mono text-xs">
            {checkoutRequestId ? checkoutRequestId.substring(0, 20) + '...' : 'Inasubiri'}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Hali</span>
          <span className="summary-value font-bold">
            {stkSent ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                STK PUSH IMETUMWA
              </span>
            ) : (
              'INASUBIRI'
            )}
          </span>
        </div>
        <div className="summary-row provider-row">
          <span className="summary-label">Njia ya Malipo</span>
          <span className="summary-value flex items-center gap-1 font-semibold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Lipa na M-PESA Mtandaoni
          </span>
        </div>
      </div>

      <button
        type="button"
        id="continuePaymentBtn"
        className="btn btn-green btn-block payment-button mt-4"
        disabled={loading}
        onClick={handleInitiateSTK}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            INATUMA OMBI KWENYE SIMU...
          </span>
        ) : (
          `TUMA STK PUSH (${formatKES(application.serviceFee)})`
        )}
      </button>

      {statusMessage && (
        <div
          id="paymentStatusBox"
          className={`payment-error show ${!isErrorMessage ? '!bg-[#d9fbe5] !text-[#126b3a]' : ''}`}
          role="alert"
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

