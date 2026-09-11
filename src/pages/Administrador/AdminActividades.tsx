import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Tipados base
interface Ods { id: number; nombre: string; numero: number; }
interface Catalogo { id: number; nombre: string; }
interface ActividadList {
  id: number;
  nombre: string;
  fecha_evento: string;
  lugar: string;
  municipios: { nombre: string } | null;
  proyectos_sociales: { nombre: string } | null;
}

export default function AdminActividades() {
  const [actividades, setActividades] = useState<ActividadList[]>([]);
  const [municipios, setMunicipios] = useState<Catalogo[]>([]);
  const [proyectos, setProyectos] = useState<Catalogo[]>([]);
  const [listaOds, setListaOds] = useState<Ods[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario (Tabla: actividades)
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', lugar: '', direccion: '', 
    fecha_evento: '', hora_inicio: '', hora_fin: '',
    beneficiarios_directos: 0, beneficiarios_indirectos: 0,
    municipio_id: 0, proyecto_social_id: 0, estado: 'Planeada'
  });

  // Estado para la tabla puente (actividad_ods)
  const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    // 1. Obtener listado de actividades
    const { data: dataAct } = await supabase
      .from('actividades')
      .select('id, nombre, fecha_evento, lugar, municipios(nombre), proyectos_sociales(nombre)')
      .is('fecha_eliminacion', null)
      .order('fecha_evento', { ascending: false });

    // 2. Obtener catálogos
    const { data: dataMun } = await supabase.from('municipios').select('id, nombre').eq('activo', true);
    const { data: dataProy } = await supabase.from('proyectos_sociales').select('id, nombre').eq('activo', true);
    const { data: dataOds } = await supabase.from('ods').select('id, nombre, numero').eq('activo', true).order('numero', { ascending: true });

    if (dataAct) setActividades(dataAct as any);
    if (dataMun) setMunicipios(dataMun);
    if (dataProy) setProyectos(dataProy);
    if (dataOds) setListaOds(dataOds);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Manejar checkboxes de ODS
  const toggleOds = (idOds: number) => {
    setOdsSeleccionados(prev => 
      prev.includes(idOds) ? prev.filter(id => id !== idOds) : [...prev, idOds]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.municipio_id === 0) return alert("Selecciona un municipio");
    if (odsSeleccionados.length === 0) return alert("Debes seleccionar al menos un ODS");

    // PASO 1: Insertar en la tabla Actividades
    const { data: nuevaActividad, error: errAct } = await supabase
      .from('actividades')
      .insert([formData])
      .select('id')
      .single();

    if (errAct || !nuevaActividad) {
      return alert("Error al crear la actividad: " + errAct?.message);
    }

    // PASO 2: Preparar e insertar en la tabla puente actividad_ods
    const insertOdsData = odsSeleccionados.map(ods_id => ({
      actividad_id: nuevaActividad.id,
      ods_id: ods_id
    }));

    const { error: errOds } = await supabase
      .from('actividad_ods')
      .insert(insertOdsData);

    if (errOds) {
      alert("La actividad se creó, pero hubo un error al vincular los ODS.");
    } else {
      // Limpiar formulario y recargar
      setFormData({
        nombre: '', descripcion: '', lugar: '', direccion: '', 
        fecha_evento: '', hora_inicio: '', hora_fin: '',
        beneficiarios_directos: 0, beneficiarios_indirectos: 0,
        municipio_id: 0, proyecto_social_id: 0, estado: 'Planeada'
      });
      setOdsSeleccionados([]);
      fetchData();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Gestión de Actividades</h2>
      
      {/* ==========================================
          FORMULARIO PRINCIPAL
      ========================================== */}
      <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 p-6 rounded-lg border">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Datos Generales */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">Nombre de la Actividad</label>
            <input type="text" required className="w-full p-2 border rounded" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-1">Descripción</label>
            <textarea required className="w-full p-2 border rounded" rows={3} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})}></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Fecha del Evento</label>
            <input type="date" required className="w-full p-2 border rounded" value={formData.fecha_evento} onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Hora Inicio</label>
              <input type="time" required className="w-full p-2 border rounded" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Hora Fin</label>
              <input type="time" required className="w-full p-2 border rounded" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
          </div>

          {/* Relaciones Base */}
          <div>
            <label className="block text-sm font-bold mb-1">Municipio</label>
            <select required className="w-full p-2 border rounded bg-white" value={formData.municipio_id} onChange={(e) => setFormData({...formData, municipio_id: Number(e.target.value)})}>
              <option value="0">-- Selecciona --</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Proyecto Social Vinculado (Opcional)</label>
            <select className="w-full p-2 border rounded bg-white" value={formData.proyecto_social_id} onChange={(e) => setFormData({...formData, proyecto_social_id: Number(e.target.value)})}>
              <option value="0">-- Ninguno --</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* ==========================================
            SECCIÓN ODS (Checkboxes)
        ========================================== */}
        <div className="border-t pt-4 mb-6">
          <h3 className="font-bold text-lg mb-3">Objetivos de Desarrollo Sostenible (ODS) Impactados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {listaOds.map(ods => (
              <label key={ods.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600"
                  checked={odsSeleccionados.includes(ods.id)}
                  onChange={() => toggleOds(ods.id)}
                />
                <span className="text-sm font-medium">{ods.numero}. {ods.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700">
            Guardar Actividad
          </button>
        </div>
      </form>

      {/* ==========================================
          TABLA DE ACTIVIDADES
      ========================================== */}
      {loading ? <p>Cargando actividades...</p> : (
        <table className="min-w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-3">Actividad</th>
              <th className="border p-3">Fecha</th>
              <th className="border p-3">Municipio</th>
              <th className="border p-3">Proyecto Vinculado</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="border p-3 font-medium">{a.nombre}</td>
                <td className="border p-3">{a.fecha_evento}</td>
                <td className="border p-3">{a.municipios?.nombre}</td>
                <td className="border p-3 text-blue-600">{a.proyectos_sociales?.nombre || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}