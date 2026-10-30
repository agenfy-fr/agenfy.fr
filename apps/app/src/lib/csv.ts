/**
 * CSV export helpers (Qualiopi evidence exports). RFC 4180 quoting, `;`
 * separator and UTF-8 BOM so the file opens correctly in French Excel.
 * Cells starting with = + - @ are prefixed with ' to prevent formula injection.
 */

export type CsvValue = string | number | boolean | null | undefined | Date;

export function csvCell(value: CsvValue, separator = ";"): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (s.includes('"') || s.includes(separator) || s.includes("\n") || s.includes("\r")) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(headers: string[], rows: CsvValue[][], separator = ";"): string {
  const lines = [headers, ...rows].map((row) => row.map((v) => csvCell(v, separator)).join(separator));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
