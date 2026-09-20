// import React, { useState, useEffect, useRef } from "react";
// import { supabase } from "../../lib/supabase";
// import { 
//   Save, Plus, Trash2, Mail, Phone, MapPin, 
//   Clock, Loader2, Link as  UploadCloud, Edit2, X, Eye, EyeOff, ImageIcon, GripVertical, Check
// } from "lucide-react";
// import { toast } from "sonner";
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   rectSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// // ==========================================
// // INTERFACES 
// // ==========================================
// interface Horario {
//   etiqueta?: string;
//   dias: string;
//   horas: string;
// }

// interface Logotipos {
//   principal?: string;
//   blanco?: string;
//   isotipo?: string;
//   [key: string]: string | undefined;
// }

// interface Sistema {
//   id?: number;
//   nombre: string;
//   descripcion: string;
//   logotipos: Logotipos;
//   direccion: string;
//   horarios: Horario[];
//   telefono: string;
//   correo: string;
//   sitio_web: string;
// }

// interface RedSocial {
//   id: number;
//   sistema_id: number;
//   nombre: string;
//   url: string;
//   activo: boolean;
// }

// interface HeroBanner {
//   id?: string;
//   title: string;
//   description: string;
//   image_url: string;
//   cta_text: string;
//   cta_link: string;
//   is_active: boolean;
//   order_index: number;
// }

// // ==========================================
// // CONFIGURACIONES PREDEFINIDAS
// // ==========================================
// const TIPOS_LOGO = [
//   { id: 'principal', nombre: 'Principal (Color)', desc: 'Para fondos claros' },
//   { id: 'blanco', nombre: 'Alternativo (Blanco)', desc: 'Para footer y oscuros' },
//   { id: 'isotipo', nombre: 'Isotipo (Ícono)', desc: 'Favicon o avatares' }
// ];

// const PAGINAS_DISPONIBLES = [
//   { label: "Inicio (Home)", value: "/" },
//   { label: "Acerca del proyecto", value: "/acercade" },
//   { label: "Resultados", value: "/resultados" },
//   { label: "Convocatoria", value: "/convocatoria" },
//   { label: "Contacto", value: "/contacto" },
// ];

// const MAX_CHARS = {
//   title: 50,
//   description: 150
// };

// const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
//   const audio = new Audio('/notification.mp3');
//   audio.volume = 0.5;
//   audio.play().catch(err => console.log('Audio bloqueado:', err));

//   const options = { position: 'bottom-right' as const };
//   switch (type) {
//     case 'success': toast.success(message, options); break;
//     case 'error': toast.error(message, options); break;
//     case 'warning': toast.warning(message, options); break;
//     default: toast.info(message, options);
//   }
// };

// // ==========================================
// // COMPONENTE PARA DRAG & DROP (Tarjeta de Banner)
// // ==========================================
// function SortableBannerCard({ 
//   banner, toggleBannerActivo, iniciarEdicionBanner, setDialogoConfBanner, isReordering 
// }: { 
//   banner: HeroBanner; toggleBannerActivo: any; iniciarEdicionBanner: any; setDialogoConfBanner: any; isReordering: boolean;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id || 'temp' });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     zIndex: isDragging ? 50 : 'auto',
//   };

//   return (
//     <div 
//       ref={setNodeRef} 
//       style={style} 
//       className={`relative group overflow-hidden rounded-2xl border-2 transition-all 
//         ${isDragging ? 'shadow-xl scale-105 border-[#26BDE2]' : ''} 
//         ${!banner.is_active && !isDragging ? 'opacity-60 grayscale-[50%] border-gray-200' : 'border-transparent hover:border-[#26BDE2] shadow-sm'}
//         ${isReordering ? 'cursor-grab active:cursor-grabbing' : ''}
//       `}
//       {...(isReordering ? attributes : {})} 
//       {...(isReordering ? listeners : {})}
//     >
//       <div className="aspect-video w-full relative pointer-events-none">
//         <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
//           <span className="text-[10px] font-bold text-white bg-black/50 w-fit px-2 py-0.5 rounded-full mb-1">Orden: {banner.order_index}</span>
//           <h4 className="text-white font-bold text-sm truncate">{banner.title.replace('\n', ' ')}</h4>
//         </div>
//       </div>
      
//       {!isReordering && (
//         <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
//           <button type="button" onClick={() => toggleBannerActivo(banner)} className={`p-1.5 rounded-lg ${banner.is_active ? 'text-green-600' : 'text-gray-500'}`}>{banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
//           <button type="button" onClick={() => iniciarEdicionBanner(banner)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
//           <button type="button" onClick={() => setDialogoConfBanner({ isOpen: true, idBanner: banner.id || null })} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
//         </div>
//       )}

//       {isReordering && (
//         <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-xl text-gray-500 shadow-sm">
//           <GripVertical size={20} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default function CatalogoPrograma() {
//   const [sistema, setSistema] = useState<Sistema>({
//     nombre: "", descripcion: "", direccion: "",
//     telefono: "", correo: "", sitio_web: "",
//     logotipos: {}, horarios: []
//   });
//   const [cargando, setCargando] = useState(true);
//   const [guardando, setGuardando] = useState(false);

//   const [archivosLogo, setArchivosLogo] = useState<Record<string, File>>({});
//   const [previewsLogo, setPreviewsLogo] = useState<Logotipos>({}); 
//   const fileInputRefs = { principal: useRef<HTMLInputElement>(null), blanco: useRef<HTMLInputElement>(null), isotipo: useRef<HTMLInputElement>(null) };

//   const [nuevoHorario, setNuevoHorario] = useState<Horario>({ etiqueta: "", dias: "Lunes a Viernes", horas: "" });
//   const [redes, setRedes] = useState<RedSocial[]>([]);
//   const [nuevaRed, setNuevaRed] = useState({ nombre: "Facebook", url: "" });
//   const [editandoRedId, setEditandoRedId] = useState<number | null>(null);

//   // ==========================================
//   // ESTADOS DE BANNERS
//   // ==========================================
//   const [banners, setBanners] = useState<HeroBanner[]>([]);
//   const bannerVacio: HeroBanner = { title: "", description: "", image_url: "", cta_text: "Conoce el proyecto", cta_link: "", is_active: true, order_index: 1 };
//   const [formBanner, setFormBanner] = useState<HeroBanner>(bannerVacio);
//   const [archivoBanner, setArchivoBanner] = useState<File | null>(null);
//   const [previewBanner, setPreviewBanner] = useState<string>("");
//   const [editandoBannerId, setEditandoBannerId] = useState<string | null>(null);
//   const [guardandoBanner, setGuardandoBanner] = useState(false);
//   const bannerFileInputRef = useRef<HTMLInputElement>(null);
  
//   const [usaEnlacePersonalizado, setUsaEnlacePersonalizado] = useState(false);
//   const [ordenesOcupados, setOrdenesOcupados] = useState<number[]>([]);

//   // Estados Drag & Drop
//   const [isReordering, setIsReordering] = useState(false);
//   const [isSavingOrder, setIsSavingOrder] = useState(false);

//   const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{ isOpen: boolean; idRed: number | null; }>({ isOpen: false, idRed: null });
//   const [dialogoConfBanner, setDialogoConfBanner] = useState<{ isOpen: boolean; idBanner: string | null; }>({ isOpen: false, idBanner: null });
//   const [, setIsProcessingAction] = useState(false);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   // ==========================================
//   // CARGA DE DATOS
//   // ==========================================
//   useEffect(() => {
//     cargarDatos();
//   }, []);

//   const cargarDatos = async () => {
//     setCargando(true);
//     try {
//       const { data: dataSis, error: errSis } = await supabase.from("sistemas").select("*").eq("activo", true).maybeSingle();
//       if (errSis) throw errSis;
//       if (dataSis) {
//         setSistema({ ...dataSis, logotipos: dataSis.logotipos || {}, horarios: Array.isArray(dataSis.horarios) ? dataSis.horarios : [] });
//         setPreviewsLogo(dataSis.logotipos || {});
//         const { data: dataRedes } = await supabase.from("redes_sociales").select("*").eq("sistema_id", dataSis.id).order("id", { ascending: true });
//         if (dataRedes) setRedes(dataRedes);
//       }
      
//       const { data: dataBanners, error: errBanners } = await supabase.from("hero_banners").select("*").order("order_index", { ascending: true });
//       if (errBanners) throw errBanners;
      
//       if (dataBanners) {
//         setBanners(dataBanners);
//         const ocupados = dataBanners.map(b => b.order_index);
//         setOrdenesOcupados(ocupados);
//         let siguienteOrden = 1;
//         while (ocupados.includes(siguienteOrden)) { siguienteOrden++; }
//         setFormBanner(prev => ({ ...prev, order_index: siguienteOrden }));
//       }
//     } catch (error) {
//       notifyWithSound("Error al cargar la información", "error");
//     } finally {
//       setCargando(false);
//     }
//   };

//   // ==========================================
//   // LÓGICA DRAG & DROP BANNERS
//   // ==========================================
//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (over && active.id !== over.id) {
//       setBanners((items) => {
//         const oldIndex = items.findIndex(item => item.id === active.id);
//         const newIndex = items.findIndex(item => item.id === over.id);
//         const nuevoArreglo = arrayMove(items, oldIndex, newIndex);
//         return nuevoArreglo.map((item, index) => ({ ...item, order_index: index + 1 }));
//       });
//     }
//   };

//   const guardarNuevoOrden = async () => {
//     setIsSavingOrder(true);
//     try {
//       const promesas = banners.map((banner, index) => 
//         supabase.from("hero_banners").update({ order_index: index + 1 }).eq("id", banner.id)
//       );
//       await Promise.all(promesas);
      
//       notifyWithSound("Orden guardado exitosamente", "success");
//       setIsReordering(false);
//       cargarDatos();
//     } catch (error) {
//       notifyWithSound("Error al guardar el nuevo orden", "error");
//     } finally {
//       setIsSavingOrder(false);
//     }
//   };

