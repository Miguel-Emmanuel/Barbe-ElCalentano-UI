export function todayInMexicoCity(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
  }).format(new Date());
}

export function normalizeMxPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) return digits.slice(2);
  if (digits.length === 13 && digits.startsWith("521")) return digits.slice(3);
  // Si pegan más de 10 sin prefijo, nos quedamos con los últimos 10
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

/** WhatsApp MX: exactamente 10 dígitos (ej. 7226935654). */
export function isValidMxPhone(raw: string): boolean {
  return /^\d{10}$/.test(normalizeMxPhone(raw));
}

export function isValidPersonName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  // Letters (incl. accents), spaces, apostrophes, dots, hyphens
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'’-]+$/.test(trimmed);
}

export function isValidOptionalEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

export function monthLabelEs(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const WEEKDAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
