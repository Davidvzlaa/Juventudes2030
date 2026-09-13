import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import PaginaPrincipal from './pages/PaginaPrincipal';
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './pages/Layout/AdminLayout';
import AdminUsersLayout from './pages/Layout/AdminUsersLayout';
import EmbajadorLayout from './pages/Layout/EmbajadorLayout';
import AdminDashboard from './pages/Administrador/AdminDashboard';
import AdminUsuariosDinamico from './pages/Administrador/AdminUsuariosDinamico';
import AdminCatalogos from './pages/Administrador/AdminCatalogos';
import AdminReportes from './pages/Administrador/AdminReportes';
import EmbajaDashboard from './pages/Embajadores/EmbajaDashboard';
import EmbajaActividad from './pages/Embajadores/EmbajaActividad';
import EmbajaReporte from './pages/Embajadores/EmbajaReporte';
import { AuthProvider } from './hooks/useAuth';
import EmbajaCalendario from './pages/Embajadores/EmbajaCalendario';
import AdminCalendario from './pages/Administrador/AdminCalendario';
import AdminActividades from './pages/Administrador/AdminActividades';
import { Toaster } from './components/ui/sonner';
import Contacto from './pages/Contacto';
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster position="bottom-right" richColors duration={4000} />
        <Routes>
        <Route path="/" element={<PaginaPrincipal />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/contacto" element={<Contacto />} />

        <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
          <Route path="/administrador" element={<AdminUsersLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
          <Route path="/administrador/usuarios" element={<AdminUsersLayout />}>
            <Route index element={<AdminUsuariosDinamico />} />
          </Route>
          <Route path="/administrador/reportes" element={<AdminUsersLayout />}>
            <Route index element={<AdminReportes />} />
          </Route>
          <Route path="/administrador/calendario" element={<AdminUsersLayout />}>
            <Route index element={<AdminCalendario />} />
          </Route>
          <Route path="/administrador/actividades" element={<AdminUsersLayout />}>
            <Route index element={<AdminActividades />} />
          </Route>
          <Route path="/administrador/configuracion" element={<AdminLayout />}>
            <Route index element={<Navigate to="roles" replace />} />
            <Route path=":catalogo" element={<AdminCatalogos />} />
          </Route>
          <Route path="/administrador/catalogos" element={<Navigate to="/administrador/configuracion/municipios" replace />} />
          <Route path="/admin/*" element={<Navigate to="/administrador" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Embajador']} />}>
          <Route path="/embajador" element={<EmbajadorLayout />}>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<EmbajaDashboard />} />
            <Route path="actividades" element={<EmbajaActividad />} />
            <Route path="calendario" element={<EmbajaCalendario />} />
            <Route path="reportes" element={<EmbajaReporte />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);