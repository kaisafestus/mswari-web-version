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
        <h1 className="card-title">Thibitisha Maombi</h1>
        <p className="card-sub">Uko karibu kuthibitisha maombi yako.</p>

        <div className="confirm-note" id="confirm-note">
          <i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
          <span>Thibitisha maelezo hapa chini ili uendelee kwenye hatua ya malipo ya M-Pesa.</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Kiasi Kilichoombwa</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Ada ya Huduma</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="summary-row summary-total">
          <span className="summary-label">Jumla ya Ada ya Huduma</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-green btn-block"
            onClick={onProceedToPayment}
            id="confirm-app-btn"
          >
            Thibitisha Maombi
          </button>
          <button
            type="button"
            className="btn btn-outline-green btn-block"
            onClick={onGoBack}
            id="confirm-back-btn"
          >
            Rudi Nyuma
          </button>
        </div>
      </div>
    </div>
  );
};
