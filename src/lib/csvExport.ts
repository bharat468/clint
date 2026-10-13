/**
 * Client-Side CSV Exporter
 * Generates and triggers instant browser download of CSV files.
 */

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(","));
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n"); // UTF-8 BOM for Excel compatibility

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
