export function formatINR(num: number): string {
  if (num === undefined || num === null || isNaN(num)) num = 0;
  const abs = Math.abs(Math.round(num));
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(abs);
  return num < 0 ? `- ${formatted}` : formatted;
}

export function formatCompact(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return formatINR(num);
}
