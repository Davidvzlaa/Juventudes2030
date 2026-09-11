import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../Header';
import { 
  Menu, X, MapPin, Users, Target, Folder, 
  Activity, UserPlus, ShieldCheck, LogOut, Settings, Globe 
} from 'lucide-react';

// Mapeamos los colores vibrantes estilo ODS explícitamente para que Tailwind los compile bien
const catalogos = [
  { id: 'roles', label: 'Roles', icon: Users, color: 'text-purple-600', dot: 'bg-purple-600' },
  { id: 'municipios', label: 'Municipios', icon: MapPin, color: 'text-green-600', dot: 'bg-green-600' },
  { id: 'ods', label: 'Agenda 2030 (ODS)', icon: Target, color: 'text-red-600', dot: 'bg-red-600' },
  { id: 'proyectos', label: 'Proyectos', icon: Folder, color: 'text-blue-600', dot: 'bg-blue-600' },
  { id: 'tipos_accion', label: 'Tipos de Acción', icon: Activity, color: 'text-amber-500', dot: 'bg-amber-500' },
  { id: 'categorias_beneficiarios', label: 'Beneficiarios', icon: UserPlus, color: 'text-teal-500', dot: 'bg-teal-500' },
  { id: 'permisos', label: 'Permisos', icon: ShieldCheck, color: 'text-rose-500', dot: 'bg-rose-500' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="sticky top-0 z-50 shadow-sm">
        <Header />
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Fondo oscuro para móvil */}
        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="fixed inset-0 z-30 bg-gray-900/60 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* ==========================================
            BARRA LATERAL (SIDEBAR) - ESTILO INSTITUCIONAL ODS
        ========================================== */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-gradient-to-b from-[#003B5C] to-[#001A29] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:static md:z-auto md:w-72 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Cabecera del Sidebar con diseño "Glassmorphism" */}
          <div className="p-6 border-b border-white/10 relative overflow-hidden shrink-0">
            <Globe className="absolute -right-4 -top-4 text-white/5" size={100} />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                  <Settings size={22} className="text-blue-300" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wide text-white leading-tight">Ajustes</h2>
                  <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-widest mt-0.5">Sistema ODS</p>
                </div>
              </div>
              <button type="button" className="md:hidden text-white/50 hover:text-white bg-white/5 p-1.5 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navegación (Catálogos) */}
          <nav className="flex-1 px-4 py-6 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <p className="px-2 text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Módulos del Sistema</p>
            
            {catalogos.map(({ id, label, icon: Icon, color, dot }) => {
              const isActive = location.pathname.endsWith(`/${id}`);
              
              return (
                <Link
                  key={id}
                  onClick={() => setIsSidebarOpen(false)}
                  to={`/administrador/configuracion/${id}`}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-gray-900 shadow-xl scale-[1.02] ring-4 ring-white/10' 
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {/* Ícono dinámico */}
                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-gray-50 shadow-sm' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon size={18} className={isActive ? color : 'text-blue-200/50 group-hover:text-blue-200'} />
                  </div>
                  
                  <span className="text-sm tracking-wide">{label}</span>

                  {/* Puntito indicador ODS cuando está activo */}
                  {isActive && (
                    <div className="absolute right-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Botón de Salir (Elegante y seguro) */}
          <div className="p-5 mt-auto border-t border-white/10 bg-black/20 shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-3 rounded-xl font-bold transition-all shadow-sm text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Salir del Sistema
            </button>
          </div>
        </aside>

        {/* ==========================================
            ÁREA PRINCIPAL DE CONTENIDO
        ========================================== */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[100rem] mx-auto">
            
            {/* Botón Flotante / Cabecera Móvil */}
            <div className="md:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <Settings className="text-[#00689D]" size={20} /> Ajustes
              </h2>
              <button 
                type="button" 
                className="inline-flex items-center gap-2 rounded-xl bg-[#00689D] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#004A70] transition-colors" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={18} />
                Menú
              </button>
            </div>

            {/* Aquí se inyectan dinámicamente las páginas hijas */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet /> 
            </div>
            
          </div>
        </main>

      </div>
    </div>
  );
}