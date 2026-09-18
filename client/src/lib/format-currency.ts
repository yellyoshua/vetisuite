const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMAT.format(amount)
}
