import { useInView } from "react-intersection-observer";
import { ArrowRight } from "lucide-react";

export default function ParticipaSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section
      id="participa"
      ref={ref}
      className={`relative overflow-hidden bg-[#00689D] transition-all duration-1000 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[40px] border-white/5" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full border-[50px] border-white/5" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="text-white">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
              Participa
            </span>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Tu participación también construye futuro.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">
              Las grandes transformaciones comienzan con personas dispuestas a
              participar, colaborar y actuar.
            </p>
          </div>

          <a href="#inicio" className="group flex w-fit items-center gap-4 bg-white px-7 py-4 text-sm font-bold text-[#061A2D] transition hover:bg-gray-100">
            Quiero participar
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}