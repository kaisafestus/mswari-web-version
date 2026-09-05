import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ApplicationForm } from './components/ApplicationForm';
import { ReviewApplication } from './components/ReviewApplication';
import { ConfirmApplication } from './components/ConfirmApplication';
import { PaymentPage } from './components/PaymentPage';
import { ResultPage } from './components/ResultPage';
import { AppView, ApplicationFormData, LoanApplication } from './types';
import { getLoanOption } from './data';

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'landing' });
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [application, setApplication] = useState<LoanApplication | null>(null);

  // Initialize from URL search params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amountParam = params.get('amount');
    const path = window.location.pathname;

    if (amountParam && !isNaN(Number(amountParam))) {
      const amt = Number(amountParam);
      setSelectedAmount(amt);
      if (path.includes('apply') || params.get('step') === 'apply') {
        setView({ type: 'apply', amount: amt });
      }
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const step = currentParams.get('step');
      const amt = Number(currentParams.get('amount')) || 5000;

      if (!step || step === 'landing') {
        setView({ type: 'landing' });
      } else if (step === 'apply') {
        setView({ type: 'apply', amount: amt });
      } else if (step === 'review' && application) {
        setView({ type: 'review', id: application.id });
      } else if (step === 'confirm' && application) {
        setView({ type: 'confirm', id: application.id });
      } else if (step === 'payment' && application) {
        setView({ type: 'payment', id: application.id, ref: application.reference });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [application]);

  // Navigate helper that updates URL state
  const navigateTo = (newView: AppView) => {
    setView(newView);
    const url = new URL(window.location.href);

    if (newView.type === 'landing') {
      url.searchParams.delete('step');
      url.searchParams.delete('amount');
      window.history.pushState({}, '', url.pathname);
    } else if (newView.type === 'apply') {
      url.searchParams.set('step', 'apply');
      url.searchParams.set('amount', String(newView.amount));
      window.history.pushState({}, '', url.toString());
    } else if (newView.type === 'review') {
      url.searchParams.set('step', 'review');
      window.history.pushState({}, '', url.toString());
    } else if (newView.type === 'confirm') {
      url.searchParams.set('step', 'confirm');
      window.history.pushState({}, '', url.toString());
    } else if (newView.type === 'payment') {
      url.searchParams.set('step', 'payment');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Step 1: Select Loan
  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    navigateTo({ type: 'apply', amount });
  };

  // Step 2: Form submit
  const handleFormSubmit = (formData: ApplicationFormData) => {
    const loanOption = getLoanOption(selectedAmount);
    const appId = String(Math.floor(180 + Math.random() * 50));
    const paymentId = String(Math.floor(150 + Math.random() * 50));
    const newApp: LoanApplication = {
      id: appId,
      paymentId: paymentId,
      amount: selectedAmount,
      serviceFee: loanOption.fee,
      formData,
      reference: 'Pending',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setApplication(newApp);
    navigateTo({ type: 'review', id: appId });
  };

  // Step 3A: Review -> Confirm
  const handleConfirmReview = () => {
    if (application) {
      navigateTo({ type: 'confirm', id: application.id });
    }
  };

  // Step 3B: Confirm -> Payment
  const handleProceedToPayment = () => {
    if (application) {
      navigateTo({
        type: 'payment',
        id: application.id,
        ref: application.paymentId
      });
    }
  };

  // Payment Success
  const handlePaymentSuccess = (reference: string) => {
    if (application) {
      setApplication({
        ...application,
        reference,
        status: 'APPROVED'
      });
      setView({ type: 'result', id: application.id, status: 'APPROVED' });
    }
  };

  // Payment Failure
  const handlePaymentFailure = () => {
    if (application) {
      setApplication({
        ...application,
        status: 'FAILED'
      });
      setView({ type: 'result', id: application.id, status: 'FAILED' });
    }
  };

  const isFormView = view.type !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F8F4] text-[#14301F]">
      <Header
        isForm={isFormView}
        onBack={() => {
          if (view.type === 'apply') {
            navigateTo({ type: 'landing' });
          } else if (view.type === 'review') {
            navigateTo({ type: 'apply', amount: selectedAmount });
          } else if (view.type === 'confirm') {
            if (application) navigateTo({ type: 'review', id: application.id });
          } else if (view.type === 'payment') {
            if (application) navigateTo({ type: 'confirm', id: application.id });
          } else {
            navigateTo({ type: 'landing' });
          }
        }}
      />

      <main className="app-main flex-1">
        {view.type === 'landing' && (
          <LandingPage
            onApply={handleSelectAmount}
            initialAmount={selectedAmount}
          />
        )}

        {view.type === 'apply' && (
          <ApplicationForm
            amount={view.amount}
            initialData={application?.formData}
            onSubmit={handleFormSubmit}
            onBack={() => navigateTo({ type: 'landing' })}
          />
        )}

        {view.type === 'review' && application && (
          <ReviewApplication
            application={application}
            onEdit={() => navigateTo({ type: 'apply', amount: application.amount })}
            onConfirm={handleConfirmReview}
          />
        )}

        {view.type === 'confirm' && application && (
          <ConfirmApplication
            application={application}
            onProceedToPayment={handleProceedToPayment}
            onGoBack={() => navigateTo({ type: 'review', id: application.id })}
          />
        )}

        {view.type === 'payment' && application && (
          <PaymentPage
            application={application}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />
        )}

        {view.type === 'result' && application && (
          <ResultPage
            application={application}
            isSuccess={view.status === 'APPROVED'}
            onHome={() => navigateTo({ type: 'landing' })}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
