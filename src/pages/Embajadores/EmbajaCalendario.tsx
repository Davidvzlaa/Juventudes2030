import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale'; 
import { 
  ChevronLeft, ChevronRight, MapPin, Clock, Calendar as CalendarIcon, 
  Info, X, LayoutGrid, List, Columns, User, Users, CheckCircle2, Edit2, 
  PlusCircle, Target, Activity as ActivityIcon, Trash2, Ban, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Actividad {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  municipio_id: number;
  lugar: string;
  direccion: string;
  calle: string;
  colonia: string;
  estado: string;
  creado_por_usuario_id: string;
  municipios: { nombre: string };
  creador: { nombre: string; apellido: string };
  actividad_asistentes: { usuario_id: string; usuarios: { nombre: string; apellido: string } }[];
  actividad_ods: { ods_id: number; ods: { numero: number; nombre: string } }[];
  actividad_acciones: { tipo_accion_id: number; cantidad: number; tipos_accion: { nombre: string } }[];
}

type ViewMode = 'mes' | 'semana' | 'dia';

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

export default function EmbajaCalendario() {
  const { usuarioDatos } = useAuth();
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Actividad | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ==========================================
  // ESTADOS DEL ALERT DIALOG (Sustituto de window.confirm)
  // ==========================================
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{
    isOpen: boolean;
    tipo: 'eliminar' | 'cancelar' | null;
    idActividad: number | null;
  }>({ isOpen: false, tipo: null, idActividad: null });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // ==========================================
  // LÓGICA DE INTERFAZ (Scroll y Header)
  // ==========================================
  const [espacioSuperior, setEspacioSuperior] = useState(88);

  useEffect(() => {
    const calcularEspacio = () => {
      const headerElement = document.querySelector('header');
      const alturaHeader = headerElement ? headerElement.offsetHeight : 88; 
      const scrollActual = window.scrollY;
      
      const nuevoEspacio = scrollActual >= alturaHeader ? 0 : alturaHeader - scrollActual;
      setEspacioSuperior(nuevoEspacio);
    };

    window.addEventListener('scroll', calcularEspacio);
    setTimeout(calcularEspacio, 50);

    return () => window.removeEventListener('scroll', calcularEspacio);
  }, []);

  useEffect(() => {
    if (isSidebarOpen || dialogoConfirmacion.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen, dialogoConfirmacion.isOpen]);

  // ==========================================
  // LÓGICA DE ESTILOS POR PARTICIPACIÓN
  // ==========================================
  const obtenerEstilosUI = (act: Actividad) => {
    const esCreador = act.creado_por_usuario_id === usuarioDatos?.id;
    const esAsistente = act.actividad_asistentes?.some(a => a.usuario_id === usuarioDatos?.id);
    const esParticipante = esCreador || esAsistente;

    if (act.estado === 'Borrador') {
      return {
        mes: 'bg-amber-50 text-amber-700 border border-amber-300 border-dashed hover:bg-amber-100 hover:text-amber-900',
        semana: 'bg-amber-50/50 border-amber-400 border-dashed',
        diaMain: 'border-amber-200 border-dashed bg-white',
        diaHora: 'bg-amber-50 text-amber-700 border-amber-200 border-dashed',
        drawerHeader: 'bg-amber-600'
      };
    } else if (esParticipante) {
      return {
        mes: 'bg-blue-50 text-[#00689D] border border-blue-200 hover:bg-[#00689D] hover:text-white',
        semana: 'bg-white border-[#00689D]',
        diaMain: 'border-blue-100 bg-white',
        diaHora: 'bg-blue-50 text-[#00689D] border-blue-100',
        drawerHeader: 'bg-[#00689D]'
      };
    } else {
      return {
        mes: 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900',
        semana: 'bg-white border-slate-300',
        diaMain: 'border-slate-200 bg-white opacity-90 hover:opacity-100',
        diaHora: 'bg-slate-50 text-slate-500 border-slate-200',
        drawerHeader: 'bg-slate-700'
      };
    }
  };

  // ==========================================
  // LÓGICA DE FECHAS
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
  // CARGA DE DATOS
  // ==========================================
  const fetchActividades = async () => {
    if (!usuarioDatos?.id) return;
    setLoading(true);
    try {
      const { data: embajador } = await supabase.from('embajadores').select('municipio_id').eq('usuario_id', usuarioDatos.id).single();

      if (embajador?.municipio_id) {
        const { data: acts, error } = await supabase
          .from('actividades')
          .select(`
            id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, direccion, calle, colonia, municipio_id, estado, creado_por_usuario_id,
            municipios(nombre), 
            creador:usuarios!actividades_creado_por_usuario_id_fkey(nombre, apellido),
            actividad_asistentes(usuario_id, usuarios(nombre, apellido)), 
            actividad_ods(ods_id, ods(numero, nombre)), 
            actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre))
          `)
          .eq('municipio_id', embajador.municipio_id)
          .is('fecha_eliminacion', null);
          
        if (error) throw error;
        
        const actividadesPermitidas = (acts as any[]).filter(a => a.estado !== 'Borrador' || a.creado_por_usuario_id === usuarioDatos.id);
        setActividades(actividadesPermitidas || []);

        setEventoSeleccionado(prev => {
          if (!prev) return null;
          const eventoActualizado = actividadesPermitidas.find(a => a.id === prev.id);
          return eventoActualizado || prev;
        });
      }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchActividades(); }, [usuarioDatos, location.key]);

  // ==========================================
  // ACCIONES Y HANDLERS
  // ==========================================
  const nextPeriod = () => { viewMode === 'mes' ? setCurrentDate(addMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1)); };
  const prevPeriod = () => { viewMode === 'mes' ? setCurrentDate(subMonths(currentDate, 1)) : viewMode === 'semana' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subDays(currentDate, 1)); };

  const handleSumarse = async () => {
    if (!usuarioDatos?.id || !eventoSeleccionado) return;
    setIsJoining(true);
    try {
      const { error } = await supabase.from('actividad_asistentes').insert({ actividad_id: eventoSeleccionado.id, usuario_id: usuarioDatos.id });
      if (error) throw error;
      await fetchActividades(); 
      notifyWithSound('¡Te has unido a la actividad con éxito!', 'success');
    } catch (error: any) { 
      notifyWithSound("Error al unirte: " + error.message, 'error'); 
    } finally { 
      setIsJoining(false); 
    }
  };

  const irAEditar = (actividad: Actividad) => {
    setIsSidebarOpen(false);
    navigate('/embajador/actividades', { state: { actToEdit: actividad } });
  };

  // Disparadores del Dialog Personalizado
  const triggerEliminar = (id: number) => {
    setDialogoConfirmacion({ isOpen: true, tipo: 'eliminar', idActividad: id });
  };

  const triggerCancelarEvento = (id: number) => {
    setDialogoConfirmacion({ isOpen: true, tipo: 'cancelar', idActividad: id });
  };

  // Ejecutor de la acción confirmada
  const ejecutarAccionConfirmada = async () => {
    if (!dialogoConfirmacion.idActividad) return;
    setIsProcessingAction(true);
    try {
      if (dialogoConfirmacion.tipo === 'eliminar') {
        const { error } = await supabase.from('actividades').update({ fecha_eliminacion: new Date().toISOString() }).eq('id', dialogoConfirmacion.idActividad);
        if (error) throw error;
        setIsSidebarOpen(false); // Cerramos el panel lateral también
        notifyWithSound('Actividad eliminada permanentemente.', 'success');
      } else if (dialogoConfirmacion.tipo === 'cancelar') {
        const { error } = await supabase.from('actividades').update({ estado: 'Cancelada' }).eq('id', dialogoConfirmacion.idActividad);
        if (error) throw error;
        notifyWithSound('La actividad ha sido cancelada con éxito.', 'success');
      }
      await fetchActividades();
    } catch (error) {
      notifyWithSound(`Error al ${dialogoConfirmacion.tipo} la actividad.`, 'error');
    } finally {
      setIsProcessingAction(false);
      setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null });
    }
  };

  // ==========================================
  // RENDERIZADO DEL GRID
  // ==========================================
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
                {acts.map(act => {
                  const estilos = obtenerEstilosUI(act);
                  return (
                    <div key={act.id} onClick={() => { setEventoSeleccionado(act); setIsSidebarOpen(true); }} className={`border-l-4 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-all group ${estilos.semana}`}>
                      <p className="text-xs font-bold text-gray-500">{act.estado === 'Borrador' && '📝 '}{act.hora_inicio?.slice(0,5)}</p>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#00689D]">{act.nombre}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const acts = getActividadesDelDia(currentDate);
    if (acts.length === 0) return <div className="py-24 text-center"><CalendarIcon className="mx-auto h-16 w-16 text-gray-200 mb-4" /><h3 className="text-xl font-bold text-gray-800">Día libre</h3><p className="text-gray-500">No hay actividades programadas para hoy en tu municipio.</p></div>;
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
                  <span className="flex items-center gap-1.5"><Info size={16} className="text-gray-400"/>{act.municipios?.nombre}</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    act.estado === 'Borrador' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    act.estado === 'Realizada' ? 'bg-green-50 text-green-700 border-green-200' :
                    act.estado === 'En curso' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    act.estado === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-purple-50 text-purple-700 border-purple-200' 
                  }`}>
                  {act.estado || 'Programada'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3"><CalendarIcon className="text-[#00689D]" size={32} /> Calendario de Impacto</h1>
          <p className="text-gray-500 mt-2 text-sm">Organiza, visualiza y súmate a las actividades de tu municipio.</p>
        </div>
        <button onClick={() => navigate('/embajador/actividades')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md transition-all">
          <PlusCircle size={20} /> Registrar Actividad
        </button>
      </div>

      {/* LEYENDA VISUAL DE COLORES */}
      <div className="flex flex-wrap items-center gap-4 mb-6 px-2 text-xs font-medium text-gray-600">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#00689D]"></div> Mi Agenda (Unido / Creador)</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Disponibles en Cartelera</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-amber-100"></div> Mis Borradores</span>
      </div>

      {/* CONTROLES DE CALENDARIO */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
            <button onClick={prevPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-bold text-gray-700 hover:bg-white rounded-lg transition-colors">Hoy</button>
            <button onClick={nextPeriod} className="p-2 hover:bg-white rounded-lg text-gray-600 transition-colors"><ChevronRight size={20} /></button>
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

      {/* RENDER GRID */}
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

      {/* ==========================================
          DRAWER LATERAL (Detalle Completo)
      ========================================== */}
      
      <div 
        className={`fixed left-0 w-full bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      <div 
        className={`fixed right-0 z-50 w-full sm:w-125 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
      >
        {eventoSeleccionado && (
          <>
            {/* Header del Drawer (Usa el color dinámico que calculamos) */}
            <div className={`${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-600' : obtenerEstilosUI(eventoSeleccionado).drawerHeader} p-6 text-white shrink-0 relative transition-colors`}>
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                {eventoSeleccionado.estado === 'Borrador' ? 'Modo Borrador' : eventoSeleccionado.estado || 'Programada'}
              </span>
              <h2 className="text-2xl font-black leading-tight pr-8">{eventoSeleccionado.nombre}</h2>
            </div>

            {/* Cuerpo del Drawer */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-[#00689D] rounded-xl shrink-0"><Clock size={24} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cuándo</p>
                    <p className="font-bold text-gray-900 capitalize text-lg">
                      {formatearFechaDrawer(eventoSeleccionado.fecha_evento)}
                    </p>
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
                      {eventoSeleccionado.direccion && <p className="text-gray-600 italic"><span className="font-bold not-italic text-gray-700">Ref:</span> {eventoSeleccionado.direccion}</p>}
                    </div>

                    <p className="text-[#00689D] font-bold text-sm mt-2">{eventoSeleccionado.municipios?.nombre || 'Municipio no definido'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-gray-100">
                <div className="p-3 bg-blue-50 text-[#00689D] rounded-xl shrink-0"><User size={24} /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Organizador</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {eventoSeleccionado.creador?.nombre} {eventoSeleccionado.creador?.apellido}
                    {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id && <span className="ml-2 text-[#00689D] font-black text-sm">(TÚ)</span>}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={18} className="text-[#00689D]" /> Impacto y Alineación</h3>
                
                {eventoSeleccionado.actividad_acciones && eventoSeleccionado.actividad_acciones.length > 0 && (
                  <div className="mb-4 flex items-center gap-2">
                    <ActivityIcon size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Tipo:</span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                      {eventoSeleccionado.actividad_acciones[0].tipos_accion?.nombre || 'Actividad'}
                    </span>
                  </div>
                )}

                {eventoSeleccionado.actividad_ods && eventoSeleccionado.actividad_ods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {eventoSeleccionado.actividad_ods.map((rel, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-[#00689D] rounded-lg text-xs font-bold">
                        <span className="w-4 h-4 bg-[#00689D] text-white rounded-full flex items-center justify-center text-[9px]">{rel.ods?.numero}</span>
                        {rel.ods?.nombre}
                      </span>
                    ))}
                  </div>
                )}

                {eventoSeleccionado.descripcion && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">Detalles Adicionales</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{eventoSeleccionado.descripcion}</p>
                  </div>
                )}
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
                          <div className="w-7 h-7 rounded-full bg-[#00689D] text-white flex items-center justify-center text-xs font-bold">
                            {asistente.usuarios?.nombre?.charAt(0) || 'U'}
                          </div>
                          <span className="text-gray-700">{asistente.usuarios?.nombre} {asistente.usuarios?.apellido}</span>
                          {asistente.usuario_id === usuarioDatos?.id && <span className="ml-auto text-xs text-[#00689D] bg-blue-50 px-2 py-1 rounded-md font-bold">Tú</span>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500 mb-6 italic">Aún no hay embajadores unidos a esta actividad.</p>}

                  {/* Lógica de Sumarse */}
                  {eventoSeleccionado.creado_por_usuario_id !== usuarioDatos?.id && eventoSeleccionado.estado !== 'Cancelada' ? (
                    eventoSeleccionado.actividad_asistentes?.some(a => a.usuario_id === usuarioDatos?.id) ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold"><CheckCircle2 size={20} /> ¡Ya estás unido!</div>
                    ) : (
                      <button onClick={handleSumarse} disabled={isJoining} className="w-full flex items-center justify-center gap-2 bg-[#00689D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00527A] shadow-md disabled:opacity-50">
                        {isJoining ? 'Uniéndome...' : 'Unirme a la actividad'}
                      </button>
                    )
                  ) : null}
                </div>
              )}
            </div>

            {/* Footer con Botones Administrativos */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              {eventoSeleccionado.creado_por_usuario_id === usuarioDatos?.id ? (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button onClick={() => triggerEliminar(eventoSeleccionado.id)} title="Eliminar permanentemente" className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                  
                  {eventoSeleccionado.estado !== 'Cancelada' && (
                    <button onClick={() => triggerCancelarEvento(eventoSeleccionado.id)} className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors shadow-sm">
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

      {/* ==========================================
          ALERT DIALOG MODAL (Sustituye window.confirm)
      ========================================== */}
      {dialogoConfirmacion.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {dialogoConfirmacion.tipo === 'eliminar' ? 'Eliminar Actividad' : 'Cancelar Actividad'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {dialogoConfirmacion.tipo === 'eliminar' 
                  ? '¿Estás seguro de que deseas eliminar permanentemente esta actividad? Esta acción no se puede deshacer.'
                  : '¿Estás seguro de que deseas marcar esta actividad como Cancelada? Los asistentes verán este cambio.'}
              </p>
              
              <div className="flex items-center justify-center gap-3 w-full">
                <button 
                  onClick={() => !isProcessingAction && setDialogoConfirmacion({ isOpen: false, tipo: null, idActividad: null })}
                  disabled={isProcessingAction}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Regresar
                </button>
                <button 
                  onClick={ejecutarAccionConfirmada}
                  disabled={isProcessingAction}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-70"
                >
                  {isProcessingAction ? <Loader2 size={16} className="animate-spin" /> : null}
                  {dialogoConfirmacion.tipo === 'eliminar' ? 'Sí, eliminar' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}