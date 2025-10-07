"use client";

import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function GoogleAuthButton({ mode = "login" }) {
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleUser = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        const { email, name, sub: googleId } = googleUser.data;

        const authRes = await fetch(`/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            googleId,
          }),
        });

        const authData = await authRes.json();
        if (!authRes.ok)
          throw new Error(authData?.message || "Fallo de autenticación");

        localStorage.setItem("jwt", authData.token);
        toast.success(`Bienvenido, ${authData.user.username}!`);
        router.push("/"); // 🔹 redirige al inicio
      } catch (error) {
        console.error(error);
        toast.error("Error con el login de Google");
      }
    },
    onError: () => toast.error("Falló el login con Google"),
  });

  return (
    <button
      className={`google-button ${
        mode === "login" ? "google-login" : "google-register"
      }`}
      onClick={() => login()}
    >
      {/* logo google */}
      {mode === "login" ? "Iniciar sesión con Google" : "Registrarse con Google"}
    </button>
  );
}
