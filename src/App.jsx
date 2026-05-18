import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OnePager from './components/OnePager';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import MethodologyOpener from './components/MethodologyOpener';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import IntroNavPage from './components/IntroNavPage';
import ResourcesPage from './components/ResourcesPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OnePager />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/geography" element={<Navigate to="/statistics" replace />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/forecast" element={<Navigate to="/" replace />} />
        <Route path="/methodology" element={<MethodologyOpener />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
