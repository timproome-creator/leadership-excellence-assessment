import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function formatInt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
}

export function formatPct(n: number, decimals = 0): string {
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(decimals)}%`
}
