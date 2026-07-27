/**
 * Matka calculation utilities
 */

/** Derive the single digit from a 3-digit panna: sum of digits mod 10 */
export function pannaToDigit(panna: string): string {
  if (!panna) return "";
  const digits = panna.split("").map(Number);
  const sum = digits.reduce((a, b) => (isNaN(b) ? a : a + b), 0);
  return String(sum % 10);
}

export const DEFAULT_MULTIPLIERS: Record<string, number> = {
  single_digit: 9,
  jodi: 90,
  single_panna: 150,
  double_panna: 300,
  triple_panna: 600,
  half_sangam_open: 1500,
  half_sangam_close: 1500,
  half_sangam: 1500,
  full_sangam: 10000,
  family_sangam: 1500,
  crossing: 90,
  sp_motor: 150,
  group_jodi: 90,
  digit_jodi: 90,
  red_bracket: 90,
  odd_even: 2,
};

/** Calculate payout multiplier for a bet type */
export function getMultiplier(betType: string, rates: { betType: string; multiplier: number }[]): number {
  const rate = rates.find((r) => r.betType === betType);
  return rate?.multiplier ?? DEFAULT_MULTIPLIERS[betType] ?? 1;
}

/**
 * Check if a bet wins given the declared result.
 * Returns true if the bet number matches the result for that bet type + session.
 */
export function isBetWinner(
  betType: string,
  betNumber: string,
  session: string,
  openPanna: string,
  closePanna: string,
  openDigit: string,
  closeDigit: string,
  jodi: string
): boolean {
  const cleanNumber = (betNumber || "").trim();
  const sessionDigit = session === "open" ? openDigit : closeDigit;
  const sessionPanna = session === "open" ? openPanna : closePanna;

  switch (betType) {
    case "single_digit":
      return cleanNumber === sessionDigit;

    case "jodi":
      return cleanNumber === jodi;

    case "single_panna": {
      if (!sessionPanna) return false;
      const bSorted = cleanNumber.split("").map(Number).sort((a, b) => a - b).join("");
      const pSorted = sessionPanna.split("").map(Number).sort((a, b) => a - b).join("");
      return bSorted === pSorted;
    }

    case "double_panna": {
      if (!sessionPanna) return false;
      const bSorted = cleanNumber.split("").map(Number).sort((a, b) => a - b).join("");
      const pSorted = sessionPanna.split("").map(Number).sort((a, b) => a - b).join("");
      return bSorted === pSorted;
    }

    case "triple_panna": {
      return cleanNumber === sessionPanna;
    }

    case "half_sangam":
    case "half_sangam_open": {
      const parts = cleanNumber.split(/[|-]/);
      if (parts.length !== 2) return false;
      return parts[0] === openDigit && parts[1] === closePanna;
    }

    case "half_sangam_close": {
      const parts = cleanNumber.split(/[|-]/);
      if (parts.length !== 2) return false;
      return parts[0] === openPanna && parts[1] === closeDigit;
    }

    case "full_sangam": {
      const parts = cleanNumber.split(/[|-]/);
      if (parts.length !== 2) return false;
      return parts[0] === openPanna && parts[1] === closePanna;
    }

    case "family_sangam": {
      const targetPanna = sessionPanna;
      const targetDigit = sessionDigit;
      if (!targetPanna) return false;
      if (cleanNumber.includes("|") || cleanNumber.includes("-")) {
        const [d, p] = cleanNumber.split(/[|-]/);
        return d === targetDigit && pannaToDigit(p) === pannaToDigit(targetPanna);
      }
      return pannaToDigit(cleanNumber) === pannaToDigit(targetPanna);
    }

    case "crossing": {
      const digits = cleanNumber.split("");
      const combos = new Set<string>();
      for (const d1 of digits) {
        for (const d2 of digits) {
          combos.add(`${d1}${d2}`);
        }
      }
      return combos.has(jodi);
    }

    case "sp_motor": {
      if (!sessionPanna) return false;
      const targetPanna = sessionPanna.split("").sort().join("");
      const betDigits = new Set(cleanNumber.split(""));
      return targetPanna.split("").every((d) => betDigits.has(d));
    }

    case "group_jodi": {
      if (cleanNumber.length === 2) {
        const d1 = parseInt(cleanNumber[0]);
        const d2 = parseInt(cleanNumber[1]);
        if (isNaN(d1) || isNaN(d2)) return false;
        const c1 = (d1 + 5) % 10;
        const c2 = (d2 + 5) % 10;
        const familyJodis = new Set([
          `${d1}${d2}`, `${d2}${d1}`,
          `${d1}${c2}`, `${c2}${d1}`,
          `${c1}${d2}`, `${d2}${c1}`,
          `${c1}${c2}`, `${c2}${c1}`
        ]);
        return familyJodis.has(jodi);
      }
      const digits = cleanNumber.split("");
      const jodis = new Set<string>();
      for (const a of digits) {
        for (const b of digits) {
          jodis.add(`${a}${b}`);
        }
      }
      return jodis.has(jodi);
    }

    case "digit_jodi": {
      return jodi.includes(cleanNumber) || cleanNumber === jodi;
    }

    case "red_bracket": {
      const d1 = parseInt(jodi[0]);
      const d2 = parseInt(jodi[1]);
      if (isNaN(d1) || isNaN(d2)) return false;
      const isRed = d1 === d2 || Math.abs(d1 - d2) === 5;
      if (!isRed) return false;
      if (cleanNumber === "all" || cleanNumber === "red") return true;
      return cleanNumber === jodi;
    }

    case "odd_even": {
      const targetDigit = parseInt(sessionDigit);
      if (isNaN(targetDigit)) return false;
      const isOdd = targetDigit % 2 !== 0;
      const isEven = !isOdd;
      const lower = cleanNumber.toLowerCase();
      if (lower === "odd" || lower === "o") return isOdd;
      if (lower === "even" || lower === "e") return isEven;
      return false;
    }

    default:
      return false;
  }
}
