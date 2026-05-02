export function parsePrice(value) {
  if (value === null || value === undefined || value === '') return 0;

  const cleaned = String(value)
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '');

  return Number(cleaned) || 0;
}

export function formatCurrency(value) {
  const num = Number(value) || 0;
  return `$${num.toLocaleString('es-CO')}`;
}
