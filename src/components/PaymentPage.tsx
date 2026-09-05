import React, { useState, useEffect, useRef } from 'react';
import { LoanApplication } from '../types';
import { formatKES, formatPhoneDisplay } from '../data';
import { CheckCircle2, AlertCircle, RefreshCw, Smartphone, ShieldCheck, Clock } from 'lucide-react';

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
  const [pollCountdown, setPollCountdown] = useState<number>(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll payment status while STK push is active
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

    // Initial check after 3 seconds, then every 3.5 seconds
    pollIntervalRef.current = setInterval(checkStatus, 3500);

    const timer = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      clearInterval(timer);
    };
  }, [stkSent, checkoutRequestId, application.formData.phone, onPaymentSuccess]);

  // Initiate real STK push via server endpoint
  const handleInitiateSTK = async () => {
    setLoading(true);
    setStatusMessage(null);
    setIsErrorMessage(false);
    setVerificationError(null);

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
        setPollCountdown(60);
        setStatusMessage(
          data.message ||
            `Real M-PESA STK Push has been sent to ${formatPhoneDisplay(application.formData.phone)}. Please check your phone screen and enter your PIN.`
        );
        setIsErrorMessage(false);
      } else {
        setIsErrorMessage(true);
        setStatusMessage(
          data.message || 'Failed to initiate STK push. Please check your phone number or try again.'
        );
      }
    } catch (err: any) {
      console.error('STK push error:', err);
      setIsErrorMessage(true);
      setStatusMessage('Network error communicating with payment server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual status verification trigger
  const handleManualVerify = async () => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/payments/verify-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: application.formData.phone,
          checkout_request_id: checkoutRequestId
        })
      });

      const data = await response.json();

      if (data.success && data.verified) {
        const finalRef =
          data.data?.reference ||
          data.data?.id ||
          checkoutRequestId ||
          'MPESA-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '9X';
        onPaymentSuccess(finalRef);
      } else {
        setVerificationError(
          data.message ||
            'Payment has not been detected yet. Please ensure you entered your M-PESA PIN on your phone, then tap Verify again.'
        );
      }
    } catch (err: any) {
      setVerificationError('Unable to check payment status right now. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
        <p>Check your phone for an official M-Pesa payment prompt.</p>
      </div>

      <div className="payment-notice" id="payment-notice">
        <Smartphone className="w-5 h-5 text-emerald-700 shrink-0" />
        <div>
          An M-Pesa STK push request will be sent to{' '}
          <strong>{formatPhoneDisplay(application.formData.phone)}</strong>.
        </div>
      </div>

      <div className="payment-summary" id="payment-summary">
        <div className="summary-row">
          <span className="summary-label">Payment Amount</span>
          <span className="summary-value font-bold text-emerald-800">{formatKES(application.serviceFee)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Phone Number</span>
          <span className="summary-value font-medium">{formatPhoneDisplay(application.formData.phone)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Reference / Request ID</span>
          <span className="summary-value font-mono text-xs">
            {checkoutRequestId ? checkoutRequestId.substring(0, 20) + '...' : 'Pending'}
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Status</span>
          <span className="summary-value font-bold">
            {stkSent ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                STK PUSH SENT
              </span>
            ) : (
              'PENDING'
            )}
          </span>
        </div>
        <div className="summary-row provider-row">
          <span className="summary-label">Payment Gateway</span>
          <span className="summary-value flex items-center gap-1 font-semibold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            M-PESA / UpesiPay
          </span>
        </div>
      </div>

      {/* STK Push Active Status Card */}
      {stkSent ? (
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-4 mb-4 text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-bold text-base text-emerald-900 mb-1">
            STK Push Sent to Your Phone!
          </h3>
          <p className="text-xs text-emerald-800 mb-3 max-w-sm mx-auto leading-relaxed">
            Please look at your mobile phone <strong>{formatPhoneDisplay(application.formData.phone)}</strong> and enter your <strong>M-PESA PIN</strong> to complete KSh {application.serviceFee}.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 mb-4 bg-white/80 py-1.5 px-3 rounded-lg border border-emerald-200 inline-flex">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Waiting for PIN confirmation ({pollCountdown}s remaining)...</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              id="manualVerifyBtn"
              className="btn btn-green btn-block !py-3 flex items-center justify-center gap-2"
              disabled={isVerifying}
              onClick={handleManualVerify}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Transaction...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  I Have Entered My PIN — Verify Payment
                </>
              )}
            </button>

            <button
              type="button"
              className="w-full py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline transition-colors"
              onClick={handleInitiateSTK}
              disabled={loading}
            >
              Didn't receive prompt? Tap here to resend STK Push
            </button>
          </div>

          {verificationError && (
            <div className="mt-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-2.5 flex items-start gap-1.5 text-left">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{verificationError}</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="payment-instructions" id="payment-instructions">
            <strong>How to complete payment:</strong>
            <ol>
              <li>Tap <strong>SEND STK PUSH</strong> below.</li>
              <li>A real M-Pesa prompt will pop up on your mobile phone screen.</li>
              <li>Enter your M-Pesa PIN on your phone.</li>
              <li>Wait while we automatically confirm your payment and approve your loan!</li>
            </ol>
          </div>

          <button
            type="button"
            id="continuePaymentBtn"
            className="btn btn-green btn-block payment-button"
            disabled={loading}
            onClick={handleInitiateSTK}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                SENDING REQUEST TO PHONE...
              </span>
            ) : (
              `SEND STK PUSH (${formatKES(application.serviceFee)})`
            )}
          </button>
        </>
      )}

      {statusMessage && (
        <div
          id="paymentStatusBox"
          className={`payment-error show ${!isErrorMessage ? '!bg-[#d9fbe5] !text-[#126b3a]' : ''}`}
          role="alert"
        >
          {statusMessage}
        </div>
      )}

      {/* Alternative Till Number fallback for complete reliability */}
      <div className="mt-5 pt-4 border-t border-stone-200 text-center">
        <p className="text-xs text-stone-500 font-medium mb-1">
          Alternative Manual Payment:
        </p>
        <p className="text-xs text-stone-600">
          M-PESA &gt; Lipa na M-PESA &gt; Buy Goods &gt; Till: <strong className="text-stone-900 font-bold font-mono">1604117</strong>
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Amount: {formatKES(application.serviceFee)} (Registration fee)
        </p>
      </div>
    </div>
  );
};

