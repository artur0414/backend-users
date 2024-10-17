# API de Gestión de Usuarios

## Introducción a la Arquitectura del Proyecto

### Modelo de Arquitectura

Este proyecto está basado en una arquitectura MVC (Modelo-Vista-Controlador), donde se utiliza la inyección de dependencias para proporcionar el modelo a los controladores. Esto permite una separación clara de preocupaciones y facilita la prueba y el mantenimiento del código. Se utiliza un enfoque RESTful para la API de gestión de usuarios, permitiendo que los administradores y superadministradores interactúen de manera eficiente con la API de cacao.

### Tecnologías Utilizadas

- **Node.js**: Se utiliza como entorno de ejecución para construir la API, ofreciendo un rendimiento eficiente y escalable.
- **Express**: Se utiliza como framework web para manejar las rutas y solicitudes HTTP, facilitando la creación de la API RESTful.
- **MySQL**: Como base de datos relacional, permite un almacenamiento estructurado y eficiente de los usuarios y sus datos.
- **JSON Web Tokens (JWT)**: Se utilizan para la autenticación y autorización, permitiendo mantener las sesiones de usuario de manera segura.
- **bcrypt**: Se utiliza para hashear las contraseñas, asegurando que las contraseñas de los usuarios se almacenen de forma segura y protegida.
- **Zod**: Se utiliza para la validación de datos, garantizando que las entradas de los usuarios sean correctas y cumplan con las expectativas del sistema.
- **Brevo**: Se utiliza para el envío de correos electrónicos. Brevo proporciona una API que permite la gestión y envío de correos electrónicos de manera sencilla y eficiente.
- **CORS**: Se configura para permitir solicitudes desde diferentes orígenes, facilitando la interacción con aplicaciones front-end que se ejecutan en dominios distintos.

## Seguridad

- **Hashing de Contraseñas**: Se implementa hashing con bcrypt para almacenar las contraseñas de los usuarios de forma segura, protegiéndolas contra accesos no autorizados.
- **Middleware de Autenticación**: Se utilizan middlewares para validar tokens JWT en las rutas protegidas, garantizando que solo los usuarios autenticados puedan acceder a ciertas funcionalidades.

## Otras Características

- **Gestión de Roles**: Los diferentes roles (administradores y superadministradores) tienen permisos específicos, asegurando un control granular sobre las acciones que cada usuario puede realizar.
- **Interfaz de Usuario**: Se planea desarrollar una interfaz web para facilitar la interacción con la API, proporcionando una experiencia de usuario intuitiva.

## Propósito de la API

La API de Gestión de Usuarios está diseñada para gestionar las sesiones y el control de acceso de administradores y superadministradores que interactúan con la API RESTful de cacao. Esta API permite un manejo eficiente de los usuarios que pueden acceder y modificar la información relacionada con el cultivo, procesamiento y distribución del cacao.

## Panel de Administración

Los usuarios de esta API son los administradores (roles "user") y los superadministradores (roles "admin") que utilizarán un panel de administración para gestionar la información relacionada con el cacao. Este panel proporciona una interfaz sencilla y efectiva para que los usuarios realicen las siguientes acciones:

### Roles de Usuario

#### Administradores (Role: `user`)

Los administradores tienen permisos para:
1. **Nutrir la API**: Encargarse de la alimentación y mantenimiento de la API de cacao, gestionando datos relevantes sobre el cultivo y procesamiento del cacao.
2. **Acceso a su Información**: Pueden acceder y ver su propia información de usuario.
3. **Actualizar Contraseña**: Tienen la opción de actualizar su contraseña si es necesario.

#### Superadministradores (Role: `admin`)

Los superadministradores poseen todos los permisos de un administrador, además de:
1. **Crear Usuarios**: Pueden añadir nuevos usuarios a la plataforma.
2. **Eliminar Usuarios**: Tienen la capacidad de eliminar cuentas de usuario existentes.
3. **Actualizar Roles**: Pueden cambiar los roles de otros usuarios (administradores y superadministradores).
4. **Ver Usuarios**: Tienen acceso a la lista completa de usuarios registrados en el sistema.

## Funcionalidad Clave

1. **Control de Sesiones**:
   - La API permite a los administradores y superadministradores iniciar sesión y mantener su sesión activa mediante tokens JWT. Al iniciar sesión, el token JWT y la información del usuario autenticado se almacenan en una cookie, lo que permite realizar acciones autorizadas en solicitudes subsecuentes.

