export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<{ key: keyof T; header: string }>,
): string {
  function toCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    return JSON.stringify(value);
  }

  function escapeCsv(raw: string): string {
    const needsQuotes = raw.includes(',') || raw.includes('"') || raw.includes('\n') || raw.includes('\r');
    if (!needsQuotes) return raw;
    return `"${raw.replaceAll('"', '""')}"`;
  }

  const headerLine = columns.map((c) => escapeCsv(String(c.header))).join(',');
  const lines = rows.map((row) => {
    return columns.map((c) => escapeCsv(toCell(row[c.key]))).join(',');
  });

  // CRLF is the most compatible for CSV downloads.
  return [headerLine, ...lines].join('\r\n');
}

export function downloadCsv(filename: string, csvText: string): void {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}


