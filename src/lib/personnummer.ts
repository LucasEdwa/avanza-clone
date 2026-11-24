/** Swedish personal identity number (personnummer) helpers. */

export function luhnCheckDigit(nineDigits: string): number {
  let sum = 0;
  for (let i = 0; i < nineDigits.length; i++) {
    let d = Number(nineDigits[i]) * (i % 2 === 0 ? 2 : 1);
    if (d > 9) d -= 9;
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Normalises "YYMMDD-XXXX", "YYYYMMDD-XXXX", "YYYYMMDDXXXX" etc. to 12 digits (YYYYMMDDXXXX).
 * Returns null when invalid (format, date or checksum).
 */
export function normalizePersonnummer(input: string, now = new Date()): string | null {
  const raw = input.trim();
  const m = raw.match(/^(\d{2})?(\d{2})(\d{2})(\d{2})([-+]?)(\d{4})$/);
  if (!m) return null;
  const [, century, yy, mm, dd, sep, last4] = m;
  let fullYear: number;
  if (century) {
    fullYear = Number(century + yy);
  } else {
    const cur = now.getFullYear();
    fullYear = 2000 + Number(yy);
    if (fullYear > cur) fullYear -= 100;
    if (sep === "+") fullYear -= 100; // 100+ years old
  }
  const month = Number(mm);
  let day = Number(dd);
  if (day > 60) day -= 60; // samordningsnummer
  const date = new Date(Date.UTC(fullYear, month - 1, day));
  if (date.getUTCFullYear() !== fullYear || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const ten = `${yy}${mm}${dd}${last4}`;
  if (luhnCheckDigit(ten.slice(0, 9)) !== Number(ten[9])) return null;
  return `${fullYear}${mm}${dd}${last4}`;
}

export function isValidPersonnummer(input: string): boolean {
  return normalizePersonnummer(input) !== null;
}

/** "19900101-2384" */
export function formatPersonnummer(pnr12: string): string {
  return `${pnr12.slice(0, 8)}-${pnr12.slice(8)}`;
}

/** Masked for display: "19900101-****" */
export function maskPersonnummer(pnr12: string): string {
  return `${pnr12.slice(0, 8)}-****`;
}

/** Builds a valid 12-digit personnummer from birth date + 3-digit serial. */
export function makePersonnummer(yyyymmdd: string, serial3: string): string {
  const nine = yyyymmdd.slice(2) + serial3;
  return `${yyyymmdd}${serial3}${luhnCheckDigit(nine)}`;
}

export function ageFromPersonnummer(pnr12: string, now = new Date()): number {
  const y = Number(pnr12.slice(0, 4));
  const m = Number(pnr12.slice(4, 6)) - 1;
  let d = Number(pnr12.slice(6, 8));
  if (d > 60) d -= 60;
  let age = now.getFullYear() - y;
  if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) age--;
  return age;
}
