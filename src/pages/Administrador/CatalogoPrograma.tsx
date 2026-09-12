import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Save, Plus, Trash2, Globe, Mail, Phone, MapPin, 
  Clock, Loader2, Link as LinkIcon, UploadCloud, Edit2, X, Check
} from "lucide-react";

// ==========================================
// INTERFACES (Adaptadas para JSONB)
// ==========================================
interface Horario {
  etiqueta?: string;
  dias: string;
  horas: string;
}

interface Logotipos {
  principal?: string;
  blanco?: string;
  isotipo?: string;
  [key: string]: string | undefined;
}

interface Sistema {
  id?: number;
  nombre: string;
  descripcion: string;
  logotipos: Logotipos;
  direccion: string;
  horarios: Horario[];
  telefono: string;
  correo: string;
  sitio_web: string;
}

interface RedSocial {
  id: number;
  sistema_id: number;
  nombre: string;
  url: string;
  activo: boolean;
}

const TIPOS_LOGO = [
  { id: 'principal', nombre: 'Principal (Color)', desc: 'Para fondos claros' },
  { id: 'blanco', nombre: 'Alternativo (Blanco)', desc: 'Para footer y oscuros' },
  { id: 'isotipo', nombre: 'Isotipo (Ícono)', desc: 'Favicon o avatares' }
];

export default function CatalogoPrograma() {
  // ==========================================
  // ESTADOS DEL SISTEMA
  // ==========================================
  const [sistema, setSistema] = useState<Sistema>({
    nombre: "", descripcion: "", direccion: "",
    telefono: "", correo: "", sitio_web: "",
    logotipos: {}, horarios: []
  });
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // ==========================================
  // ESTADOS DE LOGOTIPOS (Múltiples)
  // ==========================================
  const [archivosLogo, setArchivosLogo] = useState<Record<string, File>>({});
  // CORRECCIÓN TYPESCRIPT APLICADA AQUÍ:
  const [previewsLogo, setPreviewsLogo] = useState<Logotipos>({}); 
  
  const fileInputRefs = {
    principal: useRef<HTMLInputElement>(null),
    blanco: useRef<HTMLInputElement>(null),
    isotipo: useRef<HTMLInputElement>(null)
  };

  // ==========================================
  // ESTADOS DE HORARIOS MÚLTIPLES
  // ==========================================
  const [nuevoHorario, setNuevoHorario] = useState<Horario>({ etiqueta: "", dias: "Lunes a Viernes", horas: "" });

  // ==========================================
  // ESTADOS DE REDES SOCIALES
  // ==========================================
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [nuevaRed, setNuevaRed] = useState({ nombre: "Facebook", url: "" });
  const [editandoRedId, setEditandoRedId] = useState<number | null>(null);

  // ==========================================
  // CARGA INICIAL
  // ==========================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const { data: dataSis, error: errSis } = await supabase
        .from("sistemas")
        .select("*")
        .eq("activo", true)
        .maybeSingle();

      if (errSis) throw errSis;
      
      if (dataSis) {
        const sysData: Sistema = {
          ...dataSis,
          logotipos: dataSis.logotipos || {},
          horarios: Array.isArray(dataSis.horarios) ? dataSis.horarios : []
        };
        setSistema(sysData);
        setPreviewsLogo(sysData.logotipos);

        const { data: dataRedes, error: errRedes } = await supabase
          .from("redes_sociales")
          .select("*")
          .eq("sistema_id", dataSis.id)
          .order("id", { ascending: true });

        if (errRedes) throw errRedes;
        if (dataRedes) setRedes(dataRedes);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      mostrarMensaje("Error al cargar la información", "error");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // MANEJO DE IMÁGENES
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipoId: string) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0], tipoId);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tipoId: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0], tipoId);
  };
  
  const processFile = (file: File, tipoId: string) => {
    setArchivosLogo(prev => ({ ...prev, [tipoId]: file }));
    setPreviewsLogo(prev => ({ ...prev, [tipoId]: URL.createObjectURL(file) }));
  };

  // ==========================================
  // GESTIÓN DE HORARIOS
  // ==========================================
  const agregarHorario = () => {
    if (!nuevoHorario.horas) {
      mostrarMensaje("Debes especificar las horas (Ej. 09:00 - 17:00)", "error");
      return;
    }
    setSistema(prev => ({ ...prev, horarios: [...prev.horarios, nuevoHorario] }));
    setNuevoHorario({ etiqueta: "", dias: "Lunes a Viernes", horas: "" });
  };

  const eliminarHorario = (index: number) => {
    setSistema(prev => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== index) }));
  };
