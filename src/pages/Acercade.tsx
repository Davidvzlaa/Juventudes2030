import { 
  Globe, 
  Calendar, 
  Award, 
  BookOpen, 
  Tent, 
  Plane, 
  ShieldCheck,
  Target,
  Users
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

export default function AcercaDe() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans text-gray-900 selection:bg-[#00AEEF] selection:text-white">
      <Header />

      <main className="flex-grow pb-20">
        
        {/* ==========================================
            HERO SECTION: INSTITUCIONAL
        ====================================================== */}
        <section className="relative w-full overflow-hidden bg-[#004A87] pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          {/* Fondo decorativo sutil */}
          <div className="absolute -right-40 -top-40 opacity-5 pointer-events-none text-white">
            <Globe size={600} strokeWidth={1} />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            
            <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                <ShieldCheck size={14} className="text-[#00AEEF]" />
                ISJU • SEBIDES
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                <Globe size={14} className="text-[#00AEEF]" />
                UNFPA México
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Juventudes 2030 <br className="hidden md:block" />
              <span className="text-[#00AEEF]">Liderazgo y Acción en Sinaloa</span>
            </h1>
            
            <p className="mx-auto text-lg md:text-xl font-medium text-blue-100 max-w-3xl leading-relaxed mb-10">
              Programa estatal que forma liderazgos juveniles e impulsa proyectos con impacto social, ambiental y comunitario, estrictamente alineados con los 17 Objetivos de Desarrollo Sostenible (ODS).
            </p>

          </div>
        </section>

        {/* ==========================================
            DESTACADO: LA 4TA EDICIÓN (2026)
        ====================================================== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Tarjeta Izquierda: Información */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-8 md:p-10 shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-[#00AEEF]/10 text-[#004A87] px-3 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider mb-6 w-fit">
                Convocatoria Actual
              </div>
              <h2 className="text-3xl font-black text-[#004A87] mb-4">
                4ª Edición: Nueva Generación 2026
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-base">
                Lanzada en septiembre de 2026, esta nueva convocatoria integra a jóvenes de todo Sinaloa (16 a 35 años) en actividades formativas de alto nivel, desarrollo de liderazgo y ejecución de proyectos comunitarios.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#004A87] shrink-0">
                    <Tent size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">Campamento de Embajadores</span>
                    <span className="text-sm text-gray-500 mt-0.5 block">Formación intensiva en gestión de proyectos e incidencia pública.</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#00AEEF] shrink-0">
                    <Plane size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">Reconocimiento Especial</span>
                    <span className="text-sm text-gray-500 mt-0.5 block">Viaje oficial para visitar las instituciones de la ONU en México.</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tarjeta Derecha: Estructura */}
            <div className="lg:col-span-5 bg-[#004A87] rounded-2xl p-8 md:p-10 shadow-lg border border-[#004A87] flex flex-col justify-center relative overflow-hidden">
              {/* Decoración geométrica */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00AEEF] rounded-bl-full opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-tr-full opacity-5"></div>
              
              <h3 className="text-white text-xl font-black mb-8 relative z-10 uppercase tracking-wide flex items-center gap-2">
                <Target size={20} className="text-[#00AEEF]" />
                Estructura del Padrón
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="border-l-2 border-[#00AEEF] pl-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={16} className="text-[#00AEEF]" />
                    <span className="text-white font-bold uppercase tracking-wider text-xs">Embajadores 2030</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-white">40</p>
                    <p className="text-sm font-medium text-blue-200 uppercase tracking-wide">Jóvenes</p>
                  </div>
                  <p className="text-sm text-blue-100/80 mt-2">Representantes encargados de diseñar y liderar proyectos de impacto territorial.</p>
                </div>

                <div className="border-l-2 border-white/20 pl-5 pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-white/70" />
                    <span className="text-white font-bold uppercase tracking-wider text-xs">Voluntariado 2030</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-white">260</p>
                    <p className="text-sm font-medium text-blue-200 uppercase tracking-wide">Jóvenes</p>
                  </div>
                  <p className="text-sm text-blue-100/80 mt-2">Participantes activos en brigadas, campañas y acciones comunitarias.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
            LÍNEA DE TIEMPO (TRAYECTORIA HISTÓRICA)
        ====================================================== */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#004A87]">Evolución del Programa</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              De un programa piloto de liderazgo a una estrategia estatal estructurada con seguimiento institucional y resultados tangibles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Línea conectora (Solo visible en Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gray-200 z-0"></div>

            {/* 1ra Edición */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-16 h-16 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center text-[#004A87] font-black text-xl mb-6 shadow-sm group-hover:border-[#00AEEF] transition-colors mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Los Inicios</h3>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#00AEEF] uppercase tracking-wider mb-3 w-full">
                <Calendar size={14} /> Creación del Programa
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Impulsada por el ISJU y UNFPA. Estableció la base del modelo a través de campamentos y formación juvenil.
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 w-full">
                <span className="text-[#004A87] font-bold">Registro:</span> 50 embajadores y +300 voluntarios.
              </div>
            </div>

            {/* 2da Edición */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-16 h-16 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center text-[#004A87] font-black text-xl mb-6 shadow-sm group-hover:border-[#00AEEF] transition-colors mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Edición 2024</h3>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#00AEEF] uppercase tracking-wider mb-3 w-full">
                <BookOpen size={14} /> Emprendimiento Social
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Mayor énfasis a los emprendimientos sociales, acciones comunitarias territoriales y brigadas juveniles.
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 w-full">
                <span className="text-[#004A87] font-bold">Registro:</span> 50 embajadores y ~200 voluntarios.
              </div>
            </div>

            {/* 3ra Edición */}
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left group">
              <div className="w-16 h-16 bg-white border-4 border-[#00AEEF] rounded-full flex items-center justify-center text-[#004A87] font-black text-xl mb-6 shadow-md mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2025 - 2026</h3>
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#00AEEF] uppercase tracking-wider mb-3 w-full">
                <Award size={14} /> Resultados Medibles
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Concluyó con resultados contundentes presentados por SEBIDES: 190 actividades logradas en territorio.
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-100 text-xs text-gray-600 w-full">
                <span className="text-[#004A87] font-bold">Registro:</span> 50 embajadores y 250 voluntarios.
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}