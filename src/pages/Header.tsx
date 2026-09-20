import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { supabase } from '../lib/supabase'; 
import { Menu, X } from 'lucide-react';
// Mantenemos el logo local SOLO como plan de emergencia extrema si la BD falla o está vacía
import Juventudes2030 from '../assets/LOGO HORIZONTAL JUVENTUDES 20230.png'; 

interface Sistema {
  nombre: string;
  direccion: string;
  correo: string;
  telefono: string;
  logotipos: {
    principal?: string;
    blanco?: string; 
    isotipo?: string;
  };
}

export default function Header() {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [cargandoSistema, setCargandoSistema] = useState(true);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // ==========================================
  // CARGAR CONFIGURACIÓN DEL SISTEMA
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchSistema = async () => {
      try {
        const { data, error } = await supabase
          .from('sistemas')
          .select('logotipos, nombre')
          .eq('activo', true)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error("Error al cargar configuración del sistema:", error);
        } else if (data && isMounted) {
          setSistema(data as Sistema);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
      } finally {
        if (isMounted) setCargandoSistema(false);
      }
    };

    fetchSistema();
    return () => { isMounted = false; };
  }, []);

  // ==========================================
  // FUNCIÓN DE LOGOUT
  // ==========================================
  const handleLogout = async () => {
    try {
      closeMenu();
      navigate('/', { replace: true });
      
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 100);
      
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ==========================================
  // OBTENER LOGO 100% DE LA BASE DE DATOS
  // ==========================================
  const getLogo = () => {
    // Si la BD tiene un logo principal guardado, lo usa sin importar si hay sesión o rol.
    if (sistema?.logotipos?.principal) {
      return sistema.logotipos.principal;
    }
    // Solo si no hay nada en la BD, usa el archivo local
    return Juventudes2030;
  };

  // ==========================================
  // CLASES DE DISEÑO INSTITUCIONAL (Tipografía)
  // ==========================================
  // Letra pequeña, negrita, mayúscula y con espaciado (tracking) para un look muy formal
  const navLinkClass = "group relative text-[15px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-[#00689D] transition-colors py-2";
  const underlineClass = "absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00689D] transition-all duration-300 group-hover:w-full";

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO INSTITUCIONAL */}
          <div className="shrink-0 flex items-center">
            <Link to="/" onClick={closeMenu} className="transition-opacity hover:opacity-80 duration-300">
              {cargandoSistema ? (
                <div className="w-48 h-10 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <img 
                  src={getLogo()} 
                  alt={sistema?.nombre || "Logotipo Institucional"} 
                  className="w-60 sm:w-65 h-auto object-contain" 
                />
              )}
            </Link>
          </div>

          {/* ==========================================
              MENÚ ESCRITORIO (Sin íconos, puro texto)
          ========================================== */}
          <nav className="hidden md:flex items-center space-x-8">
            {loading ? (
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando...</span>
            ) : !isAuthenticated ? (
              
              /* --- VISTA PÚBLICA --- */
              <div className="flex items-center space-x-8">
                <Link to="/" className={navLinkClass}>
                  Inicio <span className={underlineClass}></span>
                </Link>
                <a href="/acercade" className={navLinkClass}>
                  Acerca de <span className={underlineClass}></span>
                </a>
                <a href="/contacto" className={navLinkClass}>
                  Contacto <span className={underlineClass}></span>
                </a>
                <a href="/resultados" className={navLinkClass}>
                  Resultados <span className={underlineClass}></span>
                </a>
                
                {/* Botón de acceso institucional */}
                <div className="pl-8 ml-2 border-l border-gray-200">
                  <Link to="/Login" className="bg-[#04111f] text-white px-6 py-2.5 rounded text-[15px] font-bold uppercase tracking-[0.15em] hover:bg-[#00689D] hover:shadow-lg transition-all">
                    Acceder
                  </Link>
                </div>
              </div>

            ) : (
              
              /* --- VISTA LOGUEADO (Depende del Rol) --- */
              <div className="flex items-center space-x-7">
                
                {userRole === 'Administrador' && (
                  <>
                    <Link to="/administrador" className={navLinkClass}>Dashboard <span className={underlineClass}></span></Link>
                    <Link to="/administrador/usuarios" className={navLinkClass}>Usuarios <span className={underlineClass}></span></Link>
                    <Link to="/administrador/calendario" className={navLinkClass}>Calendario <span className={underlineClass}></span></Link>
                    <Link to="/administrador/reportes" className={navLinkClass}>Reportes <span className={underlineClass}></span></Link>
                    <Link to="/administrador/catalogos" className={navLinkClass}>Configuración <span className={underlineClass}></span></Link>
                    <Link to="/administrador/perfil" className={navLinkClass}>Perfil <span className={underlineClass}></span></Link>
                  </>
                )}

                {userRole === 'Embajador' && (
                  <>
                    <Link to="/embajador/inicio" className={navLinkClass}>Mi Espacio <span className={underlineClass}></span></Link>
                    <Link to="/embajador/calendario" className={navLinkClass}>Mi Agenda <span className={underlineClass}></span></Link>
                    <Link to="/embajador/reportes" className={navLinkClass}>Mis Reportes <span className={underlineClass}></span></Link>
                    <Link to="/embajador/perfil" className={navLinkClass}>Perfil <span className={underlineClass}></span></Link>
                  </>
                )}

                <div className="pl-7 ml-2 border-l border-gray-200">
                  <button 
                    onClick={handleLogout} 
                    className="text-[#04111f] hover:text-white hover:bg-red-600 border border-gray-200 hover:border-red-600 px-5 py-2 rounded text-[15px] font-bold uppercase tracking-[0.15em] transition-all"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* ==========================================
              BOTÓN HAMBURGUESA (Celulares)
          ========================================== */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="p-2 text-[#04111f] hover:bg-gray-50 transition-colors"
              aria-label="Alternar menú"
            >
              {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
          MENÚ DESPLEGABLE MÓVIL (Tipografía limpia)
      ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-6 space-y-4">
            
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-xs uppercase tracking-widest">Cargando...</div>
            ) : !isAuthenticated ? (
              
              /* --- VISTA PÚBLICA MÓVIL --- */
              <div className="flex flex-col space-y-4">
                <Link to="/" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Inicio</Link>
                <a href="/acercade" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Acerca de</a>
                <a href="/contacto" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Contacto</a>
                <a href="/resultados" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Resultados</a>
                <Link to="/perfil" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Perfil</Link>
                <div className="pt-6 mt-4 border-t border-gray-100">
                  <Link to="/Login" onClick={closeMenu} className="bg-[#04111f] text-white w-full py-4 rounded text-xs font-bold uppercase tracking-widest text-center shadow-lg block">
                    Acceder al Portal
                  </Link>
                </div>
              </div>

            ) : (
              
              /* --- VISTA LOGUEADA MÓVIL --- */
              <div className="flex flex-col space-y-4">
                
                {userRole === 'Administrador' && (
                  <>
                    <Link to="/administrador" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Dashboard</Link>
                    <Link to="/administrador/usuarios" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Usuarios</Link>
                    <Link to="/administrador/reportes" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Reportes</Link>
                    <Link to="/administrador/catalogos" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Configuración</Link>
                    <Link to="/administrador/calendario" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Calendario</Link>
                    <Link to="/administrador/perfil" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Perfil</Link>
                  </>
                )}

                {userRole === 'Embajador' && (
                  <>
                    <Link to="/embajador/inicio" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Mi Espacio</Link>
                    <Link to="/embajador/calendario" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Mi Agenda</Link>
                    <Link to="/embajador/reportes" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Mis Reportes</Link>
                    <Link to="/embajador/perfil" onClick={closeMenu} className="text-gray-800 text-sm font-bold uppercase tracking-wider hover:text-[#00689D]">Mi Perfil</Link>
                  </>
                )}

                <div className="pt-6 mt-4 border-t border-gray-100">
                  <button onClick={handleLogout} className="w-full text-red-600 bg-red-50 hover:bg-red-600 hover:text-white py-4 rounded text-xs font-bold uppercase tracking-widest text-center transition-colors">
                    Cerrar Sesión
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