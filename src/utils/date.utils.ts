

// ============================================================
// NusaWeather — src/utils/date.utils.ts
// ============================================================
const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
export const fromUnix = (ts: number) => new Date(ts * 1000);
export const formatTime = (ts: number): string => {
  const d = fromUnix(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
export const formatDay = (ts: number): string => DAYS[fromUnix(ts).getDay()];
export const formatDayShort = (ts: number): string => DAYS_SHORT[fromUnix(ts).getDay()];
export const formatDate = (ts: number): string => {
  const d = fromUnix(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const formatDateFull = (ts: number): string => {
  const d = fromUnix(ts);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return 'Selamat Pagi';
  if (h >= 11 && h < 15) return 'Selamat Siang';
  if (h >= 15 && h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};
export const timeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  return `${Math.floor(mins / 60)} jam lalu`;
};
