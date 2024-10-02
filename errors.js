//Descripción: Archivo que contiene las clases de errores personalizadas.

//Clase de error personalizada para errores de autenticación
export class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerError";
  }
}

//Clase de error personalizada para errores que indican que el usuario ya existe
export class DuplicateEntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicateEntryError";
  }
}

//Clase de error personalizada para indicar que la conexión fue rechazada
export class ConnectionRefusedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConnectionRefusedError";
  }
}
