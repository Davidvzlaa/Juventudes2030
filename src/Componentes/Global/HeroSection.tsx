import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "../../lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EMB2DA from "../../assets/EMB2DA.jpg";
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
  
  // Plugin Autoplay configurado a 5 segundos
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

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
        if (data && data.length > 0) setBanners(data);
        else setHasError(true);
      } catch (error) {
        console.error("Error cargando banners:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const useFallback = isLoading || hasError || banners.length === 0;

  return (
    <section
      id="inicio"
      ref={ref}
      // Altura fija absoluta
      className={`relative h-[400px] md:h-[450px] w-full overflow-hidden transition-opacity duration-700 ${
        inView ? "animate-zoom-in animate-range-cover animate-duration-[0.5s] opacity-100" : "opacity-0"
      }`}
    >
      {useFallback ? (
        <>
          <img src={EMB2DA} alt="Juventudes participando" className="absolute inset-0 h-full w-full object-cover object-center animate-fade-in-up" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/95 via-[#061A2D]/80 to-[#061A2D]/25" />
          
          <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-balance line-clamp-2">
                Juventudes<br />que transforman.
              </h1>
              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80 line-clamp-2">
                Un espacio para visibilizar, impulsar y conectar las acciones de las juventudes que trabajan por comunidades más justas, inclusivas y sostenibles.
              </p>
              <div className="mt-6">
                <a href="/acercade" className="group inline-flex items-center gap-3 bg-white px-6 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-gray-100">
                  Conoce el proyecto
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={() => plugin.current.stop()}
          onMouseLeave={() => plugin.current.play()}
          opts={{ loop: true, watchDrag: banners.length > 1 }}
          className="w-full h-full relative"
        >
          <CarouselContent className="h-full">
            {banners.map((banner) => (
              <CarouselItem key={banner.id} className="relative h-[400px] md:h-[450px]">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover object-center animate-fade-in-up"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#061A2D]/95 via-[#061A2D]/80 to-[#061A2D]/25" />

                <div className="relative mx-auto flex h-full max-w-7xl items-center px-12 sm:px-16">
                  <div className="max-w-3xl text-white w-full">
                    <h1 
                      className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight whitespace-pre-line text-balance line-clamp-2"
                      title={banner.title}
                    >
                      {banner.title}
                    </h1>
                    
                    <p 
                      className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80 line-clamp-2"
                      title={banner.description}
                    >
                      {banner.description}
                    </p>

                    <div className="mt-6">
                      <a href={banner.cta_link} className="group inline-flex items-center gap-3 bg-white px-6 py-3 text-sm font-semibold text-[#061A2D] transition hover:bg-gray-100">
                        {banner.cta_text}
                        <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* 
            SOLUCIÓN DEFINITIVA: 
            Se eliminaron las clases conflictivas de Tailwind ("top-1/2", "-translate-y-1/2") 
            y se forzó el posicionamiento con CSS puro en la propiedad "style".
            El "calc(50% - 4px)" compensa la altura de la barra inferior de ODS. 
          */}
          {banners.length > 1 && (
            <>
              <CarouselPrevious 
                className="hidden sm:flex absolute left-4 md:left-8 border-white/20 bg-[#061A2D]/80 text-white hover:bg-white hover:text-[#061A2D] transition-colors z-[60] h-12 w-12 cursor-pointer pointer-events-auto items-center justify-center" 
                style={{ top: 'calc(50% - 4px)', transform: 'translateY(-50%)', margin: 0 }}
              />
              <CarouselNext 
                className="hidden sm:flex absolute right-4 md:right-8 border-white/20 bg-[#061A2D]/80 text-white hover:bg-white hover:text-[#061A2D] transition-colors z-[60] h-12 w-12 cursor-pointer pointer-events-auto items-center justify-center" 
                style={{ top: 'calc(50% - 4px)', transform: 'translateY(-50%)', margin: 0 }}
              />
            </>
          )}
        </Carousel>
      )}

      {/* BARRA ODS */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2 z-[70] pointer-events-none">
        {ods.map((item) => (
          <div key={item.id} className="h-full flex-1" style={{ backgroundColor: item.color }} />
        ))}
      </div>
    </section>
  );
}