import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StatusContextProvider } from './contexts/StatusContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { ROUTES } from './constants';

export function App() {
  return (
    <BrowserRouter>
      <StatusContextProvider>
        <AuthProvider>
          <DocumentProvider>
            <Routes>
              {/* Public routes */}
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

              {/* Protected routes with AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.UPLOAD} element={<UploadPage />} />
                <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </DocumentProvider>
        </AuthProvider>
      </StatusContextProvider>
    </BrowserRouter>
  );
}

export default App;