//   // ==========================================
//   // MÉTODOS DE BANNERS
//   // ==========================================
//   const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setArchivoBanner(e.target.files[0]);
//       setPreviewBanner(URL.createObjectURL(e.target.files[0]));
//     }
//   };

//   const guardarBanner = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!archivoBanner && !formBanner.image_url) { 
//       notifyWithSound("Debes seleccionar una imagen de fondo", "warning"); 
//       return; 
//     }
//     setGuardandoBanner(true);

//     try {
//       let finalImageUrl = formBanner.image_url;
      
//       if (archivoBanner) {
//         if (formBanner.image_url && formBanner.image_url.includes('imagenes/')) {
//           const oldFileName = formBanner.image_url.split('/').pop();
//           if (oldFileName) {
//             await supabase.storage.from('imagenes').remove([oldFileName]).catch((err) => {
//               console.warn("No se pudo borrar la imagen residual:", err);
//             });
//           }
//         }
//         const fileExt = archivoBanner.name.split('.').pop();
//         const fileName = `banner_${Date.now()}.${fileExt}`;
//         const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, archivoBanner);
//         if (uploadError) throw uploadError;
//         finalImageUrl = supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl;
//       }

//       const { id, ...datosLimpios } = formBanner;
//       const payload = { ...datosLimpios, image_url: finalImageUrl };

//       if (editandoBannerId) {
//         const { error } = await supabase.from("hero_banners").update(payload).eq("id", editandoBannerId);
//         if (error) throw error;
//         notifyWithSound("Banner actualizado correctamente", "success");
//       } else {
//         const { error } = await supabase.from("hero_banners").insert([payload]);
//         if (error) throw error;
//         notifyWithSound("Banner agregado correctamente", "success");
//       }

//       cancelarEdicionBanner(); 
//       cargarDatos();

//     } catch (error: any) { 
//       notifyWithSound(`Error: ${error.message || "No se pudo guardar el banner"}`, "error"); 
//     } finally { 
//       setGuardandoBanner(false); 
//     }
//   };

//   const iniciarEdicionBanner = (banner: HeroBanner) => {
//     setEditandoBannerId(banner.id || null);
//     setFormBanner(banner);
//     setArchivoBanner(null);
//     setPreviewBanner(banner.image_url);
//     const esPredefinido = PAGINAS_DISPONIBLES.some(p => p.value === banner.cta_link);
//     setUsaEnlacePersonalizado(!esPredefinido);
//     setOrdenesOcupados(prev => prev.filter(o => o !== banner.order_index));
//     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//   };

//   const cancelarEdicionBanner = () => {
//     setEditandoBannerId(null);
//     let siguienteOrden = 1;
//     const todosOcupados = banners.map(b => b.order_index);
//     while (todosOcupados.includes(siguienteOrden)) { siguienteOrden++; }
//     setFormBanner({ ...bannerVacio, order_index: siguienteOrden });
//     setArchivoBanner(null);
//     setPreviewBanner("");
//     setUsaEnlacePersonalizado(false);
//     setOrdenesOcupados(todosOcupados);
//     if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
//   };

//   const toggleBannerActivo = async (banner: HeroBanner) => {
//     try {
//       await supabase.from("hero_banners").update({ is_active: !banner.is_active }).eq("id", banner.id);
//       notifyWithSound(`Banner ${banner.is_active ? 'desactivado' : 'activado'}`, "success");
//       setBanners(banners.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
//     } catch (error) { notifyWithSound("Error al cambiar estado", "error"); }
//   };

//   const ejecutarEliminarBanner = async () => {
//     if (!dialogoConfBanner.idBanner) return;
//     setIsProcessingAction(true);
//     try {
//       const bannerToDelete = banners.find(b => b.id === dialogoConfBanner.idBanner);
//       if (bannerToDelete && bannerToDelete.image_url.includes('imagenes/')) {
//         const oldFileName = bannerToDelete.image_url.split('/').pop();
//         if (oldFileName) await supabase.storage.from('imagenes').remove([oldFileName]).catch(() => {});
//       }
//       await supabase.from("hero_banners").delete().eq("id", dialogoConfBanner.idBanner);
//       setBanners(banners.filter(b => b.id !== dialogoConfBanner.idBanner));
//       notifyWithSound("Banner eliminado", "success");
//       cargarDatos();
//     } catch (error) { notifyWithSound("Error al eliminar", "error"); } 
//     finally { setIsProcessingAction(false); setDialogoConfBanner({ isOpen: false, idBanner: null }); }
//   };

//   // MÉTODOS SISTEMA Y REDES
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipoId: string) => { if (e.target.files && e.target.files[0]) processFile(e.target.files[0], tipoId); };
//   const handleDrop = (e: React.DragEvent<HTMLDivElement>, tipoId: string) => { e.preventDefault(); if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0], tipoId); };
//   const processFile = (file: File, tipoId: string) => { setArchivosLogo(prev => ({ ...prev, [tipoId]: file })); setPreviewsLogo(prev => ({ ...prev, [tipoId]: URL.createObjectURL(file) })); };
  
//   const guardarSistema = async (e: React.FormEvent) => { 
//     e.preventDefault(); setGuardando(true); 
//     try { 
//       let logotiposFinales = { ...sistema.logotipos }; 
//       const uploadPromises = Object.entries(archivosLogo).map(async ([tipoId, file]) => { 
//         const urlVieja = sistema.logotipos[tipoId]; 
//         if (urlVieja) { 
//           const urlParts = urlVieja.split('/'); const oldFileName = urlParts[urlParts.length - 1]; 
//           if (oldFileName) await supabase.storage.from('imagenes').remove([oldFileName]).catch(() => {}); 
//         } 
//         const fileName = `logo_${tipoId}_${Date.now()}.${file.name.split('.').pop()}`; 
//         await supabase.storage.from('imagenes').upload(fileName, file); 
//         logotiposFinales[tipoId] = supabase.storage.from('imagenes').getPublicUrl(fileName).data.publicUrl; 
//       }); 
//       await Promise.all(uploadPromises); 
//       const payload = { ...sistema, logotipos: logotiposFinales, fecha_actualizacion: new Date().toISOString() }; 
//       if (sistema.id) { await supabase.from("sistemas").update(payload).eq("id", sistema.id); } 
//       else { await supabase.from("sistemas").insert([{ ...payload, activo: true }]); } 
//       notifyWithSound("Información general actualizada", "success"); 
//       setArchivosLogo({}); setSistema(prev => ({ ...prev, logotipos: logotiposFinales })); 
//     } catch (error) { notifyWithSound("Error al guardar la información", "error"); } 
//     finally { setGuardando(false); } 
//   };

//   const agregarHorario = () => { if (!nuevoHorario.horas) return; setSistema(prev => ({ ...prev, horarios: [...prev.horarios, nuevoHorario] })); setNuevoHorario({ etiqueta: "", dias: "Lunes a Viernes", horas: "" }); };
//   const eliminarHorario = (index: number) => { setSistema(prev => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== index) })); };
  
//   const guardarRed = async () => { 
//     if (!nuevaRed.url || !sistema.id) return;
//     try {
//       if (editandoRedId) {
//         await supabase.from("redes_sociales").update({ nombre: nuevaRed.nombre, url: nuevaRed.url }).eq("id", editandoRedId);
//         notifyWithSound("Red social actualizada con éxito", "success");
//       } else {
//         await supabase.from("redes_sociales").insert([{ sistema_id: sistema.id, nombre: nuevaRed.nombre, url: nuevaRed.url, activo: true }]);
//         notifyWithSound("Red social agregada con éxito", "success");
//       }
//       setEditandoRedId(null); setNuevaRed({ nombre: "Facebook", url: "" }); cargarDatos();
//     } catch (error) { notifyWithSound("Error al procesar la red social", "error"); }
//   };
  
//   const iniciarEdicionRed = (red: RedSocial) => { setEditandoRedId(red.id); setNuevaRed({ nombre: red.nombre, url: red.url }); };
//   const ejecutarEliminarRed = async () => { 
//     if (!dialogoConfirmacion.idRed) return;
//     setIsProcessingAction(true);
//     try {
//       await supabase.from("redes_sociales").delete().eq("id", dialogoConfirmacion.idRed);
//       setRedes(redes.filter(r => r.id !== dialogoConfirmacion.idRed));
//       notifyWithSound("Red social eliminada", "success");
//     } catch (error) { notifyWithSound("Error al eliminar la red social", "error"); }
//     finally { setIsProcessingAction(false); setDialogoConfirmacion({ isOpen: false, idRed: null }); }
//   };

//   if (cargando && !sistema.nombre) {
//     return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#00689D] w-10 h-10" /></div>;
//   }

//   const opcionesOrden = Array.from({ length: 10 }, (_, i) => i + 1);

