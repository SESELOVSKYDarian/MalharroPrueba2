"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { API_URL } from "../config";
import styles from "./dashboard.module.css";

const initialSlider = {
  imageUrl: "",
  imageDesktopUrl: "",
  imageMobileUrl: "",
  captionText: "",
};
const initialAgenda = { titulo: "", descripcion: "", fecha: "", imageUrl: "", tags: [] };
const initialUsina = { titulo: "", texto: "", imageUrl: "", tags: [] };
const initialFaq = { question: "", answer: "", position: "", tags: [] };

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
  const [newSliderDesktopFile, setNewSliderDesktopFile] = useState(null);
  const [newSliderMobileFile, setNewSliderMobileFile] = useState(null);
  const [editingSliderId, setEditingSliderId] = useState(null);
  const [sliderDraft, setSliderDraft] = useState(initialSlider);
  const [sliderDraftDesktopFile, setSliderDraftDesktopFile] = useState(null);
  const [sliderDraftMobileFile, setSliderDraftMobileFile] = useState(null);

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
  const [newUsinaTagInput, setNewUsinaTagInput] = useState("");
  const [newUsinaTagEditingIndex, setNewUsinaTagEditingIndex] = useState(-1);
  const [usinaEditingId, setUsinaEditingId] = useState(null);
  const [usinaDraft, setUsinaDraft] = useState(initialUsina);
  const [usinaDraftFile, setUsinaDraftFile] = useState(null);
  const [usinaDraftTagInput, setUsinaDraftTagInput] = useState("");
  const [usinaDraftTagEditingIndex, setUsinaDraftTagEditingIndex] = useState(-1);

  const [textos, setTextos] = useState([]);
  const [textosDraft, setTextosDraft] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState(initialFaq);
  const [newFaqTagInput, setNewFaqTagInput] = useState("");
  const [newFaqTagEditingIndex, setNewFaqTagEditingIndex] = useState(-1);
  const [faqEditingId, setFaqEditingId] = useState(null);
  const [faqDraft, setFaqDraft] = useState(initialFaq);
  const [faqDraftTagInput, setFaqDraftTagInput] = useState("");
  const [faqDraftTagEditingIndex, setFaqDraftTagEditingIndex] = useState(-1);

  const [navbarData, setNavbarData] = useState(null);
  const [navbarSaving, setNavbarSaving] = useState(false);

  const [careers, setCareers] = useState([]);
  const [careerFiles, setCareerFiles] = useState({});
  const [careerSaving, setCareerSaving] = useState({});

  const newSliderDesktopPreview = useFilePreview(newSliderDesktopFile);
  const newSliderMobilePreview = useFilePreview(newSliderMobileFile);
  const sliderDraftDesktopPreview = useFilePreview(sliderDraftDesktopFile);
  const sliderDraftMobilePreview = useFilePreview(sliderDraftMobileFile);
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
    const items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          ...item,
          imageDesktopUrl: item.imageDesktopUrl || item.imageUrl || "",
          imageMobileUrl: item.imageMobileUrl || item.imageDesktopUrl || item.imageUrl || "",
        }))
      : [];
    setSliderItems(items);
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
    const items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
      : [];
    setUsinaItems(items);
  }, [buildUrl]);

  const loadTextos = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/texts`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.items)) {
      const filtered = data.items.filter((texto) => texto.slug !== "home_agenda_cta_url");
      setTextos(filtered);
      const drafts = {};
      filtered.forEach((texto) => {
        drafts[texto.id] = texto.contenido;
      });
      setTextosDraft(drafts);
    }
  }, [buildUrl]);

  const loadFaqs = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/faqs`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const items = Array.isArray(data.items)
      ? data.items.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
        }))
      : [];
    setFaqs(items);
  }, [buildUrl]);

  const normalizeNavbarData = useCallback((raw) => {
    const base = raw && typeof raw === "object" ? JSON.parse(JSON.stringify(raw)) : { menu: [], links: [] };
    base.menu = Array.isArray(base.menu)
      ? base.menu.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags) ? item.tags : [],
          items: Array.isArray(item.items)
            ? item.items.map((option) => ({
                ...option,
                tags: Array.isArray(option.tags) ? option.tags : [],
              }))
            : [],
        }))
      : [];
    base.links = Array.isArray(base.links)
      ? base.links.map((link) => ({
          ...link,
          tags: Array.isArray(link.tags) ? link.tags : [],
        }))
      : [];
    return base;
  }, []);

  const loadNavbar = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/sections/navbar`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setNavbarData(normalizeNavbarData(data?.data));
  }, [buildUrl, normalizeNavbarData]);

  const loadCareers = useCallback(async () => {
    const res = await fetch(buildUrl(`/api/sections/careers`), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const items = Array.isArray(data?.data?.items) ? data.data.items : [];
    setCareers(items);
    setCareerFiles({});
    setCareerSaving({});
  }, [buildUrl]);

  const getNavbarTags = useCallback((data, scope, parentIndex, childIndex = null) => {
    if (!data) return null;
    if (scope === "menu") {
      return data.menu?.[parentIndex]?.tags || null;
    }
    if (scope === "submenu") {
      return data.menu?.[parentIndex]?.items?.[childIndex]?.tags || null;
    }
    if (scope === "link") {
      return data.links?.[parentIndex]?.tags || null;
    }
    return null;
  }, []);

  const updateNavbarStructure = useCallback(
    (updater) => {
      setNavbarData((previous) => {
        if (!previous) return previous;
        const clone = JSON.parse(JSON.stringify(previous));
        updater(clone);
        return clone;
      });
    },
    []
  );

  const normalizeTagValue = (value) => value.replace(/\s+/g, " ").trim();

  const handleNavbarTagChange = useCallback(
    (scope, parentIndex, childIndex, tagIndex, value) => {
      updateNavbarStructure((draft) => {
        const tags = getNavbarTags(draft, scope, parentIndex, childIndex);
        if (!tags || tagIndex < 0 || tagIndex >= tags.length) return;
        tags[tagIndex] = value;
      });
    },
    [getNavbarTags, updateNavbarStructure]
  );

  const handleNavbarTagAdd = useCallback(
    (scope, parentIndex, childIndex = null) => {
      updateNavbarStructure((draft) => {
        const tags = getNavbarTags(draft, scope, parentIndex, childIndex);
        if (!tags) return;
        tags.push("");
      });
    },
    [getNavbarTags, updateNavbarStructure]
  );

  const handleNavbarTagRemove = useCallback(
    (scope, parentIndex, childIndex, tagIndex) => {
      updateNavbarStructure((draft) => {
        const tags = getNavbarTags(draft, scope, parentIndex, childIndex);
        if (!tags || tagIndex < 0 || tagIndex >= tags.length) return;
        tags.splice(tagIndex, 1);
      });
    },
    [getNavbarTags, updateNavbarStructure]
  );

  const sanitizeNavbarPayload = useCallback(
    (data) => {
      const sanitizeTags = (tags) => {
        const cleaned = Array.isArray(tags)
          ? tags.map((tag) => normalizeTagValue(tag)).filter((tag) => tag && tag.length)
          : [];
        return Array.from(new Set(cleaned));
      };

      return {
        ...data,
        menu: Array.isArray(data?.menu)
          ? data.menu.map((item) => ({
              ...item,
              tags: sanitizeTags(item.tags),
              items: Array.isArray(item.items)
                ? item.items.map((option) => ({
                    ...option,
                    tags: sanitizeTags(option.tags),
                  }))
                : [],
            }))
          : [],
        links: Array.isArray(data?.links)
          ? data.links.map((link) => ({
              ...link,
              tags: sanitizeTags(link.tags),
            }))
          : [],
      };
    },
    [normalizeTagValue]
  );

  const handleSaveNavbar = useCallback(async () => {
    if (!navbarData) {
      toast.error("No hay navegación para guardar");
      return;
    }

    setNavbarSaving(true);
    try {
      const payload = sanitizeNavbarPayload(navbarData);
      const res = await authFetch(`/api/sections/navbar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la navegación");
      toast.success("Navegación actualizada");
      await loadNavbar();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo guardar la navegación");
    } finally {
      setNavbarSaving(false);
    }
  }, [navbarData, authFetch, sanitizeNavbarPayload, loadNavbar]);

  const handleCareerFileChange = useCallback((careerId, file) => {
    setCareerFiles((previous) => {
      const next = { ...previous };
      if (file) {
        next[careerId] = file;
      } else {
        delete next[careerId];
      }
      return next;
    });
  }, []);

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

  const persistCareers = useCallback(
    async (items) => {
      const res = await authFetch(`/api/sections/careers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudieron guardar las carreras");
      setCareers(items);
    },
    [authFetch]
  );

  const handleSaveCareerPdf = useCallback(
    async (careerId) => {
      const file = careerFiles[careerId];
      if (!file) {
        toast.error("Seleccioná un PDF para subir");
        return;
      }

      setCareerSaving((prev) => ({ ...prev, [careerId]: true }));
      try {
        const pdfUrl = await uploadFile(file);
        const updated = careers.map((career) =>
          career.id === careerId ? { ...career, pdfUrl } : career
        );
        await persistCareers(updated);
        toast.success("PDF actualizado");
        setCareerFiles((prev) => {
          const next = { ...prev };
          delete next[careerId];
          return next;
        });
      } catch (error) {
        console.error(error);
        toast.error(error.message || "No se pudo subir el PDF");
      } finally {
        setCareerSaving((prev) => ({ ...prev, [careerId]: false }));
      }
    },
    [careerFiles, careers, uploadFile, persistCareers]
  );

  const handleClearCareerPdf = useCallback(
    async (careerId) => {
      setCareerSaving((prev) => ({ ...prev, [careerId]: true }));
      try {
        const updated = careers.map((career) =>
          career.id === careerId ? { ...career, pdfUrl: "" } : career
        );
        await persistCareers(updated);
        toast.success("PDF eliminado");
      } catch (error) {
        console.error(error);
        toast.error(error.message || "No se pudo eliminar el PDF");
      } finally {
        setCareerSaving((prev) => ({ ...prev, [careerId]: false }));
      }
    },
    [careers, persistCareers]
  );

  const resolveImage = useCallback(
    (value) => {
      if (!value) return "";
      if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
      return buildUrl(value);
    },
    [buildUrl]
  );

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

  const handleNewUsinaTagSubmit = () => {
    const nextValue = normalizeTagValue(newUsinaTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la usina");
      return;
    }

    const currentTags = Array.isArray(newUsina.tags) ? [...newUsina.tags] : [];
    if (newUsinaTagEditingIndex >= 0) {
      currentTags[newUsinaTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setNewUsina({ ...newUsina, tags: currentTags });
    setNewUsinaTagInput("");
    setNewUsinaTagEditingIndex(-1);
  };

  const handleRemoveNewUsinaTag = (index) => {
    const currentTags = Array.isArray(newUsina.tags) ? [...newUsina.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setNewUsina({ ...newUsina, tags: currentTags });
    if (newUsinaTagEditingIndex === index) {
      setNewUsinaTagInput("");
      setNewUsinaTagEditingIndex(-1);
    } else if (newUsinaTagEditingIndex > index) {
      setNewUsinaTagEditingIndex((prev) => prev - 1);
    }
  };

  const handleBeginEditNewUsinaTag = (index) => {
    const currentTags = Array.isArray(newUsina.tags) ? newUsina.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setNewUsinaTagInput(currentTags[index]);
    setNewUsinaTagEditingIndex(index);
  };

  const handleUsinaDraftTagSubmit = () => {
    const nextValue = normalizeTagValue(usinaDraftTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la usina");
      return;
    }

    const currentTags = Array.isArray(usinaDraft.tags) ? [...usinaDraft.tags] : [];
    if (usinaDraftTagEditingIndex >= 0) {
      currentTags[usinaDraftTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setUsinaDraft({ ...usinaDraft, tags: currentTags });
    setUsinaDraftTagInput("");
    setUsinaDraftTagEditingIndex(-1);
  };

  const handleRemoveUsinaDraftTag = (index) => {
    const currentTags = Array.isArray(usinaDraft.tags) ? [...usinaDraft.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setUsinaDraft({ ...usinaDraft, tags: currentTags });
    if (usinaDraftTagEditingIndex === index) {
      setUsinaDraftTagInput("");
      setUsinaDraftTagEditingIndex(-1);
    } else if (usinaDraftTagEditingIndex > index) {
      setUsinaDraftTagEditingIndex((prev) => prev - 1);
    }
  };

  const handleBeginEditUsinaDraftTag = (index) => {
    const currentTags = Array.isArray(usinaDraft.tags) ? usinaDraft.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setUsinaDraftTagInput(currentTags[index]);
    setUsinaDraftTagEditingIndex(index);
  };

  const handleNewFaqTagSubmit = () => {
    const nextValue = normalizeTagValue(newFaqTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la pregunta frecuente");
      return;
    }

    const currentTags = Array.isArray(newFaq.tags) ? [...newFaq.tags] : [];
    if (newFaqTagEditingIndex >= 0) {
      currentTags[newFaqTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setNewFaq({ ...newFaq, tags: currentTags });
    setNewFaqTagInput("");
    setNewFaqTagEditingIndex(-1);
  };

  const handleRemoveNewFaqTag = (index) => {
    const currentTags = Array.isArray(newFaq.tags) ? [...newFaq.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setNewFaq({ ...newFaq, tags: currentTags });
    if (newFaqTagEditingIndex === index) {
      setNewFaqTagInput("");
      setNewFaqTagEditingIndex(-1);
    } else if (newFaqTagEditingIndex > index) {
      setNewFaqTagEditingIndex((prev) => prev - 1);
    }
  };

  const handleBeginEditNewFaqTag = (index) => {
    const currentTags = Array.isArray(newFaq.tags) ? newFaq.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setNewFaqTagInput(currentTags[index]);
    setNewFaqTagEditingIndex(index);
  };

  const handleFaqDraftTagSubmit = () => {
    const nextValue = normalizeTagValue(faqDraftTagInput);
    if (!nextValue) {
      toast.error("Ingresá una etiqueta para la pregunta frecuente");
      return;
    }

    const currentTags = Array.isArray(faqDraft.tags) ? [...faqDraft.tags] : [];
    if (faqDraftTagEditingIndex >= 0) {
      currentTags[faqDraftTagEditingIndex] = nextValue;
    } else {
      if (currentTags.includes(nextValue)) {
        toast.error("Esa etiqueta ya está cargada");
        return;
      }
      currentTags.push(nextValue);
    }

    setFaqDraft({ ...faqDraft, tags: currentTags });
    setFaqDraftTagInput("");
    setFaqDraftTagEditingIndex(-1);
  };

  const handleRemoveFaqDraftTag = (index) => {
    const currentTags = Array.isArray(faqDraft.tags) ? [...faqDraft.tags] : [];
    if (index < 0 || index >= currentTags.length) return;
    currentTags.splice(index, 1);
    setFaqDraft({ ...faqDraft, tags: currentTags });
    if (faqDraftTagEditingIndex === index) {
      setFaqDraftTagInput("");
      setFaqDraftTagEditingIndex(-1);
    } else if (faqDraftTagEditingIndex > index) {
      setFaqDraftTagEditingIndex((prev) => prev - 1);
    }
  };

  const handleBeginEditFaqDraftTag = (index) => {
    const currentTags = Array.isArray(faqDraft.tags) ? faqDraft.tags : [];
    if (index < 0 || index >= currentTags.length) return;
    setFaqDraftTagInput(currentTags[index]);
    setFaqDraftTagEditingIndex(index);
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
        await Promise.all([loadSlider(), loadAgenda(), loadUsina(), loadTextos(), loadFaqs(), loadNavbar(), loadCareers()]);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo validar la sesión");
        router.push("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyAuth();
  }, [
    token,
    router,
    buildUrl,
    loadSlider,
    loadAgenda,
    loadUsina,
    loadTextos,
    loadFaqs,
    loadNavbar,
    loadCareers,
  ]);

  const handleCreateSlider = async (event) => {
    event.preventDefault();
    if (!newSliderDesktopFile) {
      toast.error("Seleccioná la imagen para escritorio");
      return;
    }
    if (!newSliderMobileFile) {
      toast.error("Seleccioná la imagen para mobile");
      return;
    }
    try {
      const imageDesktopUrl = await uploadFile(newSliderDesktopFile);
      const imageMobileUrl = await uploadFile(newSliderMobileFile);
      const res = await authFetch(`/api/carousel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captionText: newSlider.captionText,
          imageDesktopUrl,
          imageMobileUrl,
          imageUrl: imageDesktopUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la imagen");
      toast.success("Imagen añadida al carrusel");
      setNewSlider(initialSlider);
      setNewSliderDesktopFile(null);
      setNewSliderMobileFile(null);
      loadSlider();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateSlider = async (id) => {
    try {
      let imageDesktopUrl = sliderDraft.imageDesktopUrl || sliderDraft.imageUrl;
      let imageMobileUrl = sliderDraft.imageMobileUrl || imageDesktopUrl;
      if (sliderDraftDesktopFile) {
        imageDesktopUrl = await uploadFile(sliderDraftDesktopFile);
      }
      if (sliderDraftMobileFile) {
        imageMobileUrl = await uploadFile(sliderDraftMobileFile);
      }
      const fallback = imageDesktopUrl || imageMobileUrl;
      if (!fallback) {
        toast.error("El carrusel necesita al menos una imagen");
        return;
      }
      const res = await authFetch(`/api/carousel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captionText: sliderDraft.captionText,
          imageDesktopUrl,
          imageMobileUrl,
          imageUrl: fallback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la imagen");
      toast.success("Imagen actualizada");
      setEditingSliderId(null);
      setSliderDraft(initialSlider);
      setSliderDraftDesktopFile(null);
      setSliderDraftMobileFile(null);
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
    const sanitizedTags = Array.isArray(newUsina.tags)
      ? newUsina.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta para la tarjeta");
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
        body: JSON.stringify({ ...newUsina, imageUrl, tags: sanitizedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo crear la tarjeta");
      toast.success("Tarjeta de Usina creada");
      setNewUsina(initialUsina);
      setNewUsinaFile(null);
      setNewUsinaTagInput("");
      setNewUsinaTagEditingIndex(-1);
      loadUsina();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateUsina = async (id) => {
    const sanitizedTags = Array.isArray(usinaDraft.tags)
      ? usinaDraft.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta para la tarjeta");
      return;
    }
    try {
      let imageUrl = usinaDraft.imageUrl;
      if (usinaDraftFile) {
        imageUrl = await uploadFile(usinaDraftFile);
      }
      const res = await authFetch(`/api/usina/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...usinaDraft, imageUrl, tags: sanitizedTags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo actualizar la tarjeta");
      toast.success("Tarjeta actualizada");
      setUsinaEditingId(null);
      setUsinaDraft(initialUsina);
      setUsinaDraftFile(null);
      setUsinaDraftTagInput("");
      setUsinaDraftTagEditingIndex(-1);
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

    const sanitizedTags = Array.isArray(newFaq.tags)
      ? newFaq.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta");
      return;
    }

    try {
      const payload = {
        question: newFaq.question,
        answer: newFaq.answer,
        tags: sanitizedTags,
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
      setNewFaqTagInput("");
      setNewFaqTagEditingIndex(-1);
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

    const sanitizedTags = Array.isArray(faqDraft.tags)
      ? faqDraft.tags.map((tag) => normalizeTagValue(tag)).filter(Boolean)
      : [];
    if (!sanitizedTags.length) {
      toast.error("Agregá al menos una etiqueta");
      return;
    }

    try {
      const payload = {
        question: faqDraft.question,
        answer: faqDraft.answer,
        tags: sanitizedTags,
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
      setFaqDraftTagInput("");
      setFaqDraftTagEditingIndex(-1);
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
      setFaqDraftTagInput("");
      setFaqDraftTagEditingIndex(-1);
      loadFaqs();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderNavbarTagEditor = (scope, parentIndex, childIndex = null) => {
    if (!navbarData) return null;
    const tags = getNavbarTags(navbarData, scope, parentIndex, childIndex) || [];

    return (
      <div className={styles.navbarTagManager}>
        {tags.length ? (
          tags.map((tag, tagIndex) => (
            <div key={`${scope}-${parentIndex}-${childIndex ?? "root"}-${tagIndex}`} className={styles.navbarTagRow}>
              <input
                type="text"
                value={tag}
                onChange={(e) => handleNavbarTagChange(scope, parentIndex, childIndex, tagIndex, e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={`${styles.tagButton} ${styles.tagRemove}`}
                onClick={() => handleNavbarTagRemove(scope, parentIndex, childIndex, tagIndex)}
                aria-label={`Quitar etiqueta ${tag || tagIndex + 1}`}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <p className={styles.tagHelper}>Aún no hay etiquetas para este ítem.</p>
        )}
        <button
          type="button"
          className={styles.tagSubmitButton}
          onClick={() => handleNavbarTagAdd(scope, parentIndex, childIndex)}
        >
          Agregar etiqueta
        </button>
      </div>
    );
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
              Imagen escritorio
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setNewSliderDesktopFile(e.target.files?.[0] || null)}
              />
              {newSliderDesktopPreview && (
                <img src={newSliderDesktopPreview} alt="Vista previa escritorio" className={styles.preview} />
              )}
            </label>
            <label className={styles.label}>
              Imagen mobile
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => setNewSliderMobileFile(e.target.files?.[0] || null)}
              />
              {newSliderMobilePreview && (
                <img src={newSliderMobilePreview} alt="Vista previa mobile" className={styles.preview} />
              )}
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
            const baseDesktop = resolveImage(item.imageDesktopUrl || item.imageUrl);
            const baseMobile = resolveImage(item.imageMobileUrl || item.imageDesktopUrl || item.imageUrl);
            const desktopPreview = isEditing
              ? sliderDraftDesktopFile
                ? sliderDraftDesktopPreview || baseDesktop
                : resolveImage(
                    sliderDraft.imageDesktopUrl ||
                      sliderDraft.imageUrl ||
                      item.imageDesktopUrl ||
                      item.imageUrl
                  )
              : baseDesktop;
            const mobilePreview = isEditing
              ? sliderDraftMobileFile
                ? sliderDraftMobilePreview || baseMobile
                : resolveImage(
                    sliderDraft.imageMobileUrl ||
                      sliderDraft.imageDesktopUrl ||
                      sliderDraft.imageUrl ||
                      item.imageMobileUrl ||
                      item.imageUrl
                  )
              : baseMobile;

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.dualThumb}>
                  {desktopPreview && (
                    <div className={styles.thumbItem}>
                      <span className={styles.thumbLabel}>Escritorio</span>
                      <img src={desktopPreview} alt="Vista escritorio" className={styles.cardThumb} />
                    </div>
                  )}
                  {mobilePreview && (
                    <div className={styles.thumbItem}>
                      <span className={styles.thumbLabel}>Mobile</span>
                      <img src={mobilePreview} alt="Vista mobile" className={styles.cardThumb} />
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Imagen escritorio</span>
                      {baseDesktop && <img src={baseDesktop} alt="Escritorio actual" className={styles.preview} />}
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => setSliderDraftDesktopFile(e.target.files?.[0] || null)}
                      />
                      {sliderDraftDesktopFile && sliderDraftDesktopPreview && (
                        <img src={sliderDraftDesktopPreview} alt="Nuevo escritorio" className={styles.preview} />
                      )}
                      <button
                        type="button"
                        className={`${styles.button} ${styles.ghostButton}`}
                        onClick={() => {
                          setSliderDraft((draft) => ({ ...draft, imageDesktopUrl: "" }));
                          setSliderDraftDesktopFile(null);
                        }}
                      >
                        Quitar escritorio
                      </button>
                    </div>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Imagen mobile</span>
                      {baseMobile && <img src={baseMobile} alt="Mobile actual" className={styles.preview} />}
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={(e) => setSliderDraftMobileFile(e.target.files?.[0] || null)}
                      />
                      {sliderDraftMobileFile && sliderDraftMobilePreview && (
                        <img src={sliderDraftMobilePreview} alt="Nuevo mobile" className={styles.preview} />
                      )}
                      <button
                        type="button"
                        className={`${styles.button} ${styles.ghostButton}`}
                        onClick={() => {
                          setSliderDraft((draft) => ({ ...draft, imageMobileUrl: "" }));
                          setSliderDraftMobileFile(null);
                        }}
                      >
                        Quitar mobile
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
                          setSliderDraftDesktopFile(null);
                          setSliderDraftMobileFile(null);
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
                          setSliderDraft({
                            imageUrl: item.imageUrl || "",
                            imageDesktopUrl: item.imageDesktopUrl || item.imageUrl || "",
                            imageMobileUrl: item.imageMobileUrl || item.imageDesktopUrl || item.imageUrl || "",
                            captionText: item.captionText || "",
                          });
                          setSliderDraftDesktopFile(null);
                          setSliderDraftMobileFile(null);
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
            <div className={`${styles.label} ${styles.formGridFull}`}>
              <span>Etiquetas</span>
              <div className={styles.tagField}>
                <div className={styles.tagInputRow}>
                  <input
                    type="text"
                    value={newUsinaTagInput}
                    onChange={(e) => setNewUsinaTagInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        handleNewUsinaTagSubmit();
                      }
                    }}
                    className={styles.input}
                    placeholder="Ej: Proyectos, Talleres"
                  />
                  <button
                    type="button"
                    className={styles.tagSubmitButton}
                    onClick={handleNewUsinaTagSubmit}
                  >
                    {newUsinaTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                  </button>
                </div>
                <p className={styles.tagHelper}>
                  Definí etiquetas temáticas para organizar las tarjetas de la usina.
                </p>
                <div className={styles.tagList}>
                  {(newUsina.tags || []).map((tag, index) => (
                    <span key={`${tag}-${index}`} className={styles.tagPill}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagEdit}`}
                        onClick={() => handleBeginEditNewUsinaTag(index)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagRemove}`}
                        onClick={() => handleRemoveNewUsinaTag(index)}
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
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Etiquetas</span>
                      <div className={styles.tagField}>
                        <div className={styles.tagInputRow}>
                          <input
                            type="text"
                            value={usinaDraftTagInput}
                            onChange={(e) => setUsinaDraftTagInput(e.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === ",") {
                                event.preventDefault();
                                handleUsinaDraftTagSubmit();
                              }
                            }}
                            className={styles.input}
                            placeholder="Ej: Comunidad, Inspiración"
                          />
                          <button
                            type="button"
                            className={styles.tagSubmitButton}
                            onClick={handleUsinaDraftTagSubmit}
                          >
                            {usinaDraftTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                          </button>
                        </div>
                        <p className={styles.tagHelper}>Etiquetas visibles en la sección pública.</p>
                        <div className={styles.tagList}>
                          {(usinaDraft.tags || []).map((tag, index) => (
                            <span key={`${item.id}-usina-tag-${index}`} className={styles.tagPill}>
                              <span>{tag}</span>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagEdit}`}
                                onClick={() => handleBeginEditUsinaDraftTag(index)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagRemove}`}
                                onClick={() => handleRemoveUsinaDraftTag(index)}
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
                          setUsinaDraftTagInput("");
                          setUsinaDraftTagEditingIndex(-1);
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
                      {(item.tags || []).length ? (
                        <div className={styles.tagList}>
                          {item.tags.map((tag, index) => (
                            <span key={`${item.id}-tag-${index}`} className={styles.tagPillStatic}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
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
                            tags: Array.isArray(item.tags) ? item.tags : [],
                          });
                          setUsinaDraftFile(null);
                          setUsinaDraftTagInput("");
                          setUsinaDraftTagEditingIndex(-1);
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
          <h2>Subpáginas</h2>
          <p>Administrá las etiquetas del menú de navegación y sus accesos.</p>
        </div>
        {navbarData ? (
          <>
            <div className={styles.cardGrid}>
              {navbarData.menu.map((item, menuIndex) => (
                <div key={item.id} className={`${styles.card} ${styles.textCard}`}>
                  <div className={styles.cardInfo}>
                    <h3>{item.label}</h3>
                    {renderNavbarTagEditor("menu", menuIndex)}
                    {Array.isArray(item.items) && item.items.length ? (
                      <div className={styles.submenuList}>
                        {item.items.map((option, optionIndex) => (
                          <div key={option.id} className={styles.submenuItem}>
                            <strong>{option.label}</strong>
                            {renderNavbarTagEditor("submenu", menuIndex, optionIndex)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cardGrid}>
              <div className={`${styles.card} ${styles.textCard}`}>
                <div className={styles.cardInfo}>
                  <h3>Enlaces rápidos</h3>
                  {navbarData.links.map((link, linkIndex) => (
                    <div key={link.id} className={styles.submenuItem}>
                      <strong>{link.label}</strong>
                      {renderNavbarTagEditor("link", linkIndex)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.button}
                onClick={handleSaveNavbar}
                disabled={navbarSaving}
              >
                {navbarSaving ? "Guardando…" : "Guardar navegación"}
              </button>
            </div>
          </>
        ) : (
          <p className={styles.cardMeta}>Cargando navegación…</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Carreras</h2>
          <p>Cargá o quitá los PDF informativos de cada carrera.</p>
        </div>
        <div className={styles.cardGrid}>
          {careers.map((career) => {
            const currentFile = careerFiles[career.id];
            const isSaving = !!careerSaving[career.id];
            const pdfLink = career.pdfUrl ? resolveImage(career.pdfUrl) : "";
            return (
              <div key={career.id} className={`${styles.card} ${styles.textCard}`}>
                <div className={styles.cardInfo}>
                  <h3>{career.name}</h3>
                  {pdfLink ? (
                    <p className={styles.cardMeta}>
                      <a href={pdfLink} target="_blank" rel="noreferrer">
                        Ver PDF actual
                      </a>
                    </p>
                  ) : (
                    <p className={styles.cardMeta}>Sin PDF asignado.</p>
                  )}
                  <label className={styles.label}>
                    Subir nuevo PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className={styles.fileInput}
                      onChange={(e) => handleCareerFileChange(career.id, e.target.files?.[0] || null)}
                    />
                  </label>
                  {currentFile && (
                    <p className={styles.cardMeta}>Archivo seleccionado: {currentFile.name}</p>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => handleSaveCareerPdf(career.id)}
                    disabled={isSaving || !currentFile}
                  >
                    {isSaving ? "Guardando…" : "Guardar PDF"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => handleCareerFileChange(career.id, null)}
                    disabled={isSaving || !currentFile}
                  >
                    Quitar selección
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonDanger}`}
                    onClick={() => handleClearCareerPdf(career.id)}
                    disabled={isSaving || !career.pdfUrl}
                  >
                    Quitar PDF
                  </button>
                </div>
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
            <div className={`${styles.label} ${styles.formGridFull}`}>
              <span>Etiquetas</span>
              <div className={styles.tagField}>
                <div className={styles.tagInputRow}>
                  <input
                    type="text"
                    value={newFaqTagInput}
                    onChange={(e) => setNewFaqTagInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        handleNewFaqTagSubmit();
                      }
                    }}
                    className={styles.input}
                    placeholder="Ej: Ingresos, Calendario"
                  />
                  <button
                    type="button"
                    className={styles.tagSubmitButton}
                    onClick={handleNewFaqTagSubmit}
                  >
                    {newFaqTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                  </button>
                </div>
                <p className={styles.tagHelper}>Agrupá las preguntas para facilitar su búsqueda.</p>
                <div className={styles.tagList}>
                  {(newFaq.tags || []).map((tag, index) => (
                    <span key={`${tag}-${index}`} className={styles.tagPill}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagEdit}`}
                        onClick={() => handleBeginEditNewFaqTag(index)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${styles.tagButton} ${styles.tagRemove}`}
                        onClick={() => handleRemoveNewFaqTag(index)}
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
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Etiquetas</span>
                      <div className={styles.tagField}>
                        <div className={styles.tagInputRow}>
                          <input
                            type="text"
                            value={faqDraftTagInput}
                            onChange={(e) => setFaqDraftTagInput(e.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === ",") {
                                event.preventDefault();
                                handleFaqDraftTagSubmit();
                              }
                            }}
                            className={styles.input}
                            placeholder="Ej: Inscripciones"
                          />
                          <button
                            type="button"
                            className={styles.tagSubmitButton}
                            onClick={handleFaqDraftTagSubmit}
                          >
                            {faqDraftTagEditingIndex >= 0 ? "Guardar etiqueta" : "Agregar etiqueta"}
                          </button>
                        </div>
                        <p className={styles.tagHelper}>Definí categorías para la búsqueda en el sitio.</p>
                        <div className={styles.tagList}>
                          {(faqDraft.tags || []).map((tag, index) => (
                            <span key={`${faq.id}-faq-tag-${index}`} className={styles.tagPill}>
                              <span>{tag}</span>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagEdit}`}
                                onClick={() => handleBeginEditFaqDraftTag(index)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className={`${styles.tagButton} ${styles.tagRemove}`}
                                onClick={() => handleRemoveFaqDraftTag(index)}
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
                      <button type="button" className={styles.button} onClick={() => handleUpdateFaq(faq.id)}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => {
                          setFaqEditingId(null);
                          setFaqDraft(initialFaq);
                          setFaqDraftTagInput("");
                          setFaqDraftTagEditingIndex(-1);
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
                      {(faq.tags || []).length ? (
                        <div className={styles.tagList}>
                          {faq.tags.map((tag, index) => (
                            <span key={`${faq.id}-display-tag-${index}`} className={styles.tagPillStatic}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
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
                            tags: Array.isArray(faq.tags) ? faq.tags : [],
                          });
                          setFaqDraftTagInput("");
                          setFaqDraftTagEditingIndex(-1);
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
