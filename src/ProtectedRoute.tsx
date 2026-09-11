import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ModalCambioPassword from './Componentes/Global/ModalCambioPassword'; // Ajusta la ruta

interface ProtectedRouteProps {
  allowedRoles: Array<string>;
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Asegúrate de que useAuth devuelva 'usuarioDatos' con la columna 'requiere_cambio_password'
  const { isAuthenticated, userRole, usuarioDatos, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* Si la base de datos dice que requiere cambio, inyectamos el modal flotante */}
      {usuarioDatos?.requiere_cambio_password && <ModalCambioPassword />}
      
      {/* El Outlet renderiza el panel de fondo. Si el modal está activo, 
          el usuario podrá ver su panel borroso de fondo, pero no tocarlo */}
      <Outlet />
    </>
  );
}