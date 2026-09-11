import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Send, X, Target, Globe, MapPin, FileText, Ban } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function EmbajadorActividades() {
  const { usuarioDatos } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const actToEdit = location.state?.actToEdit; 
  const isPublicada = actToEdit && actToEdit.estado !== 'Borrador';

  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [municipios, setMunicipios] = useState<any[]>([]);
  const [odsList, setOdsList] = useState<any[]>([]);
  const [tiposAccion, setTiposAccion] = useState<any[]>([]); 
  const [miProyectoPredeterminado, setMiProyectoPredeterminado] = useState<number | null>(null);

  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayString = getTodayString();

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', fecha_evento: todayString, hora_inicio: '', hora_fin: '',
    municipio_id: 0, lugar: '', direccion: '', calle: '', colonia: '',
    tipo_accion: '', cantidad_accion: 1, ods_seleccionados: [] as number[]
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!usuarioDatos?.id) return;
      
      const { data: embajador } = await supabase.from('embajadores').select('municipio_id, proyecto_social_id').eq('usuario_id', usuarioDatos.id).single();
      if (embajador) {
        setMiProyectoPredeterminado(embajador.proyecto_social_id);
        if (!actToEdit) setFormData(prev => ({ ...prev, municipio_id: embajador.municipio_id }));
      }

      const [resMun, resOds, resTipos] = await Promise.all([
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('ods').select('id, numero, nombre').eq('activo', true).order('numero'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('nombre')
      ]);
      if (resMun.data) setMunicipios(resMun.data);
      if (resOds.data) setOdsList(resOds.data);
      if (resTipos.data) setTiposAccion(resTipos.data);
    };

    fetchData();

    if (actToEdit) {
      setEditId(actToEdit.id);
      const fechaLimpia = actToEdit.fecha_evento ? actToEdit.fecha_evento.split('T')[0] : todayString;

      setFormData({
        nombre: actToEdit.nombre || '', descripcion: actToEdit.descripcion || '',
        fecha_evento: fechaLimpia, hora_inicio: actToEdit.hora_inicio || '', hora_fin: actToEdit.hora_fin || '',
        municipio_id: actToEdit.municipio_id || 0, lugar: actToEdit.lugar || '', direccion: actToEdit.direccion || '',
        calle: actToEdit.calle || '', colonia: actToEdit.colonia || '',
        tipo_accion: actToEdit.actividad_acciones?.[0]?.tipo || '', cantidad_accion: actToEdit.actividad_acciones?.[0]?.cantidad || 1,
        ods_seleccionados: actToEdit.actividad_ods?.map((o: any) => o.ods_id) || []
      });
    }
  }, [usuarioDatos, actToEdit]);

  const toggleOds = (odsId: number) => {
    setFormData(prev => {
      if (prev.ods_seleccionados.includes(odsId)) return { ...prev, ods_seleccionados: prev.ods_seleccionados.filter(id => id !== odsId) };
      if (prev.ods_seleccionados.length >= 4) { alert('Solo puedes seleccionar un máximo de 4 ODS.'); return prev; }
      return { ...prev, ods_seleccionados: [...prev.ods_seleccionados, odsId] };
    });
  };

  const handleGuardarActividad = async (estadoFinal: string) => {
    if (!usuarioDatos?.id) return;

    if (!formData.nombre.trim()) return alert('Debes asignarle un nombre a la actividad para guardar.');

    if (estadoFinal !== 'Borrador') {
      if (!formData.tipo_accion) return alert('El Tipo de Acción Principal es obligatorio.');
      if (!formData.descripcion.trim()) return alert('La descripción de la actividad es obligatoria.');
      if (formData.ods_seleccionados.length === 0) return alert('Debes alinear la actividad con al menos un ODS.');
      if (!formData.fecha_evento) return alert('La fecha del evento es obligatoria.');
      if (formData.fecha_evento < todayString) return alert('La fecha de la actividad no puede ser anterior al día de hoy.');
      if (!formData.hora_inicio) return alert('La hora de inicio es obligatoria.');
      if (!formData.hora_fin) return alert('La hora de fin es obligatoria.');
      if (formData.hora_inicio >= formData.hora_fin) return alert('La hora de inicio debe ser previa a la hora de fin.');
      if (!formData.municipio_id || formData.municipio_id === 0) return alert('Selecciona el municipio.');
      if (!formData.lugar.trim()) return alert('El lugar exacto donde se llevará a cabo es obligatorio.');
    }

    setIsSaving(true);
    try {
      const payloadActividad = {
        nombre: (formData.nombre || '').trim(),
        descripcion: (formData.descripcion || '').trim() || null,
        fecha_evento: formData.fecha_evento || null,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        municipio_id: formData.municipio_id,
        lugar: (formData.lugar || '').trim() || null,
        direccion: (formData.direccion || '').trim() || null,
        calle: (formData.calle || '').trim() || null,
        colonia: (formData.colonia || '').trim() || null,
        proyecto_social_id: miProyectoPredeterminado,
        estado: estadoFinal,
      };

      let actividadActualId = editId;

      if (editId) {
        const { error: errUpdate } = await supabase.from('actividades').update(payloadActividad).eq('id', editId);
        if (errUpdate) throw new Error("No se pudo actualizar la actividad: " + errUpdate.message);

        const { error: errDelOds } = await supabase.from('actividad_ods').delete().eq('actividad_id', editId);
        if (errDelOds) throw new Error("Error limpiando ODS: " + errDelOds.message);

        const { error: errDelAcc } = await supabase.from('actividad_acciones').delete().eq('actividad_id', editId);
        if (errDelAcc) throw new Error("Error limpiando Acciones: " + errDelAcc.message);
      } else {
        const { data: nuevaAct, error } = await supabase.from('actividades').insert([{ ...payloadActividad, creado_por_usuario_id: usuarioDatos.id }]).select('id').single();
        if (error) throw new Error("No se pudo crear la actividad: " + error.message);
        actividadActualId = nuevaAct.id;
      }

      if (actividadActualId) {
        if (formData.ods_seleccionados.length > 0) {
          const odsPayload = formData.ods_seleccionados.map((odsId, idx) => ({ actividad_id: actividadActualId, ods_id: odsId, es_principal: idx === 0 }));
          const { error: errOds } = await supabase.from('actividad_ods').insert(odsPayload);
          if (errOds) throw new Error("Error al asignar los ODS: " + errOds.message);
        }

        if (formData.tipo_accion) {
          const { error: errAccion } = await supabase.from('actividad_acciones').insert([{ actividad_id: actividadActualId, tipo: formData.tipo_accion, cantidad: formData.cantidad_accion }]);
          if (errAccion) throw new Error("Error al asignar el Tipo de Acción: " + errAccion.message);
        }
      }

      alert(estadoFinal === 'Borrador' ? 'Borrador guardado exitosamente.' : estadoFinal === 'Cancelada' ? 'Actividad cancelada.' : '¡Actividad programada en el calendario!');
      navigate('/embajador/calendario');
    } catch (error: any) { alert(error.message); } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#00689D] p-6 md:p-8">
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="text-[#00689D]" size={32} /> {editId ? 'Editar Actividad' : 'Alta de Actividad'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isPublicada ? 'Actualiza los datos de tu actividad publicada.' : 'Guárdala como borrador para continuar luego, o completa todos los campos para publicarla.'}
          </p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
            <h3 className="md:col-span-2 text-lg font-bold text-[#00689D] flex items-center gap-2"><Target size={18}/> Datos Generales</h3>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Actividad <span className="text-red-500">*</span></label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej. Taller de Reforestación Juvenil" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Acción Principal {!isPublicada && <span className="text-xs font-normal text-gray-400">(Requerido al publicar)</span>}</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.tipo_accion} onChange={e => setFormData({ ...formData, tipo_accion: e.target.value })}>
                <option value="">-- Selecciona --</option>
                {tiposAccion.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Descripción {!isPublicada && <span className="text-xs font-normal text-gray-400">(Requerido al publicar)</span>}</label>
              <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Explica el objetivo, dinámicas o requerimientos..." />
            </div>
          </div>

          <div className="bg-blue-50/30 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-[#00689D] mb-1 flex items-center gap-2"><Globe size={18}/> Alineación Agenda 2030 (Máx. 4)</h3>
            <p className="text-xs text-gray-500 mb-4">Selecciona al menos 1 ODS antes de publicar.</p>
            <div className="flex flex-wrap gap-2">
              {odsList.map(ods => {
                const isSelected = formData.ods_seleccionados.includes(ods.id);
                return (
                  <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all ${isSelected ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-white text-gray-600 hover:border-[#00689D]'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
                    {ods.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50/50 p-6 rounded-xl border border-gray-200">
            <h3 className="md:col-span-3 text-lg font-bold text-[#00689D] flex items-center gap-2"><MapPin size={18}/> Cuándo y Dónde</h3>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Fecha {!isPublicada && <span className="text-xs font-normal text-gray-400">(Obligatorio)</span>}</label><input type="date" min={todayString} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.fecha_evento} onChange={e => setFormData({ ...formData, fecha_evento: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Hora Inicio</label><input type="time" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_inicio} onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Hora Fin</label><input type="time" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.hora_fin} onChange={e => setFormData({ ...formData, hora_fin: e.target.value })} /></div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Municipio</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#00689D]" value={formData.municipio_id} onChange={e => setFormData({ ...formData, municipio_id: Number(e.target.value) })}>
                {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Lugar Exacto</label><input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.lugar} onChange={e => setFormData({ ...formData, lugar: e.target.value })} placeholder="Ej. Kiosco Central de la Plazuela" /></div>
            
            <div className="md:col-span-3 pt-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Detallada <span className="text-xs font-normal text-gray-400">(Opcional)</span></label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.calle} onChange={e => setFormData({ ...formData, calle: e.target.value })} placeholder="Calle y número" />
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.colonia} onChange={e => setFormData({ ...formData, colonia: e.target.value })} placeholder="Colonia o Sector" />
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00689D]" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} placeholder="Referencias (Ej. Entre Morelos y Zaragoza)" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/embajador/calendario')} className="w-full sm:w-auto px-6 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <X size={18} className="inline mr-1" /> {isPublicada ? 'Descartar Cambios' : 'Cancelar'}
            </button>
            
            {isPublicada ? (
              <>
                {actToEdit.estado !== 'Cancelada' && (
                  <button type="button" disabled={isSaving} onClick={() => handleGuardarActividad('Cancelada')} className="w-full sm:w-auto px-6 py-3 font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    <Ban size={18} className="inline mr-1" /> Cancelar Evento
                  </button>
                )}
                <button type="button" disabled={isSaving} onClick={() => handleGuardarActividad(actToEdit.estado === 'Cancelada' ? 'Programada' : actToEdit.estado)} className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all disabled:opacity-50">
                  <Save size={18} className="inline mr-1" /> Guardar Cambios
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={isSaving} onClick={() => handleGuardarActividad('Borrador')} className="w-full sm:w-auto px-6 py-3 font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                  <Save size={18} className="inline mr-1 text-gray-500" /> Guardar Borrador
                </button>
                <button type="button" disabled={isSaving} onClick={() => handleGuardarActividad('Programada')} className="w-full sm:w-auto px-8 py-3 font-bold text-white bg-[#00689D] rounded-xl hover:bg-[#00527A] shadow-md transition-all disabled:opacity-50">
                  <Send size={18} className="inline mr-1" /> Publicar en Calendario
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}