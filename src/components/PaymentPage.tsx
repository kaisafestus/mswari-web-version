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

  // Check payment confirmation status
  const handleCheckPaymentStatus = async () => {
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/payments/verify-status', {
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
            'Malipo bado hayajathibitishwa. Tafadhali hakikisha umeweka PIN yako ya M-PESA kwenye simu yako, kisha bonyeza kukagua tena.'
        );
      }
    } catch (err: any) {
      setVerificationError('Imeshindwa kukagua hali ya malipo kwa sasa. Tafadhali jaribu tena.');
    } finally {
      setIsVerifying(false);
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

      {/* STK Push Active Status Card */}
      {stkSent ? (
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/70 p-4 mb-4 text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-bold text-base text-emerald-900 mb-1">
            STK Push Imetumwa Kwenye Simu Yako!
          </h3>
          <p className="text-xs text-emerald-800 mb-3 max-w-sm mx-auto leading-relaxed">
            Tafadhali angalia simu yako <strong>{formatPhoneDisplay(application.formData.phone)}</strong> na uweke <strong>PIN yako ya M-PESA</strong> ili kukamilisha KSh {application.serviceFee}.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 mb-4 bg-white/80 py-1.5 px-3 rounded-lg border border-emerald-200 inline-flex">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Inasubiri uthibitisho wa PIN (zimesalia sekunde {pollCountdown})...</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              id="checkPaymentStatusBtn"
              className="btn btn-green btn-block !py-3 flex items-center justify-center gap-2"
              disabled={isVerifying}
              onClick={handleCheckPaymentStatus}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inakagua Uthibitisho...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Nishaweka PIN Yangu — Kagua Hali
                </>
              )}
            </button>

            <button
              type="button"
              className="w-full py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline transition-colors"
              onClick={handleInitiateSTK}
              disabled={loading}
            >
              Hujapata ujumbe? Bonyeza hapa kutuma tena STK Push
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
        <button
          type="button"
          id="continuePaymentBtn"
          className="btn btn-green btn-block payment-button mt-2"
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
    </div>
  );
};

