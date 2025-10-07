"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/app/config";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const STEPS = {
  REQUEST: "request",
  VERIFY: "verify",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(STEPS.REQUEST);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestCode = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudo enviar el código");
        }

        toast.success("Enviamos un código de verificación al correo configurado.");
        setStep(STEPS.VERIFY);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleVerifyCode = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Código inválido");
        }

        localStorage.setItem("jwt", data.token);
        toast.success("Inicio de sesión exitoso");
        router.push("/dashboard");
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [email, code, router]
  );

  return (
    <div className="body-inicio-sesion">
      <div className="form-inicio-sesion">
        <h2 className="title-inicio-sesion">Panel administrativo</h2>
        {step === STEPS.REQUEST ? (
          <form onSubmit={handleRequestCode}>
            <div className="form-group">
              <label className="block form-label">Correo del administrador</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button className="form-button" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label className="block form-label">Código de verificación</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                className="form-input"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            <button className="form-button" disabled={loading}>
              {loading ? "Verificando..." : "Verificar"}
            </button>
            <button
              type="button"
              className="return-button"
              onClick={() => {
                setCode("");
                setStep(STEPS.REQUEST);
              }}
            >
              Cambiar correo
            </button>
          </form>
        )}
        <div className="buttons-container">
          <Link href="/">
            <button className="return-button">Volver al inicio</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
