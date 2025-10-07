const STATIC_IMAGES = {
  logo: "/img/Logo.PNG",
};

// Obtiene la URL de una imagen a partir de su imagenID
export async function getImagenbyImagenID(ImagenID) {
  if (!ImagenID) return null;
  const key = ImagenID.toLowerCase();
  if (STATIC_IMAGES[key]) {
    return STATIC_IMAGES[key];
  }
  console.warn(`No se encontró una imagen estática para el ID ${ImagenID}`);
  return null;
}
