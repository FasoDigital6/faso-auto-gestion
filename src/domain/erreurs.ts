/**
 * Erreur métier personnalisée pour les validations business
 * Ces erreurs sont attendues et ne doivent pas être loggées comme des erreurs techniques
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
    // Maintenir la stack trace pour V8 (Chrome/Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessError);
    }
  }
}

/**
 * Erreur pour les BDL déjà facturés
 */
export class BdlDejaFactureError extends BusinessError {
  constructor(
    message: string,
    public bdlNumeros: string[]
  ) {
    super(message);
    this.name = "BdlDejaFactureError";
  }
}

/**
 * Erreur pour un proforma déjà facturé (un proforma = une facture au maximum)
 */
export class ProformaDejaFactureError extends BusinessError {
  constructor(
    message: string,
    public proformaNumero: string,
    public factureNumero?: string
  ) {
    super(message);
    this.name = "ProformaDejaFactureError";
  }
}
