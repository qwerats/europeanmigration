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

function isMediaReady(audio) {
  return audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

export default function SiteMusicFloating() {
  const audioRef = useRef(null);
  const autoplayAttemptedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(readStoredVolume);
  const [awaitingSoundUnlock, setAwaitingSoundUnlock] = useState(false);

  const musicSrc = publicUrl(SITE_BACKGROUND_MUSIC_PATH);

  const unmuteAudio = useCallback((audio, level) => {
    audio.muted = false;
    audio.volume = level;
    setAwaitingSoundUnlock(false);
  }, []);

  const applyVolume = useCallback((nextVolume) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = nextVolume;
      if (nextVolume > 0) audio.muted = false;
    }
    setVolume(nextVolume);
    persistVolume(nextVolume);
    if (nextVolume > 0) setAwaitingSoundUnlock(false);
  }, []);

  const playWithSound = useCallback(
    async (level) => {
      const audio = audioRef.current;
      if (!audio) return false;

      audio.muted = false;
      audio.volume = level;

      try {
        if (audio.paused) await audio.play();
        setIsPlaying(true);
        setAwaitingSoundUnlock(false);
        return true;
      } catch {
        setAwaitingSoundUnlock(true);
        return false;
      }
    },
    []
  );

  const startAutoplay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || autoplayAttemptedRef.current) return;

    audio.loop = true;
    audio.volume = volume;

    const tryPlayAudible = async () => {
      audio.muted = false;
      audio.volume = volume;
      try {
        await audio.play();
        setIsPlaying(true);
        setAwaitingSoundUnlock(false);
        return true;
      } catch {
        return false;
      }
    };

    const tryPlayMutedThenUnmute = async () => {
      audio.muted = true;
      audio.volume = volume;
      try {
        await audio.play();
      } catch {
        setAwaitingSoundUnlock(true);
        return;
      }

      setIsPlaying(true);

      const unlockSound = () => {
        audio.muted = false;
        audio.volume = volume;
        if (!audio.muted && !audio.paused) {
          setAwaitingSoundUnlock(false);
          return true;
        }
        return false;
      };

      if (unlockSound()) return;

      window.setTimeout(() => {
        if (unlockSound()) return;
        setAwaitingSoundUnlock(true);
      }, 120);
    };

    const audibleOk = await tryPlayAudible();
    if (!audibleOk) await tryPlayMutedThenUnmute();

    autoplayAttemptedRef.current = true;
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

    const runAutoplay = () => {
      void startAutoplay();
    };

    if (isMediaReady(audio)) {
      runAutoplay();
      return undefined;
    }

    audio.addEventListener('canplay', runAutoplay, { once: true });
    return () => audio.removeEventListener('canplay', runAutoplay);
  }, [startAutoplay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!awaitingSoundUnlock) return undefined;

    const unlockOnGesture = () => {
      const audio = audioRef.current;
      if (!audio) return;
      unmuteAudio(audio, volume);
      if (audio.paused) {
        void audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    document.addEventListener('pointerdown', unlockOnGesture, { once: true, capture: true });
    document.addEventListener('keydown', unlockOnGesture, { once: true, capture: true });
    document.addEventListener('touchstart', unlockOnGesture, { once: true, capture: true });

    return () => {
      document.removeEventListener('pointerdown', unlockOnGesture, { capture: true });
      document.removeEventListener('keydown', unlockOnGesture, { capture: true });
      document.removeEventListener('touchstart', unlockOnGesture, { capture: true });
    };
  }, [awaitingSoundUnlock, unmuteAudio, volume]);

  const handleToggle = () => {
    if (isPlaying) {
      pauseMusic();
      return;
    }
    void playWithSound(volume);
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
      title={
        awaitingSoundUnlock ? 'Нажмите на странице, чтобы включить звук' : undefined
      }
    >
      <audio ref={audioRef} src={musicSrc} preload="auto" loop autoPlay playsInline />

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
