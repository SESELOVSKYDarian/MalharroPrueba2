// src/app/hooks/useUser.js
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) { setUser(null); setLoading(false); return; }
      // Strapi v4 users-permissions:
      const data = await apiFetch("/users/me?populate=*");
      setUser(data || null);
    } catch (e) {
      console.error("useUser error:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { user, loading, reloadUser: load };
}
