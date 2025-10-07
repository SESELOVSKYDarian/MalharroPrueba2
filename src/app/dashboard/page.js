"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import styles from "./dashboard.module.css";
import { API_URL } from "@/app/config";
import { useUser } from "@/app/hooks/useUser";

const SECTIONS = {
  slider: "Carrusel",
  agenda: "Agenda",
  usina: "Usina",
  textos: "Contenido general",
};

function useToken(loading) {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const stored = localStorage.getItem("jwt");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setToken(stored);
  }, [loading, router]);

  return token;
}

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const token = useToken(loading);
  const [activeSection, setActiveSection] = useState("slider");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
  }, [loading, router, user]);

  const fetchWithAuth = useCallback(
    async (path, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        // ignore parsing errors on empty responses
      }

      if (!response.ok) {
        const message = payload?.error || "No se pudo completar la operación";
        throw new Error(message);
      }

      return payload;
    },
    [token]
  );

  // Slider state and handlers
  const [sliderItems, setSliderItems] = useState([]);
  const [sliderForm, setSliderForm] = useState({ imageUrl: "", captionText: "" });
  const [sliderEditingId, setSliderEditingId] = useState(null);

  const loadSlider = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/slider", { method: "GET" });
      setSliderItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchWithAuth]);

  const submitSlider = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        const payload = {
          imageUrl: sliderForm.imageUrl,
          captionText: sliderForm.captionText,
        };
        if (!payload.imageUrl) {
          toast.error("La URL de la imagen es obligatoria");
          return;
        }

        if (sliderEditingId) {
          await fetchWithAuth(`/slider/${sliderEditingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Slide actualizado");
        } else {
          await fetchWithAuth("/slider", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Slide creado");
        }
        setSliderForm({ imageUrl: "", captionText: "" });
        setSliderEditingId(null);
        await loadSlider();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadSlider, sliderEditingId, sliderForm.captionText, sliderForm.imageUrl]
  );

  const deleteSlider = useCallback(
    async (id) => {
      if (!confirm("¿Eliminar este elemento del carrusel?")) return;
      try {
        await fetchWithAuth(`/slider/${id}`, { method: "DELETE" });
        toast.success("Slide eliminado");
        await loadSlider();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadSlider]
  );

  const startEditSlider = useCallback((item) => {
    setSliderForm({ imageUrl: item.imageUrl, captionText: item.captionText });
    setSliderEditingId(item.id);
  }, []);

  // Agenda state and handlers
  const [agendaItems, setAgendaItems] = useState([]);
  const [agendaForm, setAgendaForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    imageUrl: "",
  });
  const [agendaEditingId, setAgendaEditingId] = useState(null);

  const loadAgenda = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/agenda", { method: "GET" });
      setAgendaItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchWithAuth]);

  const submitAgenda = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        if (!agendaForm.titulo || !agendaForm.descripcion || !agendaForm.fecha) {
          toast.error("Título, descripción y fecha son obligatorios");
          return;
        }
        const payload = { ...agendaForm };
        if (agendaEditingId) {
          await fetchWithAuth(`/agenda/${agendaEditingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Evento actualizado");
        } else {
          await fetchWithAuth("/agenda", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Evento creado");
        }
        setAgendaForm({ titulo: "", descripcion: "", fecha: "", imageUrl: "" });
        setAgendaEditingId(null);
        await loadAgenda();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [agendaEditingId, agendaForm, fetchWithAuth, loadAgenda]
  );

  const deleteAgenda = useCallback(
    async (id) => {
      if (!confirm("¿Eliminar este evento?")) return;
      try {
        await fetchWithAuth(`/agenda/${id}`, { method: "DELETE" });
        toast.success("Evento eliminado");
        await loadAgenda();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadAgenda]
  );

  const startEditAgenda = useCallback((item) => {
    setAgendaForm({
      titulo: item.titulo,
      descripcion: item.descripcion,
      fecha: item.fecha,
      imageUrl: item.imageUrl || "",
    });
    setAgendaEditingId(item.id);
  }, []);

  // Usina state and handlers
  const [usinaItems, setUsinaItems] = useState([]);
  const [usinaForm, setUsinaForm] = useState({ titulo: "", texto: "", imageUrl: "" });
  const [usinaEditingId, setUsinaEditingId] = useState(null);

  const loadUsina = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/usina", { method: "GET" });
      setUsinaItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchWithAuth]);

  const submitUsina = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        if (!usinaForm.titulo || !usinaForm.texto) {
          toast.error("Título y texto son obligatorios");
          return;
        }
        const payload = { ...usinaForm };
        if (usinaEditingId) {
          await fetchWithAuth(`/usina/${usinaEditingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Bloque actualizado");
        } else {
          await fetchWithAuth("/usina", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Bloque creado");
        }
        setUsinaForm({ titulo: "", texto: "", imageUrl: "" });
        setUsinaEditingId(null);
        await loadUsina();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadUsina, usinaEditingId, usinaForm]
  );

  const deleteUsina = useCallback(
    async (id) => {
      if (!confirm("¿Eliminar este bloque de usina?")) return;
      try {
        await fetchWithAuth(`/usina/${id}`, { method: "DELETE" });
        toast.success("Bloque eliminado");
        await loadUsina();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadUsina]
  );

  const startEditUsina = useCallback((item) => {
    setUsinaForm({
      titulo: item.titulo,
      texto: item.texto,
      imageUrl: item.imageUrl || "",
    });
    setUsinaEditingId(item.id);
  }, []);

  // Textos state and handlers
  const [textos, setTextos] = useState([]);
  const [textoForm, setTextoForm] = useState({ seccion: "", contenido: "" });
  const [textoEditingId, setTextoEditingId] = useState(null);

  const loadTextos = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/textos", { method: "GET" });
      setTextos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchWithAuth]);

  const submitTexto = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        if (!textoForm.seccion) {
          toast.error("La sección es obligatoria");
          return;
        }
        const payload = { ...textoForm };
        if (textoEditingId) {
          await fetchWithAuth(`/textos/${textoEditingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          toast.success("Texto actualizado");
        } else {
          await fetchWithAuth("/textos", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success("Texto creado");
        }
        setTextoForm({ seccion: "", contenido: "" });
        setTextoEditingId(null);
        await loadTextos();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadTextos, textoEditingId, textoForm]
  );

  const deleteTexto = useCallback(
    async (id) => {
      if (!confirm("¿Eliminar este texto?")) return;
      try {
        await fetchWithAuth(`/textos/${id}`, { method: "DELETE" });
        toast.success("Texto eliminado");
        await loadTextos();
      } catch (error) {
        toast.error(error.message);
      }
    },
    [fetchWithAuth, loadTextos]
  );

  const startEditTexto = useCallback((item) => {
    setTextoForm({ seccion: item.seccion, contenido: item.contenido || "" });
    setTextoEditingId(item.id);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadSlider();
    loadAgenda();
    loadUsina();
    loadTextos();
  }, [loadAgenda, loadSlider, loadTextos, loadUsina, token]);

  const sectionTitle = useMemo(() => SECTIONS[activeSection], [activeSection]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("jwt");
    router.replace("/login");
  }, [router]);

  if (loading || !token || !user) {
    return <p style={{ padding: "3rem", textAlign: "center" }}>Cargando panel...</p>;
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Malharro · Admin</div>
        <nav className={styles.menu}>
          {Object.entries(SECTIONS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={activeSection === key ? styles.activeButton : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>{sectionTitle}</h1>
            <p style={{ color: "rgba(0,0,0,0.55)" }}>{user.email}</p>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        {activeSection === "slider" && (
          <section>
            <form className={styles.form} onSubmit={submitSlider}>
              <h2 className={styles.sectionTitle}>{sliderEditingId ? "Editar slide" : "Nuevo slide"}</h2>
              <div className={styles.field}>
                <label htmlFor="slider-image">URL de la imagen</label>
                <input
                  id="slider-image"
                  type="url"
                  value={sliderForm.imageUrl}
                  onChange={(event) =>
                    setSliderForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="slider-caption">Texto del slide</label>
                <textarea
                  id="slider-caption"
                  value={sliderForm.captionText}
                  onChange={(event) =>
                    setSliderForm((prev) => ({ ...prev, captionText: event.target.value }))
                  }
                  placeholder="Mensaje que aparecerá sobre la imagen"
                />
              </div>
              <div className={styles.cardActions}>
                <button className={styles.primaryButton} type="submit">
                  {sliderEditingId ? "Guardar cambios" : "Crear"}
                </button>
                {sliderEditingId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setSliderEditingId(null);
                      setSliderForm({ imageUrl: "", captionText: "" });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className={`${styles.cardsGrid} ${styles.threeColumn}`} style={{ marginTop: "1.5rem" }}>
              {sliderItems.length === 0 && (
                <p className={styles.emptyState}>No hay elementos cargados.</p>
              )}
              {sliderItems.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div>
                    <p style={{ fontWeight: 600 }}>#{item.id}</p>
                    <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>{item.imageUrl}</p>
                  </div>
                  {item.captionText && <p>{item.captionText}</p>}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => startEditSlider(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteSlider(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "agenda" && (
          <section>
            <form className={styles.form} onSubmit={submitAgenda}>
              <h2 className={styles.sectionTitle}>{agendaEditingId ? "Editar evento" : "Nuevo evento"}</h2>
              <div className={styles.field}>
                <label htmlFor="agenda-title">Título</label>
                <input
                  id="agenda-title"
                  value={agendaForm.titulo}
                  onChange={(event) =>
                    setAgendaForm((prev) => ({ ...prev, titulo: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="agenda-date">Fecha</label>
                <input
                  id="agenda-date"
                  type="date"
                  value={agendaForm.fecha}
                  onChange={(event) =>
                    setAgendaForm((prev) => ({ ...prev, fecha: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="agenda-description">Descripción</label>
                <textarea
                  id="agenda-description"
                  value={agendaForm.descripcion}
                  onChange={(event) =>
                    setAgendaForm((prev) => ({ ...prev, descripcion: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="agenda-image">URL de imagen (opcional)</label>
                <input
                  id="agenda-image"
                  value={agendaForm.imageUrl}
                  onChange={(event) =>
                    setAgendaForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className={styles.cardActions}>
                <button className={styles.primaryButton} type="submit">
                  {agendaEditingId ? "Guardar cambios" : "Crear"}
                </button>
                {agendaEditingId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setAgendaEditingId(null);
                      setAgendaForm({ titulo: "", descripcion: "", fecha: "", imageUrl: "" });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className={`${styles.cardsGrid} ${styles.threeColumn}`} style={{ marginTop: "1.5rem" }}>
              {agendaItems.length === 0 && (
                <p className={styles.emptyState}>No hay eventos cargados.</p>
              )}
              {agendaItems.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div>
                    <h3 style={{ margin: 0 }}>{item.titulo}</h3>
                    <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>{item.fecha}</p>
                  </div>
                  <p>{item.descripcion}</p>
                  {item.imageUrl && (
                    <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>{item.imageUrl}</p>
                  )}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => startEditAgenda(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteAgenda(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "usina" && (
          <section>
            <form className={styles.form} onSubmit={submitUsina}>
              <h2 className={styles.sectionTitle}>{usinaEditingId ? "Editar bloque" : "Nuevo bloque"}</h2>
              <div className={styles.field}>
                <label htmlFor="usina-title">Título</label>
                <input
                  id="usina-title"
                  value={usinaForm.titulo}
                  onChange={(event) =>
                    setUsinaForm((prev) => ({ ...prev, titulo: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="usina-text">Texto</label>
                <textarea
                  id="usina-text"
                  value={usinaForm.texto}
                  onChange={(event) =>
                    setUsinaForm((prev) => ({ ...prev, texto: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="usina-image">URL de imagen (opcional)</label>
                <input
                  id="usina-image"
                  value={usinaForm.imageUrl}
                  onChange={(event) =>
                    setUsinaForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className={styles.cardActions}>
                <button className={styles.primaryButton} type="submit">
                  {usinaEditingId ? "Guardar cambios" : "Crear"}
                </button>
                {usinaEditingId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setUsinaEditingId(null);
                      setUsinaForm({ titulo: "", texto: "", imageUrl: "" });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className={`${styles.cardsGrid} ${styles.threeColumn}`} style={{ marginTop: "1.5rem" }}>
              {usinaItems.length === 0 && (
                <p className={styles.emptyState}>No hay bloques cargados.</p>
              )}
              {usinaItems.map((item) => (
                <div key={item.id} className={styles.card}>
                  <h3 style={{ margin: 0 }}>{item.titulo}</h3>
                  <p>{item.texto}</p>
                  {item.imageUrl && (
                    <p style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>{item.imageUrl}</p>
                  )}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => startEditUsina(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteUsina(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === "textos" && (
          <section>
            <form className={styles.form} onSubmit={submitTexto}>
              <h2 className={styles.sectionTitle}>{textoEditingId ? "Editar texto" : "Nuevo texto"}</h2>
              <div className={styles.field}>
                <label htmlFor="texto-section">Identificador de sección</label>
                <input
                  id="texto-section"
                  value={textoForm.seccion}
                  onChange={(event) =>
                    setTextoForm((prev) => ({ ...prev, seccion: event.target.value }))
                  }
                  placeholder="ej: texto-introduccion"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="texto-content">Contenido</label>
                <textarea
                  id="texto-content"
                  value={textoForm.contenido}
                  onChange={(event) =>
                    setTextoForm((prev) => ({ ...prev, contenido: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.cardActions}>
                <button className={styles.primaryButton} type="submit">
                  {textoEditingId ? "Guardar cambios" : "Crear"}
                </button>
                {textoEditingId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setTextoEditingId(null);
                      setTextoForm({ seccion: "", contenido: "" });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className={`${styles.cardsGrid} ${styles.threeColumn}`} style={{ marginTop: "1.5rem" }}>
              {textos.length === 0 && (
                <p className={styles.emptyState}>No hay textos configurados.</p>
              )}
              {textos.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div>
                    <h3 style={{ margin: 0 }}>{item.seccion}</h3>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{item.contenido}</p>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => startEditTexto(item)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => deleteTexto(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
