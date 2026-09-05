import React from 'react';
import { StepProgress } from './StepProgress';
import { LoanApplication } from '../types';
import { formatKES } from '../data';

interface ConfirmApplicationProps {
  application: LoanApplication;
  onProceedToPayment: () => void;
  onGoBack: () => void;
}

export const ConfirmApplication: React.FC<ConfirmApplicationProps> = ({
  application,
  onProceedToPayment,
  onGoBack
}) => {
  return (
    <div className="form-wrap">
      <StepProgress currentStep={3} />

      <div className="card summary-card" id="confirm-step-card">
        <h1 className="card-title">Confirm Application</h1>
        <p className="card-sub">You are about to confirm your application.</p>

        <div className="confirm-note" id="confirm-note">
          <i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
          <span>Confirm the details below to continue to the M-pesa payment step.</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Requested Amount</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Service Fee</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="summary-row summary-total">
          <span className="summary-label">Total Service Fee</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-green btn-block"
            onClick={onProceedToPayment}
            id="confirm-app-btn"
          >
            Confirm Application
          </button>
          <button
            type="button"
            className="btn btn-outline-green btn-block"
            onClick={onGoBack}
            id="confirm-back-btn"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
