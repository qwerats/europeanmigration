import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SITE_BACKGROUND_MUSIC_PATH,
  SITE_MUSIC_DEFAULT_VOLUME,
} from '../config/siteMusic';
import { publicUrl } from '../utils/publicUrl';
import './SiteMusicFloating.css';

const VOLUME_STORAGE_KEY = 'eu-migration-site-music-volume';

function readStoredVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw == null) return SITE_MUSIC_DEFAULT_VOLUME;
    const value = Number.parseFloat(raw);
    if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
  } catch {
    /* ignore */
  }
  return SITE_MUSIC_DEFAULT_VOLUME;
}

function persistVolume(value) {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

export default function SiteMusicFloating() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(readStoredVolume);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const musicSrc = publicUrl(SITE_BACKGROUND_MUSIC_PATH);

  const applyVolume = useCallback((nextVolume) => {
    const audio = audioRef.current;
    if (audio) audio.volume = nextVolume;
    setVolume(nextVolume);
    persistVolume(nextVolume);
  }, []);

  const playMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    audio.volume = volume;
    try {
      await audio.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
      return true;
    } catch {
      setAutoplayBlocked(true);
      return false;
    }
  }, [volume]);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.loop = true;
    audio.volume = volume;

    let cancelled = false;

    const startAutoplay = async () => {
      if (cancelled) return;
      try {
        await audio.play();
        if (!cancelled) {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }
      } catch {
        if (!cancelled) setAutoplayBlocked(true);
      }
    };

    void startAutoplay();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- autoplay once on mount
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!autoplayBlocked) return undefined;

    const resumeOnGesture = () => {
      void playMusic();
    };

    document.addEventListener('pointerdown', resumeOnGesture, { once: true });
    document.addEventListener('keydown', resumeOnGesture, { once: true });

    return () => {
      document.removeEventListener('pointerdown', resumeOnGesture);
      document.removeEventListener('keydown', resumeOnGesture);
    };
  }, [autoplayBlocked, playMusic]);

  const handleToggle = () => {
    if (isPlaying) {
      pauseMusic();
      return;
    }
    void playMusic();
  };

  const handleVolumeChange = (e) => {
    const next = Number.parseFloat(e.target.value);
    if (!Number.isFinite(next)) return;
    applyVolume(next);
  };

  return (
    <div
      className="site-music-floating"
      role="region"
      aria-label="Фоновая музыка"
      title={autoplayBlocked ? 'Нажмите на странице, чтобы включить звук' : undefined}
    >
      <audio ref={audioRef} src={musicSrc} preload="auto" loop />

      <button
        type="button"
        className={[
          'site-music-floating__toggle',
          isPlaying ? 'site-music-floating__toggle--playing' : '',
        ].join(' ')}
        onClick={handleToggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Остановить музыку' : 'Включить музыку'}
        title={isPlaying ? 'Остановить' : 'Включить'}
      >
        <span className="site-music-floating__toggle-icon" aria-hidden>
          {isPlaying ? '❚❚' : '▶'}
        </span>
        <span className="site-music-floating__toggle-label">
          {isPlaying ? 'Стоп' : 'Музыка'}
        </span>
      </button>

      <label className="site-music-floating__volume" htmlFor="site-music-volume">
        <span className="site-music-floating__volume-icon" aria-hidden>
          ♪
        </span>
        <input
          id="site-music-volume"
          className="site-music-floating__volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Громкость"
          title={`Громкость: ${Math.round(volume * 100)}%`}
        />
      </label>
    </div>
  );
}
