import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { supabase } from '../lib/supabase'; 
import { Menu, X, LogOut, User, LayoutDashboard, Settings, FileText, Home, Phone, Info, Users, Calendar } from 'lucide-react';
import Juventudes2030 from '../assets/LOGO HORIZONTAL JUVENTUDES 20230.png'; 

export default function Header() {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  
  // Estado para controlar el menú en celulares
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

// ==========================================
  // FUNCIÓN DE LOGOUT CORREGIDA
  // ==========================================
  const handleLogout = async () => {
    try {
      closeMenu();
      
      // 1. PRIMERO sacamos al usuario de la ruta protegida
      // y lo mandamos a la página de inicio (ruta pública)
      navigate('/', { replace: true });
      
      // 2. Una fracción de segundo después, matamos la sesión.
      // Como ya no está en ProtectedRoute, no será redirigido al Login.
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 100);
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  return (
    <header className="bg-blue-50 border-b border-blue-100 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO (Siempre visible) */}
          <div className="shrink-0 flex items-center">
            <Link to="/" onClick={closeMenu} className="transition-transform hover:scale-105 duration-300">
              <img src={Juventudes2030} alt="Logo de Juventudes 2030" className="w-48 sm:w-56 h-auto" />
            </Link>
          </div>

          {/* ==========================================
              MENÚ ESCRITORIO (Oculto en celulares)
          ========================================== */}
          <nav className="hidden md:flex items-center space-x-1">
            {loading ? (
              <span className="text-gray-500 text-sm font-medium animate-pulse">Cargando...</span>
            ) : !isAuthenticated ? (
              /* --- VISTA NO LOGUEADO (Escritorio) --- */
              <div className="flex items-center space-x-2">
                <Link to="/" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Home size={18}/> Inicio</Link>
                <a href="#acerca" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Info size={18}/> Acerca de</a>
                <a href="#contacto" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Phone size={18}/> Contacto</a>
                <div className="pl-4 ml-2 border-l border-blue-200">
                  <Link to="/Login" className="bg-[#00689D] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#00527A] shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                    <User size={18}/> Iniciar Sesión
                  </Link>
                </div>
              </div>
            ) : (
              /* --- VISTA LOGUEADO (Escritorio) --- */
              <div className="flex items-center space-x-2">
                
                {userRole === 'Administrador' && (
                  <>
                    <Link to="/administrador" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><LayoutDashboard size={18}/> Dashboard</Link>
                    <Link to="/administrador/usuarios" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Users size={18}/> Usuarios</Link>
                    <Link to="/administrador/calendario" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Calendar size={18}/> Calendario</Link>
                    <Link to="/administrador/reportes" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><FileText size={18}/> Reportes</Link>
                    <Link to="/administrador/catalogos" className="text-gray-700 hover:text-[#00689D] hover:bg-blue-100/50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Settings size={18}/> Configuración</Link>
                  </>
                )}

                {userRole === 'Embajador' && (
                  <>
                    <Link to="/embajador/inicio" className="text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><LayoutDashboard size={18}/> Mi Espacio</Link>
                    <Link to="/embajador/actividades" className="text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><FileText size={18}/> Mis Actividades</Link>
                    <Link to="/embajador/reportes" className="text-gray-700 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5"><Calendar size={18}/> Mis Reportes</Link>
                  </>
                )}

                <div className="pl-4 ml-2 border-l border-blue-200">
                  <button onClick={handleLogout} className="text-red-600 hover:text-white border-2 border-red-100 bg-red-50 hover:bg-red-600 hover:border-red-600 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2">
                    <LogOut size={18}/> Salir
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* ==========================================
              BOTÓN HAMBURGUESA (Solo en celulares)
          ========================================== */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-[#00689D] hover:bg-blue-100 focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
          MENÚ DESPLEGABLE MÓVIL
      ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : !isAuthenticated ? (
              /* --- VISTA NO LOGUEADO (Móvil) --- */
              <div className="flex flex-col space-y-1 mt-2">
                <Link to="/" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Home size={20} className="text-gray-400"/> Inicio</Link>
                <a href="#acerca" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Info size={20} className="text-gray-400"/> Acerca de</a>
                <a href="#contacto" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Phone size={20} className="text-gray-400"/> Contacto</a>
                
                <div className="pt-4 mt-2 border-t border-gray-100">
                  <Link to="/Login" onClick={closeMenu} className="bg-[#00689D] text-white w-full px-4 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md">
                    <User size={20}/> Iniciar Sesión
                  </Link>
                </div>
              </div>
            ) : (
              /* --- VISTA LOGUEADO (Móvil) --- */
              <div className="flex flex-col space-y-1 mt-2">
                
                {userRole === 'Administrador' && (
                  <>
                    <Link to="/administrador" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><LayoutDashboard size={20} className="text-blue-500"/> Dashboard</Link>
                    <Link to="/administrador/usuarios" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Users size={20} className="text-blue-500"/> Usuarios</Link>
                    <Link to="/administrador/reportes" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><FileText size={20} className="text-blue-500"/> Reportes</Link>
                    <Link to="/administrador/catalogos" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Settings size={20} className="text-blue-500"/> Configuración</Link>
                    <Link to="/administrador/calendario" onClick={closeMenu} className="text-gray-800 hover:text-[#00689D] hover:bg-blue-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Calendar size={20} className="text-blue-500"/> Calendario</Link>
                  
                  </>
                )}

                {userRole === 'Embajador' && (
                  <>
                    <Link to="/embajador/inicio" onClick={closeMenu} className="text-gray-800 hover:text-green-700 hover:bg-green-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><LayoutDashboard size={20} className="text-green-500"/> Mi Espacio</Link>
                    <Link to="/embajador/actividades" onClick={closeMenu} className="text-gray-800 hover:text-green-700 hover:bg-green-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><FileText size={20} className="text-green-500"/> Mis Actividades</Link>
                    <Link to="/embajador/reportes" onClick={closeMenu} className="text-gray-800 hover:text-green-700 hover:bg-green-50 px-4 py-3 rounded-lg font-semibold flex items-center gap-3"><Calendar size={20} className="text-green-500"/> Mis Reportes</Link>
                  </>
                )}

                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button onClick={handleLogout} className="w-full text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                    <LogOut size={20}/> Cerrar Sesión
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}