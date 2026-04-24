import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import LogNewPage from './pages/LogNewPage';
import LogDetailPage from './pages/LogDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/log" element={<LogPage />} />
      <Route path="/log/new" element={<LogNewPage />} />
      <Route path="/log/:id" element={<LogDetailPage />} />
      <Route path="/log/:id/edit" element={<LogNewPage />} />
    </Routes>
  );
}
