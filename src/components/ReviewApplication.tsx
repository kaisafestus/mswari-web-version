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
        <h1 className="card-title">Review Your Application</h1>
        <p className="card-sub">Check the details below before continuing.</p>

        <div className="summary-row">
          <span className="summary-label">Loan Amount</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Service Fee</span>
          <span className="summary-value">{formatKES(application.serviceFee)}</span>
        </div>

        <div className="summary-row summary-total">
          <span className="summary-label">Total Amount</span>
          <span className="summary-value">{formatKES(application.amount)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Full Legal Name</span>
          <span className="summary-value">{application.formData.fullName}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Mobile Number</span>
          <span className="summary-value">{formatPhoneDisplay(application.formData.phone)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">County</span>
          <span className="summary-value">{application.formData.county}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">Reason</span>
          <span className="summary-value">{application.formData.loanReason}</span>
        </div>

        {application.formData.email && (
          <div className="summary-row">
            <span className="summary-label">Email</span>
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
            Edit Application
          </button>
          <button
            type="button"
            className="btn btn-green btn-block"
            onClick={onConfirm}
            id="review-confirm-btn"
          >
            Confirm &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
