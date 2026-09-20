import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, Globe, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Juventudes2030 from '../assets/LOGO HORIZONTAL JUVENTUDES 20230.png';

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
  
  // NUEVOS ESTADOS PARA EL CAMBIO OBLIGATORIO
  const [requiereCambioPassword, setRequiereCambioPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  // Redirección automática basada en el rol (Solo si NO requiere cambio de contraseña)
  useEffect(() => {
    if (isAuthenticated && userRole && !requiereCambioPassword) {
      if (userRole === 'Administrador') {
        navigate('/administrador');
      } else if (userRole === 'Embajador') {
        navigate('/embajador/inicio');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, userRole, requiereCambioPassword, navigate]);

  // Cargar configuración del sistema (Logo)
  useEffect(() => {
    let isMounted = true;
    const fetchSistema = async () => {
      try {
        const { data, error } = await supabase
          .from('sistemas')
          .select('logotipos')
          .eq('activo', true)
          .maybeSingle();

        if (!error && data && isMounted) {
          setSistema(data as Sistema);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      }
    };
    fetchSistema();
    return () => { isMounted = false; };
  }, []);

  // Función de Login normal con intercepción de seguridad
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError('Correo o contraseña incorrectos. Verifica tus credenciales.');
      setIsLoading(false);
      return;
    }

    // SEGURIDAD: Consultamos si el usuario recién logueado tiene pendiente cambiar su contraseña temporal
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('requiere_cambio_password')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      await supabase.auth.signOut();
      setError('Tu cuenta no tiene un perfil válido. Contacta al administrador.');
      setIsLoading(false);
      return;
    }

    if (userData?.requiere_cambio_password) {
      // Interceptamos la navegación y mostramos el formulario de cambio obligatorio
      setRequiereCambioPassword(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  // Función para procesar el cambio obligatorio
  const handleActualizarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nuevaPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Actualizamos en Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: nuevaPassword
      });
      if (updateError) throw updateError;

      // 2. Quitamos la bandera en la tabla pública de usuarios
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase
          .from('usuarios')
          .update({ requiere_cambio_password: false })
          .eq('id', user.id);

        if (dbError) throw dbError;
      }

      toast.success('¡Contraseña actualizada con éxito! Bienvenido.');
      setRequiereCambioPassword(false);
      
      // Forzamos recarga o dejamos que el useEffect detecte el estado para redirigir
      window.location.reload(); 
    } catch (err: any) {
      setError('Error al actualizar la contraseña: ' + err.message);
      setIsLoading(false);
    }
  };
  
  const getLogo = () => {
    if (sistema?.logotipos?.principal) {
      return sistema.logotipos.principal;
    }
    return Juventudes2030;
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans relative">
      
      {/* Botón Flotante: Regresar al inicio */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center space-x-2 text-sm font-bold text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300"
        aria-label="Regresar a la página principal"
      >
        <ArrowLeft size={16} />
        <span>Regresar al inicio</span>
      </Link>

      {/* Sección Izquierda: Decorativa */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#00689D] overflow-hidden flex-col justify-between">
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
        </div>
        <div className="relative z-10">
          <OdsColorBar />
        </div>
      </div>

      {/* Sección Derecha: Formulario Dinámico (Login o Cambio Obligatorio) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-0 left-0 right-0 lg:hidden">
          <OdsColorBar />
        </div>

        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 mt-12 lg:mt-0">
          
          <div className="text-center">
            <nav className="flex justify-center items-center mb-4 transition-transform hover:scale-105 duration-300">
              <Link to="/">
                <img src={getLogo()} alt="Logo de Juventudes 2030" className="mx-auto w-80 h-auto cursor-pointer" />
              </Link>
            </nav>
            
            {/* TÍTULO CONDICIONAL */}
            {requiereCambioPassword ? (
              <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-xl text-left">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                  <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                  <span>Actualización de Seguridad</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Estás ingresando con una contraseña temporal. Por seguridad de la plataforma, debes establecer una nueva contraseña personal antes de continuar.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-3 font-medium">Ingresa tus credenciales para acceder</p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          {/* RENDERIZADO CONDICIONAL DE FORMULARIOS */}
          {!requiereCambioPassword ? (
            
            /* FORMULARIO 1: LOGIN NORMAL */
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
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

          ) : (

            /* FORMULARIO 2: CAMBIO OBLIGATORIO DE CONTRASEÑA */
            <form onSubmit={handleActualizarPassword} className="space-y-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] transition-colors bg-gray-50 focus:bg-white outline-none" 
                    placeholder="Mínimo 8 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] transition-colors bg-gray-50 focus:bg-white outline-none" 
                    placeholder="Repite la contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-all disabled:opacity-70 shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Establecer Contraseña y Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

          )}

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