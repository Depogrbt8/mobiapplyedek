import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd MMM yyyy EEE', { locale: tr });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd MMM EEE', { locale: tr });
  } catch {
    return dateStr;
  }
}

// Para birimi formatı (locale-aware)
export function formatCurrency(amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Tarih formatı (kısa)
export function formatDateShort(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM', { locale: tr });
  } catch {
    return '';
  }
}

// Saat formatı
export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm', { locale: tr });
  } catch {
    return '';
  }
}

// Uçuş süresi formatı
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}s ${mins}dk`;
}

// Telefon numarası formatı
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

// IBAN formatı
export function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
} 