# 📑 Contenido para Google Slides - Evaluación Final Backend

Este documento contiene la estructura y la información técnica necesaria para completar tu presentación de Google Slides.

---

## 1. Definición del Proyecto
- **Nombre**: Supermercado E-Commerce Pro
- **Problema que resuelve**: Gestión centralizada de productos y carritos de compra con actualización en tiempo real para clientes y administradores.
- **Funcionalidades principales**: 
  - Catálogo paginado con filtros.
  - Carrito de compras con persistencia.
  - Actualización en tiempo real vía WebSockets.
  - Persistencia dual (MongoDB y FileSystem).

## 2. Estructura del Proyecto (Captura Sugerida: Árbol de carpetas)
Explica que utilizaste una **Arquitectura de Capas con Patrón DAO**:
- `src/dao/`: Capa de persistencia (FileSystem y MongoDB).
- `src/models/`: Definición de esquemas de Mongoose.
- `src/routes/`: Separación de lógica de API (`/api/products`) y Vistas (`/products`).
- `src/public/`: Archivos estáticos y cliente de Socket.io.

## 3. Persistencia de Datos (Captura: product.model.js y connection en app.js)
- **MongoDB**: Base de datos principal (`ecommerce`).
- **Mongoose**: Modelado de datos y uso de `mongoose-paginate-v2` para optimizar consultas.
- **FileSystem**: Mantenido como sistema de persistencia secundario (clases `ManagerFS`).

## 4. Implementación de Funcionalidades
### Endpoints de Productos:
- **GET /api/products**: Retorna el formato exacto pedido (payload, totalPages, links, etc.).
- **POST /api/products**: Creación con notificación en tiempo real.
- **PUT/DELETE**: Actualización y borrado lógico/físico.

### Endpoints de Carritos:
- **GET /api/carts/:cid**: Implementación de `.populate('products.product')` para ver el detalle de los productos agregados.

## 5. Tiempo Real (WebSockets)
Explica la integración de **Socket.io**:
- Al crear un producto (`POST`), el servidor emite un evento `newProduct`.
- El cliente (browser) escucha y agrega la tarjeta dinámicamente al DOM sin recargar la página.

## 6. Evidencia de Funcionamiento (Sugerencia de Capturas/GIFs)
1. **Captura del Home**: Tarjetas de productos visibles.
2. **Captura del Detalle**: Botón "Agregar al carrito" funcionando.
3. **Captura de Postman**: Response del GET paginado.
4. **Captura de MongoDB Compass**: Evidencia de los documentos en la colección.

---

## 7. Cierre y Dificultades
- **Desafío**: Sincronizar WebSockets con el sistema de rutas de Express.
- **Solución**: Pasar la instancia de `io` a través de `req.io` mediante un middleware.
- **Mejoras Futuras**: Implementar autenticación con JWT y manejo de sesiones.
