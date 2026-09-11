import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface UsuarioDatos {
  id: string;
  nombre?: string;
  apellido?: string;
  requiere_cambio_password?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  usuarioDatos: UsuarioDatos | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [usuarioDatos, setUsuarioDatos] = useState<UsuarioDatos | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAndRole = async (sessionOverride?: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      try {
        // 1. Obtener la sesión actual
        const session = sessionOverride === undefined
          ? (await supabase.auth.getSession()).data.session
          : sessionOverride;

        if (!session) {
          setIsAuthenticated(false);
          setUserRole(null);
          setUsuarioDatos(null);
          return;
        }

        setIsAuthenticated(true);

        // 2. Consultar tu tabla 'usuarios' y traer el nombre del rol usando el 'rol_id'
        // Esto asume que tienes la relación foránea bien configurada en Postgres
        const { data: usuarioData, error } = await supabase
          .from('usuarios')
          .select(`
            id,
            nombre,
            apellido,
            roles ( nombre )
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setUsuarioDatos(usuarioData);
        const roles = usuarioData?.roles as { nombre?: string } | { nombre?: string }[] | null;
        const rol = (Array.isArray(roles) ? roles[0]?.nombre : roles?.nombre) || null;
        setUserRole(rol);

      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUsuarioDatos(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRole();

    // 3. Escuchar cambios de sesión (ej. si el usuario cierra sesión)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsuarioDatos(null);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        // Si hay una nueva sesión, volvemos a buscar su rol
        fetchUserAndRole(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    createElement(
      AuthContext.Provider,
      { value: { isAuthenticated, userRole, usuarioDatos, loading } },
      children,
    )
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
};