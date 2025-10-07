"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UsinaProtegida() {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRole() {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No autenticado");
        const data = await res.json();
        setRole(data.user?.role ?? null);
      } catch (error) {
        console.error("No se pudo obtener el rol", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRole();
  }, []);

  if (isLoading) return <p style={{ marginTop: "1rem" }}>Verificando sesión…</p>;

  if (role !== "ADMIN") {
    return (
      <p style={{ marginTop: "1rem" }}>
        ¿Formás parte del equipo de la Usina? <Link href="/login">Iniciá sesión</Link> con tu cuenta administrativa para
        editar el contenido.
      </p>
    );
  }

  return (
    <div className="usina-protegida">
      <p>
        Sos administrador. Podés gestionar toda la sección desde el nuevo
        <Link href="/dashboard" style={{ marginLeft: 4, textDecoration: "underline" }}>panel de control</Link>.
      </p>
    </div>
  );
}
