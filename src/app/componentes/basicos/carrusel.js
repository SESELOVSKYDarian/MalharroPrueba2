'use client';

import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/app/config';
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
    fetch(`${API_URL}/slider`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImagenesCarrusel(data);
        } else {
          setImagenesCarrusel([]);
        }
      })
      .catch(err => console.error('Error al cargar imágenes:', err));
  }, []);

  return (
    <div className="carrusel-container">
      {/* Carrusel usando react-slick */}
      <Slider ref={sliderRef} {...settings}>
        {imagenesCarrusel.map((imagen, index) => {
          const url = imagen.imageUrl;
          return (
            <div key={`slide-${index}`} style={{ width: '100%' }}>
              <div
                className='carrusel-img'
                style={{
                  backgroundImage: url
                    ? `linear-gradient(rgba(120, 51, 51, 0.5), rgba(0, 0, 0, 0.5)), url(${url})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Muestra el título si existe */}
                {imagen.captionText && (
                  <div className='titulo'>
                    <ReactMarkdown>{imagen.captionText}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}