2. **Gestión de Usuarios**:
   - Los superadministradores pueden gestionar cuentas de usuario, mientras que los administradores tienen acceso restringido solo a su información y a la posibilidad de actualizar su contraseña.

3. **Integración con la API de Cacao**:
   - La API de Gestión de Usuarios se integrará con la API de cacao, permitiendo a los administradores y superadministradores gestionar datos sobre el cacao de manera efectiva.

## Endpoints de la API

### 1. Autenticación

- **POST /login**
  - **Descripción**: Inicia sesión de un usuario.
  - **Request Body**: 
    ```json
    {
      "email": "string",
      "username": "string",
      "password": "string"
    }
    ```
  - **Response**: 
    - 200: `{ "token": "jwt_token" }` (almacenado en cookie)
    - 401: `"Credenciales inválidas"`

- **POST /logout**
  - **Descripción**: Cierra la sesión del usuario.
  - **Response**: 
    - 200: `{ "message": "Sesión cerrada" }`

### 2. Gestión de Usuarios

- **POST /register**
  - **Descripción**: Registra un nuevo usuario (solo para superadministradores).
  - **Request Body**: 
    ```json
    {
      "name": "string",
      "username": "string",
      "email": "string",
      "password": "string",
      "role": "string" // "admin" o "user"
    }
    ```
  - **Response**: 
    - 201: `{ "message": "Usuario creado" }`
    - 400: `"Error en la creación del usuario"`

- **GET /getall**
  - **Descripción**: Obtiene todos los usuarios (solo para superadministradores).
  - **Response**: 
    - 200: `[{ "id": "string", "name": "string", "username": "string", "email": "string", "role": "string" }]`
    - 500: `"Error en la obtención de usuarios"`

- **DELETE /delete/:id**
  - **Descripción**: Elimina un usuario por ID (solo para superadministradores).
  - **Response**: 
    - 200: `{ "message": "Usuario eliminado" }`
    - 404: `"Usuario no encontrado"`

### 3. Actualización de Información de Usuario

- **POST /forgot**
  - **Descripción**: Inicia el proceso de recuperación de contraseña.
  - **Request Body**: 
    ```json
    {
      "username": "string",
      "email": "string"
    }
    ```
  - **Response**: 
    - 200: `{ "message": "Correo de recuperación enviado" }`
    - 400: `"Error en la solicitud de recuperación"`

- **POST /recover**
  - **Descripción**: Verifica el código de recuperación de contraseña.
  - **Request Body**: 
    ```json
    {
      "code": "string"
    }
    ```
  - **Response**: 
    - 200: `{ "message": "Código verificado" }`
    - 400: `"Código incorrecto o expirado"`

- **PATCH /update**
  - **Descripción**: Actualiza la contraseña del usuario actual.
  - **Request Body**: 
    ```json
    {
      "username": "string",
      "newPassword": "string"
    }
    ```
  - **Response**: 
    - 200: `{ "message": "Contraseña actualizada" }`
    - 400: `"Error en la actualización de la contraseña"`

- **PATCH /update-role**
  - **Descripción**: Actualiza el rol de un usuario (solo para superadministradores).
  - **Request Body**: 
    ```json
    {
      "id": "string",
      "role": "string" // "admin" o "user"
    }
    ```
  - **Response**: 
    - 200: `{ "message": "Rol actualizado" }`
    - 400: `"Error en la actualización del rol"`

- **PATCH /update-password**
  - **Descripción**: Actualiza la contraseña de un usuario autenticado.
  - **Request Body**: 
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string"
    }
    ```
  - **Response**: 
    - 200: `{ "message": "Contraseña actualizada" }`
    - 400: `"Error en la actualización de la contraseña"`

### 4. Página Protegida

- **GET /protected**
  - **Descripción**: Ruta protegida que requiere autenticación.
  - **Response**: 
    - 200: `{ "message": "Acceso concedido" }`
    - 401: `"Acceso no autorizado"`

---
## Fase Futura

En la siguiente fase, se desarrollará una **API RESTful** llamada **CacaoApi**, que gestionará toda la información relacionada con las plantas de cacao. Esta API permitirá a administradores y superadministradores interactuar con los datos de las plantas, como registrar, actualizar y eliminar información. 

Cabe destacar que **CacaoApi** será independiente de la API actual para mejorar la escalabilidad y modularidad del sistema, asegurando que las futuras expansiones puedan manejarse de manera eficiente y separada, evitando la sobrecarga de una sola API.
