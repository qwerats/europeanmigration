import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Переход к секции ИИ-ассистента на главной. */
export default function MethodologyOpener() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ pathname: '/', hash: 'ai-assistant' }, { replace: true });
  }, [navigate]);

  return null;
}
