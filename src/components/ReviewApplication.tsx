import React from 'react';
import { StepProgress } from './StepProgress';
import { LoanApplication } from '../types';
import { formatKES, formatPhoneDisplay } from '../data';

interface ReviewApplicationProps {
  application: LoanApplication;
  onEdit: () => void;
  onConfirm: () => void;
}

export const ReviewApplication: React.FC<ReviewApplicationProps> = ({
  application,
  onEdit,
  onConfirm
}) => {
  return (
    <div className="form-wrap">
      <StepProgress currentStep={3} />

      <div className="card summary-card" id="review-card">
        <h1 className="card-title">Kagua Maombi Yako</h1>
        <p className="card-sub">Thibitisha maelezo hapa chini kabla ya kuendelea.</p>

        <div className="summary-row">
          <span className="summary-label">Kiasi cha Mkopo</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Ada ya Huduma</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="summary-row summary-total">
          <span className="summary-label">Jumla ya Kiasi</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Jina Kamili Rasmi</span>
          <span className="summary-value">{application.formData.fullName}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Nambari ya Simu</span>
          <span className="summary-value">{formatPhoneDisplay(application.formData.phone)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Kaunti</span>
          <span className="summary-value">{application.formData.county}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Sababu</span>
          <span className="summary-value">{application.formData.loanReason}</span>
        </div>

        {application.formData.email && (
          <div className="summary-row">
            <span className="summary-label">Barua Pepe</span>
            <span className="summary-value">{application.formData.email}</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-green btn-block"
            onClick={onEdit}
            id="review-edit-btn"
          >
            Hariri Maombi
          </button>
          <button
            type="button"
            className="btn btn-green btn-block"
            onClick={onConfirm}
            id="review-confirm-btn"
          >
            Thibitisha &amp; Endelea
          </button>
        </div>
      </div>
    </div>
  );
};
