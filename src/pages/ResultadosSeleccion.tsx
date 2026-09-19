import React, { useMemo, useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';

// Ajusta las rutas según la estructura de tu proyecto
import { seleccionados } from '../data/seleccionados';
import Header from './Header';
import Footer from './Footer';

// ==========================================
// INTERFACES Y TIPOS
// ==========================================

export interface Persona {
  id: number | string;
  rol: 'Embajador' | 'Voluntario';
  nombre: string;
}

type FiltroRol = 'Todos' | 'Embajadores' | 'Voluntariado';

export default function ResultadosSeleccion() {
  // Tipado estricto para los estados
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<FiltroRol>('Todos');

  // ==========================================
  // LÓGICA DE FILTRADO Y BÚSQUEDA
  // ==========================================

  const embajadores = useMemo<Persona[]>(() => {
    return (seleccionados as Persona[]).filter(
      (persona) =>
        persona.rol === 'Embajador' &&
        persona.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda]);

  const voluntarios = useMemo<Persona[]>(() => {
    return (seleccionados as Persona[]).filter(
      (persona) =>
        persona.rol === 'Voluntario' &&
        persona.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda]);

  const totalEmbajadores = (seleccionados as Persona[]).filter(
    (persona) => persona.rol === 'Embajador'
  ).length;

  const totalVoluntarios = (seleccionados as Persona[]).filter(
    (persona) => persona.rol === 'Voluntario'
  ).length;

  // Condiciones de visibilidad según el filtro seleccionado
  const mostrarEmbajadores = filtroRol === 'Todos' || filtroRol === 'Embajadores';
  const mostrarVoluntarios = filtroRol === 'Todos' || filtroRol === 'Voluntariado';

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 font-sans selection:bg-[#00AEEF] selection:text-white">
      
      {/* HEADER GLOBAL DEL PROYECTO */}
      <Header />
      <main className="flex-grow">
        {/* =====================================================
            HERO / ENCABEZADO INSTITUCIONAL MODERNO
        ====================================================== */}
        <section className="w-full border-b border-white/10 bg-[#004A87] pt-12 pb-10 px-4 text-center">
          <div className="mx-auto max-w-4xl flex flex-col items-center">
            
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-wide text-[#00AEEF]">
              Nueva Generación
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Consulta los seleccionados para <br className="hidden md:block" />
              formar parte de <span className="text-[#00AEEF]">Juventudes 2030</span>
            </h1>
            
            <p className="text-base md:text-lg font-medium text-blue-100 max-w-2xl mb-6">
              Te damos la bienvenida al padrón oficial. Descubre a las personas admitidas para integrarse a esta iniciativa en las modalidades de Embajadores y Voluntariado.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-xs font-bold text-blue-200 uppercase tracking-widest">
              <span>Sinaloa Gobierno del Estado</span>
              <span className="hidden md:inline">•</span>
              <span>SEBIDES</span>
            </div>

          </div>
        </section>

        {/* =====================================================
            CONTROLES: BÚSQUEDA Y FILTRO DE PESTAÑAS (STICKY)
        ====================================================== */}
        <div className="bg-gray-50 border-b border-gray-200 py-4 px-4 sticky top-0 z-10 shadow-sm">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Buscador */}
            <div className="relative w-full md:w-[28rem] text-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o apellidos..."
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm transition-colors focus:border-[#004A87] focus:outline-none focus:ring-1 focus:ring-[#004A87]"
              />
            </div>

            {/* Filtro de Pestañas Institucional */}
            <div className="flex items-center w-full md:w-auto bg-gray-200 p-1 rounded-md">
              {(['Todos', 'Embajadores', 'Voluntariado'] as FiltroRol[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFiltroRol(tab)}
                  className={`flex-1 md:flex-none px-5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-all duration-200 ${
                    filtroRol === tab
                      ? 'bg-white text-[#004A87] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* =====================================================
            LISTADOS EN FORMATO GRID (COLUMNAS)
        ====================================================== */}
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">

          {/* EMBAJADORES - 2 COLUMNAS */}
          {mostrarEmbajadores && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full flex items-center border-b-2 border-[#004A87] pb-2 mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#00AEEF]" />
                  <h3 className="text-xl md:text-2xl font-black text-[#004A87] uppercase tracking-wide">
                    Embajadores 2030 <span className="text-base font-medium text-gray-400 ml-2">({totalEmbajadores})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-1">
                {embajadores.length > 0 ? (
                  embajadores.map((persona) => (
                    <div key={persona.id} className="flex items-start border-b border-gray-100 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#00AEEF] mt-1.5 mr-3 shrink-0" />
                      <span className="text-sm font-bold text-gray-800 uppercase leading-tight">
                        {persona.nombre}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-1 lg:col-span-2 py-4">No se encontraron embajadores.</p>
                )}
              </div>
            </section>
          )}

          {/* VOLUNTARIOS - 3 COLUMNAS */}
          {mostrarVoluntarios && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full flex items-center border-b-2 border-[#004A87] pb-2 mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#00AEEF]" />
                  <h3 className="text-xl md:text-2xl font-black text-[#004A87] uppercase tracking-wide">
                    Voluntariado 2030 <span className="text-base font-medium text-gray-400 ml-2">({totalVoluntarios})</span>
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                {voluntarios.length > 0 ? (
                  voluntarios.map((persona) => (
                    <div key={persona.id} className="flex items-start border-b border-gray-100 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2.5 shrink-0" />
                      <span className="text-xs md:text-sm font-bold text-gray-700 uppercase leading-tight">
                        {persona.nombre}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-1 md:col-span-2 lg:col-span-3 py-4">No se encontraron voluntarios.</p>
                )}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* FOOTER GLOBAL DEL PROYECTO */}
      <Footer />
      
    </div>
  );
}