"use client";
import { useCallback, useEffect, useState } from "react";

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return decoded;
  } catch (error) {
    console.error("No se pudo decodificar el token", error);
    return null;
  }
}

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        setUser(null);
        return;
      }

      const payload = decodeJwt(jwt);
      if (!payload) {
        setUser(null);
        return;
      }

      setUser({
        email: payload.sub,
        role: payload.role,
        exp: payload.exp,
      });
    } catch (error) {
      console.error("useUser error:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    load();
    setLoading(false);
  }, [load]);

  return { user, loading, reloadUser: load };
}
