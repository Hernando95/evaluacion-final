# VerdeMarket - E-Commerce Backend

Bienvenido al repositorio de **VerdeMarket**, un e-commerce desarrollado con Node.js, Express, MongoDB y Handlebars.
Este proyecto cumple con los requisitos finales para el curso de Backend, implementando una arquitectura completa con separación de roles, manejo de inventario en tiempo real, carrito de compras y pasarela de checkout.

## 🚀 Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu computadora:

- [Node.js](https://nodejs.org/es/) (Versión 18 o superior)
- [MongoDB](https://www.mongodb.com/es) (Local o cuenta en MongoDB Atlas)
- Git (Opcional, para clonar el repositorio)

## 🛠️ Instalación y Configuración Paso a Paso

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio y acceder a la carpeta

\`\`\`bash
git clone <tu-repositorio>
cd supermercado/backend
\`\`\`

### 2. Instalar dependencias

Instala todos los paquetes necesarios de Node.js ejecutando:
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

Asegúrate de tener configurada tu cadena de conexión a MongoDB.
Crea un archivo \`.env\` en la raíz de la carpeta \`backend\` (si no existe) y agrega:
\`\`\`env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/supermercado
\`\`\`
*(Puedes cambiar la URI si utilizas MongoDB Atlas).*

### 4. Inicializar la Base de Datos (Poblar Productos)

Para no empezar con la tienda vacía, corre el script de carga inicial (seed) que creará decenas de productos categorizados automáticamente:
\`\`\`bash
node src/seed.js
\`\`\`
*Nota: Este comando borrará los productos anteriores y cargará la nueva lista por defecto.*

### 5. Iniciar el Servidor

Para correr el proyecto en modo desarrollo (con auto-recarga):
\`\`\`bash
npm run dev
\`\`\`
O en modo producción:
\`\`\`bash
npm start
\`\`\`

El servidor se iniciará y verás en la consola: \`🚀 Servidor corriendo en <http://localhost:8080\`>

## 👥 Uso y Pruebas (Roles del Sistema)

Ingresa desde tu navegador a \`<http://localhost:8080\`>.

El sistema cuenta con una separación estricta de roles:

### 👨‍💼 Rol Administrador

Tiene acceso exclusivo al **Panel Admin** para crear, modificar y eliminar productos.

- **Email:** \`<adminCoder@coder.com>\`
- **Password:** \`adminCod3r123\`

### 🛒 Rol Cliente (Usuario Normal)

Solo puede explorar el catálogo, agregar al carrito y finalizar compras.

- **Para probarlo:** Ve a "Iniciar Sesión" -> "Regístrate acá" y crea una cuenta nueva. El sistema te asignará un carrito propio automáticamente.

## 📦 Flujo de Compra (Checkout)

1. Inicia sesión como Cliente.
2. Agrega productos al carrito.
3. Entra al carrito y presiona **"Ir al Pago"**.
4. El sistema verificará el stock en tiempo real, lo descontará de la base de datos y generará un **Ticket de Orden de Compra**. ¡Disfruta de tu VerdeMarket!
