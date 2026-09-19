import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "../../lib/supabase"; // AJUSTA ESTA RUTA a tu cliente de Supabase
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Ajusta la ruta a tu componente shadcn
import EMB2DA from "../../assets/EMB2DA.jpg"; // Ajusta la ruta a tu imagen de fallback
import { ods } from "../../data";

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
}

export default function HeroSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const plugin = useRef(Autoplay({ delay: 6000, stopOnInteraction: true }));

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_banners")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setBanners(data);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error cargando banners:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Si está cargando, da error, o no hay datos en BD -> Mostramos tu diseño original.
  const useFallback = isLoading || hasError || banners.length === 0;

  return (
    <section
      id="inicio"
      ref={ref}
      className={`relative min-h-[400px] overflow-hidden transition-opacity duration-700 ${
        inView ? "animate-zoom-in animate-range-cover animate-duration-[0.5s] opacity-100" : "opacity-0"
      }`}
    >
      {useFallback ? (
        /* =========================================
           VERSIÓN ORIGINAL FALLBACK (Tu código intacto)
           ========================================= */
        <>
          <img
            src={EMB2DA}
            alt="Juventudes participando"
            className="absolute inset-0 h-full w-full object-cover object-center animate-fade-in-up"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/95 via-[#061A2D]/80 to-[#061A2D]/25" />

          <div className="relative mx-auto flex min-h-[400px] max-w-7xl items-center px-5 py-15 sm:px-8">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight ani sm:text-6xl lg:text-8xl">
                Juventudes
                <br />
                que transforman.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Un espacio para visibilizar, impulsar y conectar las acciones de
                las juventudes que trabajan por comunidades más justas, inclusivas
                y sostenibles.
              </p>

              <div className="mt-5 flex flex-wrap gap-4">
                <a href="/acercade" className="group flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-[#061A2D] transition hover:bg-gray-100">
                  Conoce el proyecto
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================
           VERSIÓN DINÁMICA (Base de datos Supabase)
           ========================================= */
        <Carousel
          plugins={[plugin.current]}
          opts={{ loop: true, watchDrag: banners.length > 1 }}
          className="w-full" // <- Eliminados absolute e h-full para respetar tus alturas y padding
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id} className="relative min-h-[400px]">
                {/* Imagen de fondo de la BD */}
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover object-center animate-fade-in-up"
                />
                {/* Overlay oscuro para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/95 via-[#061A2D]/80 to-[#061A2D]/25" />

                <div className="relative mx-auto flex min-h-[400px] max-w-7xl items-center px-5 py-15 sm:px-8">
                  <div className="max-w-3xl text-white">
                    {/* Se usa whitespace-pre-line para que los saltos de línea de la BD funcionen */}
                    <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight ani sm:text-6xl lg:text-8xl whitespace-pre-line">
                      {banner.title}
                    </h1>
                    <p className="mt-8 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                      {banner.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4">
                      <a href={banner.cta_link} className="group flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-[#061A2D] transition hover:bg-gray-100">
                        {banner.cta_text}
                        <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Flechas: Solo se muestran si hay 2 o más banners registrados */}
          {banners.length > 1 && (
            <div className="hidden sm:block">
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 border-white/20 bg-[#061A2D]/50 text-white hover:bg-white hover:text-[#061A2D] transition-colors z-10" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 border-white/20 bg-[#061A2D]/50 text-white hover:bg-white hover:text-[#061A2D] transition-colors z-10" />
            </div>
          )}
        </Carousel>
      )}

      {/* BARRA ODS - Siempre visible en el fondo del contenedor general */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2 z-10">
        {ods.map((item) => (
          <div key={item.id} className="h-full flex-1" style={{ backgroundColor: item.color }} />
        ))}
      </div>
    </section>
  );
}