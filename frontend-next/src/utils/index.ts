import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function copyToClipboard(text: string, clearAfterMs = 20000): Promise<void> {
  return navigator.clipboard.writeText(text).then(() => {
    setTimeout(() => navigator.clipboard.writeText(''), clearAfterMs);
  });
}

export function isExpiringSoon(expiryDate?: string | null, days = 30): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate).getTime();
  const now = Date.now();
  return expiry > now && expiry - now < days * 24 * 60 * 60 * 1000;
}

export function isExpired(expiryDate?: string | null): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < Date.now();
}
