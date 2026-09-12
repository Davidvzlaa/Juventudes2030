import { useEffect, useState, useRef } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  MapPin, Users, Target, Folder, ShieldCheck, 
  UploadCloud, Edit2, Trash2, PlusCircle, Save, 
  X, Loader2, Image as ImageIcon, Activity, UserPlus,
  Settings // <-- Nuevo ícono añadido
} from 'lucide-react';

// IMPORTACIÓN DEL NUEVO COMPONENTE
import CatalogoPrograma from '../Administrador/CatalogoPrograma'; 

// Añadimos 'sistemas' al TabType
type TabType = 'municipios' | 'roles' | 'ods' | 'proyectos' | 'tipos_accion' | 'categorias_beneficiarios' | 'permisos' | 'sistemas';

// Añadimos el nuevo catálogo al menú
const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'municipios', label: 'Municipios', icon: MapPin },
  { id: 'roles', label: 'Roles', icon: Users },
  { id: 'ods', label: 'ODS', icon: Target },
  { id: 'proyectos', label: 'Proyectos', icon: Folder },
  { id: 'tipos_accion', label: 'Tipos Acción', icon: Activity },
  { id: 'categorias_beneficiarios', label: 'Beneficiarios', icon: UserPlus },
  { id: 'permisos', label: 'Permisos', icon: ShieldCheck },
  { id: 'sistemas', label: 'Programa', icon: Settings }, // <-- NUEVO TAB
];

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

  const [permisosList, setPermisosList] = useState<any[]>([]);
  const [rolesParaPermisos, setRolesParaPermisos] = useState<any[]>([]);
  const [rolPermisosActivos, setRolPermisosActivos] = useState<any[]>([]);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const fetchData = async () => {
    setLoading(true);

    if (activeTab === 'permisos') {
      const [resPermisos, resRoles, resRolPerm] = await Promise.all([
        supabase.from('permisos').select('*').order('id', { ascending: true }),
        supabase.from('roles').select('*').eq('activo', true).order('id', { ascending: true }),
        supabase.from('rol_permiso').select('*')
      ]);
      if (resPermisos.data) setPermisosList(resPermisos.data);
      if (resRoles.data) setRolesParaPermisos(resRoles.data);
      if (resRolPerm.data) setRolPermisosActivos(resRolPerm.data);
    } else if (activeTab === 'sistemas') {
      // No hacemos fetch genérico, el componente CatalogoPrograma maneja su propia carga
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
  // LÓGICA DE PERMISOS
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
      alert("Error al actualizar el permiso.");
    }
  };

  // ==========================================
  // LÓGICA DE IMÁGENES (ODS Y PROYECTOS)
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
  // CREAR O ACTUALIZAR (EDITAR)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = formData.imagen;

    if (imageFile && (activeTab === 'ods' || activeTab === 'proyectos')) {
      setUploadingImage(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${activeTab}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('imagenes').upload(fileName, imageFile);
      if (uploadError) {
        alert("Error al subir la imagen: " + uploadError.message);
        setUploadingImage(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
      setUploadingImage(false);
    }

    const payload: any = { nombre: formData.nombre, activo: formData.activo };
    
    // Todos los catálogos que soportan descripción
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

    if (editId) {
      await supabase.from(tableName).update(payload).eq('id', editId);
    } else {
      await supabase.from(tableName).insert([payload]);
    }

    resetForm();
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar este registro?`)) return;
    const tableName = activeTab === 'proyectos' ? 'proyectos_sociales' : activeTab;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    
    if (error) {
      alert("Error al eliminar. Sugerencia: Mejor presiona 'Editar' y desmarca la casilla de 'Activo'.");
    } else fetchData();
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
          
          {/* NUEVA VISTA: PROGRAMA / SISTEMAS */}
          {activeTab === 'sistemas' ? (
            <div className="animate-in fade-in duration-300">
              <CatalogoPrograma />
            </div>
          ) : 
          
          /* VISTA: PERMISOS */
          activeTab === 'permisos' ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Cargando matriz de permisos...</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="text-[#00689D]" /> Matriz de Accesos
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Activa o desactiva las casillas para otorgar privilegios a los roles. Los cambios se guardan al instante.</p>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                  <table className="min-w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700">
                        <th className="p-4 font-bold border-b border-r border-gray-200 sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Permiso / Política</th>
                        {rolesParaPermisos.map(rol => (
                          <th key={rol.id} className="p-4 border-b border-gray-200 text-center whitespace-nowrap font-bold">
                            {rol.nombre}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {permisosList.map(permiso => (
                        <tr key={permiso.id} className="hover:bg-blue-50/50 transition-colors bg-white">
                          <td className="p-4 font-semibold text-gray-800 border-r border-gray-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            {permiso.nombre}
                          </td>
                          {rolesParaPermisos.map(rol => {
                            const isChecked = rolPermisosActivos.some(rp => rp.rol_id === rol.id && rp.permiso_id === permiso.id);
                            return (
                              <td key={rol.id} className="p-4 text-center">
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
              </div>
            )
          ) : (
            /* VISTA: CATÁLOGOS NORMALES */
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
                        <input type="number" min="1" max="17" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] outline-none transition-all"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Categoría/Registro</label>
                    <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] outline-none transition-all"
                      placeholder={`Ej. Jóvenes `}
                      value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>

                  {['roles', 'ods', 'proyectos', 'tipos_accion', 'categorias_beneficiarios'].includes(activeTab) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Descripción (Opcional)</label>
                      <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00689D] focus:border-[#00689D] outline-none transition-all resize-none"
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
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG o SVG (Max. 2MB)</p>
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

              {/* TABLA DE REGISTROS */}
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
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Error'; }}
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
                                  <div className="flex -space-x-2 overflow-hidden">
                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                      {item.embajadores.length} asignados
                                    </span>
                                  </div>
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
                                <button onClick={() => handleEdit(item)} className="text-[#00689D] hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                                  <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
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
    </div>
  );
}