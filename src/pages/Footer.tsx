import { Globe2, Users } from 'lucide-react'
import Juventudes2030 from '../assets/LOGO JUVENTUDES 20230.png'
// import { ods } from './data/ods'

export default function Footer() {
  return (

      <footer className="bg-[#061A2D] text-white">


        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Identidad */}
            <div className="lg:col-span-2">
              <img
                src={Juventudes2030}
                alt="Juventudes 2030"
                loading="lazy"
                className="h-14 w-auto object-contain brightness-0 invert"
              />
              <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
                Espacio de participación y acción juvenil orientado a impulsar
                iniciativas que contribuyan al desarrollo sostenible y al
                bienestar de las comunidades.
              </p>
            </div>

            {/* Navegación */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                Navegación
              </h3>
              <div className="mt-5 flex flex-col gap-3">
                <a href="#inicio" className="text-sm text-white/60 transition hover:text-white">
                  Inicio
                </a>
                <a href="#acciones" className="text-sm text-white/60 transition hover:text-white">
                  Acciones
                </a>
                <a href="#eventos" className="text-sm text-white/60 transition hover:text-white">
                  Eventos
                </a>
                <a href="#ods" className="text-sm text-white/60 transition hover:text-white">
                  Agenda 2030
                </a>
              </div>
            </div>

            {/* Información */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                Información
              </h3>
              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <Globe2 size={17} className="shrink-0 text-[#26BDE2]" />
                  <span className="text-sm text-white/60">
                    Desarrollo sostenible
                  </span>
                </div>
                <div className="flex gap-3">
                  <Users size={17} className="shrink-0 text-[#26BDE2]" />
                  <span className="text-sm text-white/60">
                    Participación juvenil
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-3 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} · Juventudes 2030
              </span>
              <span>Agenda 2030 para el Desarrollo Sostenible</span>
            </div>
          </div>
        </div>
      </footer>     
  );
}