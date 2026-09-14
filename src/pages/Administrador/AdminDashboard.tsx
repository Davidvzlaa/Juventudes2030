import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Sun, Moon, Sunrise, Globe, Users, Target, Activity, ShieldCheck, MapPin 
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// INTERFACES (Mejora: Tipado Estricto)
// ==========================================
interface BaseNamedElement {
  nombre: string;
}

interface OdsData {
  numero: number;
  nombre: string;
}

interface Actividad {
  id: number;
  beneficiarios_directos: number | null;
  beneficiarios_indirectos: number | null;
  municipios: BaseNamedElement | null;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  roles: BaseNamedElement | null;
  embajadores: { municipios: BaseNamedElement | null } | { municipios: BaseNamedElement | null }[] | null;
  actividades: { id: number }[] | null;
}

interface ActividadOds {
  ods: OdsData | OdsData[] | null;
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================
const getRelatedName = (relation: { nombre: string } | { nombre: string }[] | null | undefined) => {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0]?.nombre;
  return relation?.nombre;
};

// Componente para los botones "Top"
const FilterTopButtons = ({ current, setter }: { current: number, setter: (val: number) => void }) => (
  <div className="flex flex-wrap gap-1 bg-gray-50/80 p-1.5 rounded-lg border border-gray-200 shadow-inner">
    {[3, 5, 10, 20, 0].map(val => (
      <button 
        key={val} 
        type="button"
        onClick={() => setter(val)}
        className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all duration-200 ${
          current === val ? 'bg-white shadow-sm text-[#00689D] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
        }`}
      >
        {val === 0 ? 'Todos' : `Top ${val}`}
      </button>
    ))}
  </div>
);

const dynamicScale = (dataMax: number) => Math.max(20, dataMax);

export default function AdminDashboard() {
  const { usuarioDatos } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Estado tipado para los datos crudos
  const [rawData, setRawData] = useState({
    actividades: [] as Actividad[],
    usuarios: [] as Usuario[],
    actOds: [] as ActividadOds[],
    catMunicipios: [] as BaseNamedElement[],
    catOds: [] as OdsData[]
  });

  // Filtros
  const [filtroRol, setFiltroRol] = useState<'Todos' | 'Administrador' | 'Embajador'>('Todos');
  const [filtroTopOds, setFiltroTopOds] = useState<number>(5); 
  const [filtroTopEmbajadores, setFiltroTopEmbajadores] = useState<number>(5);
  const [filtroTopMunicipios, setFiltroTopMunicipios] = useState<number>(3);
  const [filtroTopMuniEmbajadores, setFiltroTopMuniEmbajadores] = useState<number>(5);

  const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#eab308', '#ef4444', '#0ea5e9', '#f97316', '#8b5cf6', '#14b8a6', '#f43f5e'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Buenos días', icon: <Sunrise className="text-orange-300" size={32} /> };
    if (hour >= 12 && hour < 19) return { text: 'Buenas tardes', icon: <Sun className="text-yellow-400" size={32} /> };
    return { text: 'Buenas noches', icon: <Moon className="text-blue-300" size={32} /> };
  };

  const greeting = getGreeting();

  // ==========================================
  // CARGA DE DATOS (CON FILTROS ESTRICTOS)
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // MEJORA: Consultas seguras que no inflan los datos.
        // Solo traemos actividades "Validadas" y usuarios "Activos".
        const [resActividades, resUsuarios, resActOds, resMun, resOds] = await Promise.all([
          supabase.from('actividades')
            .select('id, beneficiarios_directos, beneficiarios_indirectos, municipios(nombre)')
            .eq('estado', 'Validada')
            .is('fecha_eliminacion', null),
          
          supabase.from('usuarios')
            .select('id, nombre, apellido, roles(nombre), embajadores(municipios(nombre)), actividades!creado_por_usuario_id(id)')
            .eq('activo', true),

          supabase.from('actividad_ods')
            .select('ods(numero, nombre), actividades!inner(estado, fecha_eliminacion)')
            .eq('actividades.estado', 'Validada')
            .is('actividades.fecha_eliminacion', null),

          supabase.from('municipios').select('nombre').eq('activo', true),
          supabase.from('ods').select('numero, nombre').eq('activo', true)
        ]);

        if (resActividades.error) throw resActividades.error;
        if (resUsuarios.error) throw resUsuarios.error;

        setRawData({
          actividades: resActividades.data as unknown as Actividad[] || [],
          usuarios: resUsuarios.data as unknown as Usuario[] || [],
          actOds: resActOds.data as unknown as ActividadOds[] || [],
          catMunicipios: resMun.data as BaseNamedElement[] || [],
          catOds: resOds.data as OdsData[] || []
        });
      } catch (error: any) {
        console.error("Error cargando dashboard:", error);
        toast.error("Error al cargar las métricas del panel", {
          description: "Ocurrió un problema al conectar con la base de datos. Por favor, recarga la página.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ==========================================
  // MOTOR REACTIVO DE CÁLCULO
  // ==========================================
  const stats = useMemo(() => {
    const { actividades, usuarios, actOds, catMunicipios, catOds } = rawData;

    // 1. USUARIOS POR ROL
    const rolesCount: Record<string, number> = { 'Administrador': 0, 'Embajador': 0 };
    let usuariosFiltradosPorRol = 0;
    
    usuarios.forEach(u => {
      const rol = getRelatedName(u.roles) || 'Sin Rol';
      if (filtroRol === 'Todos' || rol === filtroRol) {
        rolesCount[rol] = (rolesCount[rol] || 0) + 1;
        usuariosFiltradosPorRol++;
      }
    });
    const usuariosPorRol = Object.keys(rolesCount).map(k => ({ name: k, count: rolesCount[k] }));

    // 2. EMBAJADORES POR MUNICIPIO
    const embajadoresMuniCount: Record<string, number> = {};
    catMunicipios.forEach(m => embajadoresMuniCount[m.nombre] = 0);

    usuarios.forEach(u => {
      if (getRelatedName(u.roles) === 'Embajador') {
        const emb = u.embajadores;
        const muniObj = Array.isArray(emb) ? emb[0]?.municipios : (emb as any)?.municipios;
        const muniName = getRelatedName(muniObj);

        if (muniName) {
          if (embajadoresMuniCount[muniName] === undefined) embajadoresMuniCount[muniName] = 0;
          embajadoresMuniCount[muniName] += 1;
        }
      }
    });
    
    let embajadoresPorMunicipio = Object.keys(embajadoresMuniCount)
      .map(k => ({ name: k, embajadores: embajadoresMuniCount[k] }))
      .sort((a, b) => b.embajadores - a.embajadores); 
      
    if (filtroTopMuniEmbajadores > 0) {
      embajadoresPorMunicipio = embajadoresPorMunicipio.slice(0, filtroTopMuniEmbajadores);
    }
    embajadoresPorMunicipio.sort((a, b) => a.name.localeCompare(b.name));

    // 3. RANKING DE EMBAJADORES
    const embajadoresReales = usuarios.filter(u => getRelatedName(u.roles) === 'Embajador');
    let ranking = [];
    
    if (embajadoresReales.length === 0) {
      ranking = [{ name: 'No hay embajadores registrados', municipio: '-', actividades: 0 }];
    } else {
      ranking = embajadoresReales.map(u => {
        const emb = u.embajadores;
        const muniObj = Array.isArray(emb) ? emb[0]?.municipios : (emb as any)?.municipios;
        return {
          name: `${u.nombre} ${u.apellido}`,
          municipio: getRelatedName(muniObj) || 'N/A',
          actividades: u.actividades ? u.actividades.length : 0
        };
      }).sort((a, b) => b.actividades - a.actividades);
    }
    const topEmbajadores = filtroTopEmbajadores > 0 ? ranking.slice(0, filtroTopEmbajadores) : ranking;

    // 4. IMPACTO POR MUNICIPIO
    let totalBeneficiarios = 0;
    const muniStats: Record<string, { name: string, actividades: number, beneficiarios: number, embajadores: number }> = {};
    
    catMunicipios.forEach(m => {
      muniStats[m.nombre] = { 
        name: m.nombre, 
        actividades: 0, 
        beneficiarios: 0, 
        embajadores: embajadoresMuniCount[m.nombre] || 0 
      };
    });
    
    actividades.forEach(act => {
      const dir = act.beneficiarios_directos || 0;
      const ind = act.beneficiarios_indirectos || 0;
      totalBeneficiarios += (dir + ind);
      
      const mName = getRelatedName(act.municipios);
      if (mName && muniStats[mName]) {
        muniStats[mName].actividades += 1;
        muniStats[mName].beneficiarios += (dir + ind);
      }
    });

    let topMunicipios = Object.values(muniStats).sort((a, b) => {
      if (b.beneficiarios !== a.beneficiarios) return b.beneficiarios - a.beneficiarios;
      return b.actividades - a.actividades;
    });

    if (filtroTopMunicipios > 0) {
      topMunicipios = topMunicipios.slice(0, filtroTopMunicipios);
    }

    // 5. ODS IMPACTADOS
    const odsCount: Record<string, number> = {};
    
    catOds.forEach(o => {
      const etiqueta = `${o.numero}. ${o.nombre}`;
      odsCount[etiqueta] = 0;
    });
    
    actOds.forEach(ao => {
      const odsObj = Array.isArray(ao.ods) ? ao.ods[0] : ao.ods;
      if (odsObj && odsObj.numero && odsObj.nombre) {
        const etiqueta = `${odsObj.numero}. ${odsObj.nombre}`;
        if (odsCount[etiqueta] !== undefined) {
          odsCount[etiqueta] += 1;
        } else {
          odsCount[etiqueta] = 1;
        }
      }
    });
    
    let topOds = Object.keys(odsCount)
      .map(k => ({ name: k, count: odsCount[k] }))
      .sort((a, b) => b.count - a.count); 
      
    if (filtroTopOds > 0) topOds = topOds.slice(0, filtroTopOds);

    return {
      totalUsuarios: usuarios.length,
      usuariosMostrados: usuariosFiltradosPorRol,
      totalActividades: actividades.length,
      totalBeneficiarios,
      usuariosPorRol,
      embajadoresPorMunicipio,
      topEmbajadores,
      topMunicipios,
      topOds
    };
  }, [rawData, filtroRol, filtroTopOds, filtroTopEmbajadores, filtroTopMunicipios, filtroTopMuniEmbajadores]);

  if (loading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#00689D]/20 border-t-[#00689D] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Calculando métricas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* ==========================================
          HEADER / SALUDO DINÁMICO ADMINISTRADOR
      ========================================== */}
      <div className="bg-gradient-to-r from-[#004A70] to-[#002D45] rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden text-white border border-blue-900/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 pointer-events-none">
          <Globe size={320} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                {greeting.icon}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {greeting.text}, {usuarioDatos?.nombre || 'Administrador'}
              </h1>
            </div>
            <p className="text-blue-100/90 text-lg max-w-2xl font-medium leading-relaxed">
              Bienvenido al Panel de Control Principal. Aquí tienes el panorama general del impacto, métricas y alcance territorial de Juventudes 2030.
            </p>
          </div>
          <div className="shrink-0 hidden md:block">
            <div className="flex flex-col items-end text-blue-200/80">
              <ShieldCheck size={48} className="opacity-50 mb-2" />
              <span className="text-sm font-bold uppercase tracking-widest">Nivel de Acceso</span>
              <span className="text-white font-black text-xl">Dirección</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          TARJETAS GLOBALES (Estilo Moderno ODS)
      ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600 relative z-10"><Users size={28} /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Red de Usuarios</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalUsuarios.toLocaleString('es-MX')}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Registrados y activos en plataforma</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="bg-green-100 p-4 rounded-xl text-green-600 relative z-10"><Activity size={28} /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Acción Climática</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalActividades.toLocaleString('es-MX')}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Actividades validadas totales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600 relative z-10"><Target size={28} /></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Impacto Global</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalBeneficiarios.toLocaleString('es-MX')}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Personas beneficiadas confirmadas</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          ZONA DE GRÁFICAS
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICA 1: Usuarios por Rol */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Distribución de Usuarios</h3>
              <p className="text-sm text-gray-500">Clasificación por rol asignado</p>
            </div>
            <div className="flex flex-wrap gap-1 bg-gray-50/80 border border-gray-200 p-1.5 rounded-lg">
              {(['Todos', 'Administrador', 'Embajador'] as const).map(rol => (
                <button 
                  key={rol} onClick={() => setFiltroRol(rol)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${filtroRol === rol ? 'bg-white shadow-sm text-[#00689D] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}
                >
                  {rol}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.usuariosPorRol} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="count" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {stats.usuariosPorRol.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                {/* Mejora: Formateo con separadores de miles */}
<Tooltip formatter={(value: any) => [Number(value).toLocaleString('es-MX'), 'Usuarios']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICA 2: Embajadores por Municipio (Orden A-Z) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Presencia Territorial</h3>
              <p className="text-sm text-gray-500">Embajadores activos (A-Z)</p>
            </div>
            <FilterTopButtons current={filtroTopMuniEmbajadores} setter={setFiltroTopMuniEmbajadores} />
          </div>
          
          <div className="overflow-x-auto pb-4 flex-1 scrollbar-thin scrollbar-thumb-gray-200">
            <div style={{ width: Math.max(400, stats.embajadoresPorMunicipio.length * 70), height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.embajadoresPorMunicipio} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#6b7280" angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, dynamicScale]} />
                  <Tooltip formatter={(value: any) => [Number(value).toLocaleString('es-MX'), 'Embajadores']} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="embajadores" name="Embajadores" fill="#00689D" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRÁFICA 3: Impacto por Municipio (Tres Métricas Separadas) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Top Municipios con Mayor Impacto</h3>
              <p className="text-sm text-gray-500">Ordenado por Beneficiados Totales</p>
            </div>
            <FilterTopButtons current={filtroTopMunicipios} setter={setFiltroTopMunicipios} />
          </div>
          
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
             <div style={{ width: Math.max(800, stats.topMunicipios.length * 150), height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topMunicipios} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#6b7280" angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, dynamicScale]} />
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('es-MX')} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontWeight: 600, fontSize: '13px' }} />
                  <Bar dataKey="beneficiarios" name="Beneficiados" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actividades" name="Actividades" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="embajadores" name="Embajadores" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* GRÁFICA 4: Ranking Embajadores */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Ranking Embajadores</h3>
              <p className="text-sm text-gray-500">Por volumen de actividades validadas</p>
            </div>
            <FilterTopButtons current={filtroTopEmbajadores} setter={setFiltroTopEmbajadores} />
          </div>
          
          <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            <div style={{ height: Math.max(350, stats.topEmbajadores.length * 45) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topEmbajadores} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" stroke="#9ca3af" domain={[0, dynamicScale]} />
                  <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 13, fontWeight: 600 }} stroke="#374151" />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-100 p-4 shadow-xl rounded-xl">
                            <p className="font-extrabold text-gray-900">{data.name}</p>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin size={14}/> {data.municipio}</p>
                            <div className="mt-3 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg inline-block">
                              <span className="font-bold text-sm">Actividades: {data.actividades.toLocaleString('es-MX')}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="actividades" name="Actividades validadas" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={26}>
                    {stats.topEmbajadores.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GRÁFICA 5: ODS */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-3 md:space-y-0">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Globe className="text-blue-500" size={24}/> Cobertura de la Agenda 2030</h3>
              <p className="text-sm text-gray-500">Frecuencia de ODS impactados en territorio</p>
            </div>
            <FilterTopButtons current={filtroTopOds} setter={setFiltroTopOds} />
          </div>
          
          <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            <div style={{ height: Math.max(350, stats.topOds.length * 45) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topOds} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" stroke="#9ca3af" domain={[0, dynamicScale]} />
                  <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                  <Tooltip formatter={(value: any) => [Number(value).toLocaleString('es-MX'), 'Veces impactado']} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" name="Veces impactado" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24}>
                    {stats.topOds.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}   