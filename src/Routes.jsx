import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/crollToTop";
import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import About from './pages/about';
import NotFound from './pages/NotFound';
import AadminPanel from './pages/aadmin-panel';
import HistoryPage from './pages/history';
import HomePage from './pages/home';
import PosterModal from './pages/poster-modal';
import Today from './pages/today';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import BottomTabNavigation from './components/ui/BottomTabNavigation';

const Routes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <div className="min-h-screen">
            <main className="pb-16">
              <RouterRoutes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/about" element={<About />} />

                {/* Protected routes */}
                <Route path="/poster-modal" element={<PrivateRoute><PosterModal /></PrivateRoute>} />
                <Route path="/today" element={<PrivateRoute><Today /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin-panel" element={<AdminRoute><AadminPanel /></AdminRoute>} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </RouterRoutes>
            </main>
            <BottomTabNavigation />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default Routes;