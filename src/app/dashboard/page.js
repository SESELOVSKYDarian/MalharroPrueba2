"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { API_URL } from "../config";

const initialSlider = { imageUrl: "", captionText: "" };
const initialAgenda = { titulo: "", descripcion: "", fecha: "", imageUrl: "" };
const initialUsina = { titulo: "", texto: "", imageUrl: "" };

export default function Dashboard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  const [sliderItems, setSliderItems] = useState([]);
  const [newSlider, setNewSlider] = useState(initialSlider);
  const [editingSliderId, setEditingSliderId] = useState(null);
  const [sliderDraft, setSliderDraft] = useState(initialSlider);

  const [agendaItems, setAgendaItems] = useState([]);
  const [newAgenda, setNewAgenda] = useState(initialAgenda);
  const [agendaEditingId, setAgendaEditingId] = useState(null);
  const [agendaDraft, setAgendaDraft] = useState(initialAgenda);

  const [usinaItems, setUsinaItems] = useState([]);
  const [newUsina, setNewUsina] = useState(initialUsina);
  const [usinaEditingId, setUsinaEditingId] = useState(null);
  const [usinaDraft, setUsinaDraft] = useState(initialUsina);

  const [textos, setTextos] = useState([]);
  const [textosDraft, setTextosDraft] = useState({});

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("jwt") : null), []);
  const apiBase = useMemo(() => (API_URL || "").replace(/\/$/, ""), []);

  const buildUrl = useCallback(
    (path) => {
      if (!path) return apiBase;
      if (/^https?:/i.test(path)) return path;
      const normalized = path.startsWith("/") ? path : `/${path}`;
      return `${apiBase}${normalized}`;
    },
    [apiBase]
  );

  const authFetch = useCallback(
    (url, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(buildUrl(url), { ...options, headers });
    },
    [token, buildUrl]
  );

  const loadSlider = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/carousel`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setSliderItems(Array.isArray(data.items) ? data.items : []);
  }, [buildUrl]);

  const loadAgenda = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/agenda`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setAgendaItems(Array.isArray(data.items) ? data.items : []);
  }, [buildUrl]);

  const loadUsina = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/usina`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setUsinaItems(Array.isArray(data.items) ? data.items : []);
  }, [buildUrl]);

  const loadTextos = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/texts`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.items)) {
      setTextos(data.items);
      const drafts = {};
      data.items.forEach((texto) => {
        drafts[texto.id] = texto.contenido;
      });
      setTextosDraft(drafts);
    }
  }, [buildUrl]);

  useEffect(() => {
    async function verifyAuth() {
      if (!token) {
        toast.error("Debés iniciar sesión");
        router.push("/login");
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch(buildUrl(`/api/auth/me`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No autenticado");
        const data = await res.json();
        if (data.user?.role !== "ADMIN") {
          toast.error("Acceso restringido al equipo administrativo");
          router.push("/");
          return;
        }
        setUser(data.user);
        await Promise.all([loadSlider(), loadAgenda(), loadUsina(), loadTextos()]);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo validar la sesión");
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyAuth();
  }, [token, router, loadSlider, loadAgenda, loadUsina, loadTextos]);

  const handleCreateSlider = async (event) => {
    event.preventDefault();
    if (!newSlider.imageUrl) {
      toast.error("La imagen es obligatoria");
      return;
    }
    try {
      const res = await authFetch(`/api/carousel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlider),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la imagen");
      toast.success("Imagen añadida al carrusel");
      setNewSlider(initialSlider);
      loadSlider();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateSlider = async (id) => {
    try {
      const res = await authFetch(`/api/carousel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sliderDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la imagen");
      toast.success("Imagen actualizada");
      setEditingSliderId(null);
      loadSlider();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSlider = async (id) => {
    if (!confirm("¿Eliminar esta imagen del carrusel?")) return;
    try {
      const res = await authFetch(`/api/carousel/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar la imagen");
      toast.success("Imagen eliminada");
      loadSlider();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateAgenda = async (event) => {
    event.preventDefault();
    if (!newAgenda.titulo || !newAgenda.fecha) {
      toast.error("Título y fecha son obligatorios");
      return;
    }
    try {
      const res = await authFetch(`/api/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgenda),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear el evento");
      toast.success("Evento añadido a la agenda");
      setNewAgenda(initialAgenda);
      loadAgenda();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateAgenda = async (id) => {
    try {
      const res = await authFetch(`/api/agenda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agendaDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar el evento");
      toast.success("Evento actualizado");
      setAgendaEditingId(null);
      loadAgenda();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteAgenda = async (id) => {
    if (!confirm("¿Eliminar este evento?")) return;
    try {
      const res = await authFetch(`/api/agenda/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar el evento");
      toast.success("Evento eliminado");
      loadAgenda();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateUsina = async (event) => {
    event.preventDefault();
    if (!newUsina.titulo || !newUsina.texto) {
      toast.error("Título y texto son obligatorios");
      return;
    }
    try {
      const res = await authFetch(`/api/usina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUsina),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la tarjeta");
      toast.success("Tarjeta de Usina creada");
      setNewUsina(initialUsina);
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateUsina = async (id) => {
    try {
      const res = await authFetch(`/api/usina/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usinaDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la tarjeta");
      toast.success("Tarjeta actualizada");
      setUsinaEditingId(null);
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteUsina = async (id) => {
    if (!confirm("¿Eliminar esta tarjeta de Usina?")) return;
    try {
      const res = await authFetch(`/api/usina/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar la tarjeta");
      toast.success("Tarjeta eliminada");
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSaveTexto = async (texto) => {
    try {
      const res = await authFetch(`/api/texts/${texto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: textosDraft[texto.id] ?? texto.contenido }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar el texto");
      toast.success("Texto guardado");
      loadTextos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="dashboard-loading">
        <p>Verificando credenciales…</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Panel de administración</h1>
          <p>Gestioná el contenido público del sitio web.</p>
        </div>
        {user && (
          <div className="dashboard__user">
            <span>{user.nombre}</span>
            <button
              onClick={() => {
                localStorage.removeItem("jwt");
                router.push("/");
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Carrusel</h2>
          <p>Gestioná las imágenes destacadas del slider principal.</p>
        </div>
        <form className="dashboard-form" onSubmit={handleCreateSlider}>
          <div className="form-grid">
            <label>
              URL de la imagen
              <input
                type="url"
                value={newSlider.imageUrl}
                onChange={(e) => setNewSlider({ ...newSlider, imageUrl: e.target.value })}
                required
              />
            </label>
            <label>
              Texto del carrusel
              <textarea
                value={newSlider.captionText}
                onChange={(e) => setNewSlider({ ...newSlider, captionText: e.target.value })}
                placeholder="Texto superpuesto en la imagen"
              />
            </label>
          </div>
          <button type="submit">Añadir imagen</button>
        </form>

        <div className="dashboard-cards">
          {sliderItems.map((item) => (
            <div key={item.id} className="dashboard-card">
              <img src={item.imageUrl} alt="Vista previa" className="dashboard-card__thumb" />
              {editingSliderId === item.id ? (
                <>
                  <label>
                    URL de la imagen
                    <input
                      type="url"
                      value={sliderDraft.imageUrl}
                      onChange={(e) => setSliderDraft({ ...sliderDraft, imageUrl: e.target.value })}
                    />
                  </label>
                  <label>
                    Texto del carrusel
                    <textarea
                      value={sliderDraft.captionText}
                      onChange={(e) => setSliderDraft({ ...sliderDraft, captionText: e.target.value })}
                    />
                  </label>
                  <div className="dashboard-card__actions">
                    <button type="button" onClick={() => handleUpdateSlider(item.id)}>
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        setEditingSliderId(null);
                        setSliderDraft(initialSlider);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="dashboard-card__text">{item.captionText || "(Sin texto)"}</p>
                  <div className="dashboard-card__actions">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSliderId(item.id);
                        setSliderDraft({ imageUrl: item.imageUrl, captionText: item.captionText || "" });
                      }}
                    >
                      Editar
                    </button>
                    <button type="button" className="button-danger" onClick={() => handleDeleteSlider(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Agenda</h2>
          <p>Actualizá los eventos y actividades próximas.</p>
        </div>
        <form className="dashboard-form" onSubmit={handleCreateAgenda}>
          <div className="form-grid">
            <label>
              Título
              <input
                type="text"
                value={newAgenda.titulo}
                onChange={(e) => setNewAgenda({ ...newAgenda, titulo: e.target.value })}
                required
              />
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={newAgenda.fecha}
                onChange={(e) => setNewAgenda({ ...newAgenda, fecha: e.target.value })}
                required
              />
            </label>
            <label>
              URL de la imagen
              <input
                type="url"
                value={newAgenda.imageUrl}
                onChange={(e) => setNewAgenda({ ...newAgenda, imageUrl: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              Descripción
              <textarea
                value={newAgenda.descripcion}
                onChange={(e) => setNewAgenda({ ...newAgenda, descripcion: e.target.value })}
              />
            </label>
          </div>
          <button type="submit">Agregar evento</button>
        </form>

        <div className="dashboard-cards">
          {agendaItems.map((item) => {
            const fechaLegible = item.fecha
              ? new Date(item.fecha).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";
            const isEditing = agendaEditingId === item.id;
            return (
              <div key={item.id} className="dashboard-card">
                {item.imageUrl && <img src={item.imageUrl} alt="Vista previa" className="dashboard-card__thumb" />}
                {isEditing ? (
                  <>
                    <label>
                      Título
                      <input
                        type="text"
                        value={agendaDraft.titulo}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, titulo: e.target.value })}
                      />
                    </label>
                    <label>
                      Fecha
                      <input
                        type="date"
                        value={agendaDraft.fecha}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, fecha: e.target.value })}
                      />
                    </label>
                    <label>
                      URL de la imagen
                      <input
                        type="url"
                        value={agendaDraft.imageUrl}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, imageUrl: e.target.value })}
                      />
                    </label>
                    <label>
                      Descripción
                      <textarea
                        value={agendaDraft.descripcion}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, descripcion: e.target.value })}
                      />
                    </label>
                    <div className="dashboard-card__actions">
                      <button type="button" onClick={() => handleUpdateAgenda(item.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => {
                          setAgendaEditingId(null);
                          setAgendaDraft(initialAgenda);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dashboard-card__info">
                      <h3>{item.titulo}</h3>
                      <p className="dashboard-card__meta">{fechaLegible}</p>
                      <p className="dashboard-card__text">{item.descripcion}</p>
                    </div>
                    <div className="dashboard-card__actions">
                      <button
                        type="button"
                        onClick={() => {
                          setAgendaEditingId(item.id);
                          setAgendaDraft({
                            titulo: item.titulo,
                            descripcion: item.descripcion || "",
                            fecha: item.fecha ? item.fecha.slice(0, 10) : "",
                            imageUrl: item.imageUrl || "",
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="button-danger" onClick={() => handleDeleteAgenda(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Usina</h2>
          <p>Actualizá las tarjetas informativas de la sección Usina.</p>
        </div>
        <form className="dashboard-form" onSubmit={handleCreateUsina}>
          <div className="form-grid">
            <label>
              Título
              <input
                type="text"
                value={newUsina.titulo}
                onChange={(e) => setNewUsina({ ...newUsina, titulo: e.target.value })}
                required
              />
            </label>
            <label>
              URL de la imagen
              <input
                type="url"
                value={newUsina.imageUrl}
                onChange={(e) => setNewUsina({ ...newUsina, imageUrl: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              Texto
              <textarea
                value={newUsina.texto}
                onChange={(e) => setNewUsina({ ...newUsina, texto: e.target.value })}
                required
              />
            </label>
          </div>
          <button type="submit">Crear tarjeta</button>
        </form>

        <div className="dashboard-cards">
          {usinaItems.map((item) => {
            const isEditing = usinaEditingId === item.id;
            return (
              <div key={item.id} className="dashboard-card">
                {item.imageUrl && <img src={item.imageUrl} alt="Vista previa" className="dashboard-card__thumb" />}
                {isEditing ? (
                  <>
                    <label>
                      Título
                      <input
                        type="text"
                        value={usinaDraft.titulo}
                        onChange={(e) => setUsinaDraft({ ...usinaDraft, titulo: e.target.value })}
                      />
                    </label>
                    <label>
                      URL de la imagen
                      <input
                        type="url"
                        value={usinaDraft.imageUrl}
                        onChange={(e) => setUsinaDraft({ ...usinaDraft, imageUrl: e.target.value })}
                      />
                    </label>
                    <label>
                      Texto
                      <textarea
                        value={usinaDraft.texto}
                        onChange={(e) => setUsinaDraft({ ...usinaDraft, texto: e.target.value })}
                      />
                    </label>
                    <div className="dashboard-card__actions">
                      <button type="button" onClick={() => handleUpdateUsina(item.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => {
                          setUsinaEditingId(null);
                          setUsinaDraft(initialUsina);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dashboard-card__info">
                      <h3>{item.titulo}</h3>
                      <p className="dashboard-card__text">{item.texto}</p>
                    </div>
                    <div className="dashboard-card__actions">
                      <button
                        type="button"
                        onClick={() => {
                          setUsinaEditingId(item.id);
                          setUsinaDraft({
                            titulo: item.titulo,
                            texto: item.texto,
                            imageUrl: item.imageUrl || "",
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" className="button-danger" onClick={() => handleDeleteUsina(item.id)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-head">
          <h2>Textos generales</h2>
          <p>Editá los párrafos globales del sitio.</p>
        </div>
        <div className="dashboard-cards">
          {textos.map((texto) => (
            <div key={texto.id} className="dashboard-card dashboard-card--texto">
              <div className="dashboard-card__info">
                <h3>{texto.seccion}</h3>
                <textarea
                  value={textosDraft[texto.id] ?? ""}
                  onChange={(e) => setTextosDraft({ ...textosDraft, [texto.id]: e.target.value })}
                />
              </div>
              <div className="dashboard-card__actions">
                <button type="button" onClick={() => handleSaveTexto(texto)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
