"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { API_URL } from "../config";
import styles from "./dashboard.module.css";

const initialSlider = { imageUrl: "", captionText: "" };
const initialAgenda = { titulo: "", descripcion: "", fecha: "", imageUrl: "", tags: [] };
const initialUsina = { titulo: "", texto: "", imageUrl: "" };
const initialFaq = { question: "", answer: "", position: "" };

function useFilePreview(file) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return preview;
}

export default function Dashboard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  const [sliderItems, setSliderItems] = useState([]);
  const [newSlider, setNewSlider] = useState(initialSlider);
  const [newSliderFile, setNewSliderFile] = useState(null);
  const [editingSliderId, setEditingSliderId] = useState(null);
  const [sliderDraft, setSliderDraft] = useState(initialSlider);
  const [sliderDraftFile, setSliderDraftFile] = useState(null);

  const [agendaItems, setAgendaItems] = useState([]);
  const [newAgenda, setNewAgenda] = useState(initialAgenda);
  const [newAgendaFile, setNewAgendaFile] = useState(null);
  const [newAgendaTagInput, setNewAgendaTagInput] = useState("");
  const [newAgendaTagEditingIndex, setNewAgendaTagEditingIndex] = useState(-1);
  const [agendaEditingId, setAgendaEditingId] = useState(null);
  const [agendaDraft, setAgendaDraft] = useState(initialAgenda);
  const [agendaDraftFile, setAgendaDraftFile] = useState(null);
  const [agendaDraftTagInput, setAgendaDraftTagInput] = useState("");
  const [agendaDraftTagEditingIndex, setAgendaDraftTagEditingIndex] = useState(-1);

  const [usinaItems, setUsinaItems] = useState([]);
  const [newUsina, setNewUsina] = useState(initialUsina);
  const [newUsinaFile, setNewUsinaFile] = useState(null);
  const [usinaEditingId, setUsinaEditingId] = useState(null);
  const [usinaDraft, setUsinaDraft] = useState(initialUsina);
  const [usinaDraftFile, setUsinaDraftFile] = useState(null);

  const [textos, setTextos] = useState([]);
  const [textosDraft, setTextosDraft] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState(initialFaq);
  const [faqEditingId, setFaqEditingId] = useState(null);
  const [faqDraft, setFaqDraft] = useState(initialFaq);

  const newSliderPreview = useFilePreview(newSliderFile);
  const sliderDraftPreview = useFilePreview(sliderDraftFile);
  const newAgendaPreview = useFilePreview(newAgendaFile);
  const agendaDraftPreview = useFilePreview(agendaDraftFile);
  const newUsinaPreview = useFilePreview(newUsinaFile);
  const usinaDraftPreview = useFilePreview(usinaDraftFile);

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
    const items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
      : [];
    setAgendaItems(items);
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

  const loadFaqs = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/faqs`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setFaqs(Array.isArray(data.items) ? data.items : []);
  }, [buildUrl]);

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return null;
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`/api/uploads`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo subir la imagen");
      }
      return data.url;
    },
    [authFetch]
  );

  const resolveImage = useCallback(
    (value) => {
      if (!value) return "";
      if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
      return buildUrl(value);
    },
    [buildUrl]
  );

  const normalizeTagValue = (value) => value.replace(/\s+/g, " ").trim();

  const handleNewAgendaTagSubmit = () => {
    const nextValue = normalizeTagValue(newAgendaTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la agenda");
      return;
    }

    const currentTags = Array.isArray(newAgenda.tags) ? [...newAgenda.tags] : [];
    if (newAgendaTagEditingIndex >= 0) {
      currentTags[newAgendaTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setNewAgenda({ ...newAgenda, tags: currentTags });
    setNewAgendaTagInput("");
    setNewAgendaTagEditingIndex(-1);
  };

  const handleRemoveNewAgendaTag = (index) => {
    const currentTags = Array.isArray(newAgenda.tags) ? [...newAgenda.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setNewAgenda({ ...newAgenda, tags: currentTags });
    setNewAgendaTagInput((previous) => {
      if (newAgendaTagEditingIndex === index) {
        return "";
      }
      return previous;
    });
    setNewAgendaTagEditingIndex((previous) => {
      if (previous === index) return -1;
      if (previous > index) return previous - 1;
      return previous;
    });
  };

  const handleBeginEditNewAgendaTag = (index) => {
    const currentTags = Array.isArray(newAgenda.tags) ? newAgenda.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setNewAgendaTagInput(currentTags[index]);
    setNewAgendaTagEditingIndex(index);
  };

  const handleAgendaDraftTagSubmit = () => {
    const nextValue = normalizeTagValue(agendaDraftTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la agenda");
      return;
    }

    const currentTags = Array.isArray(agendaDraft.tags) ? [...agendaDraft.tags] : [];
    if (agendaDraftTagEditingIndex >= 0) {
      currentTags[agendaDraftTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setAgendaDraft({ ...agendaDraft, tags: currentTags });
    setAgendaDraftTagInput("");
    setAgendaDraftTagEditingIndex(-1);
  };

  const handleRemoveAgendaDraftTag = (index) => {
    const currentTags = Array.isArray(agendaDraft.tags) ? [...agendaDraft.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setAgendaDraft({ ...agendaDraft, tags: currentTags });
    setAgendaDraftTagInput((previous) => {
      if (agendaDraftTagEditingIndex === index) {
        return "";
      }
      return previous;
    });
    setAgendaDraftTagEditingIndex((previous) => {
      if (previous === index) return -1;
      if (previous > index) return previous - 1;
      return previous;
    });
  };

  const handleBeginEditAgendaDraftTag = (index) => {
    const currentTags = Array.isArray(agendaDraft.tags) ? agendaDraft.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setAgendaDraftTagInput(currentTags[index]);
    setAgendaDraftTagEditingIndex(index);
  };

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
        await Promise.all([loadSlider(), loadAgenda(), loadUsina(), loadTextos(), loadFaqs()]);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo validar la sesión");
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyAuth();
  }, [token, router, buildUrl, loadSlider, loadAgenda, loadUsina, loadTextos, loadFaqs]);

  const handleCreateSlider = async (event) => {
    event.preventDefault();
    if (!newSliderFile) {
      toast.error("Seleccioná una imagen");
      return;
    }
    try {
      const imageUrl = await uploadFile(newSliderFile);
      const res = await authFetch(`/api/carousel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSlider, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la imagen");
      toast.success("Imagen añadida al carrusel");
      setNewSlider(initialSlider);
      setNewSliderFile(null);
      loadSlider();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateSlider = async (id) => {
    try {
      let imageUrl = sliderDraft.imageUrl;
      if (sliderDraftFile) {
        imageUrl = await uploadFile(sliderDraftFile);
      }
      const res = await authFetch(`/api/carousel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sliderDraft, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la imagen");
      toast.success("Imagen actualizada");
      setEditingSliderId(null);
      setSliderDraft(initialSlider);
      setSliderDraftFile(null);
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
    const sanitizedTags = Array.isArray(newAgenda.tags)
      ? newAgenda.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta para el evento");
      return;
    }
    try {
      let imageUrl = newAgenda.imageUrl;
      if (newAgendaFile) {
        imageUrl = await uploadFile(newAgendaFile);
      }
      const res = await authFetch(`/api/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAgenda, tags: sanitizedTags, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear el evento");
      toast.success("Evento añadido a la agenda");
      setNewAgenda({ ...initialAgenda });
      setNewAgendaFile(null);
      setNewAgendaTagInput("");
      setNewAgendaTagEditingIndex(-1);
      loadAgenda();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateAgenda = async (id) => {
    const sanitizedTags = Array.isArray(agendaDraft.tags)
      ? agendaDraft.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta para el evento");
      return;
    }
    try {
      let imageUrl = agendaDraft.imageUrl;
      if (agendaDraftFile) {
        imageUrl = await uploadFile(agendaDraftFile);
      }
      const res = await authFetch(`/api/agenda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...agendaDraft, tags: sanitizedTags, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar el evento");
      toast.success("Evento actualizado");
      setAgendaEditingId(null);
      setAgendaDraft({ ...initialAgenda });
      setAgendaDraftFile(null);
      setAgendaDraftTagInput("");
      setAgendaDraftTagEditingIndex(-1);
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
      let imageUrl = newUsina.imageUrl;
      if (newUsinaFile) {
        imageUrl = await uploadFile(newUsinaFile);
      }
      const res = await authFetch(`/api/usina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUsina, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la tarjeta");
      toast.success("Tarjeta de Usina creada");
      setNewUsina(initialUsina);
      setNewUsinaFile(null);
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateUsina = async (id) => {
    try {
      let imageUrl = usinaDraft.imageUrl;
      if (usinaDraftFile) {
        imageUrl = await uploadFile(usinaDraftFile);
      }
      const res = await authFetch(`/api/usina/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...usinaDraft, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la tarjeta");
      toast.success("Tarjeta actualizada");
      setUsinaEditingId(null);
      setUsinaDraft(initialUsina);
      setUsinaDraftFile(null);
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
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar el contenido");
      toast.success("Tarjeta eliminada");
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSaveTexto = async (texto) => {
    try {
      const res = await authFetch(`/api/texts/${texto.slug}`, {
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

  const handleCreateFaq = async (event) => {
    event.preventDefault();
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("Completá la pregunta y la respuesta");
      return;
    }

    try {
      const payload = {
        question: newFaq.question,
        answer: newFaq.answer,
      };
      if (newFaq.position !== "") {
        const parsedPosition = Number(newFaq.position);
        if (!Number.isNaN(parsedPosition)) {
          payload.position = parsedPosition;
        }
      }

      const res = await authFetch(`/api/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la pregunta");
      toast.success("Pregunta añadida");
      setNewFaq(initialFaq);
      loadFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateFaq = async (id) => {
    if (!faqDraft.question.trim() || !faqDraft.answer.trim()) {
      toast.error("Completá la pregunta y la respuesta");
      return;
    }

    try {
      const payload = {
        question: faqDraft.question,
        answer: faqDraft.answer,
      };
      if (faqDraft.position !== "") {
        const parsedPosition = Number(faqDraft.position);
        if (!Number.isNaN(parsedPosition)) {
          payload.position = parsedPosition;
        }
      }

      const res = await authFetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la pregunta");
      toast.success("Pregunta actualizada");
      setFaqEditingId(null);
      setFaqDraft(initialFaq);
      loadFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm("¿Eliminar esta pregunta frecuente?")) return;
    try {
      const res = await authFetch(`/api/faqs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar la pregunta");
      toast.success("Pregunta eliminada");
      setFaqEditingId((current) => (current === id ? null : current));
      setFaqDraft(initialFaq);
      loadFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className={styles.loading}>
        <p>Verificando credenciales…</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>Panel de administración</h1>
          <p>Gestioná el contenido público del sitio web.</p>
        </div>
        {user && (
          <div className={styles.headerUser}>
            <div>
              <span className={styles.userName}>{user.nombre}</span>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Carrusel</h2>
          <p>Gestioná las imágenes destacadas del slider principal.</p>
        </div>
        <form className={styles.form} onSubmit={handleCreateSlider}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Imagen destacada
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setNewSliderFile(e.target.files?.[0] || null)}
              />
              {newSliderPreview && <img src={newSliderPreview} alt="Vista previa" className={styles.preview} />}
            </label>
            <label className={`${styles.label} ${styles.formGridFull}`}>
              Texto del carrusel
              <textarea
                value={newSlider.captionText}
                onChange={(e) => setNewSlider({ ...newSlider, captionText: e.target.value })}
                placeholder="Texto superpuesto en la imagen"
                className={styles.textarea}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.button}>
              Añadir imagen
            </button>
          </div>
        </form>

        <div className={styles.cardGrid}>
          {sliderItems.map((item) => {
            const isEditing = editingSliderId === item.id;
            const baseImage = resolveImage(item.imageUrl);
            const editingImage = sliderDraftFile
              ? sliderDraftPreview || baseImage
              : resolveImage(sliderDraft.imageUrl || item.imageUrl);
            const preview = isEditing ? editingImage : baseImage;
            return (
              <div key={item.id} className={styles.card}>
                {preview && <img src={preview} alt="Vista previa" className={styles.cardThumb} />}
                {isEditing ? (
                  <>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Imagen actual</span>
                      {baseImage && <img src={baseImage} alt="Imagen actual" className={styles.preview} />}
                    </div>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Reemplazar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => setSliderDraftFile(e.target.files?.[0] || null)}
                      />
                      {sliderDraftFile && sliderDraftPreview && (
                        <img src={sliderDraftPreview} alt="Nueva vista previa" className={styles.preview} />
                      )}
                      <button
                        type="button"
                        className={`${styles.button} ${styles.ghostButton}`}
                        onClick={() => {
                          setSliderDraft((draft) => ({ ...draft, imageUrl: "" }));
                          setSliderDraftFile(null);
                        }}
                      >
                        Quitar imagen
                      </button>
                    </div>
                    <label className={styles.label}>
                      Texto del carrusel
                      <textarea
                        value={sliderDraft.captionText}
                        onChange={(e) => setSliderDraft({ ...sliderDraft, captionText: e.target.value })}
                        className={styles.textarea}
                      />
                    </label>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.button} onClick={() => handleUpdateSlider(item.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => {
                          setEditingSliderId(null);
                          setSliderDraft(initialSlider);
                          setSliderDraftFile(null);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.cardText}>{item.captionText || "(Sin texto)"}</p>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setEditingSliderId(item.id);
                          setSliderDraft({ imageUrl: item.imageUrl, captionText: item.captionText || "" });
                          setSliderDraftFile(null);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => handleDeleteSlider(item.id)}
                      >
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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Agenda</h2>
          <p>Actualizá los eventos y actividades próximas.</p>
        </div>
        <form className={styles.form} onSubmit={handleCreateAgenda}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Título
              <input
                type="text"
                value={newAgenda.titulo}
                onChange={(e) => setNewAgenda({ ...newAgenda, titulo: e.target.value })}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Fecha
              <input
                type="date"
                value={newAgenda.fecha}
                onChange={(e) => setNewAgenda({ ...newAgenda, fecha: e.target.value })}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Imagen del evento
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setNewAgendaFile(e.target.files?.[0] || null)}
              />
              {newAgendaPreview && <img src={newAgendaPreview} alt="Vista previa" className={styles.preview} />}
            </label>
            <label className={`${styles.label} ${styles.formGridFull}`}>
              Descripción
              <textarea
                value={newAgenda.descripcion}
                onChange={(e) => setNewAgenda({ ...newAgenda, descripcion: e.target.value })}
                className={styles.textarea}
              />
            </label>
            <div className={`${styles.label} ${styles.formGridFull}`}>
              <span>Etiquetas</span>
              <div className={styles.tagField}>
                <div className={styles.tagInputRow}>
                  <input
                    type="text"
                    value={newAgendaTagInput}
                    onChange={(e) => setNewAgendaTagInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        handleNewAgendaTagSubmit();
                      }
                    }}
                    className={styles.input}
                    placeholder="Ej: Mesas de examen"
                  />
                  <button
                    type="button"
                    className={styles.tagSubmitButton}
                    onClick={handleNewAgendaTagSubmit}
                  >
                    {newAgendaTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                  </button>
                </div>
                <p className={styles.tagHelper}>
                  Presioná Enter para agregar etiquetas o elegí una existente para editarla.
                </p>
                <div className={styles.tagList}>
                  {(newAgenda.tags || []).map((tag, index) => (
                    <span key={`${tag}-${index}`} className={styles.tagPill}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagEdit}`}
                        onClick={() => handleBeginEditNewAgendaTag(index)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagRemove}`}
                        onClick={() => handleRemoveNewAgendaTag(index)}
                        aria-label={`Quitar etiqueta ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.button}>
              Agregar evento
            </button>
          </div>
        </form>

        <div className={styles.cardGrid}>
          {agendaItems.map((item) => {
            const isEditing = agendaEditingId === item.id;
            const baseImage = resolveImage(item.imageUrl);
            const editingImage = agendaDraftFile
              ? agendaDraftPreview || baseImage
              : resolveImage(agendaDraft.imageUrl || item.imageUrl);
            const preview = isEditing ? editingImage : baseImage;
            const fechaLegible = item.fecha
              ? new Date(item.fecha).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";
            return (
              <div key={item.id} className={styles.card}>
                {preview && <img src={preview} alt="Vista previa" className={styles.cardThumb} />}
                {isEditing ? (
                  <>
                    <label className={styles.label}>
                      Título
                      <input
                        type="text"
                        value={agendaDraft.titulo}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, titulo: e.target.value })}
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      Fecha
                      <input
                        type="date"
                        value={agendaDraft.fecha}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, fecha: e.target.value })}
                        className={styles.input}
                      />
                    </label>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Imagen actual</span>
                      {baseImage && <img src={baseImage} alt="Imagen actual" className={styles.preview} />}
                    </div>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Reemplazar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => setAgendaDraftFile(e.target.files?.[0] || null)}
                      />
                      {agendaDraftFile && agendaDraftPreview && (
                        <img src={agendaDraftPreview} alt="Nueva vista previa" className={styles.preview} />
                      )}
                      <button
                        type="button"
                        className={`${styles.button} ${styles.ghostButton}`}
                        onClick={() => {
                          setAgendaDraft((draft) => ({ ...draft, imageUrl: "" }));
                          setAgendaDraftFile(null);
                        }}
                      >
                        Quitar imagen
                      </button>
                    </div>
                    <label className={styles.label}>
                      Descripción
                      <textarea
                        value={agendaDraft.descripcion}
                        onChange={(e) => setAgendaDraft({ ...agendaDraft, descripcion: e.target.value })}
                        className={styles.textarea}
                      />
                    </label>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Etiquetas</span>
                      <div className={styles.tagField}>
                        <div className={styles.tagInputRow}>
                          <input
                            type="text"
                            value={agendaDraftTagInput}
                            onChange={(e) => setAgendaDraftTagInput(e.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === ",") {
                                event.preventDefault();
                                handleAgendaDraftTagSubmit();
                              }
                            }}
                            className={styles.input}
                            placeholder="Ej: Presentaciones"
                          />
                          <button
                            type="button"
                            className={styles.tagSubmitButton}
                            onClick={handleAgendaDraftTagSubmit}
                          >
                            {agendaDraftTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                          </button>
                        </div>
                        <p className={styles.tagHelper}>
                          Editá, quitá o sumá etiquetas para mantener organizada la agenda.
                        </p>
                        <div className={styles.tagList}>
                          {(agendaDraft.tags || []).map((tag, index) => (
                            <span key={`${item.id}-tag-${index}`} className={styles.tagPill}>
                              <span>{tag}</span>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagEdit}`}
                                onClick={() => handleBeginEditAgendaDraftTag(index)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagRemove}`}
                                onClick={() => handleRemoveAgendaDraftTag(index)}
                                aria-label={`Quitar etiqueta ${tag}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.button} onClick={() => handleUpdateAgenda(item.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => {
                          setAgendaEditingId(null);
                          setAgendaDraft({ ...initialAgenda });
                          setAgendaDraftFile(null);
                          setAgendaDraftTagInput("");
                          setAgendaDraftTagEditingIndex(-1);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.cardInfo}>
                      <h3>{item.titulo}</h3>
                      <p className={styles.cardMeta}>{fechaLegible}</p>
                      <p className={styles.cardText}>{item.descripcion}</p>
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className={styles.cardTags}>
                          {item.tags.map((tag, index) => (
                            <span key={`${item.id}-display-tag-${index}`} className={styles.cardTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setAgendaEditingId(item.id);
                          setAgendaDraft({
                            titulo: item.titulo,
                            descripcion: item.descripcion || "",
                            fecha: item.fecha ? item.fecha.substring(0, 10) : "",
                            imageUrl: item.imageUrl || "",
                            tags: Array.isArray(item.tags) ? item.tags : [],
                          });
                          setAgendaDraftFile(null);
                          setAgendaDraftTagInput("");
                          setAgendaDraftTagEditingIndex(-1);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => handleDeleteAgenda(item.id)}
                      >
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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Usina</h2>
          <p>Curá el contenido destacado de la usina creativa.</p>
        </div>
        <form className={styles.form} onSubmit={handleCreateUsina}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Título
              <input
                type="text"
                value={newUsina.titulo}
                onChange={(e) => setNewUsina({ ...newUsina, titulo: e.target.value })}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Imagen de portada
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setNewUsinaFile(e.target.files?.[0] || null)}
              />
              {newUsinaPreview && <img src={newUsinaPreview} alt="Vista previa" className={styles.preview} />}
            </label>
            <label className={`${styles.label} ${styles.formGridFull}`}>
              Texto
              <textarea
                value={newUsina.texto}
                onChange={(e) => setNewUsina({ ...newUsina, texto: e.target.value })}
                className={styles.textarea}
                required
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.button}>
              Crear tarjeta
            </button>
          </div>
        </form>

        <div className={styles.cardGrid}>
          {usinaItems.map((item) => {
            const isEditing = usinaEditingId === item.id;
            const baseImage = resolveImage(item.imageUrl);
            const editingImage = usinaDraftFile
              ? usinaDraftPreview || baseImage
              : resolveImage(usinaDraft.imageUrl || item.imageUrl);
            const preview = isEditing ? editingImage : baseImage;
            return (
              <div key={item.id} className={styles.card}>
                {preview && <img src={preview} alt="Vista previa" className={styles.cardThumb} />}
                {isEditing ? (
                  <>
                    <label className={styles.label}>
                      Título
                      <input
                        type="text"
                        value={usinaDraft.titulo}
                        onChange={(e) => setUsinaDraft({ ...usinaDraft, titulo: e.target.value })}
                        className={styles.input}
                      />
                    </label>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Imagen actual</span>
                      {baseImage && <img src={baseImage} alt="Imagen actual" className={styles.preview} />}
                    </div>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Reemplazar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => setUsinaDraftFile(e.target.files?.[0] || null)}
                      />
                      {usinaDraftFile && usinaDraftPreview && (
                        <img src={usinaDraftPreview} alt="Nueva vista previa" className={styles.preview} />
                      )}
                      <button
                        type="button"
                        className={`${styles.button} ${styles.ghostButton}`}
                        onClick={() => {
                          setUsinaDraft((draft) => ({ ...draft, imageUrl: "" }));
                          setUsinaDraftFile(null);
                        }}
                      >
                        Quitar imagen
                      </button>
                    </div>
                    <label className={styles.label}>
                      Texto
                      <textarea
                        value={usinaDraft.texto}
                        onChange={(e) => setUsinaDraft({ ...usinaDraft, texto: e.target.value })}
                        className={styles.textarea}
                      />
                    </label>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.button} onClick={() => handleUpdateUsina(item.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => {
                          setUsinaEditingId(null);
                          setUsinaDraft(initialUsina);
                          setUsinaDraftFile(null);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.cardInfo}>
                      <h3>{item.titulo}</h3>
                      <p className={styles.cardText}>{item.texto}</p>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setUsinaEditingId(item.id);
                          setUsinaDraft({
                            titulo: item.titulo,
                            texto: item.texto,
                            imageUrl: item.imageUrl || "",
                          });
                          setUsinaDraftFile(null);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => handleDeleteUsina(item.id)}
                      >
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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Textos generales</h2>
          <p>Editá los párrafos globales del sitio.</p>
        </div>
        <div className={styles.cardGrid}>
          {textos.map((texto) => (
            <div key={texto.id} className={`${styles.card} ${styles.textCard}`}>
              <div className={styles.cardInfo}>
                <h3>{texto.titulo || texto.slug}</h3>
                <p className={styles.cardMeta}>Slug: {texto.slug}</p>
                <textarea
                  value={textosDraft[texto.id] ?? ""}
                  onChange={(e) => setTextosDraft({ ...textosDraft, [texto.id]: e.target.value })}
                  className={`${styles.textarea} ${styles.textareaDense}`}
                />
              </div>
              <div className={styles.cardActions}>
                <button type="button" className={styles.button} onClick={() => handleSaveTexto(texto)}>
                  Guardar cambios
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Preguntas frecuentes</h2>
          <p>Sumá o actualizá las dudas habituales que aparecen en el sitio.</p>
        </div>
        <form className={styles.form} onSubmit={handleCreateFaq}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Pregunta
              <input
                type="text"
                className={styles.input}
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                required
              />
            </label>
            <label className={`${styles.label} ${styles.formGridFull}`}>
              Respuesta
              <textarea
                className={`${styles.textarea} ${styles.textareaDense}`}
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                required
              />
            </label>
            <label className={styles.label}>
              Posición
              <input
                type="number"
                className={styles.input}
                value={newFaq.position}
                onChange={(e) => setNewFaq({ ...newFaq, position: e.target.value })}
                min="0"
                placeholder="Opcional"
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.button}>
              Añadir pregunta
            </button>
          </div>
        </form>

        <div className={styles.cardGrid}>
          {faqs.map((faq) => {
            const isEditing = faqEditingId === faq.id;
            return (
              <div key={faq.id} className={`${styles.card} ${styles.textCard}`}>
                {isEditing ? (
                  <>
                    <label className={styles.label}>
                      Pregunta
                      <input
                        type="text"
                        className={styles.input}
                        value={faqDraft.question}
                        onChange={(e) => setFaqDraft({ ...faqDraft, question: e.target.value })}
                      />
                    </label>
                    <label className={`${styles.label} ${styles.formGridFull}`}>
                      Respuesta
                      <textarea
                        className={`${styles.textarea} ${styles.textareaDense}`}
                        value={faqDraft.answer}
                        onChange={(e) => setFaqDraft({ ...faqDraft, answer: e.target.value })}
                      />
                    </label>
                    <label className={styles.label}>
                      Posición
                      <input
                        type="number"
                        className={styles.input}
                        value={faqDraft.position}
                        onChange={(e) => setFaqDraft({ ...faqDraft, position: e.target.value })}
                      />
                    </label>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.button} onClick={() => handleUpdateFaq(faq.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => {
                          setFaqEditingId(null);
                          setFaqDraft(initialFaq);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.cardInfo}>
                      <h3>{faq.question}</h3>
                      <p className={styles.cardMeta}>Posición: {faq.position ?? "—"}</p>
                      <div
                        className={styles.cardText}
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          setFaqEditingId(faq.id);
                          setFaqDraft({
                            question: faq.question,
                            answer: faq.answer,
                            position: faq.position !== null && faq.position !== undefined ? String(faq.position) : "",
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
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
    </div>
  );
}
