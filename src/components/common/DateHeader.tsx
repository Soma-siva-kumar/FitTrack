import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import {
  addDays,
  formatDisplayDate,
  getChallengeDayNumber,
  getCurrentISTDate,
  isFutureDate,
  isWithinChallenge,
  TOTAL_CHALLENGE_DAYS,
} from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

export const DateHeader: React.FC = () => {
  const { selectedDate, setSelectedDate } = useFitness();
  const dayNumber = getChallengeDayNumber(selectedDate);
  const withinChallenge = isWithinChallenge(selectedDate);
  const isFuture = isFutureDate(selectedDate);
  const today = getCurrentISTDate();

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleResetToday = () => {
    setSelectedDate(today < '2026-10-11' ? '2026-10-11' : today);
  };

  return (
    <div className="bg-charcoal-900 border-b border-charcoal-800 px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Navigation arrows and Date indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-800 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {formatDisplayDate(selectedDate)}
                </span>
                {withinChallenge ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    Day {dayNumber} / {TOTAL_CHALLENGE_DAYS}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950 text-amber-400 border border-amber-800">
                    Outside Challenge
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {isFuture && <span className="text-cyan-400 font-medium">Planned Schedule</span>}
                {selectedDate === '2026-10-11' && <span className="text-emerald-400 font-medium">Kickoff Day</span>}
                {selectedDate === today && <span className="text-emerald-300 font-medium">• Current Day</span>}
              </div>
            </div>
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-800 transition"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Date Actions */}
        <div className="flex items-center gap-2">
          {selectedDate !== today && (
            <button
              onClick={handleResetToday}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-emerald-400 border border-charcoal-800 transition"
              title="Return to today / Day 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          )}

          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-charcoal-850 border border-charcoal-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            />
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
