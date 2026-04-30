import { Route, Routes, useLocation } from 'react-router-dom';
import MainNav from './components/MainNav';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import LogNewPage from './pages/LogNewPage';
import LogDetailPage from './pages/LogDetailPage';
import LogRecommendPage from './pages/LogRecommendPage';
import AnalysisPage from './pages/AnalysisPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import EmailSignupPage from './pages/EmailSignupPage';
import MyPage from './pages/MyPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

export default function App() {
  const { pathname } = useLocation();
  const hideMainNav =
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth/callback');

  return (
    <>
      {!hideMainNav && <MainNav />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recommend" element={<HomePage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/log/new" element={<LogNewPage />} />
        <Route path="/log/recommend" element={<LogRecommendPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/signup/email" element={<EmailSignupPage />} />
        <Route path="/auth/callback/:provider" element={<OAuthCallbackPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin/:section?" element={<AdminPage />} />
        <Route path="/log/:id" element={<LogDetailPage />} />
        <Route path="/log/:id/edit" element={<LogNewPage />} />
      </Routes>
    </>
  );
}
