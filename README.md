# Malharro Plataforma Web

Este monorepo contiene el frontend en Next.js y un backend en Express que comparten los estilos originales del sitio estático de malharrooficial.

## Requisitos previos

* Node.js 20+
* PostgreSQL 14+ con una base de datos accesible para el backend
* Credenciales SMTP válidas para enviar el código de verificación al administrador

## Configuración

1. Instalar dependencias del frontend y backend (el script `postinstall` se encarga de correr `npm install` dentro de `backend`):
   ```bash
   npm install
   ```
2. Configurar el backend duplicando el archivo [`backend/.env.example`](backend/.env.example) y renombrándolo como `backend/.env`. Actualizá los valores de conexión a PostgreSQL, las credenciales SMTP y el correo/contraseña del usuario administrador.
3. Si necesitás reinstalar manualmente sólo el backend (por ejemplo en entornos sin scripts postinstall), ejecutá:
   ```bash
   npm --prefix backend install
   ```

4. Definí las variables de entorno del frontend en un archivo `.env.local` (no versionado):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

## Desarrollo

Ejecutá ambos servidores con un único comando desde la raíz del proyecto:

```bash
npm run dev
```

El script levanta el frontend en [http://localhost:3000](http://localhost:3000) y el backend en el puerto configurado (por defecto 4000). La base de datos se inicializa automáticamente con el contenido del sitio público para el carrusel, la agenda, la usina, la navegación y el footer.

### Backend

El backend expone una API REST bajo `/api` con autenticación mediante JWT para operaciones administrativas. La ruta `POST /api/auth/login` envía un código de verificación por correo al administrador y `POST /api/auth/verify` entrega el token JWT si el código es válido.

Los contenidos dinámicos (carrusel, agenda, usina, textos, navbar y footer) se editan desde el dashboard del frontend y se guardan en PostgreSQL. Los archivos subidos desde el panel se almacenan en `backend/uploads` y quedan disponibles públicamente en `/uploads/`.

### Frontend

El sitio público replica el diseño original utilizando directamente los estilos de `malharrooficial/css`. Los componentes principales (`Navbar`, `Carousel`, `Agenda`, `Usina` y `Footer`) consumen los endpoints REST para renderizar la información actualizada.

El dashboard requiere iniciar sesión con el correo administrativo definido en el backend. Tras ingresar usuario y contraseña se envía un código de seis dígitos por email; al validarlo se accede al panel.

### Acceso al dashboard

1. Asegurate de que el backend esté corriendo (por defecto en `http://localhost:4000`).
2. Abrí [http://localhost:3000/login](http://localhost:3000/login) en el navegador para ver el formulario de inicio de sesión de administrador.
3. Ingresá el correo y la contraseña configurados en el archivo `backend/.env`.
4. Revisá la casilla del correo administrador para obtener el código de verificación y completalo en la segunda pantalla. Si el código es correcto, se redirige automáticamente al dashboard en `/dashboard`.

## Scripts disponibles

* `npm run dev` – levanta frontend y backend simultáneamente.
* `npm run dev:frontend` – sólo el servidor Next.js.
* `npm run dev:backend` – sólo el servidor Express.
* `npm run build` / `npm run start` – comandos estándar de Next.js para producción.

## Notas

* Las imágenes históricas se sirven desde `/malharrooficial/images`, compartidas por el frontend y el backend.
* El directorio `backend/uploads` se ignora en git y se crea automáticamente al subir archivos.
* Si el entorno bloquea el acceso al registro de npm, instalá las dependencias de forma manual con un mirror autorizado.
