import React, { useState, useEffect } from 'react';
// 1. Dejas Lucide solo para los íconos de interfaz (UI)
import { Globe2, Users, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

// 2. Importas las redes sociales desde react-icons (Usando FontAwesome 6)
import { 
  FaFacebook, 
  FaInstagram, 
  FaXTwitter, // El nuevo logo de X
  FaLinkedin, 
  FaYoutube 
} from "react-icons/fa6";
import Juventudes2030 from '../assets/LOGO JUVENTUDES 20230.png';
import { supabase } from '../lib/supabase';

// Interfaces para TypeScript
interface Sistema {
  nombre: string;
  descripcion: string;
  direccion: string;
  correo: string;
  telefono: string;
  logotipo: string;
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
    const fetchFooterData = async () => {
      setCargando(true);
      try {
        // 1. Cargar la información general del sistema (Asumimos que solo hay 1 activo)
        const { data: dataSistema, error: errorSistema } = await supabase
          .from('sistemas')
          .select('nombre, descripcion, direccion, correo, telefono, logotipo')
          .eq('activo', true)
          .single();

        if (errorSistema && errorSistema.code !== 'PGRST116') {
          console.error('Error al cargar sistema:', errorSistema);
        } else if (dataSistema) {
          setSistema(dataSistema);
        }

        // 2. Cargar las redes sociales activas
        const { data: dataRedes, error: errorRedes } = await supabase
          .from('redes_sociales')
          .select('id, nombre, url')
          .eq('activo', true)
          .order('id', { ascending: true });

        if (errorRedes) throw errorRedes;
        if (dataRedes) setRedes(dataRedes);

      } catch (error) {
        console.error('Error al cargar los datos del footer:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchFooterData();
  }, []);

  // Función para asignar el ícono correcto mapeando la columna "nombre"
  const getIconoRed = (nombre: string) => {
    const props = { size: 20, className: "shrink-0" };
    switch (nombre.toLowerCase()) {
      case 'facebook': return <FaFacebook {...props} />;
      case 'instagram': return <FaInstagram {...props} />;
      case 'twitter': 
      case 'x': return <FaXTwitter {...props} />;
      case 'linkedin': return <FaLinkedin {...props} />; 
      case 'youtube': return <FaYoutube {...props} />;
      default: return <Globe2 {...props} />;
    }
  };

  return (
    <footer className="bg-[#061A2D] text-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Columna 1: Identidad y Descripción Dinámica */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <img
              // Si hay un logotipo en la BD lo usa, si no, usa el import local
              src={sistema?.logotipo || Juventudes2030}
              alt={sistema?.nombre || "Juventudes 2030"}
              loading="lazy"
              className="h-16 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm text-white/60 leading-relaxed">
              {cargando ? (
                <span className="flex flex-col gap-2">
                  <span className="h-4 w-full bg-white/10 rounded animate-pulse"></span>
                  <span className="h-4 w-4/5 bg-white/10 rounded animate-pulse"></span>
                  <span className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></span>
                </span>
              ) : (
                sistema?.descripcion || 
"Un espacio para visibilizar, impulsar y conectar las acciones de las juventudes que trabajan por comunidades más justas, inclusivas y sostenibles."
              )}
            </p>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              Explorar
            </h3>
            <ul className="flex flex-col gap-3">
              {['Inicio', 'Acciones', 'Eventos', 'Agenda 2030'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    className="group flex items-center text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[#26BDE2]" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Información y Contacto Dinámico */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              Contacto
            </h3>
            <div className="space-y-4">
              {sistema?.direccion && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-[#26BDE2] mt-0.5" />
                  <span className="text-sm text-white/60">
                    {sistema.direccion}
                  </span>
                </div>
              )}
              {sistema?.correo && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-[#26BDE2]" />
                  <a href={`mailto:${sistema.correo}`} className="text-sm text-white/60 hover:text-white transition-colors">
                    {sistema.correo}
                  </a>
                </div>
              )}
              {sistema?.telefono && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-[#26BDE2]" />
                  <a href={`tel:${sistema.telefono}`} className="text-sm text-white/60 hover:text-white transition-colors">
                    {sistema.telefono}
                  </a>
                </div>
              )}
              {/* Fallback por si la tabla sistemas está vacía */}
              {!sistema && !cargando && (
                <>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="shrink-0 text-[#26BDE2] mt-0.5" />
                    <span className="text-sm text-white/60">Sinaloa, México</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe2 size={18} className="shrink-0 text-[#26BDE2]" />
                    <span className="text-sm text-white/60">Desarrollo Sostenible</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Columna 4: Redes Sociales Dinámicas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              Síguenos
            </h3>
            
            {cargando ? (
              <div className="flex gap-3">
                {[1, 2, 3].map((skeleton) => (
                  <div key={skeleton} className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
                ))}
              </div>
            ) : redes.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {redes.map((red) => (
                  <a
                    key={red.id}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Síguenos en ${red.nombre}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:-translate-y-1 hover:bg-[#26BDE2] hover:text-white hover:shadow-lg hover:shadow-[#26BDE2]/20"
                  >
                    {getIconoRed(red.nombre)}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No hay redes disponibles.</p>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col gap-4 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {sistema?.nombre || 'Juventudes 2030 Sinaloa'}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span>Desarrollado con propósito por</span>
            <span className="font-bold text-white/80 tracking-wide">David Valenzuela</span>
          </div>
        </div>
      </div>
    </footer>
  );
}