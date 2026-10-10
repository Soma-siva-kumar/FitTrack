import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Play, Pause, RotateCcw, Timer, Volume2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export const WorkoutTimerModal: React.FC<Props> = ({ isOpen, onClose, defaultSeconds = 60 }) => {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(defaultSeconds);

  useEffect(() => {
    setSecondsLeft(defaultSeconds);
    setInitialSeconds(defaultSeconds);
    setIsRunning(false);
  }, [defaultSeconds, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play web audio chime if supported
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880; // A5 tone
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1.2);
        osc.stop(audioCtx.currentTime + 1.2);
      } catch {
        // AudioContext not available or blocked
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = (secs: number = initialSeconds) => {
    setIsRunning(false);
    setSecondsLeft(secs);
    setInitialSeconds(secs);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progressPercent = Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rest & Exercise Timer"
      subtitle="Rest between sets to allow full ATP and muscle recovery"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {/* Circular Display */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-charcoal-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-emerald-500 transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white font-mono tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 mt-1 font-medium">
              {secondsLeft === 0 ? 'Rest Complete!' : isRunning ? 'Resting...' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Quick presets */}
        <div className="grid grid-cols-4 gap-2 w-full text-xs">
          {[30, 45, 60, 90].map((s) => (
            <button
              key={s}
              onClick={() => resetTimer(s)}
              className={`py-2 rounded-xl border transition font-bold ${
                initialSeconds === s
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => resetTimer()}
            className="p-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 border border-charcoal-800 transition"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRun}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isRunning ? 'Pause Timer' : 'Start Timer'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
