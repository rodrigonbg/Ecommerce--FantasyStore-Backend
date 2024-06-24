# E-Commerce Backend con Express
Fantasy Store es un proyecto de backend para una aplicación de comercio electrónico, desarrollado con Node.js, Express y mongoDB. Proporciona una API RESTful para gestionar productos, usuarios, compras, autenticación con Passport para login local y con GitHub. Además, se maneja el almacenamiento de imágenes con Multer, envío de correos electrónicos a usuarios, encriptado de contraseñas y manejo de errores..

## Características
- CRUD de productos
- Gestión de usuarios
- Gestión de carritos de compra
- Gestión de tickets de compra
- Autenticación y autorización de usuarios (local y GitHub)
- Middlewares de validación y manejo de errores
- Envío de correos electrónicos para recuperación de cuenta y eliminación de productos
- Encriptado de contraseñas
- Roles de usuario (usuario regular, usuario premium y administrador)
- DTO (Data Transfer Object) para las respuestas de datos del usuario

## Instalación local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/rodrigonbg/Ecommerce--FantasyStore-Backend.git
   cd <tu repositorio local>
   ```
   
2. Instala las dependencias:
Ejecutar el comando 
    ```bash 
    npm install
    ```

3. Configura las variables de entorno:
    Crea un archivo .env en la raíz del proyecto y añade las siguientes variables:
    ```bash
    MONGO_URL = <Url de tu base de datos mongoDB>
    PORT = <puerto de preferencia>
    ADMIN_EMAIL = 'admincoder@coder.com'
    GithubAppID = <tu app ID de github>
    GithubClientID = <tu cliente ID de github>
    GithubClientSecret = <tu cliente secreto de github>
    ```
    
## Uso
Ejecutar el comando 
    ```
    npm start
    ```

## Endpoints
Algunas de rutas a las que se puede acceder una vez el servidor está iniciado son:

#### Usuarios
    GET /api/users - Obtener todos los usuarios
    GET /api/users/premium/:uid' - Cambiar rol de user a premium y viseversa por su ID
    GET /api/users/logout' - Desloguear al actual usuario
    GET /api/users/github' - Loguearse o registrarse con github
    GET /api/users/valid' - Ruta para validad el estado de la sesion del usuario
    POST /api/users/ - Registrar un usuario con Local Passport
    POST /api/users/login - LogIn de un usuario ya registrado con Local Passport
    POST /api/users/requestPasswordReset - Enviar mail con token para resetear contraseña
    POST /api/users/passwordReset - Cambiar contraseña con token
    POST /api/users/:uid/documents - Subir documentos de un usuario con su ID
    DELETE /api/users/:uid - Eliminar usuario por si ID
    DELETE /api/users/ - Eliminar usuarios que tienen 24 horas o más de inactividad

#### Productos
    GET /api/products - Obtener todos los productos por querys
    GET /api/products/mockingproducts - Obtener productos con un mocking
    GET /api/products/roductsOwner - Obtener todos los productos pertenecientes al usaurio conectado
    GET /api/products/:pid - Obtener un producto por un product ID
    POST /api/products/admin - Crear un nuevo producto con rol de usuario administrador
    POST /api/products/premium - Crear un nuevo producto con rol de usuario premium
    PUT /api/products/:pid - Actualizar un producto por su ID 
    DELETE /api/products/admin/:pid - Eliminar un producto por su ID
    DELETE /api/products/premium/:pid - Eliminar un producto por su ID

#### Carritos y tickets
    GET /api/carts/ - Obtener todos los carritos
    GET /api/carts/tickets - Obtener todos los tickets de compras
    GET /api/carts/:cid - Obtener un carrito por su ID
    GET /api/carts/tickets/:email - Obtener todos los tickets de compra de un comprador por su email
    POST /api/carts - Crear un nuevo carrito
    POST /api/carts/:cid/products/:pid - Agregar un producto a un carrito por sus IDs
    POST /api/carts/:cid/purchase - Finalizar compra generando un ticket y actualizando el carrito a los prodcutos sin stock sufuciente
    PUT /api/carts/:cid - Actualizar un carrito
    PUT /api/carts/:cid/products/:pid - Actualizar la cantidad de un producto en el carrito
    DELETE /api/carts/:cid - Eliminar un carrito por su ID
    DELETE /api/carts/:cid/products/:pid - Eliminar un producto de un carrito por sus IDs


## Funcionalidades Adicionales
    Envío de correos electrónicos: Se envían correos electrónicos a los usuarios cuando eliminamos su producto y cuando necesitan recuperar su usuario mediante un token.
    Subida de imágenes: Se utilizan multer para subir imágenes de productos y documentos de los usuarios.
    Encriptado de contraseñas: Se utiliza bcrypt para encriptar las contraseñas de los usuarios.

## Roles de Usuario
    Usuario Regular: Puede registrarse, agregar productos a su carrito y realizar compras.
    Usuario Premium: Además de las funcionalidades de un usuario regular, puede subir sus propios productos para la venta.
    Administrador: Puede eliminar usuarios, productos, agregar nuevos productos, y tiene acceso a todas las funcionalidades del sistema.

## Conexión con el Frontend
    Este proyecto backend está diseñado para ser utilizado con un frontend ya que las vistas con handlebars son muy básicas. 
    Puedes encontrar un proyecto frontend desarrollado con react al cual se encuentra conectado en el siguiente repositorio:
    ```
    main--front-fantasy-store.netlify.app/
    ```
    El frontend se conecta a este backend para proporcionar una interfaz de usuario amigable y funcional para el e-commerce.

## Contribuir
    Haz un fork del repositorio.
    Crea una nueva rama (git checkout -b feature/nueva_caracteristica).
    Realiza los cambios necesarios y haz commit (git commit -am 'Añadir nueva característica').
    Empuja la rama (git push origin feature/nueva_caracteristica).
    Abre un Pull Request.

Licencia
Este proyecto está bajo la licencia MIT.

    Autor: Rodrigo Rodirguez
    Correo: Rodrigonbg@hotmail.com
    GitHub: rodrigonbg




    
