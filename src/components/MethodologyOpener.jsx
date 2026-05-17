import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiAssistant } from '../context/AiAssistantContext';

/** Открывает плавающее окно агента и возвращает на главную. */
export default function MethodologyOpener() {
  const navigate = useNavigate();
  const { openAssistant } = useAiAssistant();

  useEffect(() => {
    openAssistant();
    navigate('/', { replace: true });
  }, [openAssistant, navigate]);

  return null;
}
