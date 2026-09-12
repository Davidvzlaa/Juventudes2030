import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { 
  FaFacebook, 
  FaInstagram, 
  FaXTwitter, 
  FaLinkedin, 
  FaYoutube 
} from "react-icons/fa6";
import Juventudes2030 from '../assets/LOGO JUVENTUDES 20230.png';
import { supabase } from '../lib/supabase';

interface Horario {
  etiqueta?: string;
  dias: string;
  horas: string;
}

interface Sistema {
  nombre: string;
  direccion: string;
  correo: string;
  telefono: string;
  logotipos: {
    principal?: string;
    blanco?: string;
    icono?: string;
  };
  horarios: Horario[]; 
}

interface RedSocial {
  id: number;
  nombre: string;
  url: string;
}

export default function Footer() {
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFooterData = async () => {
      try {
        const { data: dataSistema } = await supabase
          .from('sistemas')
          .select('nombre, direccion, horarios, correo, telefono, logotipos')
          .eq('activo', true)
          .maybeSingle();

        if (dataSistema && isMounted) setSistema(dataSistema);

        const { data: dataRedes } = await supabase
          .from('redes_sociales')
          .select('id, nombre, url')
          .eq('activo', true)
          .order('id', { ascending: true });

        if (dataRedes && isMounted) setRedes(dataRedes);

      } catch (error) {
        console.error('Error al cargar datos del footer:', error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchFooterData();
    return () => { isMounted = false; };
  }, []);

  const getIconoRed = (nombre: string) => {
    const props = { size: 16, className: "shrink-0 transition-all duration-300 hover:scale-110" };
    switch (nombre.toLowerCase()) {
      case 'facebook': return <FaFacebook {...props} />;
      case 'instagram': return <FaInstagram {...props} />;
      case 'twitter': 
      case 'x': return <FaXTwitter {...props} />;
      case 'linkedin': return <FaLinkedin {...props} />; 
      case 'youtube': return <FaYoutube {...props} />;
      default: return null;
    }
  };

  const getLogo = () => {
    if (!sistema?.logotipos) return Juventudes2030;
    return sistema.logotipos.blanco || sistema.logotipos.principal || Juventudes2030;
  };

  return (
    <footer className="bg-[#04111f] text-white/70 border-t border-white/10 font-light">
      <div className="mx-auto max-w-7xl px-6 py-5 md:py-4">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6 text-xs">
          
          <div className="flex flex-col md:flex-row items-center gap-4 shrink-0">
            {cargando ? (
              <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
            ) : (
              <img
                src={getLogo()}
                alt={sistema?.nombre || "Juventudes 2030"}
                // Aplicamos los filtros CSS para forzar el color blanco
                className="h-8 md:h-10 w-auto object-contain brightness-0 invert opacity-90 transition-opacity hover:opacity-100"
              />
            )}
            
            <div className="hidden md:block w-px h-8 bg-white/10"></div>
            
            <p className="text-white/50 text-center md:text-left leading-tight">
              © {new Date().getFullYear()} <span className="font-medium text-white/80">{sistema?.nombre || 'Juventudes 2030'}</span>.
              <span className="hidden md:inline"> Todos los derechos reservados.</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center xl:justify-end items-center gap-x-6 gap-y-3 flex-1">
            {(sistema?.direccion || (!sistema && !cargando)) && (
              <div className="flex items-start gap-1.5 group max-w-[280px]">
                <MapPin size={14} className="text-[#26BDE2] shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {sistema?.direccion || "Sinaloa, México"}
                </span>
              </div>
            )}

            {sistema?.horarios && sistema.horarios.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {sistema.horarios.map((horario, index) => (
                  <div key={index} className="flex items-center gap-1.5 group">
                    <Clock size={14} className="text-[#26BDE2] shrink-0" />
                    <span>
                      {horario.etiqueta && <span className="font-medium text-white/80 mr-1">{horario.etiqueta}:</span>}
                      {horario.dias}, {horario.horas}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {sistema?.correo && (
              <a href={`mailto:${sistema.correo}`} className="flex items-center gap-1.5 transition-colors hover:text-white group">
                <Mail size={14} className="text-[#26BDE2] shrink-0" />
                <span>{sistema.correo}</span>
              </a>
            )}
            
            {sistema?.telefono && (
              <a href={`tel:${sistema.telefono.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 transition-colors hover:text-white group">
                <Phone size={14} className="text-[#26BDE2] shrink-0" />
                <span>{sistema.telefono}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 pt-2 xl:pt-0">
            <div className="hidden xl:block w-px h-6 bg-white/10 mr-2"></div>
            
            {!cargando && redes.length > 0 ? (
              redes.map((red) => {
                const Icon = getIconoRed(red.nombre);
                if (!Icon) return null;
                return (
                  <a
                    key={red.id}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar ${red.nombre}`}
                    className="text-white/50 hover:text-[#26BDE2] transition-colors"
                  >
                    {Icon}
                  </a>
                );
              })
            ) : (
              !cargando && <span className="text-white/30 text-[10px] uppercase tracking-widest">Sin redes</span>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
}