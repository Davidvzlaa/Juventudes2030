// PaginaPrincipal.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Ajusta la ruta a tu hook
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import HeroSection from '../Componentes/Global/HeroSection';
import LineasAccionSection from '../Componentes/Global/LineasAccionSection';
import Agenda2030Section from '../Componentes/Global/Agenda2030Section';
import ParticipaSection from '../Componentes/Global/ParticipaSection';
export default function PaginaPrincipal() {
  const { isAuthenticated, userRole, loading } = useAuth();
  const navigate = useNavigate();

  // Redirección automática si el usuario ya tiene sesión
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (userRole === 'Administrador') {
        navigate('/administrador');
      } else if (userRole === 'Embajador') {
        navigate('/embajador/inicio');
      }
    }
  }, [isAuthenticated, userRole, loading, navigate]);

  return (
    <>
      <Header />
      <HeroSection />
      <LineasAccionSection />
      <Agenda2030Section />
      <ParticipaSection />
      <Footer />
    </>
  );
}