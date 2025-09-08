/**
 * Norwegian number formatting utilities for GAINLY app
 */

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString('nb-NO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatWeight(weight: number): string {
  return `${formatNumber(weight, 1)}kg`;
}

export function formatCalories(calories: number): string {
  return `${Math.round(calories).toLocaleString('nb-NO')} kcal`;
}

export function formatPercentage(percentage: number): string {
  return `${formatNumber(percentage, 0)}%`;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK'
  });
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit'
  });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}