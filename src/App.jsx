import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OnePager from './components/OnePager';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import AiAssistantPage from './components/AiAssistantPage';
import Forecast from './components/Forecast';
import IntroNavPage from './components/IntroNavPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OnePager />} />
        <Route path="/about" element={<IntroNavPage title="About" />} />
        <Route path="/contact" element={<IntroNavPage title="Contact" />} />
        <Route path="/resources" element={<IntroNavPage title="Resources" />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/geography" element={<Navigate to="/statistics" replace />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/methodology" element={<AiAssistantPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
