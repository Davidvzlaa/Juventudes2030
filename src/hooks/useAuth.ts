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
    let disposed = false;
    let requestSequence = 0;

    const fetchUserAndRole = async (sessionOverride?: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      const requestId = ++requestSequence;
      try {
        const session = sessionOverride === undefined
          ? (await supabase.auth.getSession()).data.session
          : sessionOverride;

        if (!session) {
          if (disposed || requestId !== requestSequence) return;
          setIsAuthenticated(false);
          setUserRole(null);
          setUsuarioDatos(null);
          return;
        }

        setIsAuthenticated(true);

        // Consulta a la tabla intermedia 'usuario_roles'
        const { data: usuarioData, error } = await supabase
          .from('usuarios')
          .select(`
            id,
            nombre,
            apellido,
            requiere_cambio_password,
            usuario_roles (
              roles ( nombre )
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        if (disposed || requestId !== requestSequence) return;

        // Separamos los datos personales de la relación de roles
        const { usuario_roles, ...datosPersonales } = usuarioData;
        setUsuarioDatos(datosPersonales as UsuarioDatos);

        // Extracción segura del nombre del rol
        const rolesRelacion = usuario_roles as any;
        const rolObj = Array.isArray(rolesRelacion) ? rolesRelacion[0]?.roles : rolesRelacion?.roles;
        const nombreRol = Array.isArray(rolObj) ? rolObj[0]?.nombre : rolObj?.nombre;
        
        setUserRole(nombreRol || null);

      } catch (error) {
        if (disposed || requestId !== requestSequence) return;
        console.error('Error obteniendo usuario:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUsuarioDatos(null);
      } finally {
        if (!disposed && requestId === requestSequence) setLoading(false);
      }
    };

    fetchUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUsuarioDatos(null);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        fetchUserAndRole(session);
      }
    });

    return () => {
      disposed = true;
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