const ACORDEONES = {
    carreras: [
        {
            id: 1,
            titulo: "Profesorado de Artes Visuales",
            contenido: "Formación integral en pedagogía y prácticas visuales contemporáneas.",
            color: "#f5c518"
        },
        {
            id: 2,
            titulo: "Tecnicatura en Diseño Multimedial",
            contenido: "Experimentación con animación, fotografía y programación para experiencias digitales.",
            color: "#ef6c8f"
        },
        {
            id: 3,
            titulo: "Tecnicatura en Cerámica",
            contenido: "Talleres con enfoque en materialidad, volumen y producción artesanal.",
            color: "#63c4c1"
        }
    ]
};

export async function getAcordeonByAcordeonID(acordeonID) {
    const key = acordeonID?.toLowerCase();
    if (key && ACORDEONES[key]) {
        return ACORDEONES[key];
    }
    console.warn(`No se encontraron datos de acordeón para ${acordeonID}`);
    return [];
}
