/**
 * Configuration centralisée de la devise
 * Point unique de configuration pour toute l'application
 */
export const CURRENCY_CONFIG = {
  code: "GNF",
  symbol: "GNF",
  locale: "fr-FR",
  name: "franc guinéen",
  namePlural: "francs guinéens",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const;

/**
 * Formate un montant avec le symbole de devise
 * Utilise Intl.NumberFormat pour un formatage cohérent
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: "currency",
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(amount);
}

/**
 * Convertit un montant en lettres (en français)
 * Utilisé pour les documents PDF et autres contextes nécessitant une représentation textuelle
 */
export function amountToWords(amount: number): string {
  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "dix",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ];

  if (amount === 0) return "zéro " + CURRENCY_CONFIG.namePlural;
  if (amount < 0) return "moins " + amountToWords(-amount);

  let n = Math.floor(amount); // On travaille avec la partie entière
  let words = "";

  // Milliards
  if (Math.floor(n / 1000000000) > 0) {
    const billions = Math.floor(n / 1000000000);
    words +=
      (billions === 1 ? "un " : amountToWords(billions).replace(` ${CURRENCY_CONFIG.namePlural}`, "") + " ") + "milliard";
    if (billions > 1) words += "s";
    n %= 1000000000;
    if (n > 0) words += " ";
  }

  // Millions
  if (Math.floor(n / 1000000) > 0) {
    const millions = Math.floor(n / 1000000);
    words +=
      (millions === 1 ? "un " : amountToWords(millions).replace(` ${CURRENCY_CONFIG.namePlural}`, "") + " ") + "million";
    if (millions > 1) words += "s";
    n %= 1000000;
    if (n > 0) words += " ";
  }

  // Milliers
  if (Math.floor(n / 1000) > 0) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) {
      words += "mille";
    } else {
      words += convertBelowThousand(thousands) + " mille";
    }
    n %= 1000;
    if (n > 0) words += " ";
  }

  // Le reste (< 1000)
  if (n > 0) {
    words += convertBelowThousand(n);
  }

  return words.trim() + " " + CURRENCY_CONFIG.namePlural;

  // Fonction auxiliaire pour convertir les nombres < 1000
  function convertBelowThousand(num: number): string {
    let result = "";

    // Centaines
    if (Math.floor(num / 100) > 0) {
      const hundreds = Math.floor(num / 100);
      if (hundreds === 1) {
        result += "cent";
      } else {
        result += units[hundreds] + " cent";
      }
      if (hundreds > 1 && num % 100 === 0) result += "s";
      num %= 100;
      if (num > 0) result += " ";
    }

    // Dizaines et unités
    if (num > 0) {
      if (num < 20) {
        result += units[num];
      } else {
        const ten = Math.floor(num / 10);
        const unit = num % 10;

        // Cas spéciaux pour 70-79 et 90-99
        if (ten === 7 || ten === 9) {
          result += tens[ten - 1];
          if (unit === 1 && ten === 7) {
            result += " et onze";
          } else {
            result += "-" + (unit === 0 ? "dix" : units[unit + 10]);
          }
        } else {
          result += tens[ten];
          if (unit === 0 && ten === 8) {
            result += "s"; // quatre-vingts
          } else if (unit === 1 && ten !== 8) {
            result += " et un";
          } else if (unit > 0) {
            result += "-" + units[unit];
          }
        }
      }
    }

    return result.trim();
  }
}

/**
 * Formate un montant sans le symbole de devise
 * Utile pour les affichages personnalisés
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString(CURRENCY_CONFIG.locale);
}

/**
 * Formate un montant avec le symbole de devise ajouté
 * Alternative à formatCurrency pour un formatage plus simple
 */
export function formatAmountWithSymbol(amount: number): string {
  return `${formatAmount(amount)} ${CURRENCY_CONFIG.symbol}`;
}


