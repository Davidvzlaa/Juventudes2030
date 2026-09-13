import { useEffect, useState, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  MapPin, Users, Target, Folder, ShieldCheck, 
  UploadCloud, Edit2, Trash2, PlusCircle, Save, 
  X, Loader2, Image as ImageIcon, Activity, UserPlus,
  Settings, Plus, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import CatalogoPrograma from '../Administrador/CatalogoPrograma'; 

type TabType = 'municipios' | 'roles' | 'ods' | 'proyectos' | 'tipos_accion' | 'categorias_beneficiarios' | 'permisos' | 'sistemas';

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'municipios', label: 'Municipios', icon: MapPin },
  { id: 'roles', label: 'Roles', icon: Users },
  { id: 'ods', label: 'ODS', icon: Target },
  { id: 'proyectos', label: 'Proyectos', icon: Folder },
  { id: 'tipos_accion', label: 'Tipos Acción', icon: Activity },
  { id: 'categorias_beneficiarios', label: 'Beneficiarios', icon: UserPlus },
  { id: 'permisos', label: 'Permisos', icon: ShieldCheck },
  { id: 'sistemas', label: 'Programa', icon: Settings },
];

// Función auxiliar para emitir notificaciones con Sonner y sonido
const notifyWithSound = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  const audio = new Audio('/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio bloqueado por el navegador:', err));

  const options = { position: 'bottom-right' as const };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

