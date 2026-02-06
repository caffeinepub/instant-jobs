/**
 * Format a number as Indian Rupees (₹)
 */
export function formatInr(amount: number | bigint, compact = false): string {
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;

  if (compact && numAmount >= 100000) {
    // Format in lakhs for large amounts
    const lakhs = numAmount / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  }

  return `₹${numAmount.toLocaleString('en-IN')}`;
}

/**
 * Parse INR string back to number
 */
export function parseInr(inrString: string): number {
  return parseInt(inrString.replace(/[₹,]/g, ''), 10) || 0;
}
