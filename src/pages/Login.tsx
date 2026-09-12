import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Ajusta la ruta a tu cliente de Supabase
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, Globe } from 'lucide-react';
import Juventudes2030 from '../assets/LOGO HORIZONTAL JUVENTUDES 20230.png'; // Ajusta la ruta si es necesario

// Generador de la barra de colores oficial de los 17 ODS
const OdsColorBar = () => {
  const odsColors = [
    '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', '#26BDE2', '#FCC30B', 
    '#A21942', '#FD6925', '#DD1367', '#FD9D24', '#BF8B2E', '#3F7E44', '#0A97D9', 
    '#56C02B', '#00689D', '#19486A'
  ];
  return (
    <div className="flex h-2 w-full">
      {odsColors.map((color, idx) => (
        <div key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
};
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
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [cargandoSistema, setCargandoSistema] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  // ==========================================
  // REDIRECCIÓN AUTOMÁTICA BASADA EN EL ROL
  // ==========================================
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === 'Administrador') {
        navigate('/administrador');
      } else if (userRole === 'Embajador') {
        navigate('/embajador/inicio');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, userRole, navigate]);
// ==========================================
  // CARGAR CONFIGURACIÓN DEL SISTEMA (LOGO)
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const fetchSistema = async () => {
      try {
        const { data, error } = await supabase
          .from('sistemas')
          .select('logotipos')
          .eq('activo', true)
          .maybeSingle(); // Usamos maybeSingle para evitar el error 406 si está vacío

        if (error) {
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
  // FUNCIÓN PARA ENVIAR EL FORMULARIO
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
      setIsLoading(false);
    }
  };
    const getLogo = () => {
    // Si la BD tiene un logo principal guardado, lo usa sin importar si hay sesión o rol.
    if (sistema?.logotipos?.principal) {
      return sistema.logotipos.principal;
    }
    // Solo si no hay nada en la BD, usa el archivo local
    return Juventudes2030;
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans relative">
      
      {/* ==========================================
          BOTÓN FLOTANTE: REGRESAR AL INICIO
      ========================================== */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center space-x-2 text-sm font-bold text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 lg:text-white"
        aria-label="Regresar a la página principal"
      >
        <ArrowLeft size={16} />
        <span>Regresar al inicio</span>
      </Link>

      {/* ==========================================
          SECCIÓN IZQUIERDA: DECORATIVA (ODS)
      ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#00689D] overflow-hidden flex-col justify-between">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        <div className="relative z-10 p-12 lg:p-24 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <Globe size={64} className="text-white opacity-90 mb-6" strokeWidth={1.5} />
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Transformando <br /> nuestro mundo.
            </h1>
            <p className="text-lg text-blue-100 max-w-lg leading-relaxed">
              Plataforma integral de Juventudes 2030 para el seguimiento, gestión y validación de proyectos sociales alineados a los Objetivos de Desarrollo Sostenible.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-blue-200">
              <div className="w-8 h-px bg-blue-300"></div>
              <span className="text-sm font-medium uppercase tracking-widest">Iniciativa Global</span>
            </div>
          </div>
        </div>

        {/* Barra ODS inferior */}
        <div className="relative z-10">
          <OdsColorBar />
        </div>
      </div>

      {/* ==========================================
          SECCIÓN DERECHA: FORMULARIO DE LOGIN
      ========================================== */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        {/* Barra ODS superior (Solo visible en móviles donde no está el panel izquierdo) */}
        <div className="absolute top-0 left-0 right-0 lg:hidden">
          <OdsColorBar />
        </div>

        {/* Cambié el botón flotante en móviles para que sea visible (texto azul oscuro en vez de blanco) */}
        {/* <Link 
          to="/" 
          className="absolute top-6 left-6 z-50 flex lg:hidden items-center space-x-2 text-sm font-bold text-[#00689D] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all duration-300 border border-blue-100 shadow-sm mt-4"
          aria-label="Regresar a la página principal"
        >
          <ArrowLeft size={16} />
          <span>Inicio</span>
        </Link> */}

        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 mt-12 lg:mt-0">
          
          {/* LOGO / CABECERA DEL FORMULARIO CON ENLACE AL INICIO */}
          <div className="text-center">
            <nav className="flex justify-center items-center mb-4 transition-transform hover:scale-105 duration-300">
              <Link to="/">
                <link rel="preload" href={getLogo()} as="image" />
                <img src={getLogo()} alt="Logo de Juventudes 2030" className="mx-auto w-80 h-auto cursor-pointer" />
              </Link>
            </nav>
            <p className="text-sm text-gray-500 mt-3 font-medium">Ingresa tus credenciales para acceder</p>
          </div>
          
          {/* ALERTA DE ERROR */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          {/* FORMULARIO */}
          <form onSubmit={handleLogin} className="space-y-6 mt-4">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] transition-colors bg-gray-50 focus:bg-white outline-none" 
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Contraseña</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] transition-colors bg-gray-50 focus:bg-white outline-none" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#00689D] hover:bg-[#00527A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00689D] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Autenticando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER DEL FORMULARIO */}
          <div className="pt-6 mt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Uso exclusivo para embajadores 2030 Cuarta Edición.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}