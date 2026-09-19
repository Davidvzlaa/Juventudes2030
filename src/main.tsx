// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import './index.css';

// // ==========================================
// // PÁGINAS PÚBLICAS
// // ==========================================
// import PaginaPrincipal from './pages/PaginaPrincipal';
// import Login from './pages/Login';
// import Contacto from './pages/Contacto';
// import AcercaDe from './pages/Acercade';

// // ==========================================
// // AUTENTICACIÓN Y LAYOUTS
// // ==========================================
// import { AuthProvider } from './hooks/useAuth';
// import ProtectedRoute from './ProtectedRoute';
// import AdminLayout from './pages/Layout/AdminLayout';
// import AdminUsersLayout from './pages/Layout/AdminUsersLayout';
// import EmbajadorLayout from './pages/Layout/EmbajadorLayout';

// // ==========================================
// // MÓDULOS ADMINISTRADOR
// // ==========================================
// import AdminDashboard from './pages/Administrador/AdminDashboard';
// import AdminUsuariosDinamico from './pages/Administrador/AdminUsuariosDinamico';
// import AdminCatalogos from './pages/Administrador/AdminCatalogos';
// import AdminReportes from './pages/Administrador/AdminReportes';
// import AdminCalendario from './pages/Administrador/AdminCalendario';
// // import AdminActividades from './pages/Administrador/AdminActividades';

// // ==========================================
// // MÓDULOS EMBAJADOR
// // ==========================================
// import EmbajaDashboard from './pages/Embajadores/EmbajaDashboard';
// // import EmbajaActividad from './pages/Embajadores/EmbajaActividad';
// import EmbajaReporte from './pages/Embajadores/EmbajaReporte';
// import EmbajaCalendario from './pages/Embajadores/EmbajaCalendario';

// // ==========================================
// // UI COMPONENTES
// // ==========================================
// import { Toaster } from './components/ui/sonner';

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Toaster position="bottom-right" richColors duration={4000} />
//         <Routes>
          
//           {/* -------------------------------------
//               RUTAS PÚBLICAS 
//           ------------------------------------- */}
//           <Route path="/" element={<PaginaPrincipal />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/contacto" element={<Contacto />} />
//           <Route path="/acercade" element={<AcercaDe />} />

//           {/* -------------------------------------
//               RUTAS PROTEGIDAS: ADMINISTRADOR 
//           ------------------------------------- */}
//           <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            
//             {/* Todas estas rutas comparten un mismo Layout (AdminUsersLayout) */}
//             <Route path="/administrador" element={<AdminUsersLayout />}>
//               <Route index element={<AdminDashboard />} />
//               <Route path="usuarios" element={<AdminUsuariosDinamico />} />
//               <Route path="reportes" element={<AdminReportes />} />
//               <Route path="calendario" element={<AdminCalendario />} />
//               {/* <Route path="actividades" element={<AdminActividades />} /> */}
//             </Route>

//             {/* Layout secundario para configuración */}
//             <Route path="/administrador/configuracion" element={<AdminLayout />}>
//               <Route index element={<Navigate to="roles" replace />} />
//               <Route path=":catalogo" element={<AdminCatalogos />} />
//             </Route>

//             {/* Redirecciones de utilidad */}
//             <Route path="/administrador/catalogos" element={<Navigate to="/administrador/configuracion/roles" replace />} />
//             <Route path="/admin/*" element={<Navigate to="/administrador" replace />} />
//           </Route>

//           {/* -------------------------------------
//               RUTAS PROTEGIDAS: EMBAJADOR 
//           ------------------------------------- */}
//           <Route element={<ProtectedRoute allowedRoles={['Embajador']} />}>
//             <Route path="/embajador" element={<EmbajadorLayout />}>
//               <Route index element={<Navigate to="inicio" replace />} />
//               <Route path="inicio" element={<EmbajaDashboard />} />
//               {/* <Route path="actividades" element={<EmbajaActividad />} /> */}
//               <Route path="calendario" element={<EmbajaCalendario />} />
//               <Route path="reportes" element={<EmbajaReporte />} />
//             </Route>
//           </Route>

