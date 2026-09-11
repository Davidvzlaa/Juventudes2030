import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

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

export default function AdminEmbajadores() {
  const [embajadores, setEmbajadores] = useState<EmbajadorList[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

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
    // Ajusta el eq('rol_id', 2) según el ID real que tenga el rol Embajador en tu tabla 'roles'
    const { data: dataUsr } = await supabase.from('usuarios').select('id, nombre, apellido, correo').eq('rol_id', 2).eq('activo', true);
    
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
    if (!usuarioId || !municipioId) return alert("Selecciona un usuario y municipio");

    let proyectoFinalId = null;

    // Si indicó que tiene proyecto...
    if (tieneProyecto) {
      if (crearProyectoNuevo) {
        // A) CREAR PROYECTO NUEVO EN LA MISMA PANTALLA
        if (!nuevoProyecto.nombre) return alert("Ingresa el nombre del nuevo proyecto");
        
        const { data: proyInsertado, error: errProy } = await supabase
          .from('proyectos_sociales')
          .insert([{ nombre: nuevoProyecto.nombre, descripcion: nuevoProyecto.descripcion, activo: true }])
          .select()
          .single();
          
        if (errProy) return alert("Error creando proyecto: " + errProy.message);
        proyectoFinalId = proyInsertado.id;
      } else {
        // B) USAR PROYECTO EXISTENTE
        if (!proyectoIdSeleccionado) return alert("Selecciona un proyecto de la lista");
        proyectoFinalId = proyectoIdSeleccionado;
      }
    }

    // Insertar o Actualizar el Perfil del Embajador (Upsert)
    const { error } = await supabase
      .from('embajadores')
      .upsert({
        usuario_id: usuarioId,
        municipio_id: municipioId,
        proyecto_social_id: proyectoFinalId,
        activo: true,
        fecha_ingreso: new Date().toISOString()
      }, { onConflict: 'usuario_id' }); // Si el usuario ya era embajador, solo lo actualiza

    if (error) {
      alert("Error guardando embajador: " + error.message);
    } else {
      // Limpiar formulario y recargar
      setUsuarioId(''); setTieneProyecto(false); setCrearProyectoNuevo(false);
      setNuevoProyecto({ nombre: '', descripcion: '' });
      fetchData();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Registro de Embajadores</h2>
      
      {/* ==========================================
          FORMULARIO RELACIONAL
      ========================================== */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded bg-gray-50 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          
          {/* Seleccionar Usuario (Pre-filtrado a solo embajadores) */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Seleccionar Usuario</label>
            <select required className="mt-1 p-2 border rounded w-full" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <option value="">-- Selecciona un usuario --</option>
              {usuariosDisponibles.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.correo})</option>
              ))}
            </select>
          </div>

          {/* Seleccionar Municipio */}
          <div>
            <label className="block text-sm font-bold text-gray-700">Municipio de Origen</label>
            <select required className="mt-1 p-2 border rounded w-full" value={municipioId} onChange={(e) => setMunicipioId(Number(e.target.value))}>
              <option value="0">-- Selecciona un municipio --</option>
              {municipios.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LÓGICA CONDICIONAL PARA EL PROYECTO SOCIAL */}
        <div className="border-t pt-4 mt-4">
          <label className="flex items-center space-x-2 font-bold text-gray-700 mb-4">
            <input type="checkbox" className="w-4 h-4" checked={tieneProyecto} onChange={(e) => setTieneProyecto(e.target.checked)} />
            <span>¿Este embajador lidera o pertenece a un Proyecto Social?</span>
          </label>

          {tieneProyecto && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="flex space-x-4 mb-4">
                <button type="button" onClick={() => setCrearProyectoNuevo(false)} className={`px-4 py-2 rounded ${!crearProyectoNuevo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Seleccionar Existente
                </button>
                <button type="button" onClick={() => setCrearProyectoNuevo(true)} className={`px-4 py-2 rounded ${crearProyectoNuevo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Crear Proyecto Nuevo
                </button>
              </div>

              {/* A) Seleccionar existente */}
              {!crearProyectoNuevo && (
                <div>
                  <label className="block text-sm font-medium">Lista de Proyectos</label>
                  <select className="mt-1 p-2 border rounded w-full" value={proyectoIdSeleccionado} onChange={(e) => setProyectoIdSeleccionado(Number(e.target.value))}>
                    <option value="0">-- Selecciona el proyecto --</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* B) Crear nuevo en el momento */}
              {crearProyectoNuevo && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Nombre del Nuevo Proyecto</label>
                    <input type="text" className="mt-1 p-2 border rounded w-full" value={nuevoProyecto.nombre} onChange={(e) => setNuevoProyecto({...nuevoProyecto, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Descripción breve</label>
                    <input type="text" className="mt-1 p-2 border rounded w-full" value={nuevoProyecto.descripcion} onChange={(e) => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">
            Guardar Perfil de Embajador
          </button>
        </div>
      </form>

      {/* ==========================================
          TABLA DE EMBAJADORES
      ========================================== */}
      {loading ? <p>Cargando datos...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Correo</th>
                <th className="border p-2">Municipio</th>
                <th className="border p-2">Proyecto Social</th>
                <th className="border p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {embajadores.map((e, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{e.usuarios?.nombre} {e.usuarios?.apellido}</td>
                  <td className="border p-2">{e.usuarios?.correo}</td>
                  <td className="border p-2 text-gray-600">{e.municipios?.nombre || 'Sin asignar'}</td>
                  <td className="border p-2 text-blue-600 font-semibold">{e.proyectos_sociales?.nombre || 'Ninguno'}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${e.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {e.activo ? 'Activo' : 'Baja'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}