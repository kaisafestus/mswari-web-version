import React, { useState } from 'react';
import { StepProgress } from './StepProgress';
import { ApplicationFormData } from '../types';
import { formatKSH, KENYAN_COUNTIES, LOAN_REASONS } from '../data';

interface ApplicationFormProps {
  amount: number;
  initialData?: ApplicationFormData;
  onSubmit: (data: ApplicationFormData) => void;
  onBack: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  amount,
  initialData,
  onSubmit,
  onBack
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [county, setCounty] = useState(initialData?.county || '');
  const [loanReason, setLoanReason] = useState(initialData?.loanReason || '');
  const [email, setEmail] = useState(initialData?.email || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Tafadhali weka jina lako kamili rasmi kama linavyoonekana kwenye Kitambulisho chako.';
    }

    // Phone validation: Kenyan format 7XXXXXXXX or 1XXXXXXXX (9 digits) or 07...
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      errs.phone = 'Tafadhali weka nambari sahihi ya simu ya tarakimu 9 (mfano: 712345678).';
    }

    if (!county) {
      errs.county = 'Tafadhali chagua kaunti unayoishi.';
    }

    if (!loanReason) {
      errs.loanReason = 'Tafadhali chagua sababu ya mkopo.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        county,
        loanReason,
        email: email.trim()
      });
    }
  };

  return (
    <div className="form-wrap">
      <StepProgress currentStep={2} />

      <div className="card app-card" id="application-card">
        <h1 className="card-title">Kamilisha maombi yako</h1>
        <p className="loan-amount-line">
          Kiasi cha mkopo: <strong>{formatKSH(amount)}</strong>
        </p>

        <form onSubmit={handleSubmit} noValidate id="application-form">
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label" htmlFor="full_name">
              Jina Kamili Rasmi
            </label>
            <input
              autoComplete="name"
              className="form-control"
              id="full_name"
              maxLength={120}
              minLength={3}
              name="full_name"
              placeholder="Kama linavyoonekana kwenye Kitambulisho"
              required
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
            />
            {errors.fullName && <div className="field-error">{errors.fullName}</div>}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label" htmlFor="phone">
              Nambari ya M-PESA / Simu
            </label>
            <div className="input-group">
              <span className="input-group-text phone-prefix">+254</span>
              <input
                autoComplete="tel"
                className="form-control"
                id="phone"
                inputMode="numeric"
                name="phone"
                placeholder="7XXXXXXXX"
                required
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
              />
            </div>
            {errors.phone && <div className="field-error">{errors.phone}</div>}
            <div className="form-hint">
              Utakapopokea ombi la STK Push kwenye simu yako ya M-Pesa, weka PIN yako ya M-Pesa ili kukamilisha malipo ya ada ya huduma.
            </div>
          </div>

          {/* County */}
          <div className="mb-3">
            <label className="form-label" htmlFor="county">
              Kaunti Unayoishi
            </label>
            <select
              className="form-select"
              id="county"
              name="county"
              required
              value={county}
              onChange={(e) => {
                setCounty(e.target.value);
                if (errors.county) setErrors({ ...errors, county: '' });
              }}
            >
              <option value="">Chagua kaunti</option>
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.county && <div className="field-error">{errors.county}</div>}
          </div>

          {/* Loan Reason */}
          <div className="mb-3">
            <label className="form-label" htmlFor="loan_reason">
              Sababu ya Mkopo
            </label>
            <select
              className="form-select"
              id="loan_reason"
              name="loan_reason"
              required
              value={loanReason}
              onChange={(e) => {
                setLoanReason(e.target.value);
                if (errors.loanReason) setErrors({ ...errors, loanReason: '' });
              }}
            >
              <option value="">Chagua sababu</option>
              {LOAN_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.loanReason && <div className="field-error">{errors.loanReason}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Barua Pepe (hiari)
            </label>
            <input
              autoComplete="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="mfano@barua.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice" id="privacy-notice">
            <i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
            <span>
              Taarifa zako zimelindwa kwa usiri mkubwa. Iwapo utapata changamoto yoyote, tafadhali wasiliana na kitengo chetu cha usaidizi.
            </span>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline-green btn-block"
              onClick={onBack}
              id="app-back-btn"
            >
              Rudi
            </button>
            <button
              type="submit"
              className="btn btn-green btn-block"
              id="app-continue-btn"
            >
              Endelea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
