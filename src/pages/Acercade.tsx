import { 
  Globe, Users, Target, MapPin, 
  Calendar, Award, ArrowRight, BookOpen, 
  Tent, Plane, ShieldCheck
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

export default function AcercaDe() {
  return (
    <>
    <Header />
    <div className="space-y-12 max-w-7xl mx-auto pb-16 overflow-hidden">
      
      {/* ==========================================
          HERO SECTION: ¿QUÉ ES JUVENTUDES 2030?
          (Aparece inmediatamente)
      ========================================== */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both bg-gradient-to-r from-[#004A70] to-[#002D45] rounded-3xl p-8 md:p-12 shadow-xl relative text-white border border-blue-900/30 overflow-hidden">
        <div className="absolute -top-20 -right-20 opacity-10 pointer-events-none animate-pulse duration-3000">
          <Globe size={400} />
        </div>
        
        <div className="relative z-10 max-w-3xl">
         
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            Juventudes 2030: Liderazgo y Acción en Sinaloa
          </h1>
          
          <p className="text-blue-100/90 text-lg md:text-xl font-medium leading-relaxed mb-8">
            Nacimos de la colaboración entre el ISJU y el UNFPA México. Somos un programa estatal que forma liderazgos juveniles y apoya proyectos con impacto social, ambiental y comunitario, estrictamente alineados con los 17 Objetivos de Desarrollo Sostenible (ODS).
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 flex items-center gap-3 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
              
              <span className="font-semibold text-sm">Red de Embajadores</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 flex items-center gap-3 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
              
              <span className="font-semibold text-sm">Impacto en la Agenda 2030</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          DESTACADO: LA 4TA EDICIÓN (2026)
          (Retraso de 200ms)
      ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border-t-4 border-[#26BDE2] flex flex-col justify-center hover:shadow-md transition-shadow">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#00689D] px-4 py-2 rounded-full font-bold text-sm mb-6 w-fit border border-blue-100">
            <ShieldCheck size={16} /> Impulsado por SEBIDES
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            4ª Edición: Nueva Generación 2026
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Lanzada en septiembre de 2026, esta nueva convocatoria busca a jóvenes de todo Sinaloa (16 a 35 años) para integrarse a actividades de formación, liderazgo y desarrollo de proyectos comunitarios.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="bg-white p-2 rounded-xl shadow-sm text-[#00689D]"><Tent size={20}/></div>
              <div>
                <span className="block font-bold text-sm">Campamento de Embajadores</span>
                <span className="text-xs text-gray-500">Formación intensiva en gestión de proyectos.</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
              <div className="bg-white p-2 rounded-xl shadow-sm text-orange-500"><Plane size={20}/></div>
              <div>
                <span className="block font-bold text-sm">Reconocimiento Especial</span>
                <span className="text-xs text-gray-500">Viaje para visitar instituciones de la ONU México.</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas de la Cuarta Edición */}
        <div className="bg-[#061A2D] rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply transition-colors group-hover:bg-transparent duration-500"></div>
          
          <h3 className="text-white text-2xl font-black mb-8 relative z-10">Estructura del Programa 2026</h3>
          
          <div className="space-y-6 relative z-10">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm transform group-hover:translate-x-2 transition-transform duration-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-200 font-bold uppercase tracking-wider text-sm">Embajadores 2030</span>
              </div>
              <p className="text-3xl font-black text-white">40 <span className="text-lg font-medium text-blue-200">jóvenes</span></p>
              <p className="text-sm text-blue-100/70 mt-2">Representantes encargados de diseñar y liderar proyectos de impacto.</p>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-200 font-bold uppercase tracking-wider text-sm">Voluntariado 2030</span>
              </div>
              <p className="text-3xl font-black text-white">Hasta 260 <span className="text-lg font-medium text-green-200">jóvenes</span></p>
              <p className="text-sm text-blue-100/70 mt-2">Participantes activos en brigadas, campañas y actividades comunitarias.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          LÍNEA DE TIEMPO (TRAYECTORIA HISTÓRICA)
      ========================================== */}
      <div className="pt-10">
        <div className="text-center mb-12 animate-in fade-in zoom-in-95 duration-1000 delay-[400ms] fill-mode-both">
          <h2 className="text-3xl font-black text-gray-900">Evolución del Programa</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            De un programa piloto de liderazgo juvenil a una estrategia estatal estructurada con seguimiento institucional y resultados tangibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Línea conectora */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-[#00689D]/20 to-gray-200 -translate-y-1/2 z-0 animate-in fade-in duration-1000 delay-[500ms] fill-mode-both"></div>

          {/* 1ra Edición (Retraso 500ms) */}
          <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group animate-in fade-in slide-in-from-left-8 duration-700 delay-[500ms] fill-mode-both">
            <div className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl mb-6 group-hover:border-[#00689D] group-hover:text-[#00689D] group-hover:bg-blue-50 transition-colors">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Los Inicios</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              <Calendar size={14} /> Creación del Programa
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Impulsada por el ISJU y UNFPA. Estableció la base del modelo a través de campamentos y formación juvenil.
            </p>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 font-medium">
              <span className="text-[#00689D] font-bold">Participación:</span> 50 embajadores y +300 voluntarios.
            </div>
          </div>

          {/* 2da Edición (Retraso 700ms) */}
          <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[700ms] fill-mode-both">
            <div className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl mb-6 group-hover:border-[#00689D] group-hover:text-[#00689D] group-hover:bg-blue-50 transition-colors">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Edición 2024</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              <BookOpen size={14} /> Emprendimiento Social
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Se dio un mayor énfasis a los emprendimientos sociales, las acciones comunitarias territoriales y las brigadas juveniles.
            </p>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 font-medium">
              <span className="text-[#00689D] font-bold">Participación:</span> 50 embajadores y ~200 voluntarios.
            </div>
          </div>

          {/* 3ra Edición (Retraso 900ms) */}
          <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform duration-300 group animate-in fade-in slide-in-from-right-8 duration-700 delay-[900ms] fill-mode-both">
            <div className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl mb-6 group-hover:border-[#00689D] group-hover:text-[#00689D] group-hover:bg-blue-50 transition-colors">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2025 - 2026</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              <Award size={14} /> Resultados Medibles
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Concluyó con resultados contundentes presentados por SEBIDES: 190 actividades ambientales y sociales logradas en territorio.
            </p>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 font-medium">
              <span className="text-[#00689D] font-bold">Participación:</span> 50 embajadores y 250 voluntarios.
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CALL TO ACTION
          (Retraso de 1100ms)
      ========================================== */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-8 md:p-12 text-center shadow-sm flex flex-col items-center mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-[1100ms] fill-mode-both">
        <MapPin className="text-[#00689D] mb-4" size={40} />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">La Convocatoria está Abierta</h2>
        <p className="text-gray-600 max-w-2xl mb-8">
          El registro para la <span className="font-bold text-[#00689D]">Nueva Generación 2026</span> estará abierto del 4 al 13 de septiembre. Diseña soluciones para tu comunidad y conviértete en agente de cambio.
        </p>
        <nav className="flex flex-wrap justify-center gap-4">
          <a href="https://forms.gle/XkGLbFWQ9EzgUZpm9" className="bg-[#00689D] text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-[#00577A] transition-colors flex items-center gap-2">
            Forms de Registro <ArrowRight size={16} />
          </a>
          
        </nav>
      </div>

    </div>
    <Footer />
    </>
  );
}