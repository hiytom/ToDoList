export function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function clampToDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isAfterDay(a: Date, b: Date) {
  const aa = clampToDay(a).getTime();
  const bb = clampToDay(b).getTime();
  return aa > bb;
}

export function doneAtForDate(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}
