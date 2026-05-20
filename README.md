Guía de Configuración e Inicio del Servidor (Backend)
Esta sección detalla los pasos necesarios para instalar dependencias, configurar el entorno y levantar el servidor del backend del proyecto.

1. Acceso a la carpeta del proyecto
Abrir la terminal del sistema y dirigirse al directorio del backend con el siguiente comando: cd backend

2. Instalación de dependencias
Asegurarse de tener instalado Node.js (versión 18 o superior) en el equipo. Luego, ejecutar el comando para descargar e instalar todas las librerías necesarias del proyecto: npm install

3. Configuración de variables de entorno
Crear un archivo de texto con el nombre .env en la raíz de la carpeta backend. Si el archivo ya existe, asegurarse de que contenga las siguientes variables de configuración básicas:

PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/supermercado
(Nota: En caso de utilizar una base de datos en la nube como MongoDB Atlas, se deberá reemplazar la dirección de MONGODB_URI por la cadena de conexión correspondiente).

4. Carga inicial de datos (Seed de base de datos)
Para no iniciar el sistema con la tienda vacía, se recomienda ejecutar el script de inicialización para poblar la base de datos con un catálogo de productos de prueba de manera automática: node src/seed.js

(Advertencia: Este comando limpiará los productos anteriores de la base de datos para cargar un listado limpio desde cero).

5. Inicio del servidor en modo desarrollo
Para levantar el servidor en el entorno de desarrollo local (el cual se reinicia automáticamente al detectar cambios en el código fuente), ejecutar: npm run dev

Una vez iniciado correctamente, la consola mostrará el mensaje de confirmación indicando que el servidor está escuchando en la dirección: http://localhost:8080

y por ultimo se debe hacer en una terminal aparte 
docker compose up -d