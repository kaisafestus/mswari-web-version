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
            <h1 className="card-title">Ongezeko la Mkopo Limeidhinishwa!</h1>
            <p className="card-sub">
              Kiwango chako cha mkopo wa M-Shwari kimesasishwa hadi{' '}
              <strong className="text-emerald-800">{formatKES(application.amount)}</strong>.
            </p>

            <div className="summary-card text-left bg-emerald-50/50 rounded-xl p-4 my-4 border border-emerald-100 text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">Mkopaji:</span>
                <span className="font-bold text-stone-900">{application.formData.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">Nambari ya Simu:</span>
                <span className="font-bold text-stone-900">{formatPhoneDisplay(application.formData.phone)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-stone-600">Kiwango Kipya cha Mkopo:</span>
                <span className="font-bold text-emerald-700">{formatKES(application.amount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-600">Kumbukumbu ya M-Pesa:</span>
                <span className="font-mono font-bold text-stone-800">{application.reference}</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 mb-5">
              Utapokea ujumbe rasmi wa uthibitisho (SMS) kutoka M-PESA hivi punde.
            </p>

            <button
              type="button"
              className="btn btn-green btn-block"
              onClick={onHome}
              id="result-home-btn"
            >
              Rudi Mwanzo
            </button>
          </>
        ) : (
          <>
            <div className="result-icon failed" aria-hidden="true" id="result-failed-icon">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <h1 className="card-title">Malipo Hayajakamilika</h1>
            <p className="card-sub">
              Hatujaweza kuthibitisha malipo yako. Tafadhali jaribu tena.
            </p>
            <button
              type="button"
              className="btn btn-green btn-block"
              onClick={onHome}
            >
              Rudi Mwanzo
            </button>
          </>
        )}
      </div>
    </div>
  );
};
