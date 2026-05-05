import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Geography from './components/Geography';
import Statistics from './components/Statistics';
import AiAssistantPage from './components/AiAssistantPage';
import Forecast from './components/Forecast';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/geography" element={<Geography />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/methodology" element={<AiAssistantPage />} />
      </Routes>
    </Layout>
  );
}