//           {/* -------------------------------------
//               FALLBACK (Si la ruta no existe) 
//           ------------------------------------- */}
//           <Route path="*" element={<Navigate to="/" replace />} />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// );
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// ==========================================
// PÁGINAS PÚBLICAS
// ==========================================
import PaginaPrincipal from './pages/PaginaPrincipal';
import Login from './pages/Login';
import Contacto from './pages/Contacto';
import AcercaDe from './pages/Acercade';

// ==========================================
// AUTENTICACIÓN Y LAYOUTS
// ==========================================
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './pages/Layout/AdminLayout';
import AdminUsersLayout from './pages/Layout/AdminUsersLayout';
import EmbajadorLayout from './pages/Layout/EmbajadorLayout';

// ==========================================
// MÓDULOS ADMINISTRADOR
// ==========================================
import AdminDashboard from './pages/Administrador/AdminDashboard';
import AdminUsuariosDinamico from './pages/Administrador/AdminUsuariosDinamico';
import AdminCatalogos from './pages/Administrador/AdminCatalogos';
import AdminReportes from './pages/Administrador/AdminReportes';
import AdminCalendario from './pages/Administrador/AdminCalendario';
// import AdminActividades from './pages/Administrador/AdminActividades';

// ==========================================
// MÓDULOS EMBAJADOR
// ==========================================
import EmbajaDashboard from './pages/Embajadores/EmbajaDashboard';
// import EmbajaActividad from './pages/Embajadores/EmbajaActividad';
import EmbajaReporte from './pages/Embajadores/EmbajaReporte';
import EmbajaCalendario from './pages/Embajadores/EmbajaCalendario';
import ResultadosSeleccion from './pages/ResultadosSeleccion';
// ==========================================
// UI COMPONENTES
// ==========================================
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors duration={4000} />
        <Routes>
          
          {/* -------------------------------------
              RUTAS PÚBLICAS 
          ------------------------------------- */}
          <Route path="/" element={<PaginaPrincipal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/resultados" element={<ResultadosSeleccion />} />
          <Route path="/acercade" element={<AcercaDe />} />

          {/* -------------------------------------
              RUTAS PROTEGIDAS: ADMINISTRADOR 
          ------------------------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            
            {/* Todas estas rutas comparten un mismo Layout (AdminUsersLayout) */}
            <Route path="/administrador" element={<AdminUsersLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsuariosDinamico />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="calendario" element={<AdminCalendario />} />
              {/* <Route path="actividades" element={<AdminActividades />} /> */}
            </Route>

            {/* Layout secundario para configuración */}
            <Route path="/administrador/configuracion" element={<AdminLayout />}>
              <Route index element={<Navigate to="roles" replace />} />
              <Route path=":catalogo" element={<AdminCatalogos />} />
            </Route>

            {/* Redirecciones de utilidad */}
            <Route path="/administrador/catalogos" element={<Navigate to="/administrador/configuracion/roles" replace />} />
            <Route path="/admin/*" element={<Navigate to="/administrador" replace />} />
          </Route>

          {/* -------------------------------------
              RUTAS PROTEGIDAS: EMBAJADOR 
          ------------------------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['Embajador']} />}>
            <Route path="/embajador" element={<EmbajadorLayout />}>
              <Route index element={<Navigate to="inicio" replace />} />
              <Route path="inicio" element={<EmbajaDashboard />} />
              {/* <Route path="actividades" element={<EmbajaActividad />} /> */}
              <Route path="calendario" element={<EmbajaCalendario />} />
              <Route path="reportes" element={<EmbajaReporte />} />
            </Route>
          </Route>

          {/* -------------------------------------
              FALLBACK (Si la ruta no existe) 
          ------------------------------------- */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Aquí es donde quitamos <StrictMode> para evitar la recarga doble
createRoot(document.getElementById('root')!).render(
  <App />
);