//   return (
//     <div className="w-full pb-20">
//       <div className="mb-8">
//         <h1 className="text-2xl font-black text-[#061A2D]">Configuración del Programa</h1>
//         <p className="text-gray-500 text-sm">Gestiona la información pública, variaciones de logotipo y banners.</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* ================= DATOS GENERALES ================= */}
//         <div className="lg:col-span-2 space-y-6">
//           <form onSubmit={guardarSistema} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
//             <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Identidad Gráfica</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//               {TIPOS_LOGO.map((tipo) => (
//                 <div key={tipo.id} className="flex flex-col">
//                   <span className="text-xs font-bold text-gray-700 mb-1">{tipo.nombre}</span>
//                   <span className="text-[10px] text-gray-400 mb-2">{tipo.desc}</span>
//                   <div 
//                     onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, tipo.id)} onClick={() => fileInputRefs[tipo.id as keyof typeof fileInputRefs].current?.click()}
//                     className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer group relative min-h-[120px] ${tipo.id === 'blanco' ? 'bg-gray-800 border-gray-600 hover:border-[#26BDE2]' : 'bg-gray-50 border-gray-200 hover:border-[#00689D]'}`}
//                   >
//                     <input type="file" accept="image/*" className="hidden" ref={fileInputRefs[tipo.id as keyof typeof fileInputRefs]} onChange={(e) => handleFileChange(e, tipo.id)} />
//                     {previewsLogo[tipo.id] ? (
//                       <><img src={previewsLogo[tipo.id]} alt={`Logo`} className="max-h-16 object-contain" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"><span className="text-white text-[10px] font-bold tracking-wider uppercase">Cambiar</span></div></>
//                     ) : (
//                       <div className="text-center flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity"><UploadCloud size={24} className={tipo.id === 'blanco' ? 'text-white' : 'text-gray-400'} /><span className={`text-[10px] mt-2 ${tipo.id === 'blanco' ? 'text-white' : 'text-gray-500'}`}>Subir imagen</span></div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Información de Contacto</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Programa</label>
//                 <input type="text" required value={sistema.nombre} onChange={(e) => setSistema({...sistema, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50" />
//               </div>
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción (Bio)</label>
//                 <textarea rows={3} value={sistema.descripcion} onChange={(e) => setSistema({...sistema, descripcion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50 resize-none" />
//               </div>

//               <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
//                 <label className="block text-xs font-bold text-[#00689D] uppercase tracking-wider mb-4 flex items-center gap-2"><Clock size={16} /> Horarios</label>
//                 {sistema.horarios.length > 0 && (
//                   <div className="mb-4 space-y-2">
//                     {sistema.horarios.map((h, i) => (
//                       <div key={i} className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg text-sm">
//                         <div>{h.etiqueta && <span className="font-bold text-gray-700 mr-2">{h.etiqueta}:</span>}<span className="text-gray-600">{h.dias}, <span className="font-medium text-[#00689D]">{h.horas}</span></span></div>
//                         <button type="button" onClick={() => eliminarHorario(i)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end bg-white p-3 rounded-lg border border-gray-200">
//                   <div className="flex-1 w-full"><span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Etiqueta</span><input type="text" value={nuevoHorario.etiqueta} onChange={e => setNuevoHorario({...nuevoHorario, etiqueta: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm" /></div>
//                   <div className="flex-1 w-full"><span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Días</span><select value={nuevoHorario.dias} onChange={e => setNuevoHorario({...nuevoHorario, dias: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm"><option>Lunes a Viernes</option><option>Sábados y Domingos</option></select></div>
//                   <div className="flex-1 w-full"><span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Horas</span><input type="text" placeholder="09:00 - 17:00" value={nuevoHorario.horas} onChange={e => setNuevoHorario({...nuevoHorario, horas: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm" /></div>
//                   <button type="button" onClick={agregarHorario} className="bg-[#26BDE2] text-white p-2 rounded-md hover:bg-[#1CA9CB] w-full sm:w-auto"><Plus size={18} /></button>
//                 </div>
//               </div>

//               <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dirección</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div><input type="text" value={sistema.direccion} onChange={(e) => setSistema({...sistema, direccion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50" /></div></div>
//               <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div><input type="text" value={sistema.telefono} onChange={(e) => setSistema({...sistema, telefono: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50" /></div></div>
//               <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div><input type="email" value={sistema.correo} onChange={(e) => setSistema({...sistema, correo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50" /></div></div>
//             </div>

//             <div className="mt-8 flex justify-end">
//               <button type="submit" disabled={guardando} className="flex items-center gap-2 bg-[#00689D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#061A2D] transition-colors disabled:opacity-50 shadow-md">
//                 {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Guardar
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* ================= GESTOR REDES SOCIALES ================= */}
//         <div className="lg:col-span-1 space-y-6">
//           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
//             <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Redes Sociales</h2>
//             <div className="flex-1 overflow-y-auto mb-6 space-y-3 min-h-[200px]">
//               {redes.length === 0 ? (
//                 <div className="text-center text-sm text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">No hay redes configuradas.</div>
//               ) : (
//                 redes.map(red => (
//                   <div key={red.id} className={`flex items-center justify-between p-3 border rounded-xl group ${editandoRedId === red.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
//                     <div className="flex flex-col overflow-hidden"><span className="text-xs font-black text-[#00689D]">{red.nombre}</span><span className="text-xs text-gray-500 truncate">{red.url}</span></div>
//                     <div className="flex items-center gap-1">
//                       <button type="button" onClick={() => iniciarEdicionRed(red)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
//                       <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: true, idRed: red.id })} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
            
//             <div className="p-4 rounded-2xl border bg-gray-50">
//               <h3 className="text-xs font-bold text-gray-600 mb-3">{editandoRedId ? "Editando Red" : "Agregar Nueva"}</h3>
//               <div className="space-y-3">
//                 <select value={nuevaRed.nombre} onChange={(e) => setNuevaRed({...nuevaRed, nombre: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"><option>Facebook</option><option>Instagram</option><option>LinkedIn</option></select>
//                 <input type="url" placeholder="URL" value={nuevaRed.url} onChange={(e) => setNuevaRed({...nuevaRed, url: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm" />
//                 <button type="button" onClick={guardarRed} className="w-full bg-[#26BDE2] text-white py-2 rounded-xl text-sm font-bold">{editandoRedId ? "Actualizar" : "Agregar"}</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ==========================================
//           SECCIÓN: BANNERS (CARRUSEL INICIO)
//       ========================================== */}
//       <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800 mb-1">Banners del Carrusel (Inicio)</h2>
//             <p className="text-gray-500 text-sm">Controla las imágenes y textos principales que se muestran en el Hero.</p>
//           </div>
          
//           {/* BOTONES DE REORGANIZAR */}
//           {banners.length > 1 && (
//             <div className="mt-4 sm:mt-0">
//               {isReordering ? (
//                 <div className="flex gap-2">
//                   <button onClick={() => { setIsReordering(false); cargarDatos(); }} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">
//                     Cancelar
//                   </button>
//                   <button onClick={guardarNuevoOrden} disabled={isSavingOrder} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50">
//                     {isSavingOrder ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
//                     Guardar Orden
//                   </button>
//                 </div>
//               ) : (
//                 <button onClick={() => { setIsReordering(true); cancelarEdicionBanner(); }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
//                   <GripVertical size={16} /> Reorganizar
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           <div className="lg:col-span-2 space-y-4">
//             {banners.length === 0 ? (
//               <div className="text-center text-sm text-gray-400 py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
//                 Aún no has agregado banners al carrusel.
//               </div>
//             ) : (
//               // IMPLEMENTACIÓN DEL DND-KIT (Arrastrar y Soltar)
//               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                 <SortableContext items={banners.map(b => b.id || '')} strategy={rectSortingStrategy}>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {banners.map(banner => (
//                       <SortableBannerCard 
//                         key={banner.id} 
//                         banner={banner} 
//                         toggleBannerActivo={toggleBannerActivo} 
//                         iniciarEdicionBanner={iniciarEdicionBanner} 
//                         setDialogoConfBanner={setDialogoConfBanner} 
//                         isReordering={isReordering} 
//                       />
//                     ))}
//                   </div>
//                 </SortableContext>
//               </DndContext>
//             )}
//           </div>

//           {/* COLUMNA DERECHA: FORMULARIO */}
//           <div className="lg:col-span-1 relative">
            
//             {/* Overlay bloqueador mientras reorganizas */}
//             {isReordering && (
//               <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300">
//                 <GripVertical size={32} className="text-gray-400 mb-2 opacity-50" />
//                 <span className="text-gray-600 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm">
//                   Guarda el orden para editar
//                 </span>
//               </div>
//             )}

//             <form onSubmit={guardarBanner} className={`p-5 rounded-2xl border transition-colors ${editandoBannerId ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
//                   {editandoBannerId ? <><Edit2 className="w-4 h-4 text-blue-500"/> Editando Banner</> : <><Plus className="w-4 h-4 text-[#26BDE2]"/> Nuevo Banner</>}
//                 </h3>
//                 {editandoBannerId && <button type="button" onClick={cancelarEdicionBanner} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>}
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Imagen de fondo</label>
//                   <div onClick={() => bannerFileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#00689D] relative flex flex-col items-center justify-center bg-white">
//                     <input type="file" accept="image/*" className="hidden" ref={bannerFileInputRef} onChange={handleBannerFileChange} />
//                     {previewBanner ? <img src={previewBanner} className="w-full h-full object-cover" /> : <><ImageIcon className="w-8 h-8 text-gray-400 mb-2" /><span className="text-xs text-gray-500">Clic para subir imagen</span></>}
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-end mb-1">
//                     <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Título principal</label>
//                     <span className={`text-[10px] font-bold ${formBanner.title.length >= MAX_CHARS.title ? 'text-red-500' : 'text-gray-400'}`}>
//                       {formBanner.title.length}/{MAX_CHARS.title}
//                     </span>
//                   </div>
//                   <textarea 
//                     required maxLength={MAX_CHARS.title} rows={2} placeholder="Ej. Juventudes&#10;que transforman."
//                     value={formBanner.title} onChange={(e) => setFormBanner({...formBanner, title: e.target.value})} 
//                     className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50 resize-none" 
//                   />
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-end mb-1">
//                     <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Descripción (Opcional)</label>
//                     <span className={`text-[10px] font-bold ${formBanner.description.length >= MAX_CHARS.description ? 'text-red-500' : 'text-gray-400'}`}>
//                       {formBanner.description.length}/{MAX_CHARS.description}
//                     </span>
//                   </div>
//                   <textarea 
//                     maxLength={MAX_CHARS.description} rows={3} placeholder="Breve texto descriptivo..."
//                     value={formBanner.description} onChange={(e) => setFormBanner({...formBanner, description: e.target.value})} 
//                     className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50 resize-none" 
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 gap-3">
//                   <div>
//                     <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Texto del Botón</label>
//                     <input type="text" required placeholder="Ej. Conoce más" value={formBanner.cta_text} onChange={(e) => setFormBanner({...formBanner, cta_text: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50" />
//                   </div>
                  
