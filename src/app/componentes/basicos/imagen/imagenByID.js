const imageMap = {
  logo: "/malharrooficial/images/Logo_Malharro.svg",
};

export async function getImagenbyImagenID(ImagenID) {
  return imageMap[ImagenID] || null;
}
