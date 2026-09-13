import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Mail, MapPin, Phone, Globe, Send, MessageSquare, 
  Target, Leaf, Loader2, Link as LinkIcon 
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// INTERFACES (Alineadas con la BD)
// ==========================================
interface Sistema {
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
}

interface RedSocial {
  id: number;
  nombre: string;
  url: string;
}

export default function Contacto() {
  // Estados para datos dinámicos
  const [sistemaInfo, setSistemaInfo] = useState<Sistema | null>(null);
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([]);
  const [cargandoInfo, setCargandoInfo] = useState(true);

  // Estados del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', correo: '', asunto: '', mensaje: ''
  });

  // ==========================================
  // CARGA DE DATOS DESDE SUPABASE
  // ==========================================
  useEffect(() => {
    const fetchInformacion = async () => {
      try {
        // 1. Obtener datos del sistema (Activo)
        const { data: dataSis, error: errSis } = await supabase
          .from("sistemas")
          .select("id, nombre, direccion, telefono, correo")
          .eq("activo", true)
          .maybeSingle();

        if (errSis) throw errSis;

        if (dataSis) {
          setSistemaInfo(dataSis);

          // 2. Obtener redes sociales ligadas a ese sistema
          const { data: dataRedes, error: errRedes } = await supabase
            .from("redes_sociales")
            .select("id, nombre, url")
            .eq("sistema_id", dataSis.id)
            .eq("activo", true)
            .order("id", { ascending: true });

          if (errRedes) throw errRedes;
          if (dataRedes) setRedesSociales(dataRedes);
        }
      } catch (error) {
        console.error("Error al cargar la información de contacto:", error);
      } finally {
        setCargandoInfo(false);
      }
    };

    fetchInformacion();
  }, []);

  // ==========================================
  // ENVÍO DE FORMULARIO
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // AQUÍ PUEDES INTEGRAR TU LÓGICA DE ENVÍO DE CORREO 
      // (Ej. Insertar en tabla "mensajes_contacto", o usar EmailJS/Resend)
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      toast.success('Mensaje enviado con éxito', {
        description: 'Nuestro equipo se pondrá en contacto contigo pronto.'
      });
      
      setFormData({ nombre: '', correo: '', asunto: '', mensaje: '' });
    } catch (error) {
      toast.error('Error al enviar el mensaje', {
        description: 'Por favor, intenta nuevamente más tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* ==========================================
          HEADER / HERO SECTION
      ========================================== */}
      <div className="bg-gradient-to-r from-[#004A70] to-[#002D45] rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden text-white border border-blue-900/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 pointer-events-none">
          <Globe size={320} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                <MessageSquare className="text-blue-300" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Contacto y Soporte
              </h1>
            </div>
            <p className="text-blue-100/90 text-lg max-w-2xl font-medium leading-relaxed">
              ¿Tienes dudas sobre {sistemaInfo?.nombre || 'la plataforma'}, tus métricas de impacto o el registro de actividades? Estamos aquí para ayudarte a impulsar la Agenda 2030.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ==========================================
            COLUMNA IZQUIERDA: INFORMACIÓN DINÁMICA
        ========================================== */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Tarjeta de Información */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="text-[#00689D]" size={24} /> Información de Contacto
            </h3>
            
            {cargandoInfo ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-gray-300 w-8 h-8" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-[#00689D] shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sede Operativa</p>
                    <p className="text-sm text-gray-500 mt-1">{sistemaInfo?.direccion || 'No especificada'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-xl text-green-600 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Correo Oficial</p>
                    {sistemaInfo?.correo ? (
                      <a href={`mailto:${sistemaInfo.correo}`} className="text-sm text-[#00689D] hover:underline mt-1 block font-medium">
                        {sistemaInfo.correo}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">No especificado</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-xl text-purple-600 shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Línea de Atención</p>
                    <p className="text-sm text-gray-500 mt-1">{sistemaInfo?.telefono || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta de Redes Sociales (Dinámicas) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Comunidad y Redes</h3>
            
            {cargandoInfo ? (
               <div className="animate-pulse flex gap-3">
                 <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
                 <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
               </div>
            ) : redesSociales.length === 0 ? (
              <p className="text-sm text-gray-400">No hay redes sociales configuradas.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {redesSociales.map((red) => (
                  <a 
                    key={red.id}
                    href={red.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-[#00689D]/5 hover:text-[#00689D] hover:border-[#00689D]/20 text-gray-600 p-3 rounded-xl border border-gray-200 transition-colors font-semibold text-sm shadow-sm"
                  >
                    <LinkIcon size={16} /> {red.nombre}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            COLUMNA DERECHA: FORMULARIO
        ========================================== */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-t-4 border-[#00689D] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
            
            <div className="mb-8 border-b border-gray-100 pb-4 relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Envíanos un Mensaje
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Completa el formulario y responderemos a la brevedad posible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all bg-gray-50/50 focus:bg-white" 
                    placeholder="Ej. Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all bg-gray-50/50 focus:bg-white" 
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Asunto <span className="text-red-500">*</span></label>
                <select 
                  required 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all bg-gray-50/50 focus:bg-white"
                  value={formData.asunto}
                  onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                >
                  <option value="">-- Selecciona el motivo de tu mensaje --</option>
                  <option value="soporte">Soporte técnico con la plataforma</option>
                  <option value="alianzas">Propuesta de alianza o proyecto</option>
                  <option value="ods">Asesoría sobre métricas ODS</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows={5} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all resize-none bg-gray-50/50 focus:bg-white" 
                  placeholder="Escribe tu mensaje aquí..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Leaf size={14} className="text-green-500"/> Plataforma sostenible
                </p>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#00527A] disabled:bg-gray-400 transition-colors shadow-md"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={18} /> Procesando...</>
                  ) : (
                    <><Send size={18} /> Enviar Mensaje</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}