//                   <div>
//                     <div className="flex justify-between items-center mb-1">
//                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Enlace a donde dirigirá</label>
//                       <button type="button" onClick={() => { setUsaEnlacePersonalizado(!usaEnlacePersonalizado); setFormBanner({...formBanner, cta_link: ""}); }} className="text-[10px] text-[#26BDE2] hover:underline font-bold">
//                         {usaEnlacePersonalizado ? "Usar lista" : "Escribir manual"}
//                       </button>
//                     </div>

//                     {usaEnlacePersonalizado ? (
//                       <input type="text" required placeholder="Ej. https://..." value={formBanner.cta_link} onChange={(e) => setFormBanner({...formBanner, cta_link: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50" />
//                     ) : (
//                       <select required value={formBanner.cta_link} onChange={(e) => setFormBanner({...formBanner, cta_link: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50">
//                         <option value="" disabled>Selecciona una página...</option>
//                         {PAGINAS_DISPONIBLES.map(pagina => (<option key={pagina.value} value={pagina.value}>{pagina.label}</option>))}
//                       </select>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 items-center pt-2">
//                   <div>
//                     <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Orden de aparición</label>
//                     <select required value={formBanner.order_index} onChange={(e) => setFormBanner({...formBanner, order_index: parseInt(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50">
//                       {opcionesOrden.map(num => (
//                         <option key={num} value={num} disabled={ordenesOcupados.includes(num) && formBanner.order_index !== num}>
//                           {num} {ordenesOcupados.includes(num) && formBanner.order_index !== num ? "(Ocupado)" : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="flex flex-col items-end justify-center pt-3">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Activo</span>
//                       <input type="checkbox" checked={formBanner.is_active} onChange={(e) => setFormBanner({...formBanner, is_active: e.target.checked})} className="w-4 h-4 text-[#26BDE2] rounded" />
//                     </label>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 pt-4 border-t border-gray-200">
//                   {editandoBannerId && <button type="button" onClick={cancelarEdicionBanner} className="flex-1 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold">Cancelar</button>}
//                   <button type="submit" disabled={guardandoBanner || isReordering} className={`flex-1 flex justify-center items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold ${editandoBannerId ? 'bg-[#00689D]' : 'bg-[#26BDE2]'} disabled:opacity-50`}>
//                     {guardandoBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : (editandoBannerId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)} {editandoBannerId ? "Actualizar" : "Agregar"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {dialogoConfBanner.isOpen && (
//         <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
//             <h3 className="text-xl font-bold mb-2">Eliminar Banner</h3>
//             <p className="text-sm text-gray-600 mb-6">¿Estás seguro de que deseas eliminar permanentemente este banner?</p>
//             <div className="flex gap-3 w-full">
//               <button type="button" onClick={() => setDialogoConfBanner({ isOpen: false, idBanner: null })} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-700">Cancelar</button>
//               <button type="button" onClick={ejecutarEliminarBanner} className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white">Sí, eliminar</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {dialogoConfirmacion.isOpen && (
//         <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
//             <h3 className="text-xl font-bold mb-2">Eliminar Red Social</h3>
//             <p className="text-sm text-gray-600 mb-6">¿Estás seguro de eliminar esta red?</p>
//             <div className="flex gap-3 w-full">
//               <button type="button" onClick={() => setDialogoConfirmacion({ isOpen: false, idRed: null })} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-700">Cancelar</button>
//               <button type="button" onClick={ejecutarEliminarRed} className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white">Sí, eliminar</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  Save,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Loader2,
  UploadCloud,
  Edit2,
  X,
  Eye,
  EyeOff,
  ImageIcon,
  GripVertical,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// ==========================================
// INTERFACES
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

interface HeroBanner {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  order_index: number;
}

// ==========================================
// CONFIGURACIONES
// ==========================================

const TIPOS_LOGO = [
  {
    id: "principal",
    nombre: "Principal (Color)",
    desc: "Para fondos claros",
  },
  {
    id: "blanco",
    nombre: "Alternativo (Blanco)",
    desc: "Para footer y oscuros",
  },
  {
    id: "isotipo",
    nombre: "Isotipo (Ícono)",
    desc: "Favicon o avatares",
  },
];

const PAGINAS_DISPONIBLES = [
  { label: "Inicio (Home)", value: "/" },
  { label: "Acerca del proyecto", value: "/acercade" },
  { label: "Resultados", value: "/resultados" },
  { label: "Convocatoria", value: "/convocatoria" },
  { label: "Contacto", value: "/contacto" },
];

const MAX_CHARS = {
  title: 50,
  description: 150,
};

const OPCIONES_ORDEN = Array.from(
  { length: 10 },
  (_, index) => index + 1
);

// ==========================================
// NOTIFICACIONES
// ==========================================

const notifyWithSound = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {
    // El sonido es opcional.
  }

  const options = {
    position: "bottom-right" as const,
  };

  switch (type) {
    case "success":
      toast.success(message, options);
      break;

    case "error":
      toast.error(message, options);
      break;

    case "warning":
      toast.warning(message, options);
      break;

    default:
      toast.info(message, options);
      break;
  }
};

// ==========================================
// UTILIDADES
// ==========================================

const obtenerNombreArchivoStorage = (url?: string | null) => {
  if (!url) return null;

  try {
    const partes = url.split("/");
    const ultimo = partes[partes.length - 1];

    return ultimo ? decodeURIComponent(ultimo) : null;
  } catch {
    return null;
  }
};

const esUrlValida = (url: string) => {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
};

// ==========================================
// COMPONENTE SORTABLE
// ==========================================

interface SortableBannerCardProps {
  banner: HeroBanner;
  toggleBannerActivo: (banner: HeroBanner) => void;
  iniciarEdicionBanner: (banner: HeroBanner) => void;
  setDialogoConfBanner: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      idBanner: string | null;
    }>
  >;
  isReordering: boolean;
}

