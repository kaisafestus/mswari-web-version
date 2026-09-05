import React from 'react';
import { LoanApplication } from '../types';
import { formatKES, formatPhoneDisplay } from '../data';

interface ResultPageProps {
  application: LoanApplication;
  isSuccess: boolean;
  onHome: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  application,
  isSuccess,
  onHome
}) => {
  return (
    <div className="form-wrap">
      <div className="card result-card text-center" id="result-card">
        {isSuccess ? (
          <>
            <div className="result-icon success" aria-hidden="true" id="result-success-icon">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h1 className="card-title">Loan Increment Approved!</h1>
            <p className="card-sub">
              Your M-Shwari loan limit has been updated to{' '}
              <strong className="text-emerald-800">{formatKES(application.amount)}</strong>.
            </p>

            <div className="summary-card text-left bg-emerald-50/50 rounded-xl p-4 my-4 border border-emerald-100 text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">Borrower:</span>
                <span className="font-bold text-stone-900">{application.formData.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">Phone:</span>
                <span className="font-bold text-stone-900">{formatPhoneDisplay(application.formData.phone)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">New Loan Limit:</span>
                <span className="font-bold text-emerald-700">{formatKES(application.amount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600">M-Pesa Reference:</span>
                <span className="font-mono font-bold text-stone-800">{application.reference}</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 mb-5">
              You will receive an official confirmation SMS from M-PESA shortly.
            </p>

            <button
              type="button"
              className="btn btn-green btn-block"
              onClick={onHome}
              id="result-home-btn"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <div className="result-icon failed" aria-hidden="true" id="result-failed-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <h1 className="card-title">Payment Unsuccessful</h1>
            <p className="card-sub">
              We could not verify your payment. Please try again.
            </p>
            <button
              type="button"
              className="btn btn-green btn-block"
              onClick={onHome}
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};
