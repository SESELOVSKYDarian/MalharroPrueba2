'use client';

import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Componente para la flecha izquierda del carrusel
const PrevArrow = ({ onClick }) => (
  <button className="custom-arrow prev-arrow" onClick={onClick}>
    <FaArrowLeft />
  </button>
);

// Componente para la flecha derecha del carrusel
const NextArrow = ({ onClick }) => (
  <button className="custom-arrow next-arrow" onClick={onClick}>
    <FaArrowRight />
  </button>
);

export default function Carrusel() {
  const sliderRef = useRef(null); // Referencia al slider
  const [imagenesCarrusel, setImagenesCarrusel] = useState([]); // Imágenes del carrusel
  const [isLoading, setIsLoading] = useState(true);

  // Configuración del carrusel
  const settings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    fade: false,
    adaptiveHeight: true,
    swipe: true,
    touchThreshold: 100,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  // Carga las imágenes del carrusel al montar el componente
  useEffect(() => {
    fetch(`/api/slider`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el carrusel');
        return res.json();
      })
      .then((data) => {
        setImagenesCarrusel(Array.isArray(data.items) ? data.items : []);
      })
      .catch(err => console.error('Error al cargar imágenes:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="carrusel-container">
      {isLoading ? (
        <p className="carrusel-loading">Cargando carrusel…</p>
      ) : imagenesCarrusel.length === 0 ? (
        <p className="carrusel-empty">No hay imágenes disponibles.</p>
      ) : (
        <Slider ref={sliderRef} {...settings}>
          {imagenesCarrusel.map((imagen) => (
            <div key={imagen.id} className="slider-item">
              <div
                className="slider-item__image"
                style={{
                  backgroundImage: `url(${imagen.imageUrl})`
                }}
              >
                {imagen.captionText && (
                  <div className="slider-item__caption">
                    <ReactMarkdown>{imagen.captionText}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}