function SortableBannerCard({
  banner,
  toggleBannerActivo,
  iniciarEdicionBanner,
  setDialogoConfBanner,
  isReordering,
}: SortableBannerCardProps) {
  const sortableId = banner.id || `banner-${banner.order_index}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group overflow-hidden rounded-2xl border-2 transition-all
        ${
          isDragging
            ? "shadow-xl scale-105 border-[#26BDE2]"
            : ""
        }
        ${
          !banner.is_active && !isDragging
            ? "opacity-60 grayscale-[50%] border-gray-200"
            : "border-transparent hover:border-[#26BDE2] shadow-sm"
        }
        ${isReordering ? "cursor-grab active:cursor-grabbing" : ""}
      `}
      {...(isReordering ? attributes : {})}
      {...(isReordering ? listeners : {})}
    >
      <div className="aspect-video w-full relative pointer-events-none">
        <img
          src={banner.image_url}
          alt={banner.title || "Banner"}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
          <span className="text-[10px] font-bold text-white bg-black/50 w-fit px-2 py-0.5 rounded-full mb-1">
            Orden: {banner.order_index}
          </span>

          <h4 className="text-white font-bold text-sm truncate">
            {(banner.title || "Sin título").replace(/\n/g, " ")}
          </h4>
        </div>
      </div>

      {!isReordering && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur p-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            type="button"
            onClick={() => toggleBannerActivo(banner)}
            className={`p-1.5 rounded-lg ${
              banner.is_active
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title={
              banner.is_active
                ? "Desactivar banner"
                : "Activar banner"
            }
          >
            {banner.is_active ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => iniciarEdicionBanner(banner)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
            title="Editar banner"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setDialogoConfBanner({
                isOpen: true,
                idBanner: banner.id || null,
              })
            }
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
            title="Eliminar banner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isReordering && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-xl text-gray-500 shadow-sm pointer-events-none">
          <GripVertical size={20} />
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function CatalogoPrograma() {
  // ==========================================
  // SISTEMA
  // ==========================================

  const [sistema, setSistema] = useState<Sistema>({
    nombre: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    correo: "",
    sitio_web: "",
    logotipos: {},
    horarios: [],
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ==========================================
  // LOGOTIPOS
  // ==========================================

  const [archivosLogo, setArchivosLogo] = useState<
    Record<string, File>
  >({});

  const [previewsLogo, setPreviewsLogo] =
    useState<Logotipos>({});

  const fileInputRefs = {
    principal: useRef<HTMLInputElement>(null),
    blanco: useRef<HTMLInputElement>(null),
    isotipo: useRef<HTMLInputElement>(null),
  };

  // ==========================================
  // HORARIOS
  // ==========================================

  const [nuevoHorario, setNuevoHorario] =
    useState<Horario>({
      etiqueta: "",
      dias: "Lunes a Viernes",
      horas: "",
    });

  // ==========================================
  // REDES SOCIALES
  // ==========================================

  const [redes, setRedes] = useState<RedSocial[]>([]);

  const [nuevaRed, setNuevaRed] = useState({
    nombre: "Facebook",
    url: "",
  });

  const [editandoRedId, setEditandoRedId] =
    useState<number | null>(null);

  // ==========================================
  // BANNERS
  // ==========================================

  const bannerVacio: HeroBanner = {
    title: "",
    description: "",
    image_url: "",
    cta_text: "Conoce el proyecto",
    cta_link: "",
    is_active: true,
    order_index: 1,
  };

  const [banners, setBanners] =
    useState<HeroBanner[]>([]);

  const [formBanner, setFormBanner] =
    useState<HeroBanner>(bannerVacio);

  const [archivoBanner, setArchivoBanner] =
    useState<File | null>(null);

  const [previewBanner, setPreviewBanner] =
    useState("");

  const [editandoBannerId, setEditandoBannerId] =
    useState<string | null>(null);

  const [guardandoBanner, setGuardandoBanner] =
    useState(false);

  const bannerFileInputRef =
    useRef<HTMLInputElement>(null);

  const [
    usaEnlacePersonalizado,
    setUsaEnlacePersonalizado,
  ] = useState(false);

  const [ordenesOcupados, setOrdenesOcupados] =
    useState<number[]>([]);

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const [isReordering, setIsReordering] =
    useState(false);

  const [isSavingOrder, setIsSavingOrder] =
    useState(false);

  // ==========================================
  // MODALES
  // ==========================================

  const [dialogoConfirmacion, setDialogoConfirmacion] =
    useState<{
      isOpen: boolean;
      idRed: number | null;
    }>({
      isOpen: false,
      idRed: null,
    });

  const [dialogoConfBanner, setDialogoConfBanner] =
    useState<{
      isOpen: boolean;
      idBanner: string | null;
    }>({
      isOpen: false,
      idBanner: null,
    });

  const [isProcessingAction, setIsProcessingAction] =
    useState(false);

  // ==========================================
  // SENSORES DND
  // ==========================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ==========================================
  // CARGA INICIAL
  // ==========================================

  useEffect(() => {
    cargarDatos();
  }, []);

  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const cargarDatos = async () => {
    setCargando(true);

    try {
      // ------------------------------------------
      // SISTEMA
      // ------------------------------------------

      const {
        data: dataSis,
        error: errSis,
      } = await supabase
        .from("sistemas")
        .select("*")
        .eq("activo", true)
        .maybeSingle();

      if (errSis) {
        throw errSis;
      }

      if (dataSis) {
        const sistemaNormalizado: Sistema = {
          ...dataSis,
          logotipos: dataSis.logotipos || {},
          horarios: Array.isArray(dataSis.horarios)
            ? dataSis.horarios
            : [],
        };

        setSistema(sistemaNormalizado);
        setPreviewsLogo(
          sistemaNormalizado.logotipos || {}
        );

        // ------------------------------------------
        // REDES SOCIALES
        // ------------------------------------------

        const {
          data: dataRedes,
          error: errRedes,
        } = await supabase
          .from("redes_sociales")
          .select("*")
          .eq("sistema_id", dataSis.id)
          .order("id", {
            ascending: true,
          });

        if (errRedes) {
          throw errRedes;
        }

        setRedes(dataRedes || []);
      } else {
        setSistema({
          nombre: "",
          descripcion: "",
          direccion: "",
          telefono: "",
          correo: "",
          sitio_web: "",
          logotipos: {},
          horarios: [],
        });

        setRedes([]);
      }

      // ------------------------------------------
      // BANNERS
      // ------------------------------------------

      const {
        data: dataBanners,
        error: errBanners,
      } = await supabase
        .from("hero_banners")
        .select("*")
        .order("order_index", {
          ascending: true,
        });

      if (errBanners) {
        throw errBanners;
      }

      const bannersNormalizados =
        (dataBanners || []) as HeroBanner[];

      setBanners(bannersNormalizados);

      const ocupados = bannersNormalizados
        .map((banner) => banner.order_index)
        .filter(
          (orden): orden is number =>
            typeof orden === "number"
        );

      setOrdenesOcupados(ocupados);

      if (!editandoBannerId) {
        let siguienteOrden = 1;

        while (
          ocupados.includes(siguienteOrden) &&
          siguienteOrden <= 10
        ) {
          siguienteOrden++;
        }

        setFormBanner((prev) => ({
          ...prev,
          order_index: siguienteOrden,
        }));
      }
    } catch (error: any) {
      console.error(
        "Error cargando configuración:",
        error
      );

      notifyWithSound(
        error?.message ||
          "Error al cargar la información",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setBanners((items) => {
      const oldIndex = items.findIndex(
        (item) => item.id === active.id
      );

      const newIndex = items.findIndex(
        (item) => item.id === over.id
      );

      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return items;
      }

      const nuevoArreglo = arrayMove(
        items,
        oldIndex,
        newIndex
      );

      return nuevoArreglo.map(
        (item, index) => ({
          ...item,
          order_index: index + 1,
        })
      );
    });
  };

  // ==========================================
  // GUARDAR ORDEN
  // ==========================================

  const guardarNuevoOrden = async () => {
    if (banners.some((banner) => !banner.id)) {
      notifyWithSound(
        "No se puede guardar el orden porque existe un banner sin identificador.",
        "error"
      );
      return;
    }

    setIsSavingOrder(true);

    try {
      /*
       * Se actualiza cada banner por su ID.
       * No se modifica ninguna otra columna.
       */
      for (let index = 0; index < banners.length; index++) {
        const banner = banners[index];

        const {
          error,
        } = await supabase
          .from("hero_banners")
          .update({
            order_index: index + 1,
          })
          .eq("id", banner.id);

        if (error) {
          throw error;
        }
      }

      const bannersActualizados =
        banners.map((banner, index) => ({
          ...banner,
          order_index: index + 1,
        }));

      setBanners(bannersActualizados);
      setOrdenesOcupados(
        bannersActualizados.map(
          (banner) => banner.order_index
        )
      );

      notifyWithSound(
        "Orden guardado exitosamente",
        "success"
      );

      setIsReordering(false);

      await cargarDatos();
    } catch (error: any) {
      console.error(
        "Error guardando orden:",
        error
      );

      notifyWithSound(
        error?.message ||
          "Error al guardar el nuevo orden",
        "error"
      );

      await cargarDatos();
    } finally {
      setIsSavingOrder(false);
    }
  };

  // ==========================================
  // ARCHIVO BANNER
  // ==========================================

  const handleBannerFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setArchivoBanner(file);

    const preview = URL.createObjectURL(file);

    setPreviewBanner(preview);
  };

  // ==========================================
  // GUARDAR BANNER
  // ==========================================

  const guardarBanner = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !archivoBanner &&
      !formBanner.image_url
    ) {
      notifyWithSound(
        "Debes seleccionar una imagen de fondo.",
        "warning"
      );
      return;
    }

    if (!formBanner.title.trim()) {
      notifyWithSound(
        "El título del banner es obligatorio.",
        "warning"
      );
      return;
    }

    if (!formBanner.cta_text.trim()) {
      notifyWithSound(
        "El texto del botón es obligatorio.",
        "warning"
      );
      return;
    }

    if (!formBanner.cta_link.trim()) {
      notifyWithSound(
        "Debes seleccionar o escribir un enlace.",
        "warning"
      );
      return;
    }

    if (
      usaEnlacePersonalizado &&
      !esUrlValida(formBanner.cta_link)
    ) {
      notifyWithSound(
        "El enlace personalizado no es válido.",
        "warning"
      );
      return;
    }

    if (
      formBanner.order_index < 1 ||
      formBanner.order_index > 10
    ) {
      notifyWithSound(
        "El orden debe estar entre 1 y 10.",
        "warning"
      );
      return;
    }

    setGuardandoBanner(true);

    try {
      let finalImageUrl =
        formBanner.image_url;

      // ------------------------------------------
      // SUBIR NUEVA IMAGEN
      // ------------------------------------------

      if (archivoBanner) {
        const nombreAnterior =
          obtenerNombreArchivoStorage(
            formBanner.image_url
          );

        if (nombreAnterior) {
          const {
            error: errorRemove,
          } = await supabase.storage
            .from("imagenes")
            .remove([nombreAnterior]);

          if (errorRemove) {
            console.warn(
              "No se pudo eliminar la imagen anterior:",
              errorRemove
            );
          }
        }

        const extension =
          archivoBanner.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const fileName = `banner_${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("imagenes")
          .upload(
            fileName,
            archivoBanner,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                archivoBanner.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("imagenes")
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl) {
          throw new Error(
            "No se pudo obtener la URL pública de la imagen."
          );
        }

        finalImageUrl =
          publicUrlData.publicUrl;
      }

      // ------------------------------------------
      // PAYLOAD
      // ------------------------------------------

      const payload = {
        title: formBanner.title.trim(),
        description:
          formBanner.description.trim(),
        image_url: finalImageUrl,
        cta_text:
          formBanner.cta_text.trim(),
        cta_link:
          formBanner.cta_link.trim(),
        is_active:
          formBanner.is_active,
        order_index:
          formBanner.order_index,
      };

      // ------------------------------------------
      // ACTUALIZAR
      // ------------------------------------------

      if (editandoBannerId) {
        const {
          error,
        } = await supabase
          .from("hero_banners")
          .update(payload)
          .eq("id", editandoBannerId);

        if (error) {
          throw error;
        }

        notifyWithSound(
          "Banner actualizado correctamente.",
          "success"
        );
      }

      // ------------------------------------------
      // CREAR
      // ------------------------------------------

      else {
        const {
          error,
        } = await supabase
          .from("hero_banners")
          .insert([payload]);

        if (error) {
          throw error;
        }

        notifyWithSound(
          "Banner agregado correctamente.",
          "success"
        );
      }

      cancelarEdicionBanner();

      await cargarDatos();
    } catch (error: any) {
      console.error(
        "Error guardando banner:",
        error
      );

      notifyWithSound(
        error?.message ||
          "No se pudo guardar el banner.",
        "error"
      );
    } finally {
      setGuardandoBanner(false);
    }
  };

  // ==========================================
  // EDITAR BANNER
  // ==========================================

  const iniciarEdicionBanner = (
    banner: HeroBanner
  ) => {
    if (!banner.id) {
      notifyWithSound(
        "Este banner no tiene un identificador válido.",
        "error"
      );
      return;
    }

    setEditandoBannerId(banner.id);

    setFormBanner({
      id: banner.id,
      title: banner.title || "",
      description:
        banner.description || "",
      image_url:
        banner.image_url || "",
      cta_text:
        banner.cta_text ||
        "Conoce el proyecto",
      cta_link:
        banner.cta_link || "",
      is_active:
        banner.is_active ?? true,
      order_index:
        banner.order_index || 1,
    });

    setArchivoBanner(null);
    setPreviewBanner(
      banner.image_url || ""
    );

    const esPredefinido =
      PAGINAS_DISPONIBLES.some(
        (pagina) =>
          pagina.value ===
          banner.cta_link
      );

    setUsaEnlacePersonalizado(
      !esPredefinido
    );

    setOrdenesOcupados((prev) =>
      prev.filter(
        (orden) =>
          orden !== banner.order_index
      )
    );

    setTimeout(() => {
      window.scrollTo({
        top:
          document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  // ==========================================
  // CANCELAR EDICIÓN BANNER
  // ==========================================

  const cancelarEdicionBanner = () => {
    setEditandoBannerId(null);

    const todosOcupados = banners
      .map(
        (banner) => banner.order_index
      )
      .filter(
        (orden): orden is number =>
          typeof orden === "number"
      );

    let siguienteOrden = 1;

    while (
      todosOcupados.includes(
        siguienteOrden
      ) &&
      siguienteOrden <= 10
    ) {
      siguienteOrden++;
    }

    setFormBanner({
      ...bannerVacio,
      order_index:
        siguienteOrden <= 10
          ? siguienteOrden
          : 1,
    });

    setArchivoBanner(null);
    setPreviewBanner("");
    setUsaEnlacePersonalizado(false);

    setOrdenesOcupados(
      todosOcupados
    );

    if (
      bannerFileInputRef.current
    ) {
      bannerFileInputRef.current.value =
        "";
    }
  };

  // ==========================================
  // ACTIVAR / DESACTIVAR BANNER
  // ==========================================

  const toggleBannerActivo = async (
    banner: HeroBanner
  ) => {
    if (!banner.id) {
      return;
    }

    const nuevoEstado =
      !banner.is_active;

    try {
      const {
        error,
      } = await supabase
        .from("hero_banners")
        .update({
          is_active: nuevoEstado,
        })
        .eq("id", banner.id);

      if (error) {
        throw error;
      }

      setBanners((prev) =>
        prev.map((item) =>
          item.id === banner.id
            ? {
                ...item,
                is_active:
                  nuevoEstado,
              }
            : item
        )
      );

      notifyWithSound(
        `Banner ${
          nuevoEstado
            ? "activado"
            : "desactivado"
        }.`,
        "success"
      );
    } catch (error: any) {
      console.error(
        "Error cambiando estado del banner:",
        error
      );

      notifyWithSound(
        error?.message ||
          "Error al cambiar el estado del banner.",
        "error"
      );
    }
  };

  // ==========================================
  // ELIMINAR BANNER
  // ==========================================

  const ejecutarEliminarBanner =
    async () => {
      const idBanner =
        dialogoConfBanner.idBanner;

      if (!idBanner) {
        return;
      }

      setIsProcessingAction(true);

      try {
        const bannerToDelete =
          banners.find(
            (banner) =>
              banner.id === idBanner
          );

        if (!bannerToDelete) {
          throw new Error(
            "No se encontró el banner."
          );
        }

        // --------------------------------------
        // ELIMINAR REGISTRO
        // --------------------------------------

        const {
          error: deleteError,
        } = await supabase
          .from("hero_banners")
          .delete()
          .eq("id", idBanner);

        if (deleteError) {
          throw deleteError;
        }

        // --------------------------------------
        // ELIMINAR IMAGEN
        // --------------------------------------

        const fileName =
          obtenerNombreArchivoStorage(
            bannerToDelete.image_url
          );

        if (fileName) {
          const {
            error: storageError,
          } = await supabase.storage
            .from("imagenes")
            .remove([fileName]);

          if (storageError) {
            console.warn(
              "Banner eliminado, pero no se pudo eliminar la imagen:",
              storageError
            );
          }
        }

        setBanners((prev) =>
          prev.filter(
            (banner) =>
              banner.id !== idBanner
          )
        );

        notifyWithSound(
          "Banner eliminado correctamente.",
          "success"
        );

        setDialogoConfBanner({
          isOpen: false,
          idBanner: null,
        });

        await cargarDatos();
      } catch (error: any) {
        console.error(
          "Error eliminando banner:",
          error
        );

        notifyWithSound(
          error?.message ||
            "Error al eliminar el banner.",
          "error"
        );
      } finally {
        setIsProcessingAction(false);
      }
    };

  // ==========================================
  // LOGOTIPOS
  // ==========================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipoId: string
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    processFile(file, tipoId);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    tipoId: string
  ) => {
    e.preventDefault();

    const file =
      e.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    processFile(file, tipoId);
  };

  const processFile = (
    file: File,
    tipoId: string
  ) => {
    if (!file.type.startsWith("image/")) {
      notifyWithSound(
        "Solo puedes subir archivos de imagen.",
        "warning"
      );
      return;
    }

    setArchivosLogo((prev) => ({
      ...prev,
      [tipoId]: file,
    }));

    setPreviewsLogo((prev) => ({
      ...prev,
      [tipoId]:
        URL.createObjectURL(file),
    }));
  };

  // ==========================================
  // GUARDAR SISTEMA
  // ==========================================

  const guardarSistema = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!sistema.nombre.trim()) {
      notifyWithSound(
        "El nombre del programa es obligatorio.",
        "warning"
      );
      return;
    }

    setGuardando(true);

    try {
      let logotiposFinales = {
        ...sistema.logotipos,
      };

      // ----------------------------------------
      // SUBIR LOGOS
      // ----------------------------------------

      for (const [
        tipoId,
        file,
      ] of Object.entries(
        archivosLogo
      )) {
        const urlVieja =
          sistema.logotipos[
            tipoId
          ];

        const nombreAnterior =
          obtenerNombreArchivoStorage(
            urlVieja
          );

        if (nombreAnterior) {
          const {
            error: removeError,
          } = await supabase.storage
            .from("imagenes")
            .remove([
              nombreAnterior,
            ]);

          if (removeError) {
            console.warn(
              "No se pudo eliminar el logo anterior:",
              removeError
            );
          }
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "png";

        const fileName = `logo_${tipoId}_${Date.now()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("imagenes")
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                undefined,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("imagenes")
          .getPublicUrl(fileName);

        if (!publicUrlData?.publicUrl) {
          throw new Error(
            `No se pudo obtener la URL del logo ${tipoId}.`
          );
        }

        logotiposFinales[
          tipoId
        ] = publicUrlData.publicUrl;
      }

      // ----------------------------------------
      // PAYLOAD
      // ----------------------------------------

      const payload = {
        nombre:
          sistema.nombre.trim(),

        descripcion:
          sistema.descripcion?.trim() ||
          "",

        logotipos:
          logotiposFinales,

        direccion:
          sistema.direccion?.trim() ||
          "",

        horarios:
          sistema.horarios || [],

        telefono:
          sistema.telefono?.trim() ||
          "",

        correo:
          sistema.correo?.trim() ||
          "",

        sitio_web:
          sistema.sitio_web?.trim() ||
          "",

        fecha_actualizacion:
          new Date().toISOString(),
      };

      // ----------------------------------------
      // ACTUALIZAR
      // ----------------------------------------

      if (sistema.id) {
        const {
          error,
        } = await supabase
          .from("sistemas")
          .update(payload)
          .eq("id", sistema.id);

        if (error) {
          throw error;
        }
      }

      // ----------------------------------------
      // CREAR
      // ----------------------------------------

      else {
        const {
          data,
          error,
        } = await supabase
          .from("sistemas")
          .insert([
            {
              ...payload,
              activo: true,
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setSistema({
            ...data,
            logotipos:
              data.logotipos || {},
            horarios:
              Array.isArray(
                data.horarios
              )
                ? data.horarios
                : [],
          });
        }
      }

      setArchivosLogo({});

      setSistema((prev) => ({
        ...prev,
        ...payload,
        logotipos:
          logotiposFinales,
      }));

      setPreviewsLogo(
        logotiposFinales
      );

      notifyWithSound(
        "Información general actualizada.",
        "success"
      );
    } catch (error: any) {
      console.error(
        "Error guardando sistema:",
        error
      );

      notifyWithSound(
        error?.message ||
          "Error al guardar la información.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // HORARIOS
  // ==========================================

  const agregarHorario = () => {
    if (!nuevoHorario.horas.trim()) {
      notifyWithSound(
        "Debes indicar el horario.",
        "warning"
      );
      return;
    }

    setSistema((prev) => ({
      ...prev,
      horarios: [
        ...prev.horarios,
        {
          etiqueta:
            nuevoHorario.etiqueta?.trim() ||
            "",
          dias:
            nuevoHorario.dias,
          horas:
            nuevoHorario.horas.trim(),
        },
      ],
    }));

    setNuevoHorario({
      etiqueta: "",
      dias: "Lunes a Viernes",
      horas: "",
    });
  };

  const eliminarHorario = (
    index: number
  ) => {
    setSistema((prev) => ({
      ...prev,
      horarios:
        prev.horarios.filter(
          (_, i) => i !== index
        ),
    }));
  };

  // ==========================================
  // REDES SOCIALES
  // ==========================================

  const guardarRed = async () => {
    if (!sistema.id) {
      notifyWithSound(
        "Primero debes guardar la información general del programa.",
        "warning"
      );
      return;
    }

    const url = nuevaRed.url.trim();

    if (!url) {
      notifyWithSound(
        "Debes ingresar la URL de la red social.",
        "warning"
      );
      return;
    }

    if (!esUrlValida(url)) {
      notifyWithSound(
        "La URL ingresada no es válida.",
        "warning"
      );
      return;
    }

    try {
      // ----------------------------------------
      // EDITAR
      // ----------------------------------------

      if (editandoRedId) {
        const {
          error,
        } = await supabase
          .from("redes_sociales")
          .update({
            nombre:
              nuevaRed.nombre,
            url,
          })
          .eq(
            "id",
            editandoRedId
          );

        if (error) {
          throw error;
        }

        notifyWithSound(
          "Red social actualizada con éxito.",
          "success"
        );
      }

      // ----------------------------------------
      // CREAR
      // ----------------------------------------

      else {
        const {
          error,
        } = await supabase
          .from("redes_sociales")
          .insert([
            {
              sistema_id:
                sistema.id,
              nombre:
                nuevaRed.nombre,
              url,
              activo: true,
            },
          ]);

        if (error) {
          throw error;
        }

        notifyWithSound(
          "Red social agregada con éxito.",
          "success"
        );
      }

      setEditandoRedId(null);

      setNuevaRed({
        nombre: "Facebook",
        url: "",
      });

      await cargarDatos();
    } catch (error: any) {
      console.error(
        "Error procesando red social:",
        error
      );

      notifyWithSound(
        error?.message ||
          "Error al procesar la red social.",
        "error"
      );
    }
  };

  const iniciarEdicionRed = (
    red: RedSocial
  ) => {
    setEditandoRedId(red.id);

    setNuevaRed({
      nombre: red.nombre,
      url: red.url,
    });
  };

  const cancelarEdicionRed = () => {
    setEditandoRedId(null);

    setNuevaRed({
      nombre: "Facebook",
      url: "",
    });
  };

  const ejecutarEliminarRed =
    async () => {
      const idRed =
        dialogoConfirmacion.idRed;

      if (!idRed) {
        return;
      }

      setIsProcessingAction(true);

      try {
        const {
          error,
        } = await supabase
          .from("redes_sociales")
          .delete()
          .eq("id", idRed);

        if (error) {
          throw error;
        }

        setRedes((prev) =>
          prev.filter(
            (red) =>
              red.id !== idRed
          )
        );

        if (
          editandoRedId === idRed
        ) {
          cancelarEdicionRed();
        }

        notifyWithSound(
          "Red social eliminada correctamente.",
          "success"
        );

        setDialogoConfirmacion({
          isOpen: false,
          idRed: null,
        });
      } catch (error: any) {
        console.error(
          "Error eliminando red social:",
          error
        );

        notifyWithSound(
          error?.message ||
            "Error al eliminar la red social.",
          "error"
        );
      } finally {
        setIsProcessingAction(false);
      }
    };

  // ==========================================
  // CARGANDO
  // ==========================================

  if (
    cargando &&
    !sistema.nombre
  ) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#00689D] w-10 h-10" />
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="w-full pb-20">
      {/* ======================================
          ENCABEZADO
      ====================================== */}

      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#061A2D]">
          Configuración del Programa
        </h1>

        <p className="text-gray-500 text-sm">
          Gestiona la información pública,
          variaciones de logotipo y banners.
        </p>
      </div>

      {/* ======================================
          CONTENIDO PRINCIPAL
      ====================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ====================================
            DATOS GENERALES
        ==================================== */}

        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={guardarSistema}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm"
          >
            {/* IDENTIDAD GRÁFICA */}

            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
              Identidad Gráfica
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {TIPOS_LOGO.map(
                (tipo) => (
                  <div
                    key={tipo.id}
                    className="flex flex-col"
                  >
                    <span className="text-xs font-bold text-gray-700 mb-1">
                      {tipo.nombre}
                    </span>

                    <span className="text-[10px] text-gray-400 mb-2">
                      {tipo.desc}
                    </span>

                    <div
                      onDragOver={(e) =>
                        e.preventDefault()
                      }
                      onDrop={(e) =>
                        handleDrop(
                          e,
                          tipo.id
                        )
                      }
                      onClick={() =>
                        fileInputRefs[
                          tipo.id as keyof typeof fileInputRefs
                        ].current?.click()
                      }
                      className={`
                        flex-1 border-2 border-dashed rounded-xl p-4
                        flex flex-col items-center justify-center
                        transition-colors cursor-pointer group relative
                        min-h-[120px]
                        ${
                          tipo.id ===
                          "blanco"
                            ? "bg-gray-800 border-gray-600 hover:border-[#26BDE2]"
                            : "bg-gray-50 border-gray-200 hover:border-[#00689D]"
                        }
                      `}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        ref={
                          fileInputRefs[
                            tipo.id as keyof typeof fileInputRefs
                          ]
                        }
                        onChange={(e) =>
                          handleFileChange(
                            e,
                            tipo.id
                          )
                        }
                      />

                      {previewsLogo[
                        tipo.id
                      ] ? (
                        <>
                          <img
                            src={
                              previewsLogo[
                                tipo.id
                              ]
                            }
                            alt={`Logo ${tipo.nombre}`}
                            className="max-h-16 max-w-full object-contain"
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold tracking-wider uppercase">
                              Cambiar
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
                          <UploadCloud
                            size={24}
                            className={
                              tipo.id ===
                              "blanco"
                                ? "text-white"
                                : "text-gray-400"
                            }
                          />

                          <span
                            className={`
                              text-[10px] mt-2
                              ${
                                tipo.id ===
                                "blanco"
                                  ? "text-white"
                                  : "text-gray-500"
                              }
                            `}
                          >
                            Subir imagen
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* INFORMACIÓN */}

            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
              Información de Contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOMBRE */}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nombre del Programa
                </label>

                <input
                  type="text"
                  required
                  value={
                    sistema.nombre
                  }
                  onChange={(e) =>
                    setSistema({
                      ...sistema,
                      nombre:
                        e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                />
              </div>

              {/* DESCRIPCIÓN */}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Descripción (Bio)
                </label>

                <textarea
                  rows={3}
                  value={
                    sistema.descripcion
                  }
                  onChange={(e) =>
                    setSistema({
                      ...sistema,
                      descripcion:
                        e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50 resize-none"
                />
              </div>

              {/* HORARIOS */}

              <div className="md:col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-[#00689D] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  Horarios
                </label>

                {sistema.horarios
                  .length > 0 && (
                  <div className="mb-4 space-y-2">
                    {sistema.horarios.map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg text-sm"
                        >
                          <div>
                            {h.etiqueta && (
                              <span className="font-bold text-gray-700 mr-2">
                                {
                                  h.etiqueta
                                }
                                :
                              </span>
                            )}

                            <span className="text-gray-600">
                              {h.dias},{" "}
                              <span className="font-medium text-[#00689D]">
                                {h.horas}
                              </span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarHorario(
                                i
                              )
                            }
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Eliminar horario"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                      Etiqueta
                    </span>

                    <input
                      type="text"
                      value={
                        nuevoHorario.etiqueta
                      }
                      onChange={(e) =>
                        setNuevoHorario(
                          {
                            ...nuevoHorario,
                            etiqueta:
                              e.target.value,
                          }
                        )
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                      Días
                    </span>

                    <select
                      value={
                        nuevoHorario.dias
                      }
                      onChange={(e) =>
                        setNuevoHorario(
                          {
                            ...nuevoHorario,
                            dias: e.target.value,
                          }
                        )
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                    >
                      <option>
                        Lunes a Viernes
                      </option>
                      <option>
                        Sábados y Domingos
                      </option>
                    </select>
                  </div>

                  <div className="flex-1 w-full">
                    <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                      Horas
                    </span>

                    <input
                      type="text"
                      placeholder="09:00 - 17:00"
                      value={
                        nuevoHorario.horas
                      }
                      onChange={(e) =>
                        setNuevoHorario(
                          {
                            ...nuevoHorario,
                            horas: e.target.value,
                          }
                        )
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      agregarHorario
                    }
                    className="bg-[#26BDE2] text-white p-2 rounded-md hover:bg-[#1CA9CB] w-full sm:w-auto"
                    title="Agregar horario"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* DIRECCIÓN */}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Dirección
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    value={
                      sistema.direccion
                    }
                    onChange={(e) =>
                      setSistema({
                        ...sistema,
                        direccion:
                          e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>

              {/* TELÉFONO */}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Teléfono
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    value={
                      sistema.telefono
                    }
                    onChange={(e) =>
                      setSistema({
                        ...sistema,
                        telefono:
                          e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>

              {/* CORREO */}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Correo
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>

                  <input
                    type="email"
                    value={
                      sistema.correo
                    }
                    onChange={(e) =>
                      setSistema({
                        ...sistema,
                        correo:
                          e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                  />
                </div>
              </div>
            </div>

            {/* GUARDAR */}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="flex items-center gap-2 bg-[#00689D] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#061A2D] transition-colors disabled:opacity-50 shadow-md"
              >
                {guardando ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}

                {guardando
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </form>
        </div>

        {/* ====================================
            REDES SOCIALES
        ==================================== */}

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
              Redes Sociales
            </h2>

            <div className="flex-1 overflow-y-auto mb-6 space-y-3 min-h-[200px]">
              {redes.length ===
              0 ? (
                <div className="text-center text-sm text-gray-400 py-10 border-2 border-dashed border-gray-100 rounded-xl">
                  No hay redes configuradas.
                </div>
              ) : (
                redes.map((red) => (
                  <div
                    key={red.id}
                    className={`
                      flex items-center justify-between p-3 border rounded-xl group
                      ${
                        editandoRedId ===
                        red.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-xs font-black text-[#00689D]">
                        {red.nombre}
                      </span>

                      <span className="text-xs text-gray-500 truncate">
                        {red.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          iniciarEdicionRed(
                            red
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDialogoConfirmacion(
                            {
                              isOpen: true,
                              idRed:
                                red.id,
                            }
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FORM RED */}

            <div className="p-4 rounded-2xl border bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-600">
                  {editandoRedId
                    ? "Editando Red"
                    : "Agregar Nueva"}
                </h3>

                {editandoRedId && (
                  <button
                    type="button"
                    onClick={
                      cancelarEdicionRed
                    }
                    className="text-gray-400 hover:text-red-500"
                    title="Cancelar edición"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <select
                  value={
                    nuevaRed.nombre
                  }
                  onChange={(e) =>
                    setNuevaRed({
                      ...nuevaRed,
                      nombre:
                        e.target.value,
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option>
                    Facebook
                  </option>
                  <option>
                    Instagram
                  </option>
                  <option>
                    LinkedIn
                  </option>
                </select>

                <input
                  type="url"
                  placeholder="https://..."
                  value={
                    nuevaRed.url
                  }
                  onChange={(e) =>
                    setNuevaRed({
                      ...nuevaRed,
                      url: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />

                <button
                  type="button"
                  onClick={
                    guardarRed
                  }
                  className="w-full bg-[#26BDE2] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#1CA9CB]"
                >
                  {editandoRedId
                    ? "Actualizar"
                    : "Agregar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          BANNERS
      ========================================== */}

      <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Banners del Carrusel
              (Inicio)
            </h2>

            <p className="text-gray-500 text-sm">
              Controla las imágenes y
              textos principales que se
              muestran en el Hero.
            </p>
          </div>

          {/* REORGANIZAR */}

          {banners.length > 1 && (
            <div className="mt-4 sm:mt-0">
              {isReordering ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReordering(
                        false
                      );
                      cargarDatos();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={
                      guardarNuevoOrden
                    }
                    disabled={
                      isSavingOrder
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSavingOrder ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={16} />
                    )}

                    Guardar Orden
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsReordering(
                      true
                    );
                    cancelarEdicionBanner();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  <GripVertical size={16} />
                  Reorganizar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LISTADO */}

          <div className="lg:col-span-2 space-y-4">
            {banners.length ===
            0 ? (
              <div className="text-center text-sm text-gray-400 py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                Aún no has agregado
                banners al carrusel.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={
                  closestCenter
                }
                onDragEnd={
                  handleDragEnd
                }
              >
                <SortableContext
                  items={banners
                    .filter(
                      (banner) =>
                        Boolean(
                          banner.id
                        )
                    )
                    .map(
                      (banner) =>
                        banner.id!
                    )}
                  strategy={
                    rectSortingStrategy
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {banners.map(
                      (banner) => (
                        <SortableBannerCard
                          key={
                            banner.id ||
                            `banner-${banner.order_index}`
                          }
                          banner={
                            banner
                          }
                          toggleBannerActivo={
                            toggleBannerActivo
                          }
                          iniciarEdicionBanner={
                            iniciarEdicionBanner
                          }
                          setDialogoConfBanner={
                            setDialogoConfBanner
                          }
                          isReordering={
                            isReordering
                          }
                        />
                      )
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* FORMULARIO BANNER */}

          <div className="lg:col-span-1 relative">
            {isReordering && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300">
                <GripVertical
                  size={32}
                  className="text-gray-400 mb-2 opacity-50"
                />

                <span className="text-gray-600 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-sm">
                  Guarda el orden
                  para editar
                </span>
              </div>
            )}

            <form
              onSubmit={
                guardarBanner
              }
              className={`
                p-5 rounded-2xl border transition-colors
                ${
                  editandoBannerId
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  {editandoBannerId ? (
                    <>
                      <Edit2 className="w-4 h-4 text-blue-500" />
                      Editando Banner
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#26BDE2]" />
                      Nuevo Banner
                    </>
                  )}
                </h3>

                {editandoBannerId && (
                  <button
                    type="button"
                    onClick={
                      cancelarEdicionBanner
                    }
                    className="text-gray-400 hover:text-red-500"
                    title="Cancelar edición"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* IMAGEN */}

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Imagen de fondo
                  </label>

                  <div
                    onClick={() =>
                      bannerFileInputRef.current?.click()
                    }
                    className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-[#00689D] relative flex flex-col items-center justify-center bg-white"
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      ref={
                        bannerFileInputRef
                      }
                      onChange={
                        handleBannerFileChange
                      }
                    />

                    {previewBanner ? (
                      <img
                        src={
                          previewBanner
                        }
                        alt="Vista previa del banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />

                        <span className="text-xs text-gray-500">
                          Clic para subir
                          imagen
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* TÍTULO */}

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Título principal
                    </label>

                    <span
                      className={`
                        text-[10px] font-bold
                        ${
                          formBanner.title
                            .length >=
                          MAX_CHARS.title
                            ? "text-red-500"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {
                        formBanner
                          .title
                          .length
                      }
                      /
                      {
                        MAX_CHARS.title
                      }
                    </span>
                  </div>

                  <textarea
                    required
                    maxLength={
                      MAX_CHARS.title
                    }
                    rows={2}
                    placeholder={
                      "Ej. Juventudes\nque transforman."
                    }
                    value={
                      formBanner.title
                    }
                    onChange={(e) =>
                      setFormBanner({
                        ...formBanner,
                        title:
                          e.target.value,
                      })
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50 resize-none"
                  />
                </div>

                {/* DESCRIPCIÓN */}

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Descripción
                      (Opcional)
                    </label>

                    <span
                      className={`
                        text-[10px] font-bold
                        ${
                          formBanner
                            .description
                            .length >=
                          MAX_CHARS.description
                            ? "text-red-500"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {
                        formBanner
                          .description
                          .length
                      }
                      /
                      {
                        MAX_CHARS.description
                      }
                    </span>
                  </div>

                  <textarea
                    maxLength={
                      MAX_CHARS.description
                    }
                    rows={3}
                    placeholder="Breve texto descriptivo..."
                    value={
                      formBanner.description
                    }
                    onChange={(e) =>
                      setFormBanner({
                        ...formBanner,
                        description:
                          e.target.value,
                      })
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50 resize-none"
                  />
                </div>

                {/* CTA */}

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Texto del Botón
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="Ej. Conoce más"
                      value={
                        formBanner.cta_text
                      }
                      onChange={(e) =>
                        setFormBanner({
                          ...formBanner,
                          cta_text:
                            e.target.value,
                        })
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50"
                    />
                  </div>

                  {/* ENLACE */}

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Enlace a donde
                        dirigirá
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setUsaEnlacePersonalizado(
                            (prev) =>
                              !prev
                          );

                          setFormBanner(
                            (prev) => ({
                              ...prev,
                              cta_link:
                                "",
                            })
                          );
                        }}
                        className="text-[10px] text-[#26BDE2] hover:underline font-bold"
                      >
                        {usaEnlacePersonalizado
                          ? "Usar lista"
                          : "Escribir manual"}
                      </button>
                    </div>

                    {usaEnlacePersonalizado ? (
                      <input
                        type="url"
                        required
                        placeholder="Ej. https://..."
                        value={
                          formBanner.cta_link
                        }
                        onChange={(e) =>
                          setFormBanner(
                            {
                              ...formBanner,
                              cta_link:
                                e.target.value,
                            }
                          )
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                      />
                    ) : (
                      <select
                        required
                        value={
                          formBanner.cta_link
                        }
                        onChange={(e) =>
                          setFormBanner(
                            {
                              ...formBanner,
                              cta_link:
                                e.target.value,
                            }
                          )
                        }
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00689D]/50"
                      >
                        <option
                          value=""
                          disabled
                        >
                          Selecciona una
                          página...
                        </option>

                        {PAGINAS_DISPONIBLES.map(
                          (
                            pagina
                          ) => (
                            <option
                              key={
                                pagina.value
                              }
                              value={
                                pagina.value
                              }
                            >
                              {
                                pagina.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </div>
                </div>

                {/* ORDEN / ACTIVO */}

                <div className="grid grid-cols-2 gap-3 items-center pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Orden de
                      aparición
                    </label>

                    <select
                      required
                      value={
                        formBanner.order_index
                      }
                      onChange={(e) =>
                        setFormBanner(
                          {
                            ...formBanner,
                            order_index:
                              parseInt(
                                e.target.value,
                                10
                              ),
                          }
                        )
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#00689D]/50"
                    >
                      {OPCIONES_ORDEN.map(
                        (num) => {
                          const ocupado =
                            ordenesOcupados.includes(
                              num
                            );

                          const esActual =
                            formBanner.order_index ===
                            num;

                          return (
                            <option
                              key={num}
                              value={num}
                              disabled={
                                ocupado &&
                                !esActual
                              }
                            >
                              {num}{" "}
                              {ocupado &&
                              !esActual
                                ? "(Ocupado)"
                                : ""}
                            </option>
                          );
                        }
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col items-end justify-center pt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Activo
                      </span>

                      <input
                        type="checkbox"
                        checked={
                          formBanner.is_active
                        }
                        onChange={(e) =>
                          setFormBanner({
                            ...formBanner,
                            is_active:
                              e.target
                                .checked,
                          })
                        }
                        className="w-4 h-4 text-[#26BDE2] rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* BOTONES */}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {editandoBannerId && (
                    <button
                      type="button"
                      onClick={
                        cancelarEdicionBanner
                      }
                      className="flex-1 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={
                      guardandoBanner ||
                      isReordering
                    }
                    className={`
                      flex-1 flex justify-center items-center gap-2
                      text-white px-4 py-2.5 rounded-xl text-sm font-bold
                      disabled:opacity-50
                      ${
                        editandoBannerId
                          ? "bg-[#00689D] hover:bg-[#061A2D]"
                          : "bg-[#26BDE2] hover:bg-[#1CA9CB]"
                      }
                    `}
                  >
                    {guardandoBanner ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editandoBannerId ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}

                    {guardandoBanner
                      ? "Guardando..."
                      : editandoBannerId
                      ? "Actualizar"
                      : "Agregar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL ELIMINAR BANNER
      ========================================== */}

      {dialogoConfBanner.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Eliminar Banner
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que
              deseas eliminar
              permanentemente este
              banner?
            </p>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() =>
                  setDialogoConfBanner(
                    {
                      isOpen: false,
                      idBanner:
                        null,
                    }
                  )
                }
                disabled={
                  isProcessingAction
                }
                className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  ejecutarEliminarBanner
                }
                disabled={
                  isProcessingAction
                }
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}

                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL ELIMINAR RED SOCIAL
      ========================================== */}

      {dialogoConfirmacion.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Eliminar Red Social
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de
              eliminar esta red
              social?
            </p>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() =>
                  setDialogoConfirmacion(
                    {
                      isOpen: false,
                      idRed: null,
                    }
                  )
                }
                disabled={
                  isProcessingAction
                }
                className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  ejecutarEliminarRed
                }
                disabled={
                  isProcessingAction
                }
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}

                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}