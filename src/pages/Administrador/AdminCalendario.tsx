import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale'; 
import { 
  ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, 
  Info, X, LayoutGrid, List, Columns, User, Users, Edit2, 
  PlusCircle, Trash2, Ban, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  municipio_id: number | null; // null si es para "todos los municipios"
  lugar: string;
  direccion: string;
  calle: string;
  colonia: string;
  estado: string;
  creado_por_usuario_id: string;
  municipios: { nombre: string } | null;
  creador: { nombre: string; apellido: string };
  actividad_asistentes: { usuario_id: string; usuarios: { nombre: string; apellido: string } }[];
  actividad_ods: { ods_id: number; ods: { numero: number; nombre: string } }[];
  actividad_acciones: { tipo_accion_id: number; cantidad: number; tipos_accion: { nombre: string } }[];
}

interface Municipio {
  id: number;
  nombre: string;
}

type ViewMode = 'mes' | 'semana' | 'dia';

export default function AdminCalendario() {
  const { usuarioDatos } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estados de datos
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [municipiosLista, setMunicipiosLista] = useState<Municipio[]>([]);
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('todos');
  
  const [loading, setLoading] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Actividad | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================
  // LÓGICA DE INTERFAZ
  // ==========================================
  const [espacioSuperior, setEspacioSuperior] = useState(88);

  useEffect(() => {
    const calcularEspacio = () => {
      const headerElement = document.querySelector('header');
      const alturaHeader = headerElement ? headerElement.offsetHeight : 88; 
      const scrollActual = window.scrollY;
      setEspacioSuperior(scrollActual >= alturaHeader ? 0 : alturaHeader - scrollActual);
    };
    window.addEventListener('scroll', calcularEspacio);
    setTimeout(calcularEspacio, 50);
    return () => window.removeEventListener('scroll', calcularEspacio);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen]);

  // ==========================================
  // LÓGICA DE ESTILOS (VERSIÓN ADMIN)
  // ==========================================
  const obtenerEstilosUI = (act: Actividad) => {
    const esCreador = act.creado_por_usuario_id === usuarioDatos?.id;

    if (act.estado === 'Borrador') {
      return {
        mes: 'bg-amber-50 text-amber-700 border border-amber-300 border-dashed hover:bg-amber-100 cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-amber-50/50 border-amber-400 border-dashed',
        diaMain: 'border-amber-200 border-dashed bg-white',
        diaHora: 'bg-amber-50 text-amber-700 border-amber-200 border-dashed',
        drawerHeader: 'bg-amber-600'
      };
    } else if (esCreador) {
      // Actividades creadas por el Admin
      return {
        mes: 'bg-blue-50 text-[#00689D] border border-blue-200 hover:bg-[#00689D] hover:text-white cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-white border-[#00689D]',
        diaMain: 'border-blue-100 bg-white',
        diaHora: 'bg-blue-50 text-[#00689D] border-blue-100',
        drawerHeader: 'bg-[#00689D]'
      };
    } else {
      // Actividades creadas por Embajadores (Gris Pizarra)
      return {
        mes: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 cursor-pointer hover:scale-[1.02] transform transition-transform',
        semana: 'bg-white border-slate-300',
        diaMain: 'border-slate-200 bg-white opacity-90 hover:opacity-100',
        diaHora: 'bg-slate-50 text-slate-500 border-slate-200',
        drawerHeader: 'bg-slate-700'
      };
    }
  };

  // ==========================================
  // FECHAS
  // ==========================================
  const getFechaLocal = (fechaString: string) => {
    if (!fechaString) return new Date();
    const partes = fechaString.split('T')[0].split('-');
    return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  };

  const formatearFechaDrawer = (fechaString: string) => {
    if (!fechaString) return 'Fecha sin definir';
    const fechaLocal = getFechaLocal(fechaString);
    return `${format(fechaLocal, 'EEEE, d', { locale: es })} de ${format(fechaLocal, 'MMMM yyyy', { locale: es })}`;
  };

  const getActividadesDelDia = (fechaCelda: Date) => {
    return actividades.filter(act => {
      if (!act.fecha_evento) return false;
      const fechaActividadLocal = getFechaLocal(act.fecha_evento);
      return isSameDay(fechaActividadLocal, fechaCelda);
    }).sort((a, b) => (a.hora_inicio > b.hora_inicio ? 1 : -1));
  };

  // ==========================================
  // CARGA DE DATOS Y FILTROS
  // ==========================================
  useEffect(() => {
    const cargarMunicipios = async () => {
      const { data } = await supabase.from('municipios').select('id, nombre').order('nombre');
      if (data) setMunicipiosLista(data);
    };
    cargarMunicipios();
  }, []);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('actividades')
        .select(`
          id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, direccion, calle, colonia, municipio_id, estado, creado_por_usuario_id,
          municipios(nombre), 
          creador:usuarios!actividades_creado_por_usuario_id_fkey(nombre, apellido),
          actividad_asistentes(usuario_id, usuarios(nombre, apellido)), 
          actividad_ods(ods_id, ods(numero, nombre)), 
          actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre))
        `)
        .is('fecha_eliminacion', null);

      // Aplicar filtro si no es "todos"
      if (filtroMunicipio !== 'todos') {
        // Trae las del municipio específico, O las que son para "todos" (municipio_id IS NULL si es que lo manejas así en base de datos)
        query = query.or(`municipio_id.eq.${filtroMunicipio},municipio_id.is.null`);
      }

      const { data: acts, error } = await query;
      if (error) throw error;
      
      // Filtrar borradores: Un admin solo ve sus propios borradores, no los de los embajadores
      const actividadesPermitidas = (acts as any[]).filter(a => a.estado !== 'Borrador' || a.creado_por_usuario_id === usuarioDatos?.id);
      
      setActividades(actividadesPermitidas || []);

      setEventoSeleccionado(prev => {
        if (!prev) return null;
        return actividadesPermitidas.find(a => a.id === prev.id) || prev;
      });
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchActividades(); }, [usuarioDatos, filtroMunicipio, location.key]);

  // ==========================================
  // ACCIONES ADMINISTRATIVAS
  // ==========================================
  const irAEditar = (actividad: Actividad) => {
    setIsSidebarOpen(false);
    navigate('/admin/actividades/editar', { state: { actToEdit: actividad } }); // Ajusta esta ruta a la de tu admin
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta actividad?')) return;
    try {
      const { error } = await supabase.from('actividades').update({ fecha_eliminacion: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setIsSidebarOpen(false);
      fetchActividades();
    } catch (error) { alert('Error al eliminar la actividad.'); }
  };

  const handleCancelarEvento = async (id: number) => {
    if (!window.confirm('¿Deseas marcar esta actividad como Cancelada?')) return;
    try {
      const { error } = await supabase.from('actividades').update({ estado: 'Cancelada' }).eq('id', id);
      if (error) throw error;
      await fetchActividades(); 
    } catch (error) { alert('Error al cancelar la actividad.'); }
  };

  // ... Aquí van renderMonthView, renderWeekView y renderDayView (son idénticas a las del Embajador)
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate); const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
    const rows = []; let days = []; let day = startOfWeek(monthStart, { weekStartsOn: 1 });

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day; const acts = getActividadesDelDia(cloneDay);
        days.push(
          <div key={day.toString()} onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} className={`min-h-30 p-2 border-b border-r border-gray-100 cursor-pointer group ${!isSameMonth(day, monthStart) ? 'bg-gray-50/50 text-gray-400' : 'bg-white hover:bg-blue-50/30'}`}>
            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isSameDay(day, new Date()) ? 'bg-[#00689D] text-white' : 'text-gray-700'}`}>{format(day, 'd')}</span>
            <div className="mt-2 space-y-1">
              {acts.slice(0, 3).map(act => {
                const estilos = obtenerEstilosUI(act);
                return (
                  <div key={act.id} onClick={(e) => { e.stopPropagation(); setEventoSeleccionado(act); setIsSidebarOpen(true); }} className={`px-2 py-1 rounded text-xs truncate font-medium shadow-sm transition-colors ${estilos.mes}`}>
                    {act.estado === 'Borrador' && '📝 '}{act.hora_inicio?.slice(0,5)} {act.nombre}
                  </div>
                );
              })}
              {acts.length > 3 && <div className="text-xs text-gray-500 font-bold pl-1">+ {acts.length - 3} más</div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>); days = [];
    }
    return rows;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    return (
      <div className="grid grid-cols-7">
        {Array.from({length: 7}).map((_, i) => {
          const cloneDay = addDays(startDate, i); const acts = getActividadesDelDia(cloneDay);
          return (
            <div key={i} className="flex flex-col min-h-125 border-r border-gray-100 bg-white">
              <div onClick={() => { setCurrentDate(cloneDay); setViewMode('dia'); }} className="p-3 text-center border-b border-gray-100 cursor-pointer hover:bg-blue-50">
                <p className="text-xs font-bold text-gray-400 uppercase">{format(cloneDay, 'EEE', { locale: es })}</p>
                <p className={`text-xl font-black mt-1 ${isSameDay(cloneDay, new Date()) ? 'text-[#00689D]' : 'text-gray-700'}`}>{format(cloneDay, 'd')}</p>
              </div>
              <div className="p-2 space-y-2 flex-1 bg-gray-50/30">
                {acts.map(act => (
                  <div key={act.id} onClick={() => { setEventoSeleccionado(act); setIsSidebarOpen(true); }} className={`border-l-4 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-all group ${obtenerEstilosUI(act).semana}`}>
                    <p className="text-xs font-bold text-gray-500">{act.estado === 'Borrador' && '📝 '}{act.hora_inicio?.slice(0,5)}</p>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#00689D]">{act.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const acts = getActividadesDelDia(currentDate);
    if (acts.length === 0) return <div className="py-24 text-center"><CalendarIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" /><h3 className="text-xl font-bold text-gray-800">Sin actividades</h3><p className="text-gray-500">No hay eventos programados en esta fecha.</p></div>;
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {acts.map(act => {
          const estilos = obtenerEstilosUI(act);
          return (
            <div key={act.id} onClick={() => { setEventoSeleccionado(act); setIsSidebarOpen(true); }} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${estilos.diaMain}`}>
              <div className={`flex flex-col items-center justify-center min-w-25 h-full py-2 rounded-xl border ${estilos.diaHora}`}>
                <span className="font-black text-xl">{act.hora_inicio?.slice(0,5) || '--:--'}</span><span className="text-xs font-bold uppercase mt-1">Inicio</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold transition-colors ${act.estado === 'Borrador' ? 'text-gray-700' : 'text-gray-900 group-hover:text-[#00689D]'}`}>
                  {act.estado === 'Borrador' && '📝 '}{act.nombre}
                </h3>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/>{act.lugar || 'Por definir'}</span>
                  <span className="flex items-center gap-1.5"><Info size={16} className="text-gray-400"/>{act.municipios?.nombre || 'Todos los Municipios'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* HEADER ADMIN Y FILTRO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3"><CalendarIcon className="text-[#00689D]" size={32} /> Calendario General (Admin)</h1>
          <p className="text-gray-500 mt-2 text-sm">Supervisa todas las actividades de los embajadores o crea actividades globales.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          {/* NUEVO: Filtro por municipio */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-[#00689D] focus:border-transparent transition-all appearance-none outline-none"
            >
              <option value="todos">Todos los Municipios</option>
              {municipiosLista.map(mun => (
                <option key={mun.id} value={mun.id}>{mun.nombre}</option>
              ))}
            </select>
          </div>

          <button onClick={() => navigate('/administrador/actividades')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md transition-all">
            <PlusCircle size={20} /> Crear Actividad
          </button>
        </div>
      </div>

      {/* LEYENDA VISUAL */}
      <div className="flex flex-wrap items-center gap-4 mb-6 px-2 text-xs font-medium text-gray-600">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00689D]"></div> Creadas por Mí (Admin)</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Creadas por Embajadores</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-100"></div> Mis Borradores</span>
      </div>

      {/* CONTROLES DE FECHAS (Igual) */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
            <button onClick={() => viewMode === 'mes' ? setCurrentDate(subMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
            
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-white rounded-lg transition-colors">Hoy</button>
            
            <button onClick={() => viewMode === 'mes' ? setCurrentDate(addMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#00689D] capitalize min-w-45 text-center md:text-left">
            {viewMode === 'mes' && format(currentDate, 'MMMM yyyy', { locale: es })}
            {viewMode === 'semana' && `Sem. del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: es })}`}
            {viewMode === 'dia' && format(currentDate, 'd MMM, yyyy', { locale: es })}
          </h2>
        </div>
        <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner w-full md:w-auto">
          <button onClick={() => setViewMode('dia')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'dia' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><List size={16} /><span className="hidden sm:inline">Día</span></button>
          <button onClick={() => setViewMode('semana')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'semana' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><Columns size={16} /><span className="hidden sm:inline">Semana</span></button>
          <button onClick={() => setViewMode('mes')} className={`flex-1 flex justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'mes' ? 'bg-white shadow-sm text-[#00689D]' : 'text-gray-500 hover:text-gray-800'}`}><LayoutGrid size={16} /><span className="hidden sm:inline">Mes</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="h-150 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00689D]/20 border-t-[#00689D] rounded-full animate-spin"></div></div>
        ) : (
          <>
            {viewMode !== 'dia' && (
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="text-center font-black text-xs text-gray-500 py-3 uppercase tracking-wider">{format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i), 'EEEE', { locale: es })}</div>
                ))}
              </div>
            )}
            <div className="bg-white">
              {viewMode === 'mes' && renderMonthView()}
              {viewMode === 'semana' && renderWeekView()}
              {viewMode === 'dia' && renderDayView()}
            </div>
          </>
        )}
      </div>

      {/* DRAWER LATERAL */}
      <div className={`fixed left-0 w-full bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }} onClick={() => setIsSidebarOpen(false)} />
      
      <div className={`fixed right-0 z-50 w-full sm:w-125 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}>
        {eventoSeleccionado && (
          <>
            <div className={`${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-600' : obtenerEstilosUI(eventoSeleccionado).drawerHeader} p-6 text-white shrink-0 relative transition-colors`}>
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                {eventoSeleccionado.estado === 'Borrador' ? 'Modo Borrador' : eventoSeleccionado.estado || 'Programada'}
              </span>
              <h2 className="text-2xl font-black leading-tight pr-8">{eventoSeleccionado.nombre}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-[#00689D] rounded-xl shrink-0"><Clock size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cuándo</p>
                    <p className="font-bold text-gray-900 capitalize text-lg">{formatearFechaDrawer(eventoSeleccionado.fecha_evento)}</p>
                    <p className="text-gray-600 font-medium">{eventoSeleccionado.hora_inicio?.slice(0,5) || '--:--'} hrs - {eventoSeleccionado.hora_fin ? eventoSeleccionado.hora_fin.slice(0,5) + ' hrs' : 'Fin por definir'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-[#00689D] rounded-xl shrink-0"><MapPin size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dónde</p>
                    <p className="font-bold text-gray-900 text-lg leading-tight">{eventoSeleccionado.lugar || 'Lugar sin especificar'}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      {eventoSeleccionado.calle && <p className="text-gray-700"><span className="font-bold">Calle:</span> {eventoSeleccionado.calle}</p>}
                      {eventoSeleccionado.colonia && <p className="text-gray-700"><span className="font-bold">Colonia:</span> {eventoSeleccionado.colonia}</p>}
                    </div>
                    {/* El Admin puede ver claramente a qué municipio pertenece */}
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 font-bold rounded-lg text-sm border border-gray-200">
                      📍 {eventoSeleccionado.municipios?.nombre || 'General (Todos los municipios)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-gray-100">
                <div className="p-3 bg-blue-50 text-[#00689D] rounded-xl shrink-0"><User size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Organizador</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {eventoSeleccionado.creador?.nombre} {eventoSeleccionado.creador?.apellido}
                    {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id && <span className="ml-2 text-[#00689D] font-black text-sm">(TÚ / ADMIN)</span>}
                  </p>
                </div>
              </div>
              
              {eventoSeleccionado.estado !== 'Borrador' && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users size={18} className="text-[#00689D]" /> Embajadores Unidos</p>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_asistentes?.length || 0}</span>
                  </div>

                  {eventoSeleccionado.actividad_asistentes?.length > 0 ? (
                    <div className="space-y-2 mb-6 max-h-32 overflow-y-auto pr-2">
                      {eventoSeleccionado.actividad_asistentes.map((asistente, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium">
                          <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold">
                            {asistente.usuarios?.nombre?.charAt(0) || 'U'}
                          </div>
                          <span className="text-gray-700">{asistente.usuarios?.nombre} {asistente.usuarios?.apellido}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500 mb-6 italic">Aún no hay embajadores unidos.</p>}
                  
                  {/* SE ELIMINÓ EL BOTÓN DE "UNIRSE" PORQUE EL ADMIN NO SE PUEDE UNIR */}
                </div>
              )}
            </div>

            {/* Footer con Botones Administrativos (Solo si el Admin la creó) */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id ? (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button onClick={() => handleEliminar(eventoSeleccionado.id)} title="Eliminar de la base de datos" className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                  
                  {eventoSeleccionado.estado !== 'Cancelada' && (
                    <button onClick={() => handleCancelarEvento(eventoSeleccionado.id)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors shadow-sm">
                      <Ban size={16} /> Cancelar Evento
                    </button>
                  )}
                  
                  <button onClick={() => irAEditar(eventoSeleccionado)} className="flex items-center gap-2 px-6 py-2.5 bg-[#00689D] hover:bg-[#00527A] text-white font-bold rounded-xl transition-colors shadow-sm">
                    <Edit2 size={16} /> Editar
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button onClick={() => setIsSidebarOpen(false)} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-colors shadow-sm">
                    Cerrar panel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}