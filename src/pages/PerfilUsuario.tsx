import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase"; // Ajusta la ruta a tu cliente de Supabase
import { 
  User, Mail, Phone, Calendar, MapPin, Shield, 
  Camera, Save, Loader2, Award, Clock, Lock, UploadCloud, X 
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// INTERFACES
// ==========================================
interface Rol {
  nombre: string;
}

interface ProyectoPerfil {
  id: number;
  nombre: string;
  descripcion: string;
  logo: string | null;
}

interface Municipio {
  nombre: string;
}

interface EmbajadorData {
  fecha_ingreso: string;
  municipios?: Municipio | null;
}

interface UsuarioPerfil {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  avatar_url: string | null;
  roles?: Rol | null;
  embajador_info?: EmbajadorData;
}

export default function PerfilUsuario() {
  // Estados de Usuario
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [archivoAvatar, setArchivoAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Proyecto (Solo para Embajadores)
  const [proyecto, setProyecto] = useState<ProyectoPerfil | null>(null);
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estados UI
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados Cambio Contraseña
  const [modalPassword, setModalPassword] = useState(false);
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [procesandoPassword, setProcesandoPassword] = useState(false);

  // ==========================================
  // LIMPIEZA DE MEMORIA (Blobs de imágenes locales)
  // ==========================================
  useEffect(() => {
    return () => {
      if (previewAvatar && previewAvatar.startsWith('blob:')) URL.revokeObjectURL(previewAvatar);
      if (previewLogo && previewLogo.startsWith('blob:')) URL.revokeObjectURL(previewLogo);
    };
  }, [previewAvatar, previewLogo]);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("No hay sesión activa");

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select(`*, roles ( nombre )`)
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      const rolData = Array.isArray(userData.roles) ? userData.roles[0] : userData.roles;

      let perfilData: UsuarioPerfil = { 
        ...userData,
        roles: rolData
      };

      // Si es Embajador, traemos su info y su Proyecto Social
      if (rolData?.nombre?.toLowerCase() === "embajador") {
        const { data: embajadorData, error: embError } = await supabase
          .from("embajadores")
          .select(`
            fecha_ingreso,
            proyectos_sociales ( id, nombre, descripcion, logo ),
            municipios ( nombre )
          `)
          .eq("usuario_id", user.id)
          .maybeSingle();
          
        if (!embError && embajadorData) {
          const munData = Array.isArray(embajadorData.municipios) ? embajadorData.municipios[0] : embajadorData.municipios;
          
          perfilData.embajador_info = {
            fecha_ingreso: embajadorData.fecha_ingreso,
            municipios: munData
          };
          
          if (embajadorData.proyectos_sociales) {
            const proj: any = Array.isArray(embajadorData.proyectos_sociales) 
              ? embajadorData.proyectos_sociales[0] 
              : embajadorData.proyectos_sociales;
              
            setProyecto(proj);
            setPreviewLogo(proj.logo || "");
          } else {
            // Si el embajador no tiene proyecto, inicializamos uno vacío
            setProyecto({ id: 0, nombre: "", descripcion: "", logo: null });
          }
        }
      }

      setPerfil(perfilData);
      setPreviewAvatar(perfilData.avatar_url || "");

    } catch (error: any) {
      console.error("Error al cargar perfil:", error);
      toast.error("No se pudo cargar tu información");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // MANEJADORES DE IMAGEN
  // ==========================================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoAvatar(e.target.files[0]);
      setPreviewAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoLogo(e.target.files[0]);
      setPreviewLogo(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ==========================================
  // GUARDAR CAMBIOS (Usuario + Proyecto)
  // ==========================================
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) return;
    setGuardando(true);

    try {
      // 1. PROCESAR AVATAR DEL USUARIO (Bucket: imagenes)
      let finalAvatarUrl = perfil.avatar_url;
      if (archivoAvatar) {
        if (perfil.avatar_url && perfil.avatar_url.includes('avatares/')) {
          const oldFileName = perfil.avatar_url.split('/').pop();
          if (oldFileName) await supabase.storage.from('imagenes').remove([`avatares/${oldFileName}`]).catch(() => {});
        }
        
        const fileExt = archivoAvatar.name.split('.').pop();
        const fileName = `avatares/avatar_${perfil.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, archivoAvatar);
        if (uploadError) throw uploadError;
        
        finalAvatarUrl = supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl;
      }

      // 2. ACTUALIZAR TABLA USUARIOS
      const payloadUsuario = {
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        telefono: perfil.telefono,
        fecha_nacimiento: perfil.fecha_nacimiento,
        avatar_url: finalAvatarUrl
      };
      
      const { error: userUpdateError } = await supabase.from("usuarios").update(payloadUsuario).eq("id", perfil.id);
      if (userUpdateError) throw userUpdateError;

      // 3. PROCESAR PROYECTO SOCIAL (Si es Embajador)
      if (proyecto && esEmbajador) {
        let finalLogoUrl = proyecto.logo;
        
        if (archivoLogo) {
          if (proyecto.logo && proyecto.logo.includes('logos/')) {
            const oldLogoName = proyecto.logo.split('/').pop();
            if (oldLogoName) await supabase.storage.from('imagenes').remove([`logos/${oldLogoName}`]).catch(() => {});
          }
          
          const logoExt = archivoLogo.name.split('.').pop();
          const prefixId = proyecto.id === 0 ? `temp_${perfil.id}` : proyecto.id;
          const logoName = `logos/logo_proyecto_${prefixId}_${Date.now()}.${logoExt}`;
          
          const { error: uploadLogoError } = await supabase.storage.from('imagenes').upload(logoName, archivoLogo);
          if (uploadLogoError) throw uploadLogoError;
          
          finalLogoUrl = supabase.storage.from('imagenes').getPublicUrl(logoName).data.publicUrl;
        }

        const payloadProyecto = {
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          logo: finalLogoUrl
        };
        
        if (proyecto.id !== 0) {
          const { error: projUpdateError } = await supabase.from("proyectos_sociales").update(payloadProyecto).eq("id", proyecto.id);
          if (projUpdateError) throw projUpdateError;
          setProyecto({ ...proyecto, ...payloadProyecto });
        } else if (proyecto.nombre.trim() !== "") {
          const { data: newProj, error: projInsertError } = await supabase
            .from("proyectos_sociales")
            .insert(payloadProyecto)
            .select("id")
            .single();
            
          if (projInsertError) throw projInsertError;
          
          if (newProj) {
            const { error: embUpdateError } = await supabase.from("embajadores").update({ proyecto_social_id: newProj.id }).eq("usuario_id", perfil.id);
            if (embUpdateError) throw embUpdateError;
            setProyecto({ ...proyecto, ...payloadProyecto, id: newProj.id });
          }
        }
        setArchivoLogo(null);
      }

      toast.success("Información actualizada correctamente");
      setPerfil({ ...perfil, ...payloadUsuario });
      setArchivoAvatar(null);

    } catch (error: any) {
      console.error("Error guardando:", error);
      toast.error("Ocurrió un error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // CAMBIO DE CONTRASEÑA DIRECTO (SIN CORREO)
  // ==========================================
  const cambiarPasswordDirecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil?.correo) return;

    if (passwords.nueva !== passwords.confirmar) {
      return toast.error("Las contraseñas nuevas no coinciden");
    }
    if (passwords.nueva.length < 6) {
      return toast.error("La contraseña nueva debe tener al menos 6 caracteres");
    }

    setProcesandoPassword(true);
    try {
      // 1. Verificar la contraseña actual haciendo un login silencioso
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: perfil.correo,
        password: passwords.actual
      });

      if (signInError) throw new Error("La contraseña actual es incorrecta");

      // 2. Si la contraseña actual es correcta, actualizamos a la nueva
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.nueva
      });

      if (updateError) throw updateError;

      toast.success("¡Contraseña actualizada exitosamente!");
      setModalPassword(false);
      setPasswords({ actual: '', nueva: '', confirmar: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesandoPassword(false);
    }
  };

  if (cargando) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#00689D] w-10 h-10" /></div>;
  }

  if (!perfil) return <div className="p-8 text-center text-gray-500">Error al cargar perfil</div>;

  const esEmbajador = perfil.roles?.nombre?.toLowerCase() === "embajador";

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 p-4">
      
      {/* MODAL PARA CAMBIAR CONTRASEÑA */}
      {modalPassword && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Lock size={20} className="text-[#00689D]"/> Cambiar Contraseña</h3>
              <button onClick={() => {setModalPassword(false); setPasswords({ actual: '', nueva: '', confirmar: '' });}} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            
            <form onSubmit={cambiarPasswordDirecto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contraseña Actual <span className="text-red-500">*</span></label>
                <input 
                  type="password" required autoFocus
                  value={passwords.actual} onChange={(e) => setPasswords({...passwords, actual: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]" 
                  placeholder="Tu contraseña actual"
                />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-600 mb-1">Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password" required minLength={6}
                  value={passwords.nueva} onChange={(e) => setPasswords({...passwords, nueva: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]" 
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Confirmar Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password" required minLength={6}
                  value={passwords.confirmar} onChange={(e) => setPasswords({...passwords, confirmar: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]" 
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setModalPassword(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={procesandoPassword} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:opacity-70">
                  {procesandoPassword ? <Loader2 className="animate-spin" size={16} /> : null}
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#061A2D]">Mi Perfil</h1>
        <p className="text-gray-500 text-sm">Gestiona tu información personal y los datos de tu programa.</p>
      </div>

      <form onSubmit={guardarCambios} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= COLUMNA IZQUIERDA: RESUMEN Y AVATAR ================= */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            
            <div 
              className="relative w-32 h-32 rounded-full mb-4 group cursor-pointer border-4 border-gray-50 overflow-hidden shadow-sm bg-blue-50 flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-blue-200" />
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white mb-1" size={20} />
                <span className="text-white text-[10px] font-bold">Cambiar foto</span>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
            </div>

            <h2 className="text-xl font-bold text-gray-800">{perfil.nombre} {perfil.apellido}</h2>
            
            <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5
              ${esEmbajador ? 'bg-green-100 text-green-700' : 'bg-[#00689D]/10 text-[#00689D]'}`}
            >
              {esEmbajador ? <Award size={14} /> : <Shield size={14} />}
              {perfil.roles?.nombre || 'Usuario'}
            </div>
          </div>

          {/* ESTATUS DE EMBAJADOR (Solo lectura) */}
          {esEmbajador && perfil.embajador_info && (
            <div className="bg-gradient-to-br from-[#061A2D] to-[#00689D] p-6 rounded-3xl shadow-sm text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={100} /></div>
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 border-b border-white/20 pb-2">
                Estatus Operativo
              </h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <span className="text-[10px] text-white/60 uppercase font-bold block mb-1">Municipio de Operación</span>
                  <div className="font-medium text-sm flex items-center gap-2">
                    <MapPin size={16} className="text-[#26BDE2]" />
                    <span>{perfil.embajador_info.municipios?.nombre || 'Sin asignar'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 uppercase font-bold block mb-1">Embajador desde</span>
                  <div className="font-medium text-sm flex items-center gap-2">
                    <Clock size={16} className="text-[#26BDE2]" />
                    <span>
                      {perfil.embajador_info.fecha_ingreso 
                        ? new Date(perfil.embajador_info.fecha_ingreso).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric'}) 
                        : 'No registrado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMNA DERECHA: FORMULARIOS ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BLOQUE 1: DATOS PERSONALES */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Información Personal</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombres</label>
                <input type="text" required value={perfil.nombre || ''} onChange={(e) => setPerfil({...perfil, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Apellidos</label>
                <input type="text" required value={perfil.apellido || ''} onChange={(e) => setPerfil({...perfil, apellido: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input type="email" disabled value={perfil.correo || ''} className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm cursor-not-allowed outline-none" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">El correo está vinculado a tu cuenta de acceso y no puede modificarse.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" value={perfil.telefono || ''} onChange={(e) => setPerfil({...perfil, telefono: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fecha de Nacimiento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" value={perfil.fecha_nacimiento || ''} onChange={(e) => setPerfil({...perfil, fecha_nacimiento: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: PROYECTO SOCIAL */}
          {esEmbajador && proyecto && (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-2">
                <Award className="text-[#00689D]" size={20}/> Mi Proyecto Social
              </h2>
              
              {proyecto.id === 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  <strong>Aún no tienes un proyecto registrado.</strong> Completa los datos a continuación para registrar tu iniciativa oficial.
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logo del Proyecto</label>
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:border-[#00689D] relative flex flex-col items-center justify-center bg-gray-50 transition-colors"
                  >
                    <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoChange} />
                    {previewLogo ? (
                      <>
                        <img src={previewLogo} alt="Logo Proyecto" className="w-full h-full object-contain p-2 bg-white" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-bold">Cambiar Logo</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Subir Logo</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Proyecto</label>
                  <input 
                    type="text" required
                    value={proyecto.nombre} onChange={(e) => setProyecto({...proyecto, nombre: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción y Objetivo</label>
                  <textarea 
                    rows={4} required
                    value={proyecto.descripcion} onChange={(e) => setProyecto({...proyecto, descripcion: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#00689D]/50 focus:bg-white outline-none transition-colors resize-none"
                    placeholder="Describe el propósito y las actividades principales de tu proyecto..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN GUARDAR GLOBAL */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" disabled={guardando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#061A2D] transition-colors disabled:opacity-50 shadow-md"
            >
              {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
              {guardando ? "Guardando todo..." : "Guardar Todos los Cambios"}
            </button>
          </div>

          {/* BLOQUE 3: SEGURIDAD Y ACCESO */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-red-100 shadow-sm mt-8">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Seguridad y Acceso</h2>
            <p className="text-sm text-gray-500 mb-6 pb-4 border-b">Asegúrate de mantener una contraseña fuerte para proteger tu cuenta.</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Actualizar Contraseña</h4>
                <p className="text-xs text-gray-500 mt-1">Podrás cambiar tu contraseña validando tu contraseña actual.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalPassword(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shrink-0"
              >
                <Lock size={16} /> Cambiar Contraseña
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}