export default function AdminCatalogos() {
  const { catalogo } = useParams<{ catalogo: string }>();
  const catalogosValidos = TABS.map(tab => tab.id);
  const activeTab = catalogosValidos.includes(catalogo as TabType) ? catalogo as TabType : null;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', numero: 1, imagen: '', activo: true, categoria_sostenibilidad: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados específicos para la sección de Permisos
  const [permisosList, setPermisosList] = useState<any[]>([]);
  const [rolesParaPermisos, setRolesParaPermisos] = useState<any[]>([]);
  const [rolPermisosActivos, setRolPermisosActivos] = useState<any[]>([]);
  const [mostrarFormPermiso, setMostrarFormPermiso] = useState(false);
  const [permisoEditId, setPermisoEditId] = useState<number | null>(null);
  const [permisoForm, setPermisoForm] = useState({ nombre: '', descripcion: '' });

  // Estados del Dialogo de Confirmación (Eliminar)
  const [dialogoConfirmacion, setDialogoConfirmacion] = useState<{
    isOpen: boolean;
    idAEliminar: number | null;
  }>({ isOpen: false, idAEliminar: null });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (dialogoConfirmacion.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [dialogoConfirmacion.isOpen]);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const fetchData = async () => {
    setLoading(true);

    if (activeTab === 'sistemas') {
      setLoading(false);
      return;
    }

    if (activeTab === 'permisos') {
      const [resPermisos, resRoles, resRolPerm] = await Promise.all([
        supabase.from('permisos').select('*').order('id', { ascending: true }),
        supabase.from('roles').select('*').eq('activo', true).order('id', { ascending: true }),
        supabase.from('rol_permiso').select('*')
      ]);
      if (resPermisos.data) {
        setPermisosList(resPermisos.data);
        setItems(resPermisos.data); // Usamos items también para la tabla inferior
      }
      if (resRoles.data) setRolesParaPermisos(resRoles.data);
      if (resRolPerm.data) setRolPermisosActivos(resRolPerm.data);
    } else {
      let query;
      if (activeTab === 'proyectos') {
        query = supabase.from('proyectos_sociales').select('*, embajadores(usuarios(nombre, apellido))').order('id', { ascending: true });
      } else if (activeTab === 'ods') {
        query = supabase.from('ods').select('*').order('numero', { ascending: true });
      } else {
        query = supabase.from(activeTab as TabType).select('*').order('id', { ascending: true });
      }

      const { data, error } = await query;
      if (error) console.error("Error obteniendo datos:", error);
      else setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!activeTab) return;
    fetchData();
    resetForm();
  }, [activeTab]);

  if (!activeTab) return <Navigate to="/administrador/configuracion/municipios" replace />;

  // ==========================================
  // LÓGICA ESPECÍFICA DE PERMISOS
  // ==========================================
  const handleTogglePermiso = async (rolId: number, permisoId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await supabase.from('rol_permiso').delete().match({ rol_id: rolId, permiso_id: permisoId });
        setRolPermisosActivos(prev => prev.filter(rp => !(rp.rol_id === rolId && rp.permiso_id === permisoId)));
      } else {
        await supabase.from('rol_permiso').insert([{ rol_id: rolId, permiso_id: permisoId }]);
        setRolPermisosActivos(prev => [...prev, { rol_id: rolId, permiso_id: permisoId }]);
      }
    } catch (error) {
      notifyWithSound("Error al actualizar el permiso en la base de datos.", "error");
    }
  };

  const handleSavePermiso = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (permisoEditId) {
        const { error } = await supabase.from('permisos').update(permisoForm).eq('id', permisoEditId);
        if (error) throw error;
        notifyWithSound("Permiso actualizado con éxito.", "success");
      } else {
        const { error } = await supabase.from('permisos').insert([{ ...permisoForm, activo: true }]);
        if (error) throw error;
        notifyWithSound("Nuevo permiso registrado con éxito.", "success");
      }
      setPermisoForm({ nombre: '', descripcion: '' });
      setPermisoEditId(null);
      setMostrarFormPermiso(false);
      fetchData();
    } catch (error: any) {
      notifyWithSound("Error al guardar el permiso: " + error.message, "error");
    }
  };

  const handleEditPermiso = (item: any) => {
    setPermisoEditId(item.id);
    setPermisoForm({ nombre: item.nombre || '', descripcion: item.descripcion || '' });
    setMostrarFormPermiso(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // LÓGICA GENERAL DE CATÁLOGOS (EXCEPTO PERMISOS)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = formData.imagen;

    if (imageFile && (activeTab === 'ods' || activeTab === 'proyectos')) {
      setUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${activeTab}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, imageFile);
      if (uploadError) {
        notifyWithSound("Error al subir la imagen: " + uploadError.message, "error");
        setUploadingImage(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
      setUploadingImage(false);
    }

    const payload: any = { nombre: formData.nombre, activo: formData.activo };
    
    if (['roles', 'ods', 'proyectos', 'tipos_accion', 'categorias_beneficiarios'].includes(activeTab)) {
      payload.descripcion = formData.descripcion;
    }

    if (activeTab === 'ods') {
      payload.numero = formData.numero;
      payload.imagen = finalImageUrl;
      payload.categoria_sostenibilidad = formData.categoria_sostenibilidad;
    }
    if (activeTab === 'proyectos') {
      payload.logo = finalImageUrl; 
    }

    const tableName = activeTab === 'proyectos' ? 'proyectos_sociales' : activeTab;

    try {
      if (editId) {
        const { error } = await supabase.from(tableName).update(payload).eq('id', editId);
        if (error) throw error;
        notifyWithSound("Registro actualizado correctamente.", "success");
      } else {
        const { error } = await supabase.from(tableName).insert([payload]);
        if (error) throw error;
        notifyWithSound("Nuevo registro guardado con éxito.", "success");
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      notifyWithSound("Error al guardar el registro: " + error.message, "error");
    }
  };

  const triggerDelete = (id: number) => {
    setDialogoConfirmacion({ isOpen: true, idAEliminar: id });
  };

  const ejecutarEliminar = async () => {
    if (!dialogoConfirmacion.idAEliminar) return;
    setIsProcessingAction(true);
    
    try {
      const tableName = activeTab === 'proyectos' ? 'proyectos_sociales' : (activeTab === 'permisos' ? 'permisos' : activeTab);
      const { error } = await supabase.from(tableName as string).delete().eq('id', dialogoConfirmacion.idAEliminar);
      
      if (error) {
        notifyWithSound("Error al eliminar. Puede que el registro esté en uso. Sugerencia: Presiona 'Editar' y desmarca la casilla 'Activo'.", "error");
      } else {
        notifyWithSound("Registro eliminado permanentemente.", "success");
        fetchData();
      }
    } catch (err) {
      notifyWithSound("Ocurrió un error inesperado.", "error");
    } finally {
      setIsProcessingAction(false);
      setDialogoConfirmacion({ isOpen: false, idAEliminar: null });
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      nombre: item.nombre || '', descripcion: item.descripcion || '',
      numero: item.numero || 1, 
      imagen: activeTab === 'proyectos' ? (item.logo || '') : (item.imagen || ''), 
      activo: item.activo,
      categoria_sostenibilidad: item.categoria_sostenibilidad || ''
    });
    setImagePreview(activeTab === 'proyectos' ? (item.logo || null) : (item.imagen || null));
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ nombre: '', descripcion: '', numero: 1, imagen: '', activo: true, categoria_sostenibilidad: '' });
    setImageFile(null); setImagePreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          
          {/* VISTA DEL PROGRAMA */}
          {activeTab === 'sistemas' ? (
            <div className="animate-in fade-in duration-300">
              <CatalogoPrograma />
            </div>
          ) : 
          
          /* VISTA ESPECÍFICA PARA PERMISOS */
          activeTab === 'permisos' ? (
            <div className="animate-in fade-in duration-300 space-y-8">
              
              {/* Encabezado y Botón para habilitar formulario de creación */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-[#00689D]" /> Gestión de Accesos y Permisos
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Administra los permisos del sistema y asígnalos visualmente a los roles de usuario en la matriz.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setMostrarFormPermiso(!mostrarFormPermiso);
                    setPermisoEditId(null);
                    setPermisoForm({ nombre: '', descripcion: '' });
                  }}
                  className="flex items-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00527A] transition-all shadow-sm shrink-0"
                >
                  <Plus size={18} /> {mostrarFormPermiso ? 'Ocultar Formulario' : 'Crear Nuevo Permiso'}
                </button>
              </div>

              {/* Formulario desplegable para Crear/Editar Permiso */}
              {mostrarFormPermiso && (
                <form onSubmit={handleSavePermiso} className="p-6 bg-blue-50/40 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    {permisoEditId ? <Edit2 size={16} className="text-blue-600"/> : <PlusCircle size={16} className="text-green-600"/>}
                    {permisoEditId ? 'Editar Permiso' : 'Registrar Nuevo Permiso'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nombre del Permiso</label>
                      <input 
                        type="text" required 
                        placeholder="Ej. editar_reportes"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D]"
                        value={permisoForm.nombre} 
                        onChange={e => setPermisoForm({...permisoForm, nombre: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descripción</label>
                      <input 
                        type="text" 
                        placeholder="Detalle o alcance del permiso..."
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00689D]"
                        value={permisoForm.descripcion} 
                        onChange={e => setPermisoForm({...permisoForm, descripcion: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setMostrarFormPermiso(false)} 
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-[#00689D] text-white rounded-lg text-sm font-bold hover:bg-[#00527A] shadow-sm"
                    >
                      {permisoEditId ? 'Actualizar Permiso' : 'Guardar Permiso'}
                    </button>
                  </div>
                </form>
              )}

              {/* Matriz Interactiva de Checkboxes */}
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Matriz de Asignación por Roles</h3>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm max-h-[350px] overflow-y-auto">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700">
                          <th className="p-3 font-bold border-b border-r border-gray-200 sticky left-0 top-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Permiso / Política
                          </th>
                          {rolesParaPermisos.map(rol => (
                            <th key={rol.id} className="p-3 border-b border-gray-200 text-center whitespace-nowrap font-bold sticky top-0 bg-gray-50 z-10">
                              {rol.nombre}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {permisosList.map(permiso => (
                          <tr key={permiso.id} className="hover:bg-blue-50/50 transition-colors bg-white">
                            <td className="p-3 font-semibold text-gray-800 border-r border-gray-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              {permiso.nombre}
                            </td>
                            {rolesParaPermisos.map(rol => {
                              const isChecked = rolPermisosActivos.some(rp => rp.rol_id === rol.id && rp.permiso_id === permiso.id);
                              return (
                                <td key={rol.id} className="p-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-[#00689D] border-gray-300 rounded focus:ring-[#00689D] cursor-pointer transition-all"
                                    checked={isChecked} 
                                    onChange={() => handleTogglePermiso(rol.id, permiso.id, isChecked)} 
                                  />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Lista inferior con los permisos creados para administrarlos */}
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Listado General de Permisos</h3>
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                          <th className="p-3 font-bold">Identificador / Nombre</th>
                          <th className="p-3 font-bold">Descripción</th>
                          <th className="p-3 font-bold w-28 text-center">Estado</th>
                          <th className="p-3 font-bold w-32 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {permisosList.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 font-bold text-gray-800">{item.nombre}</td>
                            <td className="p-3 text-gray-500 text-xs md:text-sm">{item.descripcion || '-'}</td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200">
                                Activo
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEditPermiso(item)} className="text-[#00689D] hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => triggerDelete(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* VISTA: CATÁLOGOS NORMALES (Municipios, Roles, ODS, etc.) */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* FORMULARIO */}
              <form onSubmit={handleSubmit} className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00689D]"></div>
                
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {editId ? <Edit2 className="text-blue-500" size={20}/> : <PlusCircle className="text-green-500" size={20}/>}
                    {editId ? `Editar registro en ${activeTab.replace('_', ' ')}` : `Nuevo registro en ${activeTab.replace('_', ' ')}`}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'ods' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Número de ODS</label>
                        <input type="number" min="1" max="17" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all"
                          value={formData.numero} onChange={e => setFormData({...formData, numero: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categoría de Sostenibilidad</label>
                        <select required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none bg-white transition-all"
                          value={formData.categoria_sostenibilidad} onChange={e => setFormData({...formData, categoria_sostenibilidad: e.target.value})}>
                          <option value="">-- Selecciona --</option>
                          <option value="Ambiental">Ambiental</option>
                          <option value="Social">Social</option>
                          <option value="Económico">Económico</option>
                          <option value="Gobernanza">Gobernanza</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className={activeTab === 'ods' ? 'md:col-span-2' : 'md:col-span-2'}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre / Registro</label>
                    <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all"
                      placeholder={`Ej. Nombre...`}
                      value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>

                  {['roles', 'ods', 'proyectos', 'tipos_accion', 'categorias_beneficiarios'].includes(activeTab) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                      <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] outline-none transition-all resize-none"
                        placeholder="Añade una descripción detallada..."
                        value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                    </div>
                  )}

                  {(activeTab === 'ods' || activeTab === 'proyectos') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {activeTab === 'proyectos' ? 'Logotipo del Proyecto' : 'Imagen del ODS'}
                      </label>
                      <div 
                        onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-white hover:bg-blue-50 hover:border-[#00689D] transition-colors cursor-pointer group"
                      >
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        {imagePreview ? (
                          <div className="relative flex flex-col items-center">
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-lg shadow-sm" />
                            <p className="text-xs text-center mt-3 text-[#00689D] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Haz clic para cambiar la imagen</p>
                          </div>
                        ) : (
                          <div className="text-center flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full text-gray-400 group-hover:bg-[#00689D] group-hover:text-white transition-colors mb-3">
                              <UploadCloud size={32} />
                            </div>
                            <p className="text-sm text-gray-700 font-semibold">Haz clic o arrastra una imagen aquí</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00689D]"></div>
                      <span className="ml-3 text-sm font-bold text-gray-700">Registro Activo en el Sistema</span>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  {editId && (
                    <button type="button" onClick={resetForm} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-colors">
                      <X size={18} /> Cancelar
                    </button>
                  )}
                  <button type="submit" disabled={uploadingImage} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00689D] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#00527A] transition-colors disabled:bg-gray-400 shadow-md">
                    {uploadingImage ? <><Loader2 className="animate-spin" size={18}/> Subiendo...</> : <><Save size={18}/> {editId ? 'Actualizar' : 'Guardar'}</>}
                  </button>
                </div>
              </form>

              {/* TABLA DE REGISTROS NORMALES */}
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                          {(activeTab === 'ods' || activeTab === 'proyectos') && <th className="p-4 font-bold text-center w-20">Ícono</th>}
                          {activeTab === 'ods' && <th className="p-4 font-bold w-16 text-center">#</th>}
                          <th className="p-4 font-bold">Nombre / Categoría</th>
                          {activeTab === 'ods' && <th className="p-4 font-bold">Área</th>}
                          {['roles', 'ods', 'proyectos', 'tipos_accion', 'categorias_beneficiarios'].includes(activeTab) && <th className="p-4 font-bold">Descripción</th>}
                          {activeTab === 'proyectos' && <th className="p-4 font-bold">Embajadores</th>}
                          <th className="p-4 font-bold w-28 text-center">Estado</th>
                          <th className="p-4 font-bold w-32 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            
                            {(activeTab === 'ods' || activeTab === 'proyectos') && (
                              <td className="p-3 text-center align-middle">
                                {(activeTab === 'proyectos' ? item.logo : item.imagen) ? (
                                  <img 
                                    src={activeTab === 'proyectos' ? item.logo : item.imagen} 
                                    alt="logo" 
                                    className="w-10 h-10 object-contain rounded-md mx-auto drop-shadow-sm bg-white"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                                    <ImageIcon size={18} />
                                  </div>
                                )}
                              </td>
                            )}
                            
                            {activeTab === 'ods' && <td className="p-4 font-black text-lg text-center text-[#00689D]">{item.numero}</td>}
                            
                            <td className="p-4 font-bold text-gray-800">{item.nombre}</td>
                            
                            {activeTab === 'ods' && (
                                <td className="p-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    {item.categoria_sostenibilidad || 'Sin asignar'}
                                  </span>
                                </td>
                            )}

                            {['roles', 'ods', 'proyectos', 'tipos_accion', 'categorias_beneficiarios'].includes(activeTab) && (
                              <td className="p-4 text-gray-500 text-xs md:text-sm max-w-50 truncate" title={item.descripcion}>
                                {item.descripcion || '-'}
                              </td>
                            )}

                            {activeTab === 'proyectos' && (
                              <td className="p-4">
                                {item.embajadores && item.embajadores.length > 0 ? (
                                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                    {item.embajadores.length} asignados
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">Sin asignar</span>
                                )}
                              </td>
                            )}

                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                item.activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {item.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => handleEdit(item)} className="text-[#00689D] hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => triggerDelete(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {items.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-12 text-center text-gray-500">
                              <Folder className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                              <p className="font-medium text-lg">No hay registros</p>
                              <p className="text-sm">Agrega el primer registro utilizando el formulario de arriba.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          ALERT DIALOG MODAL (Sustituye window.confirm)
      ========================================== */}
      {dialogoConfirmacion.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Eliminar Registro</h3>
              <p className="text-sm text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar permanentemente este registro? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex items-center justify-center gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => !isProcessingAction && setDialogoConfirmacion({ isOpen: false, idAEliminar: null })}
                  disabled={isProcessingAction}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={ejecutarEliminar}
                  disabled={isProcessingAction}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-70"
                >
                  {isProcessingAction ? <Loader2 size={16} className="animate-spin" /> : null}
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}