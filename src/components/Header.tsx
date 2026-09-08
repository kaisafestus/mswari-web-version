import React from 'react';

interface HeaderProps {
  isForm?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isForm, onBack }) => {
  return (
    <header className={`app-header ${isForm ? 'app-header-form' : ''}`}>
      <div className="header-inner">
        {isForm ? (
          <>
            <button
              type="button"
              className="header-back"
              onClick={onBack}
              aria-label="Rudi nyuma"
              id="header-back-btn"
            >
              <i className="bi bi-arrow-left" aria-hidden="true"></i>
            </button>
            <span className="brand-name">M-SHWARI MKOPO</span>
            <span className="header-spacer" aria-hidden="true"></span>
          </>
        ) : (
          <>
            <div className="brand">
              <span className="brand-icon" aria-hidden="true">
                <i className="bi bi-shield-check"></i>
              </span>
              <span className="brand-name">M-SHWARI MKOPO</span>
            </div>
            <span className="secure-badge">
              <i className="bi bi-lock-fill" aria-hidden="true"></i> Salama
            </span>
          </>
        )}
      </div>
    </header>
  );
};
