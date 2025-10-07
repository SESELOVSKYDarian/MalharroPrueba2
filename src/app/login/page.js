"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const initialCredentials = { email: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("credentials");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "No se pudo iniciar sesión");
      }
      toast.success("Código enviado. Revisá tu correo electrónico");
      setStage("verify");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Código inválido");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("jwt", data.token);
      }
      toast.success("Acceso concedido");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-4">
            <h1 className="h3 mb-4 text-center">Acceso administrativo</h1>
            {stage === "credentials" ? (
              <form onSubmit={handleCredentialsSubmit} className="vstack gap-3">
                <div>
                  <label htmlFor="email" className="form-label">
                    Correo institucional
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={credentials.email}
                    onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={credentials.password}
                    onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Solicitar código"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit} className="vstack gap-3">
                <p>Ingresá el código de verificación enviado a tu correo institucional.</p>
                <div>
                  <label htmlFor="code" className="form-label">
                    Código de verificación
                  </label>
                  <input
                    id="code"
                    type="text"
                    className="form-control"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-link" onClick={() => setStage("credentials")}>
                    Corregir correo
                  </button>
                  <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
                    {isSubmitting ? "Validando..." : "Ingresar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
