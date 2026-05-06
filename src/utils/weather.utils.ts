// ============================================================
// NusaWeather — src/utils/weather.utils.ts
// ============================================================
export const getWindDir = (deg: number): string => {
  const dirs = ['U','TL','T','TG','S','BD','B','BL'];
  return dirs[Math.round(deg / 45) % 8];
};
export const getUVLevel = (uvi: number): { label: string; color: string } => {
  if (uvi <= 2) return { label: 'Rendah', color: '#26A69A' };
  if (uvi <= 5) return { label: 'Sedang', color: '#FFA726' };
  if (uvi <= 7) return { label: 'Tinggi', color: '#EF5350' };
  if (uvi <= 10) return { label: 'Sangat Tinggi', color: '#AB47BC' };
  return { label: 'Ekstrem', color: '#7B1FA2' };
};
export const getWeatherGradient = (icon: string, hour?: number): string[] => {
  const code = icon.slice(0, 2);
  if (['09','10','11'].includes(code)) return ['#373B44','#4286F4'];
  if (['03','04','50'].includes(code)) return ['#636FA4','#E8CBC0'];
  const h = hour ?? new Date().getHours();
  if (h >= 4 && h < 11) return ['#FCCB90','#D57EEB'];
  if (h >= 11 && h < 16) return ['#2196F3','#1565C0'];
  if (h >= 16 && h < 19) return ['#F7971E','#FFD200'];
  return ['#0A1628','#1A3A5C'];
};
export const getMoonPhase = (p: number): string => {
  if (p === 0 || p === 1) return '🌑 Bulan Baru';
  if (p < 0.25) return '🌒 Sabit Awal';
  if (p === 0.25) return '🌓 Kuartal Pertama';
  if (p < 0.5) return '🌔 Cembung Awal';
  if (p === 0.5) return '🌕 Purnama';
  if (p < 0.75) return '🌖 Cembung Akhir';
  if (p === 0.75) return '🌗 Kuartal Ketiga';
  return '🌘 Sabit Akhir';
};
