export class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerError";
  }
}

export class DuplicateEntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicateEntryError";
  }
}

export class ConnectionRefusedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConnectionRefusedError";
  }
}
