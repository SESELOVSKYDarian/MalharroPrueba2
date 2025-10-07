This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Variables de entorno

Define los siguientes valores en tu `.env.local` (puedes tomar como referencia `env.example`):

```
ADMIN_EMAIL=correo@ejemplo.com
JWT_SECRET=clave-super-secreta
```

- `ADMIN_EMAIL` corresponde al único correo autorizado para ingresar al panel.
- `JWT_SECRET` es la clave usada para firmar los tokens de sesión (HS256). Mantén este valor en secreto.

### Servidor de desarrollo

```bash
npm run dev
```

El panel admin está disponible en [http://localhost:3000/login](http://localhost:3000/login). El flujo de acceso envía un código temporal al correo configurado (el código también queda registrado en `data/last-verification-code.log` para entornos de desarrollo).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
