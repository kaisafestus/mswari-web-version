import React, { useState } from 'react';
import { LOAN_OPTIONS, formatKSH } from '../data';
import { LiveActivityCard } from './LiveActivityCard';

interface LandingPageProps {
  onApply: (amount: number) => void;
  initialAmount?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onApply, initialAmount }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(initialAmount || null);

  const handleCardClick = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount) {
      onApply(selectedAmount);
    }
  };

  return (
    <div className="landing-wrap">
      {/* HERO */}
      <div className="hero text-center">
        <div className="hero-icon" aria-hidden="true" id="hero-icon">
          <i className="bi bi-wallet2"></i>
        </div>
        <h1 className="hero-title" id="hero-title">
          M-SHWARI MKOPO
        </h1>
        <p className="hero-sub" id="hero-sub">
          Omba kwa haraka na urahisi kutoka kwenye simu yako.
        </p>
      </div>

      {/* DISCLAIMER */}
      <div className="disclaimer-card" id="disclaimer-card">
        <i className="bi bi-info-circle" aria-hidden="true"></i>
        <p>
          Tafadhali kagua maelezo yote ya maombi kwa makini. Hii inafanywa kwa ajili ya kuwawezesha vijana na kizazi kijacho.
        </p>
      </div>

      {/* FEATURES */}
      <div className="feature-grid" id="feature-grid">
        <div className="feature-card" id="feature-secure">
          <span className="feature-icon" aria-hidden="true">
            <i className="bi bi-shield-check"></i>
          </span>
          <span>Salama</span>
        </div>
        <div className="feature-card" id="feature-fast">
          <span className="feature-icon" aria-hidden="true">
            <i className="bi bi-lightning-charge-fill"></i>
          </span>
          <span>Haraka</span>
        </div>
        <div className="feature-card" id="feature-simple">
          <span className="feature-icon" aria-hidden="true">
            <i className="bi bi-check2-square"></i>
          </span>
          <span>Rahisi</span>
        </div>
        <div className="feature-card" id="feature-support">
          <span className="feature-icon" aria-hidden="true">
            <i className="bi bi-headset"></i>
          </span>
          <span>Msaada</span>
        </div>
      </div>

      {/* COMPACT LIVE ACTIVITY */}
      <LiveActivityCard />

      {/* LOAN AMOUNT */}
      <h2 className="section-title" id="section-title">
        Chagua Kiasi cha Mkopo Wako
      </h2>

      {/* LOAN FORM */}
      <form id="loan-form" onSubmit={handleSubmit}>
        <input
          type="hidden"
          name="amount"
          id="selected-amount"
          value={selectedAmount || ''}
        />

        {/* LOAN OPTIONS */}
        <div className="loan-grid" id="loan-grid" role="radiogroup" aria-label="Chagua kiasi cha mkopo">
          {LOAN_OPTIONS.map((option) => {
            const isSelected = selectedAmount === option.amount;
            return (
              <button
                key={option.amount}
                type="button"
                className={`loan-card ${isSelected ? 'selected' : ''}`}
                data-amount={option.amount}
                aria-pressed={isSelected}
                aria-checked={isSelected}
                role="radio"
                tabIndex={0}
                id={`loan-card-${option.amount}`}
                onClick={() => handleCardClick(option.amount)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(option.amount);
                  }
                }}
              >
                <span className="loan-check" aria-hidden="true">
                  <i className="bi bi-check-lg"></i>
                </span>
                <span className="loan-amount">{option.label}</span>
                <span className="loan-fee">{option.feeText}</span>
              </button>
            );
          })}
        </div>

        {/* APPLY BUTTON */}
        <div className="apply-bar" id="apply-bar">
          <button
            type="submit"
            id="apply-btn"
            className="btn btn-green btn-block"
            disabled={!selectedAmount}
          >
            {selectedAmount ? `Omba ${formatKSH(selectedAmount)}` : 'Omba KSH —'}
          </button>
          {!selectedAmount && (
            <p className="apply-hint" id="apply-hint">
              Chagua kiasi cha mkopo ili kuendelea
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
