import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Intro from './pages/Intro';
import Survey from './pages/Survey';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('aadorpUiLang') || 'en'; }
    catch { return 'en'; }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('aadorpUiLang', lang); } catch {}
  }, [lang]);

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/"          element={<Intro     lang={lang} />} />
        <Route path="/survey"    element={<Survey    lang={lang} />} />
        <Route path="/wishlist"  element={<Navigate to="/dashboard" replace />} />
        <Route path="/roadmap"   element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard lang={lang} />} />
        <Route path="/admin"     element={<Admin     lang={lang} />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
