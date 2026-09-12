import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Save, Plus, Trash2, Globe, Mail, Phone, MapPin, 
  Clock, Image as ImageIcon, Loader2, Link as LinkIcon,
  UploadCloud, Edit2, X
} from "lucide-react";

interface Sistema {
  id?: number;
  nombre: string;
  descripcion: string;
  logotipo: string;
  direccion: string;
  horario: string;
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

export default function CatalogoPrograma() {
  // ==========================================
  // ESTADOS DEL SISTEMA
  // ==========================================
  const [sistema, setSistema] = useState<Sistema>({
    nombre: "", descripcion: "", logotipo: "", direccion: "",
    horario: "", telefono: "", correo: "", sitio_web: ""
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // ESTADOS DE IMAGEN (Drag & Drop)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESTADOS DE REDES SOCIALES
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [nuevaRed, setNuevaRed] = useState({ nombre: "Facebook", url: "" });
  const [editandoRedId, setEditandoRedId] = useState<number | null>(null);

  // ESTADOS CONSTRUCTOR DE HORARIO
  const [rangoDias, setRangoDias] = useState("Lunes a Viernes");
  const [horaApertura, setHoraApertura] = useState("09:00");
  const [horaCierre, setHoraCierre] = useState("17:00");

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
        setSistema(dataSis);
        setImagePreview(dataSis.logotipo || null);

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
  // MANEJO DE IMAGEN LOGOTIPO
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };
  const processFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ==========================================
  // CONSTRUCTOR DE HORARIO
  // ==========================================
  useEffect(() => {
    // Si elige "Personalizado", dejamos que el usuario escriba lo que quiera en el input.
    // Si elige otra cosa, le construimos el string automáticamente.
    if (rangoDias !== "Personalizado") {
      setSistema(prev => ({
        ...prev,
        horario: `${rangoDias} de ${horaApertura} a ${horaCierre}`
      }));
    }
  }, [rangoDias, horaApertura, horaCierre]);


  // ==========================================
  // GUARDAR SISTEMA (Información General)
  // ==========================================
  const guardarSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    let finalImageUrl = sistema.logotipo;

    try {
      // 1. Subir imagen si hay una nueva
      if (imageFile) {
        setUploadingImage(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `logo_sistema_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, imageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
        setUploadingImage(false);
      }

      // 2. Guardar en BD
      const payload = {
        nombre: sistema.nombre,
        descripcion: sistema.descripcion,
        logotipo: finalImageUrl,
        direccion: sistema.direccion,
        horario: sistema.horario,
        telefono: sistema.telefono,
        correo: sistema.correo,
        sitio_web: sistema.sitio_web,
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
      setImageFile(null); // Limpiar el archivo pendiente
      cargarDatos(); // Recargar para obtener el ID si era nuevo
    } catch (error) {
      console.error("Error al guardar:", error);
      mostrarMensaje("Error al guardar la información", "error");
      setUploadingImage(false);
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
        // ACTUALIZAR RED EXISTENTE
        const { error } = await supabase
          .from("redes_sociales")
          .update({ nombre: nuevaRed.nombre, url: nuevaRed.url })
          .eq("id", editandoRedId);
        
        if (error) throw error;
        mostrarMensaje("Red social actualizada", "exito");
      } else {
        // AGREGAR NUEVA RED
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

  // Helper
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
        <p className="text-gray-500 text-sm">Gestiona la información pública, logotipos y redes sociales.</p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Información General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ZONA DE LOGOTIPO (Drag & Drop) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Logotipo Oficial</label>
                <div 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={handleDrop} 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-[#00689D] transition-colors cursor-pointer group"
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  {imagePreview ? (
                    <div className="relative flex flex-col items-center">
                      <img src={imagePreview} alt="Logo Preview" className="h-32 object-contain rounded-lg shadow-sm bg-white p-2" />
                      <p className="text-xs text-center mt-3 text-[#00689D] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Haz clic para cambiar la imagen</p>
                    </div>
                  ) : (
                    <div className="text-center flex flex-col items-center">
                      <div className="bg-white p-4 rounded-full text-gray-400 shadow-sm group-hover:bg-[#00689D] group-hover:text-white transition-colors mb-3">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-sm text-gray-700 font-semibold">Haz clic o arrastra el logotipo aquí</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG o SVG (Fondo transparente recomendado)</p>
                    </div>
                  )}
                </div>
              </div>

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

              {/* CONSTRUCTOR DE HORARIOS */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Horario de Atención</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 block mb-1">Días</span>
                    <select 
                      value={rangoDias} onChange={(e) => setRangoDias(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                    >
                      <option value="Lunes a Viernes">Lunes a Viernes</option>
                      <option value="Lunes a Sábado">Lunes a Sábado</option>
                      <option value="Todos los días">Todos los días</option>
                      <option value="Sábados y Domingos">Sábados y Domingos</option>
                      <option value="Personalizado">Personalizado...</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 block mb-1">Apertura</span>
                    <input 
                      type="time" disabled={rangoDias === "Personalizado"}
                      value={horaApertura} onChange={(e) => setHoraApertura(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 block mb-1">Cierre</span>
                    <input 
                      type="time" disabled={rangoDias === "Personalizado"}
                      value={horaCierre} onChange={(e) => setHoraCierre(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>

                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Clock className="h-4 w-4 text-gray-400" /></div>
                  <input 
                    type="text" 
                    value={sistema.horario} 
                    onChange={(e) => {
                      setSistema({...sistema, horario: e.target.value});
                      setRangoDias("Personalizado"); // Si escribe a mano, se cambia a personalizado
                    }}
                    placeholder="Ej. Lunes y Miércoles de 09:00 a 14:00..."
                    className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
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
                disabled={guardando || uploadingImage}
                className="flex items-center gap-2 bg-[#00689D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#061A2D] transition-colors disabled:opacity-50 shadow-md"
              >
                {(guardando || uploadingImage) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {uploadingImage ? "Subiendo Logo..." : "Guardar Información"}
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

            {/* FORMULARIO AGREGAR / EDITAR */}
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