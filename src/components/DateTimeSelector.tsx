interface DateTimeSelectorProps {
  dayMode: 'today' | 'tomorrow';
  onDayModeChange: (mode: 'today' | 'tomorrow') => void;
  availableTimes: string[];
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

export function DateTimeSelector({
  dayMode,
  onDayModeChange,
  availableTimes,
  selectedTime,
  onTimeChange,
}: DateTimeSelectorProps) {
  return (
    <section className="datetime-selector">
      <div className="datetime-selector__tabs">
        <button
          type="button"
          className={dayMode === 'today' ? 'is-active' : ''}
          onClick={() => onDayModeChange('today')}
        >
          오늘
        </button>
        <button
          type="button"
          className={dayMode === 'tomorrow' ? 'is-active' : ''}
          onClick={() => onDayModeChange('tomorrow')}
        >
          내일
        </button>
      </div>

      <label className="datetime-selector__time">
        시간
        <select value={selectedTime} onChange={(e) => onTimeChange(e.target.value)}>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