// ==========================================
  // GUARDAR SISTEMA (Información General + Limpieza de Storage)
  // ==========================================
  const guardarSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      let logotiposFinales = { ...sistema.logotipos };
      
      // 1. PROCESAR SUBIDA DE IMÁGENES Y BORRADO DE LAS VIEJAS
      const uploadPromises = Object.entries(archivosLogo).map(async ([tipoId, file]) => {
        
        // A) Verificar si ya existía un logo viejo en este espacio
        const urlVieja = sistema.logotipos[tipoId];
        
        if (urlVieja) {
          // Extraer solo el nombre del archivo de la URL pública de Supabase
          // Ej: https://.../storage/v1/object/public/imagenes/logo_principal_123.png -> logo_principal_123.png
          const urlParts = urlVieja.split('/');
          const oldFileName = urlParts[urlParts.length - 1];

          // Mandar a borrar el archivo viejo del bucket de 'imagenes'
          if (oldFileName) {
            // Usamos .catch para que si falla (ej. el archivo ya no existe), no detenga el guardado
            await supabase.storage.from('imagenes').remove([oldFileName]).catch(err => {
              console.warn("No se pudo borrar el logo anterior o ya no existe:", err);
            });
          }
        }

        // B) Subir el nuevo archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `logo_${tipoId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, file);
        if (uploadError) throw uploadError;

        // C) Obtener la nueva URL pública
        const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
        logotiposFinales[tipoId] = publicUrl;
      });

      // Esperar a que se borren los viejos y se suban los nuevos
      await Promise.all(uploadPromises);

      // 2. GUARDAR EN LA BASE DE DATOS (PostgreSQL)
      const payload = {
        nombre: sistema.nombre,
        descripcion: sistema.descripcion,
        direccion: sistema.direccion,
        telefono: sistema.telefono,
        correo: sistema.correo,
        sitio_web: sistema.sitio_web,
        logotipos: logotiposFinales,
        horarios: sistema.horarios,
        fecha_actualizacion: new Date().toISOString()
      };

      if (sistema.id) {
        const { error } = await supabase.from("sistemas").update(payload).eq("id", sistema.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sistemas").insert([{ ...payload, activo: true }]);
        if (error) throw error;
      }
      
      mostrarMensaje("Información actualizada correctamente", "exito");
      setArchivosLogo({}); // Limpiar pendientes
      setSistema(prev => ({ ...prev, logotipos: logotiposFinales }));
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarMensaje("Error al guardar la información", "error");
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // CRUD REDES SOCIALES
  // ==========================================
  const guardarRed = async () => {
    if (!nuevaRed.url || !sistema.id) return;
    
    try {
      if (editandoRedId) {
        const { error } = await supabase
          .from("redes_sociales")
          .update({ nombre: nuevaRed.nombre, url: nuevaRed.url })
          .eq("id", editandoRedId);
        
        if (error) throw error;
        mostrarMensaje("Red social actualizada", "exito");
      } else {
        const { error } = await supabase
          .from("redes_sociales")
          .insert([{
            sistema_id: sistema.id,
            nombre: nuevaRed.nombre,
            url: nuevaRed.url,
            activo: true
          }]);

        if (error) throw error;
        mostrarMensaje("Red social añadida", "exito");
      }

      cancelarEdicionRed();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar red:", error);
      mostrarMensaje("Error al procesar la red social", "error");
    }
  };

  const iniciarEdicionRed = (red: RedSocial) => {
    setEditandoRedId(red.id);
    setNuevaRed({ nombre: red.nombre, url: red.url });
  };

  const cancelarEdicionRed = () => {
    setEditandoRedId(null);
    setNuevaRed({ nombre: "Facebook", url: "" });
  };

  const eliminarRed = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta red?")) return;
    try {
      const { error } = await supabase.from("redes_sociales").delete().eq("id", id);
      if (error) throw error;
      setRedes(redes.filter(r => r.id !== id));
      mostrarMensaje("Red eliminada", "exito");
    } catch (error) {
      console.error("Error al eliminar red:", error);
    }
  };

  const mostrarMensaje = (texto: string, tipo: string) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
  };

  if (cargando && !sistema.nombre) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#00689D] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#061A2D]">Configuración del Programa</h1>
        <p className="text-gray-500 text-sm">Gestiona la información pública, variaciones de logotipo y horarios.</p>
      </div>

      {mensaje.texto && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= DATOS GENERALES ================= */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={guardarSistema} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
            
            {/* ZONA DE LOGOTIPOS */}
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Identidad Gráfica</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {TIPOS_LOGO.map((tipo) => (
                <div key={tipo.id} className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 mb-1">{tipo.nombre}</span>
                  <span className="text-[10px] text-gray-400 mb-2">{tipo.desc}</span>
                  
                  <div 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={(e) => handleDrop(e, tipo.id)}
                    onClick={() => fileInputRefs[tipo.id as keyof typeof fileInputRefs].current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer group relative min-h-[120px]
                      ${tipo.id === 'blanco' ? 'bg-gray-800 border-gray-600 hover:border-[#26BDE2]' : 'bg-gray-50 border-gray-200 hover:border-[#00689D]'}`}
                  >
                    <input 
                      type="file" accept="image/*" className="hidden" 
                      ref={fileInputRefs[tipo.id as keyof typeof fileInputRefs]} 
                      onChange={(e) => handleFileChange(e, tipo.id)} 
                    />
                    
                    {previewsLogo[tipo.id] ? (
                      <>
                        <img src={previewsLogo[tipo.id]} alt={`Logo ${tipo.nombre}`} className="max-h-16 object-contain" />
                        {archivosLogo[tipo.id] && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm" title="Nuevo archivo pendiente">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold tracking-wider uppercase">Cambiar</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
                        <UploadCloud size={24} className={tipo.id === 'blanco' ? 'text-white' : 'text-gray-400'} />
                        <span className={`text-[10px] mt-2 ${tipo.id === 'blanco' ? 'text-white' : 'text-gray-500'}`}>Subir imagen</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ZONA DE CONTACTO */}
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Información de Contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Programa</label>
                <input 
                  type="text" required
                  value={sistema.nombre} onChange={(e) => setSistema({...sistema, nombre: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción (Bio)</label>
                <textarea 
                  rows={3}
                  value={sistema.descripcion} onChange={(e) => setSistema({...sistema, descripcion: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50 resize-none"
                />
              </div>

              {/* GESTOR DE HORARIOS MULTIPLES */}
              <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-[#00689D] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock size={16} /> Horarios de Atención
                </label>
                
                {sistema.horarios.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {sistema.horarios.map((h, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg text-sm">
                        <div>
                          {h.etiqueta && <span className="font-bold text-gray-700 mr-2">{h.etiqueta}:</span>}
                          <span className="text-gray-600">{h.dias}, <span className="font-medium text-[#00689D]">{h.horas}</span></span>
                        </div>
                        <button type="button" onClick={() => eliminarHorario(i)} className="text-gray-400 hover:text-red-500 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Etiqueta (Opcional)</span>
                    <input type="text" placeholder="Ej. Oficinas" value={nuevoHorario.etiqueta} onChange={e => setNuevoHorario({...nuevoHorario, etiqueta: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Días</span>
                    <select value={nuevoHorario.dias} onChange={e => setNuevoHorario({...nuevoHorario, dias: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm">
                      <option>Lunes a Viernes</option>
                      <option>Lunes a Sábado</option>
                      <option>Sábados y Domingos</option>
                      <option>24/7</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Horas (Requerido)</span>
                    <input type="text" placeholder="Ej. 09:00 - 17:00" value={nuevoHorario.horas} onChange={e => setNuevoHorario({...nuevoHorario, horas: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm" />
                  </div>
                  <button type="button" onClick={agregarHorario} className="bg-[#26BDE2] text-white p-2 rounded-md hover:bg-[#1CA9CB] transition-colors w-full sm:w-auto mt-2 sm:mt-0">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dirección Física</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    value={sistema.direccion} onChange={(e) => setSistema({...sistema, direccion: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    value={sistema.telefono} onChange={(e) => setSistema({...sistema, telefono: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Oficial</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="email" 
                    value={sistema.correo} onChange={(e) => setSistema({...sistema, correo: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sitio Web</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Globe className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="url" placeholder="https://..."
                    value={sistema.sitio_web} onChange={(e) => setSistema({...sistema, sitio_web: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={guardando}
                className="flex items-center gap-2 bg-[#00689D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#061A2D] transition-colors disabled:opacity-50 shadow-md"
              >
                {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {guardando ? "Guardando..." : "Guardar Información"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= GESTOR REDES SOCIALES ================= */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Redes Sociales</h2>
            
            {/* LISTA ACTUAL */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-3 min-h-[200px]">
              {redes.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">
                  No hay redes configuradas.
                </div>
              ) : (
                redes.map(red => (
                  <div key={red.id} className={`flex items-center justify-between p-3 border rounded-xl group transition-all
                    ${editandoRedId === red.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-black text-[#00689D] uppercase">{red.nombre}</span>
                      <a href={red.url} target="_blank" rel="noreferrer" className="text-sm text-gray-500 truncate hover:text-[#26BDE2] transition">
                        {red.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button 
                        onClick={() => iniciarEdicionRed(red)}
                        className="p-1.5 text-gray-400 hover:text-[#00689D] hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar red"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => eliminarRed(red.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar red"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FORMULARIO AGREGAR / EDITAR RED */}
            <div className={`p-4 rounded-2xl border transition-colors ${editandoRedId ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'} mt-auto`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                  {editandoRedId ? <><Edit2 className="w-3 h-3 text-blue-500"/> Editando Red</> : "Agregar Nueva"}
                </h3>
                {editandoRedId && (
                  <button onClick={cancelarEdicionRed} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <select 
                  value={nuevaRed.nombre}
                  onChange={(e) => setNuevaRed({...nuevaRed, nombre: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="X">X (Twitter)</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Otro">Otro</option>
                </select>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-3 w-3 text-gray-400" /></div>
                  <input 
                    type="url" placeholder="https://..."
                    value={nuevaRed.url}
                    onChange={(e) => setNuevaRed({...nuevaRed, url: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  {editandoRedId && (
                    <button 
                      onClick={cancelarEdicionRed}
                      className="flex-1 bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    onClick={guardarRed}
                    disabled={!nuevaRed.url || !sistema.id}
                    className={`flex-1 flex justify-center items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-sm
                      ${editandoRedId ? 'bg-[#00689D] hover:bg-[#061A2D]' : 'bg-[#26BDE2] hover:bg-[#1CA9CB]'}`}
                  >
                    {editandoRedId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                    {editandoRedId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}