import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import RagLayout from './components/RagLayout';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import IntegrationPage from './components/IntegrationPage';

export default function App() {
  // Pages: 'landing', 'login', 'signup', 'integration', 'chat'
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onEnter={() => setCurrentPage('login')}
            onIntegration={() => setCurrentPage('integration')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onBack={() => setCurrentPage('landing')}
            onLogin={() => setCurrentPage('chat')}
            onSignup={() => setCurrentPage('signup')}
            onSkip={() => setCurrentPage('chat')}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onBack={() => setCurrentPage('landing')}
            onSignup={() => setCurrentPage('chat')}
            onLogin={() => setCurrentPage('login')}
            onSkip={() => setCurrentPage('chat')}
          />
        );
      case 'integration':
        return (
          <IntegrationPage
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'chat':
        return <RagLayout onLogout={() => setCurrentPage('landing')} />;
      default:
        return <LandingPage onEnter={() => setCurrentPage('login')} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: currentPage === 'chat' ? 20 : 0 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: currentPage === 'chat' ? 0 : -20, filter: 'blur(10px)' }}
        transition={{ duration: 0.4 }}
        className="h-screen w-full"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}
