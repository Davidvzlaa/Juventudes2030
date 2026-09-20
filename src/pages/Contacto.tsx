import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Mail, MapPin, Phone, Globe, MessageSquare, 
  Target, Loader2, Link as LinkIcon, Clock 
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { ods } from "../data";

// ==========================================
// INTERFACES
// ==========================================
interface Horario {
  etiqueta?: string;
  dias: string;
  horas: string;
}

interface Sistema {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  correo: string;
  horarios?: Horario[];
}

interface RedSocial {
  id: number;
  nombre: string;
  url: string;
}

export default function Contacto() {
  const [sistemaInfo, setSistemaInfo] = useState<Sistema | null>(null);
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([]);
  const [cargandoInfo, setCargandoInfo] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // ==========================================
  // CARGA DE DATOS DESDE SUPABASE
  // ==========================================
  const fetchInformacion = async () => {
      setCargandoInfo(true);
      setErrorCarga(null);
      try {
        const { data: dataSis, error: errSis } = await supabase
          .from("sistemas")
          .select("id, nombre, descripcion, direccion, telefono, correo, horarios")
          .eq("activo", true)
          .maybeSingle();

        if (errSis) throw errSis;

        if (dataSis) {
          // Aseguramos que horarios sea un arreglo
          setSistemaInfo({
            ...dataSis,
            horarios: Array.isArray(dataSis.horarios) ? dataSis.horarios : []
          });

          const { data: dataRedes, error: errRedes } = await supabase
            .from("redes_sociales")
            .select("id, nombre, url")
            .eq("sistema_id", dataSis.id)
            .eq("activo", true)
            .order("id", { ascending: true });

          if (errRedes) throw errRedes;
          if (dataRedes) setRedesSociales(dataRedes);
        } else {
          setErrorCarga('No hay una configuración institucional activa.');
        }
      } catch (error) {
        console.error("Error al cargar la información de contacto:", error);
        setErrorCarga('No se pudo cargar la información de contacto. Verifica la conexión o las policies públicas de Supabase.');
      } finally {
        setCargandoInfo(false);
      }
  };

  useEffect(() => {
    fetchInformacion();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12 min-h-[70vh] flex flex-col justify-center animate-in fade-in duration-500">
        
        {/* ==========================================
            HERO SECTION
        ========================================== */}
       

        {/* ==========================================
            CARD CENTRAL DE INFORMACIÓN
        ========================================== */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
          
          {/* Adorno superior */}
          <div className="h-3 w-full bg-gradient-to-r  from-[#00689D] to-[#26BDE2]"></div>
           <div className="text-center mb-10">
          <div className="inline-flex items-center mt-4 justify-center bg-blue-50 p-4 rounded-full mb-4 text-[#00689D]">
            <MessageSquare size={32} />
          </div>
          <h1 className="text-4xl  font-extrabold text-gray-900 tracking-tight mb-4">
            Contacto y Atención
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Estamos aquí para resolver tus dudas y apoyarte en el desarrollo de tus proyectos de impacto sostenible.
          </p>
        </div>
        {/* BARRA ODS */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        {ods.map((item) => (
          <div key={item.id} className="h-full flex-1" style={{ backgroundColor: item.color }} />
        ))}
      </div>
              
          <div className="p-8 md:p-12">
            {cargandoInfo ? (
              <div className="flex flex-col justify-center items-center h-64 text-[#00689D]">
                <Loader2 className="animate-spin w-10 h-10 mb-4" />
                <p className="font-medium">Cargando directorio...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {errorCarga && (
                  <div role="alert" className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between gap-3">
                    <span>{errorCarga}</span>
                    <button type="button" onClick={fetchInformacion} className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-bold hover:bg-red-100">
                      Reintentar
                    </button>
                  </div>
                )}
                
                {/* COLUMNA IZQUIERDA: Info General y Contacto */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="text-[#26BDE2]" size={24} /> {sistemaInfo?.nombre || 'Juventudes 2030'}
                    </h2>
                    {sistemaInfo?.descripcion && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {sistemaInfo.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-3 rounded-2xl text-[#00689D] shrink-0">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sede Operativa</p>
                        <p className="text-sm font-medium text-gray-800">{sistemaInfo?.direccion || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-green-50 p-3 rounded-2xl text-green-600 shrink-0">
                        <Mail size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Institucional</p>
                        {sistemaInfo?.correo ? (
                          <a href={`mailto:${sistemaInfo.correo}`} className="text-sm font-bold text-[#00689D] hover:underline">
                            {sistemaInfo.correo}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">No especificado</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-50 p-3 rounded-2xl text-purple-600 shrink-0">
                        <Phone size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Línea de Atención</p>
                        <p className="text-sm font-medium text-gray-800">{sistemaInfo?.telefono || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Horarios y Redes Sociales */}
                <div className="space-y-8 md:border-l md:border-gray-100 md:pl-12">
                  
                  {/* Horarios */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock size={16} /> Horarios de Atención
                    </h3>
                    
                    {sistemaInfo?.horarios && sistemaInfo.horarios.length > 0 ? (
                      <div className="space-y-3">
                        {sistemaInfo.horarios.map((horario, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            {horario.etiqueta && <p className="text-xs font-bold text-[#00689D] mb-1">{horario.etiqueta}</p>}
                            <p className="text-sm text-gray-700">
                              {horario.dias}, <span className="font-bold">{horario.horas}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">Horarios no especificados.</p>
                    )}
                  </div>

                  {/* Redes Sociales */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Globe size={16} /> Comunidad Digital
                    </h3>
                    
                    {redesSociales.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hay redes sociales configuradas.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {redesSociales.map((red) => (
                          <a 
                            key={red.id}
                            href={red.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white hover:bg-blue-50 text-gray-700 hover:text-[#00689D] p-3 rounded-xl border border-gray-200 hover:border-blue-200 transition-all shadow-sm hover:shadow"
                          >
                            <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                              <LinkIcon size={16} />
                            </div>
                            <span className="font-bold text-sm">{red.nombre}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}