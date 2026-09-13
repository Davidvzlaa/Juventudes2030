import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Target, Globe, MapPin, FileText, List, Edit, Trash2, X, Archive } from 'lucide-react';

// Tipados base
interface Ods { id: number; nombre: string; numero: number; }
interface Catalogo { id: number; nombre: string; }
interface ActividadList {
  id: number;
  nombre: string;
  fecha_evento: string;
  lugar: string;
  estado: string;
  municipios: { nombre: string } | null;
}

export default function AdminActividades() {
  const [actividades, setActividades] = useState<ActividadList[]>([]);
  const [municipios, setMunicipios] = useState<Catalogo[]>([]);
  const [tiposAccion, setTiposAccion] = useState<Catalogo[]>([]);
  const [listaOds, setListaOds] = useState<Ods[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estado auxiliar para saber qué botón apretó (Borrador o Programar)
  const [accionGuardar, setAccionGuardar] = useState<'Programada' | 'Borrador'>('Programada');

  // Estados del Formulario (Ajustado para el Admin)
  const [formData, setFormData] = useState({
    nombre: '', 
    descripcion: '', 
    tipo_accion_id: 0,
    fecha_evento: '', 
    hora_inicio: '', 
    hora_fin: '',
    municipio_id: 0,
    lugar: '', 
    calle: '', 
    colonia: '', 
    direccion: '', // Usado para Referencias
    estado: 'Programada'
  });

  const [odsSeleccionados, setOdsSeleccionados] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    
    // Obtener el usuario autenticado actual
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    // 1. Obtener listado de actividades (ahora incluimos el 'estado')
    let query = supabase
      .from('actividades')
      .select('id, nombre, fecha_evento, lugar, estado, municipios(nombre)')
      .is('fecha_eliminacion', null)
      .order('fecha_evento', { ascending: false });

    if (userId) {
      query = query.eq('creado_por_usuario_id', userId);
    }

    const { data: dataAct } = await query;

    // 2. Obtener catálogos simultáneamente
    const [resMun, resOds, resTipos] = await Promise.all([
      supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
      supabase.from('ods').select('id, nombre, numero').eq('activo', true).order('numero', { ascending: true }),
      supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('nombre')
    ]);

    if (dataAct) setActividades(dataAct as any);
    if (resMun.data) setMunicipios(resMun.data);
    if (resOds.data) setListaOds(resOds.data);
    if (resTipos.data) setTiposAccion(resTipos.data);
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleOds = (idOds: number) => {
    setOdsSeleccionados(prev => 
      prev.includes(idOds) ? prev.filter(id => id !== idOds) : [...prev, idOds]
    );
  };

  const handleEdit = async (id: number) => {
    try {
      const { data: act, error } = await supabase.from('actividades').select('*').eq('id', id).single();
      if (error) throw error;

      const { data: ods } = await supabase.from('actividad_ods').select('ods_id').eq('actividad_id', id);
      const { data: acciones } = await supabase.from('actividad_acciones').select('tipo_accion_id').eq('actividad_id', id).single();

      setFormData({
        nombre: act.nombre || '',
        descripcion: act.descripcion || '',
        tipo_accion_id: acciones ? acciones.tipo_accion_id : 0,
        fecha_evento: act.fecha_evento ? act.fecha_evento.split('T')[0] : '',
        hora_inicio: act.hora_inicio || '',
        hora_fin: act.hora_fin || '',
        municipio_id: act.municipio_id || 0,
        lugar: act.lugar || '',
        calle: act.calle || '',
        colonia: act.colonia || '',
        direccion: act.direccion || '',
        estado: act.estado || 'Programada'
      });
      
      setOdsSeleccionados(ods ? ods.map((o: any) => o.ods_id) : []);
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert('Error al cargar la actividad: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('actividades')
        .update({ 
           fecha_eliminacion: new Date().toISOString(),
           actualizado_por_usuario_id: authData.user?.id
        })
        .eq('id', id);
        
      if (error) throw error;
      alert('Actividad eliminada con éxito');
      if (editingId === id) resetForm();
      fetchData();
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  // Función para resetear completamente el formulario
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nombre: '', descripcion: '', tipo_accion_id: 0,
      fecha_evento: '', hora_inicio: '', hora_fin: '',
      municipio_id: 0, lugar: '', calle: '', colonia: '', direccion: '', estado: 'Programada'
    });
    setOdsSeleccionados([]);
  };

  const handleCancelClick = () => {
    if (window.confirm('¿Estás seguro de cancelar? Se perderán los datos que no hayas guardado.')) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.municipio_id === 0) return alert("Selecciona un municipio.");
    if (formData.tipo_accion_id === 0) return alert("Selecciona el Tipo de Acción Principal.");
    if (odsSeleccionados.length === 0) return alert("Debes alinear la actividad con al menos un ODS.");
    if (!formData.calle.trim() || !formData.colonia.trim()) return alert("La calle y colonia son obligatorias.");

    setIsSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      // Usamos accionGuardar para definir si se va como Borrador o Programada
      const payloadActividad = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_evento: formData.fecha_evento,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        municipio_id: formData.municipio_id,
        lugar: formData.lugar.trim(),
        calle: formData.calle.trim(),
        colonia: formData.colonia.trim(),
        direccion: formData.direccion.trim(),
        estado: accionGuardar, 
        actualizado_por_usuario_id: userId 
      };

      let actividadId = editingId;

      if (editingId) {
        const { error: errAct } = await supabase.from('actividades').update(payloadActividad).eq('id', editingId);
        if (errAct) throw new Error("Error al actualizar: " + errAct.message);

        await supabase.from('actividad_ods').delete().eq('actividad_id', editingId);
        await supabase.from('actividad_acciones').delete().eq('actividad_id', editingId);
      } else {
        const { data: nuevaActividad, error: errAct } = await supabase
          .from('actividades')
          .insert([{ ...payloadActividad, creado_por_usuario_id: userId }])
          .select('id')
          .single();

        if (errAct || !nuevaActividad) throw new Error("Error al crear: " + errAct?.message);
        actividadId = nuevaActividad.id;
      }

      const insertOdsData = odsSeleccionados.map((ods_id, idx) => ({
        actividad_id: actividadId,
        ods_id: ods_id,
        es_principal: idx === 0 
      }));
      const { error: errOds } = await supabase.from('actividad_ods').insert(insertOdsData);
      if (errOds) throw new Error("Error ODS: " + errOds.message);

      const { error: errAccion } = await supabase.from('actividad_acciones').insert([{ 
        actividad_id: actividadId, tipo_accion_id: formData.tipo_accion_id, cantidad: 1 
      }]);
      if (errAccion) throw new Error("Error Tipo Acción: " + errAccion.message);

      resetForm();
      fetchData();
      
      const mensaje = accionGuardar === 'Borrador' ? 'guardada como borrador' : 'publicada';
      alert(`¡Actividad ${mensaje} exitosamente!`);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8 mb-8">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="text-[#00689D]" size={32} /> 
            {editingId ? 'Editar Actividad (Admin)' : 'Alta de Actividad Central (Admin)'}
          </h2>
          <p className="text-gray-500 mt-2">
            Registra y clasifica actividades para cualquier municipio del estado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* DATOS GENERALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
            <h3 className="md:col-span-2 text-lg font-bold text-[#00689D] flex items-center gap-2">
              <Target size={18}/> Datos Generales
            </h3>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Taller de Reforestación Juvenil" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Acción Principal <span className="text-red-500">*</span></label>
              <select required className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.tipo_accion_id} onChange={(e) => setFormData({...formData, tipo_accion_id: Number(e.target.value)})}>
                <option value="0">-- Selecciona la Acción --</option>
                {tiposAccion.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Descripción de la Dinámica <span className="text-red-500">*</span></label>
              <textarea required rows={3} className="w-full p-3 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Explica el objetivo, dinámicas o requerimientos..."></textarea>
            </div>
          </div>

          {/* ODS */}
          <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-[#00689D] mb-1 flex items-center gap-2">
              <Globe size={18}/> Alineación Agenda 2030 (ODS) <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Selecciona los ODS impactados. El primero que selecciones se registrará como el principal.</p>
            <div className="flex flex-wrap gap-2">
              {listaOds.map(ods => {
                const isSelected = odsSeleccionados.includes(ods.id);
                return (
                  <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${isSelected ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-white text-gray-600 hover:border-[#00689D]'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
                    {ods.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUÁNDO Y DÓNDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
            <h3 className="md:col-span-3 text-lg font-bold text-[#00689D] flex items-center gap-2">
              <MapPin size={18}/> Cuándo y Dónde
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>
              <input type="date" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.fecha_evento} onChange={(e) => setFormData({...formData, fecha_evento: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Hora Inicio <span className="text-red-500">*</span></label>
              <input type="time" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_inicio} onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Hora Fin <span className="text-red-500">*</span></label>
              <input type="time" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_fin} onChange={(e) => setFormData({...formData, hora_fin: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Municipio <span className="text-red-500">*</span></label>
              <select required className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#00689D]" value={formData.municipio_id} onChange={(e) => setFormData({...formData, municipio_id: Number(e.target.value)})}>
                <option value="0">-- Selecciona --</option>
                {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Lugar Exacto (Edificio / Espacio) <span className="text-red-500">*</span></label>
              <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.lugar} onChange={(e) => setFormData({...formData, lugar: e.target.value})} placeholder="Ej. Kiosco Central de la Plazuela" />
            </div>

            {/* DIRECCIÓN DETALLADA */}
            <div className="md:col-span-3 pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Detallada <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.calle} onChange={(e) => setFormData({...formData, calle: e.target.value})} placeholder="Calle y número" />
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.colonia} onChange={(e) => setFormData({...formData, colonia: e.target.value})} placeholder="Colonia o Sector" />
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} placeholder="Referencias (Ej. Frente a la iglesia)" />
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            {/* Botón Cancelar */}
            <button 
              type="button" 
              onClick={handleCancelClick}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 border border-gray-200 shadow-sm transition-all disabled:opacity-50"
            >
              <X size={18} className="inline mr-1" /> Cancelar
            </button>

            {/* Botón Guardar Borrador */}
            <button 
              type="submit" 
              onClick={() => setAccionGuardar('Borrador')}
              disabled={isSaving} 
              className="w-full sm:w-auto px-6 py-3 font-bold text-[#00689D] bg-blue-50 border border-[#00689D] rounded-xl hover:bg-blue-100 shadow-sm transition-all disabled:opacity-50"
            >
              <Archive size={18} className="inline mr-1" /> 
              {isSaving && accionGuardar === 'Borrador' ? 'Guardando...' : 'Guardar Borrador'}
            </button>

            {/* Botón Publicar / Actualizar */}
            <button 
              type="submit" 
              onClick={() => setAccionGuardar('Programada')}
              disabled={isSaving} 
              className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all disabled:opacity-50"
            >
              <Save size={18} className="inline mr-1" /> 
              {isSaving && accionGuardar === 'Programada' ? 'Procesando...' : (editingId ? 'Actualizar y Publicar' : 'Publicar Actividad')}
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE ACTIVIDADES */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/50 p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <List className="text-[#00689D]" size={24} /> Mis Actividades Registradas
          </h3>
          <span className="bg-blue-100 text-[#00689D] text-xs font-bold px-3 py-1 rounded-full">
            {actividades.length} {actividades.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Cargando actividades...</div>
          ) : actividades.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No tienes actividades registradas aún.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <th className="p-4 font-bold">Actividad</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Lugar Exacto</th>
                  <th className="p-4 font-bold">Municipio</th>
                  <th className="p-4 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actividades.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{a.nombre}</td>
                    <td className="p-4">
                      {/* Badge (Etiqueta) de Estado */}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        a.estado === 'Borrador' 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {a.estado === 'Borrador' ? 'Borrador' : 'Publicada / Programada'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{a.fecha_evento}</td>
                    <td className="p-4 text-gray-600">{a.lugar}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {a.municipios?.nombre || 'Sin asignar'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button 
                        onClick={() => handleEdit(a.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}