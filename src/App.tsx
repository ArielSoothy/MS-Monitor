import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import AIPipelineAssistant from './components/AIPipelineAssistant';
import { useKeyboardShortcuts, createNavigationShortcuts } from './hooks/useKeyboardShortcuts';
import { mockAlerts } from './data/mockData';
import './App.css';

// Lazy load pages for better performance
const Overview = lazy(() => import('./pages/Overview'));
const Pipelines = lazy(() => import('./pages/Pipelines'));
const DataLineage = lazy(() => import('./pages/DataLineage'));
const PredictiveInsights = lazy(() => import('./pages/PredictiveInsights'));
const AutonomousAgent = lazy(() => import('./components/AutonomousAgent'));
const Alerts = lazy(() => import('./pages/Alerts'));

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Set up navigation keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: createNavigationShortcuts(navigate)
  });

  // Get current page for Claude context
  const currentPage = location.pathname.replace('/', '') || 'overview';

  // Get recent alerts for Claude context
  const recentAlerts = mockAlerts.slice(0, 10);

  return (
    <div className="app">
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      
      <main className="main-content">
        <ErrorBoundary>
          <Suspense 
            fallback={
              <div className="page-loading">
                <LoadingSkeleton variant="card" count={3} />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/pipelines" element={<Pipelines />} />
              <Route path="/data-lineage" element={<DataLineage />} />
              <Route path="/predictive-insights" element={<PredictiveInsights />} />
              <Route path="/ai-agent" element={<AutonomousAgent />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        
        {/* AI Pipeline Assistant - Available on all pages */}
        <ErrorBoundary>
          <AIPipelineAssistant 
            currentPage={currentPage}
            recentAlerts={recentAlerts}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
