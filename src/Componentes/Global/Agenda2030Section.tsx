import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ExternalLink } from "lucide-react";
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

  useEffect(() => {
    const fetchOds = async () => {
      try {
        // Al hacer select('*'), nos traemos también la columna 'imagen'
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
                    {/* <div
                      className="group relative flex h-32 w-full cursor-pointer flex-col overflow-hidden p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      style={{ backgroundColor: bgColor }}
                    >
                      <span className="text-3xl font-bold leading-none text-white/95">
                        {String(item.numero).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="mb-1 h-px w-7 bg-white/50 transition-all duration-300 group-hover:w-12" />
                        <span className="text-[11px] font-bold uppercase leading-2 tracking-wide text-white">
                          {item.nombre}
                        </span>
                      </div>
                    </div> */}
                    <div className="group relative flex h-32 w-full cursor-pointer flex-col overflow-hidden p-4 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      style={{ backgroundColor: bgColor }}>
                        <img src={item.imagen} alt={item.nombre} className="h-full w-full object-contain" />
                          
                    </div>
                  </HoverCardTrigger>
                  
                  {/* GLOBO DE INFORMACIÓN (HOVER) */}
                  <HoverCardContent side="inline-end" align="center" sideOffset={10} className="w-[340px] overflow-hidden border-0 bg-white p-0 shadow-2xl">
                    <div className="h-2 w-full" style={{ backgroundColor: bgColor }} />
                    <div className="p-5">
                      <div className="flex gap-4">
                        
                        {/* AQUÍ ESTÁ LA MAGIA DE LA IMAGEN */}
                        {/* {item.imagen ? (
                          <img 
                            src={item.imagen} 
                            alt={item.nombre}
                            className="h-14 w-14 shrink-0 object-contain rounded shadow-sm bg-white"
                          />
                        ) : ( */}
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center text-xl font-bold text-white rounded" style={{ backgroundColor: bgColor }}>
                            {String(item.numero).padStart(2, "0")}
                          </div>
                        {/* )} */}

                        <div className="flex flex-col align-center justify-center">
                          <h3 className="mt-1 text-lg font-bold leading-6 text-[#061A2D]">{item.nombre}</h3>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="mb-1 h-px w-full transition-all duration-300 group-hover:w-12" style={{ backgroundColor: bgColor }} />
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
    </section>
  );
}