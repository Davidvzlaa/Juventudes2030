import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";
import EMB2DA from "../../assets/EMB2DA.jpg";
import { ods } from "../../data";

export default function HeroSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      id="inicio"
      ref={ref}
      className={`relative min-h-[400px] overflow-hidden transition-opacity duration-700 ${
        inView ? "animate-zoom-in animate-range-cover animate-duration-[0.5s] opacity-100" : "opacity-0"
      }`}
    >
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
          <p className="mt-8 max-w-2xl  text-base leading-7 text-white/80 sm:text-lg">
            Un espacio para visibilizar, impulsar y conectar las acciones de
            las juventudes que trabajan por comunidades más justas, inclusivas
            y sostenibles.
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            <a href="#acciones" className="group flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-[#061A2D] transition hover:bg-gray-100">
              Conoce el proyecto
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#eventos" className="flex items-center gap-3 border border-white/40 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
              Ver actividades
            </a>
          </div>
        </div>
      </div>

      {/* BARRA ODS */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        {ods.map((item) => (
          <div key={item.id} className="h-full flex-1" style={{ backgroundColor: item.color }} />
        ))}
      </div>
    </section>
  );
}