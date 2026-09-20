import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Save, UserPlus, MapPin, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

// Tipados (Ajustados a tu base de datos)
interface Usuario { id: string; nombre: string; apellido: string; correo: string; }
interface Municipio { id: number; nombre: string; }
interface Proyecto { id: number; nombre: string; }
interface EmbajadorList {
  usuario_id: string;
  activo: boolean;
  usuarios: { nombre: string; apellido: string; correo: string } | null;
  municipios: { nombre: string } | null;
  proyectos_sociales: { nombre: string } | null;
}

// Función auxiliar para emitir la notificación con sonido y posición inferior derecha
const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio bloqueado por el navegador:', err));

  const options = { position: 'bottom-right' as const };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

export default function AdminEmbajadores() {
  const [embajadores, setEmbajadores] = useState<EmbajadorList[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados del Formulario
  const [usuarioId, setUsuarioId] = useState('');
  const [municipioId, setMunicipioId] = useState<number>(0);
  
  // Lógica de Proyecto Dinámico
  const [tieneProyecto, setTieneProyecto] = useState(false);
  const [crearProyectoNuevo, setCrearProyectoNuevo] = useState(false);
  const [proyectoIdSeleccionado, setProyectoIdSeleccionado] = useState<number>(0);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripcion: '' });

  const fetchData = async () => {
    setLoading(true);
    // 1. Obtener embajadores actuales (JOIN con usuarios, municipios y proyectos)
    const { data: dataEmb } = await supabase
      .from('embajadores')
      .select(`usuario_id, activo, usuarios(nombre, apellido, correo), municipios(nombre), proyectos_sociales(nombre)`);
    
    // 2. Obtener usuarios que sean rol "Embajador" (Asumiendo que el ID del rol es 2)
const { data: dataUsr, error: errUsr } = await supabase
  .from('usuarios')
  .select(`
    id,
    nombre,
    apellido,
    correo,
    usuario_roles!inner(
      rol_id,
      roles!inner(
        id,
        nombre
      )
    )
  `)
  .eq('activo', true)
  .eq('usuario_roles.roles.nombre', 'Embajador');    

    if (errUsr) {
      console.error('Error al obtener usuarios:', errUsr);
    }

    // 3. Obtener Catálogos
    const { data: dataMun } = await supabase.from('municipios').select('id, nombre').eq('activo', true);
    const { data: dataProy } = await supabase.from('proyectos_sociales').select('id, nombre').eq('activo', true);

    if (dataEmb) setEmbajadores(dataEmb as any);
    if (dataUsr) setUsuariosDisponibles(dataUsr);
    if (dataMun) setMunicipios(dataMun);
    if (dataProy) setProyectos(dataProy);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId || !municipioId) {
      notifyWithSound("Selecciona un usuario y un municipio", "warning");
      return;
    }

    setIsSaving(true);
    let proyectoFinalId = null;

    try {
      // Si indicó que tiene proyecto...
      if (tieneProyecto) {
        if (crearProyectoNuevo) {
          // A) CREAR PROYECTO NUEVO EN LA MISMA PANTALLA
          if (!nuevoProyecto.nombre) {
            notifyWithSound("Ingresa el nombre del nuevo proyecto", "warning");
            setIsSaving(false);
            return;
          }
          
          const { data: proyInsertado, error: errProy } = await supabase
            .from('proyectos_sociales')
            .insert([{ nombre: nuevoProyecto.nombre, descripcion: nuevoProyecto.descripcion, activo: true }])
            .select()
            .single();
            
          if (errProy) throw errProy;
          proyectoFinalId = proyInsertado.id;
        } else {
          // B) USAR PROYECTO EXISTENTE
          if (!proyectoIdSeleccionado) {
            notifyWithSound("Selecciona un proyecto de la lista", "warning");
            setIsSaving(false);
            return;
          }
          proyectoFinalId = proyectoIdSeleccionado;
        }
      }

      // Insertar o actualizar sin depender de una restricción UNIQUE no documentada.
      const payloadEmbajador = {
        usuario_id: usuarioId,
        municipio_id: municipioId,
        proyecto_social_id: proyectoFinalId,
        activo: true,
        fecha_ingreso: new Date().toISOString()
      };
      const { data: embajadorExistente, error: consultaEmbajadorError } = await supabase
        .from('embajadores')
        .select('usuario_id')
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (consultaEmbajadorError) throw consultaEmbajadorError;

      const { error } = embajadorExistente
        ? await supabase.from('embajadores').update(payloadEmbajador).eq('usuario_id', usuarioId)
        : await supabase.from('embajadores').insert(payloadEmbajador);

      if (error) throw error;

      notifyWithSound("Perfil de embajador registrado correctamente.", "success");
      
      // Limpiar formulario y recargar
      setUsuarioId(''); 
      setMunicipioId(0);
      setTieneProyecto(false); 
      setCrearProyectoNuevo(false);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      fetchData();

    } catch (error: any) {
      notifyWithSound("Error guardando embajador: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <UserPlus className="text-[#00689D] w-8 h-8" />
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Registro de Embajadores</h2>
            <p className="text-sm text-gray-500">Asigna municipios y proyectos a los usuarios con rol de Embajador.</p>
          </div>
        </div>
        
        {/* ==========================================
            FORMULARIO RELACIONAL
        ========================================== */}
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-xl bg-gray-50 border border-gray-200 shadow-inner space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Seleccionar Usuario */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Seleccionar Usuario</label>
              <select required className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D] transition-all" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                <option value="">-- Selecciona un usuario --</option>
                {usuariosDisponibles.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.correo})</option>
                ))}
              </select>
            </div>

            {/* Seleccionar Municipio */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={14}/> Municipio de Origen</label>
              <select required className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D] transition-all" value={municipioId} onChange={(e) => setMunicipioId(Number(e.target.value))}>
                <option value="0">-- Selecciona un municipio --</option>
                {municipios.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* LÓGICA CONDICIONAL PARA EL PROYECTO SOCIAL */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center space-x-3 font-bold text-gray-700 mb-4 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-[#00689D] rounded border-gray-300 focus:ring-[#00689D] transition-all" checked={tieneProyecto} onChange={(e) => setTieneProyecto(e.target.checked)} />
              <span className="flex items-center gap-2"><FolderOpen size={18} className="text-gray-400"/> ¿Este embajador lidera o pertenece a un Proyecto Social?</span>
            </label>

            {tieneProyecto && (
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                  <button type="button" onClick={() => setCrearProyectoNuevo(false)} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${!crearProyectoNuevo ? 'bg-[#00689D] text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Seleccionar Existente
                  </button>
                  <button type="button" onClick={() => setCrearProyectoNuevo(true)} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${crearProyectoNuevo ? 'bg-[#00689D] text-white shadow-md' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Crear Proyecto Nuevo
                  </button>
                </div>

                {/* A) Seleccionar existente */}
                {!crearProyectoNuevo && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Lista de Proyectos</label>
                    <select className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D] transition-all" value={proyectoIdSeleccionado} onChange={(e) => setProyectoIdSeleccionado(Number(e.target.value))}>
                      <option value="0">-- Selecciona el proyecto --</option>
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* B) Crear nuevo en el momento */}
                {crearProyectoNuevo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nombre del Nuevo Proyecto</label>
                      <input type="text" placeholder="Ej. Rescate de Playas" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D] transition-all" value={nuevoProyecto.nombre} onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Descripción breve (Opcional)</label>
                      <input type="text" placeholder="Describe brevemente el proyecto..." className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D] transition-all" value={nuevoProyecto.descripcion} onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Guardando...' : 'Guardar Perfil de Embajador'}
            </button>
          </div>
        </form>

        {/* ==========================================
            TABLA DE EMBAJADORES
        ========================================== */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">Directorio de Embajadores</h3>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <th className="p-4 font-bold">Nombre del Embajador</th>
                    <th className="p-4 font-bold">Correo</th>
                    <th className="p-4 font-bold">Municipio</th>
                    <th className="p-4 font-bold">Proyecto Social</th>
                    <th className="p-4 font-bold text-center w-28">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {embajadores.map((e, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">
                        {e.usuarios?.nombre} {e.usuarios?.apellido}
                      </td>
                      <td className="p-4 text-gray-500">{e.usuarios?.correo}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {e.municipios?.nombre || 'Sin asignar'}</td>
                      <td className="p-4 text-[#00689D] font-semibold">{e.proyectos_sociales?.nombre || 'Ninguno'}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${e.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {e.activo ? 'Activo' : 'Baja'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {embajadores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No hay embajadores registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}