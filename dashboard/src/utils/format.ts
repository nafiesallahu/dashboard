export function formatNumber(value: number) {
  // TODO: centralize formatting options (locale, decimals, currency).
  return new Intl.NumberFormat().format(value);
}


