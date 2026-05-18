import { useEffect, useRef, useState } from 'react';
import { HEYGEN_AVATAR_VIDEO_PATH } from '../config/heygenAvatar';
import { publicUrl } from '../utils/publicUrl';
import './HeyGenAvatarFloating.css';

export default function HeyGenAvatarFloating() {
  const videoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const videoSrc = publicUrl(HEYGEN_AVATAR_VIDEO_PATH);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpen) {
      video.play().catch(() => setIsOpen(false));
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isOpen]);

  const handleFabClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="heygen-avatar-floating" aria-live="polite">
      <button
        type="button"
        className={[
          'heygen-avatar-floating__fab',
          isOpen ? 'heygen-avatar-floating__fab--active' : '',
        ].join(' ')}
        onClick={handleFabClick}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Выключить аватар' : 'Включить аватар'}
        title={isOpen ? 'Выключить аватар' : 'Включить аватар'}
      >
        <span className="heygen-avatar-floating__fab-icon" aria-hidden>
          {isOpen ? '■' : '▶'}
        </span>
        <span className="heygen-avatar-floating__fab-label">
          {isOpen ? 'Стоп' : 'Аватар'}
        </span>
      </button>

      {isOpen ? (
        <div className="heygen-avatar-floating__panel" role="dialog" aria-label="ИИ-аватар">
          <div className="heygen-avatar-floating__panel-header">
            <span className="heygen-avatar-floating__panel-title">ИИ-аватар</span>
            <button
              type="button"
              className="heygen-avatar-floating__close"
              onClick={handleClose}
              aria-label="Выключить аватар"
            >
              ×
            </button>
          </div>
          <div className="heygen-avatar-floating__stage">
            <video
              ref={videoRef}
              className="heygen-avatar-floating__video"
              src={videoSrc}
              playsInline
              loop
              preload="metadata"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
