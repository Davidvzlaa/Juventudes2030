import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Award, Users, CheckCircle2, Loader2, Star, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase'; // Ajusta la ruta según tu proyecto

// Definimos las interfaces basadas en lo que normalmente retorna Supabase
interface Seleccionado {
  id: string;
  nombre: string;
  apellido: string;
  municipio: string;
  rol: 'Embajador' | 'Voluntario';
  avatar_url?: string;
}

export default function ResultadosSeleccion() {
  const [activaTab, setActivaTab] = useState<'Embajador' | 'Voluntario'>('Embajador');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<Seleccionado[]>([]);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // CARGA DE DATOS DESDE SUPABASE
  // ==========================================
  useEffect(() => {
    const fetchResultados = async () => {
      setCargando(true);
      try {
        /* 
          NOTA PARA ADAPTAR A TU BASE DE DATOS:
          Sustituye 'postulaciones' por el nombre real de tu tabla o vista 
          donde guardas a los usuarios que fueron aceptados.
        */
        const { data, error } = await supabase
          .from('usuarios') // Ejemplo: Asumiendo que los marcas en la tabla usuarios
          .select(`
            id,
            nombre,
            apellido,
            avatar_url,
            roles (nombre),
            municipios (nombre)
          `)
          .in('roles.nombre', ['Embajador', 'Voluntario'])
          .eq('activo', true); // O el filtro que defina que fueron "seleccionados"

        if (error) throw error;

        if (data) {
          // Formateamos los datos para nuestra interfaz
          const formateados: Seleccionado[] = data.map((user: any) => ({
            id: user.id,
            nombre: user.nombre || 'Sin nombre',
            apellido: user.apellido || '',
            municipio: user.municipios?.nombre || 'General',
            rol: user.roles?.nombre as 'Embajador' | 'Voluntario',
            avatar_url: user.avatar_url
          }));
          setSeleccionados(formateados);
        }
      } catch (error) {
        console.error('Error al cargar resultados:', error);
        // DATOS DE PRUEBA (MOCK) POR SI FALLA LA BD MIENTRAS PRUEBAS EL DISEÑO:
        setSeleccionados([
          { id: '1', nombre: 'Ana', apellido: 'García', municipio: 'Ahome', rol: 'Embajador' },
          { id: '2', nombre: 'Carlos', apellido: 'López', municipio: 'Culiacán', rol: 'Embajador' },
          { id: '3', nombre: 'María', apellido: 'Fernández', municipio: 'Mazatlán', rol: 'Voluntario' },
          { id: '4', nombre: 'Luis', apellido: 'Martínez', municipio: 'Guasave', rol: 'Voluntario' },
          { id: '5', nombre: 'Sofia', apellido: 'Castro', municipio: 'Ahome', rol: 'Embajador' },
          { id: '6', nombre: 'Diego', apellido: 'Ruiz', municipio: 'Navolato', rol: 'Voluntario' },
        ]);
      } finally {
        setCargando(false);
      }
    };

    fetchResultados();
  }, []);

  // ==========================================
  // FILTRADO DE DATOS
  // ==========================================
  const listaFiltrada = seleccionados.filter((persona) => {
    const coincideTab = persona.rol === activaTab;
    const nombreCompleto = `${persona.nombre} ${persona.apellido}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase()) || 
                             persona.municipio.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideTab && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* HEADER TIPO HERO */}
      <div className="bg-[#00689D] relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm mb-2 shadow-lg">
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            ¡Resultados Oficiales 2026!
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Conoce a los líderes y agentes de cambio que formarán parte de nuestra nueva generación. Gracias a todos los que participaron.
          </p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        
        {/* PANEL DE CONTROL (Buscador y Pestañas) */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 sm:p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Pestañas (Tabs) */}
          <div className="flex w-full md:w-auto bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActivaTab('Embajador')}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activaTab === 'Embajador' 
                  ? 'bg-white text-[#00689D] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award size={18} />
              Embajadores
            </button>
            <button
              onClick={() => setActivaTab('Voluntario')}
              className={`flex-1 md:w-48 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activaTab === 'Voluntario' 
                  ? 'bg-white text-[#00689D] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={18} />
              Voluntarios
            </button>
          </div>

          {/* Buscador */}
          <div className="w-full md:w-72 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o municipio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00689D]/20 focus:border-[#00689D] sm:text-sm transition-all"
            />
          </div>
        </div>

        {/* LISTADO DE RESULTADOS */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#00689D] animate-spin mb-4" />
            <p className="text-gray-500 font-bold">Cargando resultados oficiales...</p>
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron resultados</h3>
            <p className="text-gray-500 text-sm">Intenta buscar con otro nombre o municipio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listaFiltrada.map((persona, index) => (
              <div 
                key={persona.id || index}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group overflow-hidden flex flex-col"
              >
                {/* Cabecera de la tarjeta con color sutil */}
                <div className="h-16 bg-gradient-to-r from-gray-50 to-gray-100 w-full relative">
                  {persona.rol === 'Embajador' && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 p-1.5 rounded-full" title="Embajador Destacado">
                      <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    </div>
                  )}
                </div>
                
                <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col items-center text-center">
                  
                  {/* Avatar / Iniciales */}
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-[#00689D] shadow-md -mt-10 mb-3 flex items-center justify-center overflow-hidden shrink-0">
                    {persona.avatar_url ? (
                      <img src={persona.avatar_url} alt={persona.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white uppercase">
                        {persona.nombre.charAt(0)}{persona.apellido ? persona.apellido.charAt(0) : ''}
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      {persona.nombre} {persona.apellido}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-gray-500 mt-1.5">
                      <MapPin size={14} className="text-[#00689D]" />
                      <span className="text-sm font-semibold">{persona.municipio}</span>
                    </div>
                  </div>

                  {/* Badge de Estatus */}
                  <div className="mt-auto pt-4 w-full border-t border-gray-50">
                    <span className={`inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                      persona.rol === 'Embajador' 
                        ? 'bg-[#00689D]/10 text-[#00689D]' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <CheckCircle2 size={14} />
                      {persona.rol} Oficial Seleccionado
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}