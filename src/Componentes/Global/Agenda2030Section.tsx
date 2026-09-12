import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ExternalLink, X } from "lucide-react"; // <-- Agregamos el ícono X
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../components/ui/hover-card"; 
import { supabase } from "../../lib/supabase"; 

// Mapeo oficial de colores de los ODS de la ONU
const odsColors: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D',
  5: '#FF3A21', 6: '#26BDE2', 7: '#FCC30B', 8: '#A21942',
  9: '#FD6925', 10: '#DD1367', 11: '#FD9D24', 12: '#BF8B2E',
  13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B', 16: '#00689D',
  17: '#19486A'
};

export default function Agenda2030Section() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  
  const [odsList, setOdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // <-- NUEVO ESTADO: Controla qué ODS está seleccionado en versión celular
  const [selectedOds, setSelectedOds] = useState<any>(null); 

  // <-- MEJORA: Evitar que el fondo se mueva al hacer scroll cuando el modal móvil está abierto
  useEffect(() => {
    if (selectedOds) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedOds]);

  useEffect(() => {
    const fetchOds = async () => {
      try {
        const { data, error } = await supabase
          .from('ods')
          .select('*')
          .eq('activo', true)
          .order('numero', { ascending: true }); 
        
        if (data && !error) {
          setOdsList(data);
        }
      } catch (error) {
        console.error("Error al cargar los ODS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOds();
  }, []);

  return (
    <section
      id="ods"
      ref={ref}
      className={`bg-white transition-opacity duration-700 ${
        inView ? "animate-slide-in-left animate-slide-distance-[100%] opacity-100" : "opacity-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 py-15 sm:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#00689D]">Agenda 2030</span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            17 objetivos.<br />Una visión compartida.
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-600">
            Los Objetivos de Desarrollo Sostenible son una hoja de ruta global para construir un futuro más sostenible e inclusivo.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 py-12 text-center text-sm font-bold text-gray-400 uppercase animate-pulse">
            Cargando Objetivos de Desarrollo Sostenible...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
            {odsList.map((item) => {
              const bgColor = odsColors[item.numero] || '#00689D';

              return (
                <HoverCard key={item.id}>
                  {/* BOTÓN / TARJETA PRINCIPAL */}
                  <HoverCardTrigger>
                    <div 
                      onClick={() => setSelectedOds(item)} // <-- NUEVO: Al tocar, guardamos el ODS para el celular
                      className="group relative flex h-32 w-full cursor-pointer flex-col overflow-hidden p-2 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl rounded-md"
                      style={{ backgroundColor: bgColor }}
                    >
                        <img src={item.imagen} alt={item.nombre} className="h-full w-full object-contain" />
                    </div>
                  </HoverCardTrigger>
                  
                  {/* GLOBO DE INFORMACIÓN (HOVER EN COMPUTADORA) */}
                  {/* <-- NUEVO: Agregamos "hidden md:block" para que no estorbe en celulares */}
                  <HoverCardContent side="top" align="center" sideOffset={10} className="hidden md:block w-[340px] overflow-hidden border-0 bg-white p-0 shadow-2xl z-50">
                    <div className="h-2 w-full" style={{ backgroundColor: bgColor }} />
                    <div className="p-5">
                      <div className="flex gap-4 items-center">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center text-xl font-bold text-white rounded" style={{ backgroundColor: bgColor }}>
                          {String(item.numero).padStart(2, "0")}
                        </div>
                        <div className="flex flex-col align-center justify-center">
                          <h3 className="text-lg font-bold leading-5 text-[#061A2D]">{item.nombre}</h3>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="mb-3 h-px w-full" style={{ backgroundColor: `${bgColor}40` }} />
                        <p className="text-sm leading-6 text-gray-600">{item.descripcion}</p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 border-l-2 border-[#00689D] bg-[#F5F7F9] px-5 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-gray-500">
            Los Objetivos de Desarrollo Sostenible forman parte de la Agenda 2030 para el Desarrollo Sostenible adoptada por los Estados Miembros de las Naciones Unidas.
          </p>
          <a href="https://sdgs.un.org/es/goals" target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-2 text-xs font-bold text-[#00689D]">
            Conocer los 17 ODS
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NUEVO: MODAL EXCLUSIVO PARA CELULARES (Se activa al tocar) */}
      {/* ========================================================= */}
      {selectedOds && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedOds(null)} // Cierra el modal si tocan el fondo negro
        >
          <div 
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Evita que se cierre si tocan el cuadro blanco
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => setSelectedOds(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm backdrop-blur hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            
            {/* Contenido del ODS adaptado a la tarjeta móvil */}
            <div className="h-3 w-full" style={{ backgroundColor: odsColors[selectedOds.numero] || '#00689D' }} />
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div 
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white shadow-md" 
                  style={{ backgroundColor: odsColors[selectedOds.numero] || '#00689D' }}
                >
                  {String(selectedOds.numero).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-bold leading-tight text-[#061A2D]">
                  {selectedOds.nombre}
                </h3>
              </div>
              <div className="mt-5">
                <div className="mb-4 h-px w-full" style={{ backgroundColor: `${odsColors[selectedOds.numero] || '#00689D'}40` }} />
                <p className="text-base leading-relaxed text-gray-600">
                  {selectedOds.descripcion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}