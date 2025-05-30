import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useKeyboardShortcuts, createNavigationShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

// Lazy load pages for better performance
const Overview = lazy(() => import('./pages/Overview'));
const Pipelines = lazy(() => import('./pages/Pipelines'));
const DataLineage = lazy(() => import('./pages/DataLineage'));
const Alerts = lazy(() => import('./pages/Alerts'));

function AppContent() {
  const navigate = useNavigate();

  // Set up navigation keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: createNavigationShortcuts(navigate)
  });

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
              <Route path="/" element={<Overview />} />
              <Route path="/pipelines" element={<Pipelines />} />
              <Route path="/data-lineage" element={<DataLineage />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </Suspense>
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
