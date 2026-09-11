import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Sun, Moon, Sunrise, Users, Calendar, Target, 
  MapPin, Clock, ArrowRight, ChevronRight, Activity, Globe, User,
  X, CheckCircle2, Edit2, Activity as ActivityIcon, Trash2, Ban
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mismos tipos que el Calendario para mantener compatibilidad total en el Drawer
interface Actividad {
  id: number; nombre: string; descripcion: string; fecha_evento: string; hora_inicio: string; hora_fin: string;
  municipio_id: number; lugar: string; direccion: string; calle: string; colonia: string; estado: string;
  creado_por_usuario_id: string; municipios: { nombre: string }; creador: { nombre: string; apellido: string };
  actividad_asistentes: { usuario_id: string; usuarios: { nombre: string; apellido: string } }[];
  actividad_ods: { ods_id: number; ods: { numero: number; nombre: string } }[];
  actividad_acciones: { tipo_accion_id: number; cantidad: number; tipos_accion: { nombre: string } }[];
}

export default function EmbajadorInicio() {
  const { usuarioDatos } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ actividades: 0, beneficiarios: 0, ods: 0 });
  const [misProximas, setMisProximas] = useState<Actividad[]>([]);
  const [actividadesComunidad, setActividadesComunidad] = useState<Actividad[]>([]);
  const [municipioNombre, setMunicipioNombre] = useState<string>('');

  // Estados del Drawer Lateral
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Actividad | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
// Estado para calcular el margen superior dinámico
  const [espacioSuperior, setEspacioSuperior] = useState(88); // Valor por defecto seguro

  useEffect(() => {
    const calcularEspacio = () => {
      // 1. Busca automáticamente el Header en tu página para saber cuánto mide exactamente
      const headerElement = document.querySelector('header');
      const alturaHeader = headerElement ? headerElement.offsetHeight : 88; 
      
      const scrollActual = window.scrollY;
      
      // 2. Calcula el espacio restante
      const nuevoEspacio = scrollActual >= alturaHeader ? 0 : alturaHeader - scrollActual;
      setEspacioSuperior(nuevoEspacio);
    };

    window.addEventListener('scroll', calcularEspacio);
    
    // Lo ejecutamos con un mini-retraso al cargar para asegurar que el logo y botones ya tengan su tamaño final
    setTimeout(calcularEspacio, 50); 

    return () => window.removeEventListener('scroll', calcularEspacio);
  }, []);
  // Funciones de fecha seguras
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFechaLocal = (fechaString: string) => {
    if (!fechaString) return new Date();
    const partes = fechaString.split('T')[0].split('-');
    return new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
  };

  const formatFechaAbreviada = (fechaStr: string) => {
    if (!fechaStr) return { dia: '00', mes: '---' };
    const date = getFechaLocal(fechaStr);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return { dia: date.getDate().toString().padStart(2, '0'), mes: meses[date.getMonth()] };
  };

  const formatearFechaDrawer = (fechaString: string) => {
    if (!fechaString) return 'Fecha sin definir';
    const fechaLocal = getFechaLocal(fechaString);
    return `${format(fechaLocal, 'EEEE, d', { locale: es })} de ${format(fechaLocal, 'MMMM yyyy', { locale: es })}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Buenos días', icon: <Sunrise className="text-orange-400" size={28} /> };
    if (hour >= 12 && hour < 19) return { text: 'Buenas tardes', icon: <Sun className="text-yellow-500" size={28} /> };
    return { text: 'Buenas noches', icon: <Moon className="text-blue-400" size={28} /> };
  };
  const greeting = getGreeting();

  // ==========================================
  // CARGA DE DATOS PRINCIPAL
  // ==========================================
  const fetchDashboardData = async () => {
    if (!usuarioDatos?.id) return;
    setLoading(true);

    try {
      // 1. Datos de municipio del embajador
      const { data: embajadorData } = await supabase.from('embajadores').select('municipio_id').eq('usuario_id', usuarioDatos.id).maybeSingle();
      const miMunicipioId = embajadorData?.municipio_id;

      if (miMunicipioId) {
        // SOLUCIÓN: Cambiamos .single() por .maybeSingle() 👇
        const { data: municipio } = await supabase.from('municipios').select('nombre').eq('id', miMunicipioId).maybeSingle();
        setMunicipioNombre(municipio?.nombre || 'Municipio no definido');
      }

      // 2. Métricas (Totales)
      const { data: misActividadesStats } = await supabase.from('actividades')
        .select('id, beneficiarios_directos, beneficiarios_indirectos')
        .eq('creado_por_usuario_id', usuarioDatos.id)
        .is('fecha_eliminacion', null);

      let totalBen = 0;
      if (misActividadesStats) {
        totalBen = misActividadesStats.reduce((acc, act) => acc + (act.beneficiarios_directos || 0) + (act.beneficiarios_indirectos || 0), 0);
      }

      const { data: odsData } = await supabase.from('actividad_ods').select('ods_id').in('actividad_id', (misActividadesStats || []).map(a => a.id));
      const odsUnicos = new Set(odsData?.map(o => o.ods_id)).size;

      setStats({ actividades: misActividadesStats?.length || 0, beneficiarios: totalBen, ods: odsUnicos });

      // 3. Actividades Dinámicas (Mi Agenda vs Cerca de ti)
      if (miMunicipioId) {
        const hoyLocal = getTodayString();
        
        // Traemos TODAS las actividades próximas del municipio con datos completos para el Drawer
        const { data: upcomingActs } = await supabase
          .from('actividades')
          .select(`
            id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, direccion, calle, colonia, municipio_id, estado, creado_por_usuario_id,
            municipios(nombre), 
            creador:usuarios!actividades_creado_por_usuario_id_fkey(nombre, apellido),
            actividad_asistentes(usuario_id, usuarios(nombre, apellido)), 
            actividad_ods(ods_id, ods(numero, nombre)), 
            actividad_acciones(tipo_accion_id, cantidad, tipos_accion(nombre))
          `)
          .eq('municipio_id', miMunicipioId)
          .gte('fecha_evento', hoyLocal)
          .is('fecha_eliminacion', null)
          .order('fecha_evento', { ascending: true });

        if (upcomingActs) {
          const myActs: Actividad[] = [];
          const communityActs: Actividad[] = [];

          upcomingActs.forEach((act: any) => {
            // Excluimos borradores que no sean nuestros
            if (act.estado === 'Borrador' && act.creado_por_usuario_id !== usuarioDatos.id) return;

            const soyCreador = act.creado_por_usuario_id === usuarioDatos.id;
            const soyAsistente = act.actividad_asistentes?.some((a: any) => a.usuario_id === usuarioDatos.id);

            // Si la creé yo o ya estoy anotado, va a Mi Agenda
            if (soyCreador || soyAsistente) {
              myActs.push(act);
            } else {
              communityActs.push(act);
            }
          });

          setMisProximas(myActs.slice(0, 3));
          setActividadesComunidad(communityActs.slice(0, 4));

          // Actualiza el modal en vivo si lo tenemos abierto
          setEventoSeleccionado(prev => {
            if (!prev) return null;
            const updated = upcomingActs.find(a => a.id === prev.id);
            return (updated as any) || prev;
          });
        }
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Escucha cambios, incluyendo navegación (location.key)
  useEffect(() => { fetchDashboardData(); }, [usuarioDatos, location.key]);

  // ==========================================
  // ACCIONES DEL DRAWER
  // ==========================================
  const abrirDetalle = (act: Actividad) => {
    setEventoSeleccionado(act);
    setIsSidebarOpen(true);
  };

  const handleSumarse = async () => {
    if (!usuarioDatos?.id || !eventoSeleccionado) return;
    setIsJoining(true);
    try {
      const { error } = await supabase.from('actividad_asistentes').insert({ actividad_id: eventoSeleccionado.id, usuario_id: usuarioDatos.id });
      if (error) throw error;
      await fetchDashboardData(); // Esto actualizará el Drawer y pasará la actividad a "Mi Agenda" al instante.
    } catch (error: any) { alert("Error al unirte: " + error.message); } finally { setIsJoining(false); }
  };

  const irAEditar = (actividad: Actividad) => {
    setIsSidebarOpen(false);
    navigate('/embajador/actividades', { state: { actToEdit: actividad } });
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar permanentemente esta actividad?')) return;
    try {
      const { error } = await supabase.from('actividades').update({ fecha_eliminacion: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setIsSidebarOpen(false);
      fetchDashboardData();
    } catch (error) { alert('Error al eliminar.'); }
  };

  const handleCancelarEvento = async (id: number) => {
    if (!window.confirm('¿Deseas marcar esta actividad como Cancelada?')) return;
    try {
      const { error } = await supabase.from('actividades').update({ estado: 'Cancelada' }).eq('id', id);
      if (error) throw error;
      await fetchDashboardData();
    } catch (error) { alert('Error al cancelar.'); }
  };
  // Bloquear el scroll del cuerpo de la página cuando el panel está abierto
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Limpieza de seguridad si el componente se desmonta
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen]);
  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#00689D]/20 border-t-[#00689D] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Preparando tu espacio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* ==========================================
          HEADER / SALUDO DINÁMICO
      ========================================== */}
      <div className="bg-linear-to-r from-[#00689D] to-[#004A70] rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none"><Globe size={300} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {greeting.icon}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{greeting.text}, {usuarioDatos?.nombre || 'Embajador'}</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-2xl font-medium">Es un gran día para transformar tu entorno. Aquí tienes el resumen de tu impacto en la Agenda 2030.</p>
          </div>
          <div className="shrink-0">
            <Link to="/embajador/actividades" className="bg-white text-[#00689D] px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2">
              <Activity size={18} /> Registrar Actividad
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          TARJETAS DE MÉTRICAS (STATS)
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><Users size={28} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Impacto Social</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.beneficiarios}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Personas beneficiadas</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-4 rounded-xl text-green-600"><Calendar size={28} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Tu Participación</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.actividades}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Actividades registradas</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="bg-purple-50 p-4 rounded-xl text-purple-600"><Target size={28} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Agenda 2030</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.ods}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">ODS diferentes impactados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ==========================================
            MIS PRÓXIMAS ACTIVIDADES
        ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]" size={20} /> Mi Agenda</h2>
            <Link to="/embajador/calendario" className="text-sm font-bold text-[#00689D] hover:underline">Ver calendario</Link>
          </div>
          
          <div className="p-6 flex-1 bg-gray-50/30">
            {misProximas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="bg-gray-100 p-4 rounded-full text-gray-400 mb-3"><Calendar size={32} /></div>
                <p className="font-bold text-gray-700">No tienes actividades próximas</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">Organiza o únete a un evento en tu comunidad.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {misProximas.map(act => {
                  const fecha = formatFechaAbreviada(act.fecha_evento);
                  return (
                    <div key={act.id} onClick={() => abrirDetalle(act)} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-lg w-16 h-16 shrink-0">
                        <span className="text-xs font-bold text-[#00689D] uppercase tracking-wider">{fecha.mes}</span>
                        <span className="text-2xl font-black text-[#00689D] leading-none mt-1">{fecha.dia}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#00689D] transition-colors line-clamp-1 pr-2">{act.nombre}</h4>
                          {act.estado === 'Borrador' && <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Borrador</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Clock size={14} /> {act.hora_inicio?.slice(0,5) || 'Por definir'}</span>
                          <span className="flex items-center gap-1 line-clamp-1"><MapPin size={14} /> {act.lugar || 'Lugar por definir'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            COMUNIDAD (ACTIVIDADES EN SU MUNICIPIO)
        ========================================== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MapPin className="text-green-600" size={20} /> Cerca de ti</h2>
            {municipioNombre && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{municipioNombre}</span>}
          </div>
          
          <div className="p-6 flex-1">
            {actividadesComunidad.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="bg-gray-50 p-4 rounded-full text-gray-300 mb-3"><Users size={32} /></div>
                <p className="font-bold text-gray-700">Comunidad en pausa</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">Aún no hay actividades programadas por otros embajadores.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actividadesComunidad.map(act => (
                  <div key={act.id} onClick={() => abrirDetalle(act)} className="group relative flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all">
                    <div className="pr-4">
                      <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 group-hover:text-[#00689D] transition-colors">{act.nombre}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Por {act.creador?.nombre} {act.creador?.apellido} • {formatFechaAbreviada(act.fecha_evento).dia} {formatFechaAbreviada(act.fecha_evento).mes}
                      </p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-[#00689D] group-hover:text-white transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {actividadesComunidad.length > 0 && (
            <div className="bg-blue-50/50 p-4 border-t border-blue-100 text-center">
              <p className="text-xs text-blue-700 font-medium flex items-center justify-center gap-1">Toca una actividad para sumarte como voluntario <ArrowRight size={12} /></p>
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          DRAWER LATERAL (Detalle Completo)
      ========================================== */}
      {/* Fondo Oscuro (Overlay) */}
      <div 
        className={`fixed left-0 w-full bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      {/* Panel Lateral (Drawer) */}
      <div 
        className={`fixed right-0 z-50 w-full sm:w-125 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: `${espacioSuperior}px`, height: `calc(100vh - ${espacioSuperior}px)` }}
      >
        {eventoSeleccionado && (
          <>
            <div className={`${eventoSeleccionado.estado === 'Cancelada' ? 'bg-red-600' : eventoSeleccionado.estado === 'Borrador' ? 'bg-gray-600' : 'bg-[#00689D]'} p-6 text-white shrink-0 relative transition-colors`}>
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
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{eventoSeleccionado.actividad_acciones[0].tipos_accion?.nombre || 'Actividad'}</span>
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