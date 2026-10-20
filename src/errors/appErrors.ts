export class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ConfigError extends AppError {}

export class DeckError extends AppError {}
export class DeckRequestError extends DeckError {}
export class DeckHttpError extends DeckError {}
export class DeckFormatError extends DeckError {}
export class InvalidCardError extends DeckError {}

export class DeckExhaustedError extends DeckError {}
