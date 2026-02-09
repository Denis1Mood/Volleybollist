type ScheduleState = {
  time: string | null;
  nextRun: Date | null;
  timer: NodeJS.Timeout | null;
};

const state: ScheduleState = {
  time: null,
  nextRun: null,
  timer: null,
};

const parseTime = (input: string) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(input.trim());
  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
};

const getNextRun = (hours: number, minutes: number) => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
};

const scheduleDaily = (time: string, onTrigger: () => void) => {
  const parsed = parseTime(time);
  if (!parsed) {
    throw new Error("Неверный формат времени. Используйте HH:MM.");
  }

  clear();

  const nextRun = getNextRun(parsed.hours, parsed.minutes);
  const delay = nextRun.getTime() - Date.now();

  state.time = time;
  state.nextRun = nextRun;
  state.timer = setTimeout(() => {
    onTrigger();
    if (state.time) {
      scheduleDaily(state.time, onTrigger);
    }
  }, delay);
};

const clear = () => {
  if (state.timer) {
    clearTimeout(state.timer);
  }

  state.timer = null;
  state.time = null;
  state.nextRun = null;
};

const getStatus = () => ({
  time: state.time,
  nextRun: state.nextRun,
});

export const scheduler = {
  scheduleDaily,
  clear,
  getStatus,
};
