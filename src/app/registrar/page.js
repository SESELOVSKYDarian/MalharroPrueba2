
import Link from "next/link";
import "@/styles/componentes-styles.css";
import "@/styles/styles.css";

export default function Page() {
  return (
    <div className="home">
      <section className="body-inicio-sesion">
        <div className="form-inicio-sesion">
          <h2 className="title-inicio-sesion">Registro deshabilitado</h2>
          <p style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            El panel administrativo es exclusivo para el equipo autorizado. Si
            necesitas acceso, comunícate con el administrador.
          </p>
          <Link href="/login">
            <button className="form-button">Volver al inicio de sesión</button>
          </Link>
        </div>
      </section>
    </div>
  );
}