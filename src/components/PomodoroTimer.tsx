import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PomodoroTimerProps {
  onSessionComplete: () => void;
  isTaskSelected: boolean;
}

const TOTAL_SECONDS = 25 * 60;

const PomodoroTimer = ({ onSessionComplete, isTaskSelected }: PomodoroTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            stop();
            onSessionComplete();
            return TOTAL_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, stop, onSessionComplete]);

  const reset = () => {
    stop();
    setSecondsLeft(TOTAL_SECONDS);
  };

  return (
    <div className="glass rounded-xl p-6 flex flex-col items-center">
      <h2 className="text-lg font-semibold text-foreground mb-4">Pomodoro Timer</h2>

      <div className="relative w-52 h-52 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-mono font-bold text-foreground">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          disabled={!isTaskSelected}
          className="gradient-primary text-primary-foreground"
          size="lg"
        >
          {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={reset} variant="secondary" size="lg">
          <RotateCcw className="w-5 h-5 mr-2" /> Reset
        </Button>
      </div>

      {!isTaskSelected && (
        <p className="text-muted-foreground text-sm mt-3">Select a task to start focusing</p>
      )}
    </div>
  );
};

export default PomodoroTimer;
