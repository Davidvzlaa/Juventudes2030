// // import React, { useState, useEffect } from 'react';
// // import { 
// //   Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
// //   Plus, X, Save, UploadCloud, Edit2, Loader2
// // } from 'lucide-react';

// // // import { supabase } from '@/lib/supabase'; 

// // type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado';

// // export default function EmbajaReporte() {
// //   // ESTADO DE REPORTES
// //   const [reportes, setReportes] = useState<any[]>([]);
// //   const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
// //   const [actividades, setActividades] = useState<any[]>([]);
  
// //   // ESTADO DE EDICIÓN
// //   const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
// //   const [guardando, setGuardando] = useState(false);

// //   // CATÁLOGOS DE BD
// //   const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
// //   const [accionesDB, setAccionesDB] = useState<any[]>([]);

// //   // FETCH INICIAL
// //   useEffect(() => {
// //     const fetchDatos = async () => {
// //       try {
// //         // MOCKS (Sustituir por Supabase cuando esté conectado)
// //         setCategoriasDB([
// //           { id: 1, nombre: 'Niñez de 1 a 11 años' },
// //           { id: 2, nombre: 'Jóvenes de 12 a 29 años' },
// //           { id: 3, nombre: 'Adultos de 30 a 59 años' },
// //           { id: 4, nombre: 'Adultos Mayores de 60 años' },
// //           { id: 5, nombre: 'Personas con discapacidad' },
// //           { id: 6, nombre: 'Población indígena' },
// //           { id: 7, nombre: 'Diversidad sexual' },
// //           { id: 8, nombre: 'Desplazados / Refugiados' },
// //           { id: 9, nombre: 'Mujeres embarazadas / Lactantes' },
// //           { id: 10, nombre: 'Población General (impacto ambiental)' },
// //           { id: 11, nombre: 'Otros' },
// //           { id: 99, nombre: 'Total Beneficiarios' }
// //         ]);

// //         setAccionesDB([
// //           { id: 1, nombre: 'Evento' },
// //           { id: 2, nombre: 'Talleres' },
// //           { id: 3, nombre: 'Capacitaciones' },
// //           { id: 4, nombre: 'Apoyo en especie' },
// //           { id: 99, nombre: 'TOTAL' }
// //         ]);

// //         // REPORTES MOCK
// //         setReportes([
// //           { 
// //             id: 'REP-001', 
// //             mes: 'Septiembre 2026', 
// //             estado: 'Borrador' as EstadoReporte,
// //             actividades: [
// //               {
// //                 id: 'act-1',
// //                 nombre: 'Taller de Reforestación',
// //                 tipo_actividad: 'Taller',
// //                 fecha_evento: '15/09/2026',
// //                 hora_inicio: '10:00',
// //                 hora_fin: '13:00',
// //                 ods_principal: '13. Acción por el clima',
// //                 sostenibilidad: { economico: false, social: true, ambiental: true },
// //                 lugar: 'CBTIS 43',
// //                 domicilio: { municipio: 'Ahome', colonia: 'Centro', calle: 'Rosales 123' },
// //                 beneficiarios: { 
// //                   2: { total: 20, hombres: 10, mujeres: 10 },
// //                   4: { total: 25, hombres: 10, mujeres: 15 },
// //                   99: { total: 45, hombres: 20, mujeres: 25 }
// //                 },
// //                 acciones: { 'Talleres': 1, 'TOTAL': 1 },
// //                 rango_edad: '15 a 18 años',
// //                 descripcion: 'Plantamos 50 árboles endémicos',
// //                 evidencias: []
// //               }
// //             ]
// //           },
// //           { 
// //             id: 'REP-002', 
// //             mes: 'Agosto 2026', 
// //             estado: 'Enviado' as EstadoReporte,
// //             actividades: []
// //           },
// //           { 
// //             id: 'REP-003', 
// //             mes: 'Octubre 2026', 
// //             estado: 'Sin empezar' as EstadoReporte,
// //             actividades: []
// //           }
// //         ]);
// //       } catch (error) {
// //         console.error(error);
// //       }
// //     };
// //     fetchDatos();
// //   }, []);

// //   const seleccionarReporte = (reporte: any) => {
// //     setReporteSeleccionado(reporte);
// //     setActividades(reporte.actividades || []);
// //   };

// //   const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
// //   };

// //   const handleSostenibilidadChange = (tipo: string) => {
// //     setActividadEnEdicion((prev: any) => ({
// //       ...prev,
// //       sostenibilidad: { ...prev.sostenibilidad, [tipo]: !prev.sostenibilidad?.[tipo] }
// //     }));
// //   };

// //   const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const { name, value } = e.target;
// //     setActividadEnEdicion((prev: any) => ({
// //       ...prev,
// //       domicilio: { ...prev.domicilio, [name]: value }
// //     }));
// //   };

// //   const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
// //     setActividadEnEdicion((prev: any) => {
// //       const prevBenef = prev.beneficiarios?.[categoriaId] || {};
// //       const updatedBenef = { ...prevBenef, [campo]: value };
      
// //       const h = parseInt(updatedBenef.hombres || '0', 10) || 0;
// //       const m = parseInt(updatedBenef.mujeres || '0', 10) || 0;
// //       updatedBenef.total = (h + m).toString();

// //       const newBeneficiarios = { ...prev.beneficiarios, [categoriaId]: updatedBenef };

// //       let granTotalHombres = 0;
// //       let granTotalMujeres = 0;

// //       Object.keys(newBeneficiarios).forEach((key) => {
// //         if (key !== '99') {
// //           granTotalHombres += parseInt(newBeneficiarios[key].hombres || '0', 10) || 0;
// //           granTotalMujeres += parseInt(newBeneficiarios[key].mujeres || '0', 10) || 0;
// //         }
// //       });

// //       newBeneficiarios[99] = {
// //         hombres: granTotalHombres.toString(),
// //         mujeres: granTotalMujeres.toString(),
// //         total: (granTotalHombres + granTotalMujeres).toString()
// //       };

// //       return { ...prev, beneficiarios: newBeneficiarios };
// //     });
// //   };

// //   const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const { name, value } = e.target;
// //     setActividadEnEdicion((prev: any) => ({
// //       ...prev,
// //       acciones: { ...prev.acciones, [name]: value }
// //     }));
// //   };

// //   const handleEvidenciaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files || !e.target.files.length) return;
// //     const file = e.target.files[0];
// //     const url = URL.createObjectURL(file);
    
// //     setActividadEnEdicion((prev: any) => {
// //       const evidenciasActuales = prev.evidencias || [];
// //       if (evidenciasActuales.length >= 4) {
// //         alert("Máximo 4 evidencias permitidas por actividad.");
// //         return prev;
// //       }
// //       return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
// //     });
// //   };

// //   const eliminarEvidencia = (idEliminar: number) => {
// //     setActividadEnEdicion((prev: any) => ({
// //       ...prev, 
// //       evidencias: prev.evidencias.filter((ev: any) => ev.id !== idEliminar)
// //     }));
// //   };

// //   const guardarEdicionActividad = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!reporteSeleccionado || !actividadEnEdicion) return;

// //     setGuardando(true);
// //     try {
// //       // Aquí iría tu update a Supabase

// //       // Actualizar localmente
// //       const reporteActualizado = {
// //         ...reporteSeleccionado,
// //         actividades: reporteSeleccionado.actividades.map((act: any) => 
// //           act.id === actividadEnEdicion.id ? actividadEnEdicion : act
// //         )
// //       };
      
// //       setReporteSeleccionado(reporteActualizado);
// //       setReportes(reportes.map(r => r.id === reporteActualizado.id ? reporteActualizado : r));
// //       setActividades(reporteActualizado.actividades);
// //       setActividadEnEdicion(null);
      
// //       alert('Actividad guardada exitosamente');
// //     } catch (error) {
// //       console.error(error);
// //       alert('Error al guardar la actividad');
// //     } finally {
// //       setGuardando(false);
// //     }
// //   };

// //   const crearNuevaActividad = () => {
// //     setActividadEnEdicion({
// //       id: `act-${Date.now()}`,
// //       nombre: '',
// //       tipo_actividad: '',
// //       fecha_evento: '',
// //       hora_inicio: '',
// //       hora_fin: '',
// //       ods_principal: '',
// //       sostenibilidad: { economico: false, social: false, ambiental: false },
// //       lugar: '',
// //       domicilio: { municipio: '', colonia: '', calle: '' },
// //       beneficiarios: {},
// //       acciones: {},
// //       rango_edad: '',
// //       descripcion: '',
// //       evidencias: []
// //     });
// //   };

// //   const getBadgeEstado = (estado: EstadoReporte) => {
// //     switch(estado) {
// //       case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
// //       case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
// //       case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
// //       case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
// //       {/* ================= MODAL DE EDICIÓN ================= */}
// //       {actividadEnEdicion && (
// //         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
// //           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
// //             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
// //               <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
// //                 <Edit2 size={20} className="text-[#00689D]"/> {actividadEnEdicion.id?.startsWith('act-') && !reportes[0]?.actividades?.find((a: any) => a.id === actividadEnEdicion.id) ? 'Nueva Actividad' : 'Editar Actividad'}
// //               </h3>
// //               <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
// //                 <X size={24} />
// //               </button>
// //             </div>
            
// //             <div className="flex-1 overflow-y-auto p-6">
// //               <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                
// //                 {/* DATOS GENERALES */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad</label>
// //                       <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">ODS Principal</label>
// //                       <select name="ods_principal" value={actividadEnEdicion.ods_principal || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none">
// //                         <option value="">Selecciona un ODS...</option>
// //                         <option value="1. Fin de la pobreza">1. Fin de la pobreza</option>
// //                         <option value="4. Educación de calidad">4. Educación de calidad</option>
// //                         <option value="13. Acción por el clima">13. Acción por el clima</option>
// //                       </select>
// //                     </div>
// //                   </div>
// //                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Actividad</label>
// //                       <input type="text" name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
// //                       <input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('/').reverse().join('-') || ''} onChange={(e) => setActividadEnEdicion({...actividadEnEdicion, fecha_evento: e.target.value.split('-').reverse().join('/')})} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label>
// //                       <input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Fin</label>
// //                       <input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                   </div>
// //                   <div>
// //                     <label className="block text-xs font-bold text-gray-600 mb-2">Sostenibilidad</label>
// //                     <div className="flex gap-6">
// //                       {['economico', 'social', 'ambiental'].map(tipo => (
// //                         <label key={tipo} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
// //                           <input type="checkbox" checked={actividadEnEdicion.sostenibilidad?.[tipo] || false} onChange={() => handleSostenibilidadChange(tipo)} className="rounded text-[#00689D] focus:ring-[#00689D] w-4 h-4"/>
// //                           {tipo}
// //                         </label>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* UBICACIÓN */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad</label>
// //                       <input type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Municipio</label>
// //                       <input type="text" name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Colonia</label>
// //                       <input type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Calle</label>
// //                       <input type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* BENEFICIARIOS Y ACCIONES */}
// //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //                   <div className="space-y-4">
// //                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Beneficiarios</h4>
// //                     {categoriasDB.map(cat => {
// //                       const esFilaTotal = cat.id === 99;
// //                       return (
// //                         <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20' : 'bg-gray-50 border-gray-100'}`}>
// //                           <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>
// //                             {cat.nombre}
// //                           </span>
                          
// //                           <input 
// //                             type="number" 
// //                             placeholder="0" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.total || ''} 
// //                             disabled
// //                             tabIndex={-1}
// //                             className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
// //                           />
                          
// //                           <input 
// //                             type="number" 
// //                             placeholder="H" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || ''} 
// //                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
// //                             disabled={esFilaTotal}
// //                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
// //                           />
                          
// //                           <input 
// //                             type="number" 
// //                             placeholder="M" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || ''} 
// //                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
// //                             disabled={esFilaTotal}
// //                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
// //                           />
// //                         </div>
// //                       );
// //                     })}
// //                   </div>

// //                   <div className="space-y-4">
// //                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Acciones</h4>
// //                     <div className="grid grid-cols-2 gap-3">
// //                       {accionesDB.map(act => (
// //                         <div key={act.id}>
// //                           <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate">{act.nombre}</label>
// //                           <input type="number" name={act.nombre} value={actividadEnEdicion.acciones?.[act.nombre] || ''} onChange={handleAccionChange} className="w-full border border-gray-300 rounded p-1.5 text-sm"/>
// //                         </div>
// //                       ))}
// //                     </div>
// //                     <div className="mt-4">
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Rango de Edad</label>
// //                       <input type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* DESCRIPCIÓN */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad</h4>
// //                   <textarea name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
// //                 </div>

// //                 {/* EVIDENCIAS */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Evidencias Fotográficas ({actividadEnEdicion.evidencias?.length || 0} / 4)</h4>
// //                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                     {actividadEnEdicion.evidencias?.map((ev: any) => (
// //                       <div key={ev.id} className="relative aspect-video rounded-xl border overflow-hidden bg-gray-100 group">
// //                         <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
// //                         <button 
// //                           type="button"
// //                           onClick={() => eliminarEvidencia(ev.id)}
// //                           className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
// //                         >
// //                           <X size={16}/>
// //                         </button>
// //                       </div>
// //                     ))}

// //                     {(actividadEnEdicion.evidencias?.length || 0) < 4 && (
// //                       <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#00689D] hover:bg-[#00689D]/5 transition-colors bg-gray-50">
// //                         <UploadCloud className="w-6 h-6 text-gray-400 mb-1"/>
// //                         <span className="text-xs font-bold text-gray-500">Subir foto</span>
// //                         <input type="file" accept="image/*" className="hidden" onChange={handleEvidenciaUpload} />
// //                       </label>
// //                     )}
// //                   </div>
// //                 </div>

// //               </form>
// //             </div>

// //             <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
// //               <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
// //                 Cancelar
// //               </button>
// //               <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md">
// //                 {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Actividad</>}
// //               </button>
// //             </div>

// //           </div>
// //         </div>
// //       )}

// //       {/* CABECERA */}
// //       <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
// //         <div>
// //           <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]"/> Mis Reportes Mensuales</h1>
// //           <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
// //         </div>
// //       </div>

// //       {/* CONTENIDO PRINCIPAL */}
// //       <div className="flex flex-1 gap-6 min-h-0">
        
// //         {/* LISTA DE REPORTES (Izquierda) */}
// //         <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden">
// //           <div className="p-4 border-b border-gray-100 bg-gray-50">
// //             <h3 className="text-sm font-black text-gray-700">Mis Reportes</h3>
// //           </div>
// //           <div className="flex-1 overflow-y-auto">
// //             {reportes.map(reporte => (
// //               <div 
// //                 key={reporte.id} 
// //                 onClick={() => seleccionarReporte(reporte)} 
// //                 className={`p-4 border-b cursor-pointer transition-all ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}
// //               >
// //                 <p className="text-xs font-black uppercase text-gray-400">{reporte.mes}</p>
// //                 <p className={`text-sm mt-2 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-700'}`}>{reporte.mes}</p>
// //                 <div className="mt-2">{getBadgeEstado(reporte.estado)}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* DETALLE DEL REPORTE (Derecha) */}
// //         {reporteSeleccionado ? (
// //           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
// //             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
// //               <div>
// //                 <h2 className="text-lg font-black text-gray-800">{reporteSeleccionado.mes}</h2>
// //                 <p className="text-xs text-gray-600 mt-1">Gestiona las actividades de este periodo</p>
// //               </div>
// //               <button 
// //                 onClick={() => alert('El reporte se enviará cuando hayas completado todas las actividades')}
// //                 disabled={reporteSeleccionado.estado === 'Enviado'}
// //                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${reporteSeleccionado.estado === 'Enviado' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#00689D] text-white hover:bg-[#00527A]'}`}
// //               >
// //                 <Send size={16}/> Enviar Reporte
// //               </button>
// //             </div>

// //             <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
// //               {reporteSeleccionado.estado !== 'Enviado' && (
// //                 <button 
// //                   onClick={crearNuevaActividad}
// //                   className="w-full mb-6 py-6 px-4 border-2 border-dashed border-[#00689D]/40 rounded-xl text-[#00689D] bg-[#00689D]/5 hover:bg-[#00689D]/10 font-bold transition-colors flex items-center justify-center gap-2"
// //                 >
// //                   <Plus size={20}/> Agregar Nueva Actividad
// //                 </button>
// //               )}

// //               <div className="space-y-4">
// //                 {actividades.length === 0 ? (
// //                   <div className="text-center py-12 text-gray-500">
// //                     <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30"/>
// //                     <p className="font-bold text-lg">No hay actividades registradas</p>
// //                     <p className="text-sm">Agrega actividades para este mes</p>
// //                   </div>
// //                 ) : (
// //                   actividades.map((act, idx) => (
// //                     <div key={act.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
// //                       <div className="p-4 flex items-start justify-between">
// //                         <div className="flex-1 min-w-0">
// //                           <div className="flex items-center gap-3 mb-2">
// //                             <div className="w-8 h-8 rounded-full bg-[#00689D]/10 flex items-center justify-center flex-shrink-0">
// //                               <span className="text-[#00689D] font-bold text-xs">{idx + 1}</span>
// //                             </div>
// //                             <h4 className="font-bold text-gray-900 truncate">{act.nombre}</h4>
// //                           </div>
// //                           <p className="text-xs text-gray-600 ml-11 space-x-2">
// //                             <span>{act.fecha_evento}</span>
// //                             <span>•</span>
// //                             <span>{act.tipo_actividad}</span>
// //                             {act.evidencias?.length > 0 && (
// //                               <>
// //                                 <span>•</span>
// //                                 <span className="text-blue-600">{act.evidencias.length}/4 evidencias</span>
// //                               </>
// //                             )}
// //                           </p>
// //                         </div>
// //                         <button 
// //                           onClick={() => setActividadEnEdicion(act)}
// //                           disabled={reporteSeleccionado.estado === 'Enviado'}
// //                           className={`ml-4 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${reporteSeleccionado.estado === 'Enviado' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-[#00689D] hover:text-white'}`}
// //                         >
// //                           <Edit2 size={16}/>
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
// //             <div className="text-center text-gray-500">
// //               <FileText className="w-16 h-16 mx-auto mb-4 opacity-20"/>
// //               <p className="font-bold text-lg">Selecciona un mes</p>
// //               <p className="text-sm">Elige un reporte para gestionar sus actividades</p>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import { 
//   Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
//   Plus, X, Save, UploadCloud, Edit2, Loader2, Info, Globe
// } from 'lucide-react';

// import { supabase } from '@/lib/supabase'; 
// // IMPORTA TU PDFViewer Y COMPONENTES DEL PDF SI ES NECESARIO EN ESTE ARCHIVO
// // Si este archivo solo lo usa el embajador, puedes omitir ReportePDF, 
// // pero he adaptado la lógica por si compartes componentes.

// type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado';

// const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// export default function EmbajaReporte() {
//   // ESTADO DE REPORTES
//   const [reportes, setReportes] = useState<any[]>([]);
//   const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
//   const [actividades, setActividades] = useState<any[]>([]);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
//   // ESTADO DE EDICIÓN
//   const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
//   const [guardando, setGuardando] = useState(false);

//   // CATÁLOGOS DE BD
//   const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
//   const [accionesDB, setAccionesDB] = useState<any[]>([]);
//   const [odsDB, setOdsDB] = useState<any[]>([]); // <--- NUEVO ESTADO PARA ODS

//   // ==========================================
//   // FETCH INICIAL: Catálogos y Reportes
//   // ==========================================
//   useEffect(() => {
//     const fetchDatos = async () => {
//       try {
//         const { data: authData } = await supabase.auth.getUser();
//         const userId = authData.user?.id;

//         if (!userId) return;
//         setCurrentUserId(userId);

//         // Traer Catálogos Activos
//         const { data: categorias } = await supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id');
//         if (categorias) setCategoriasDB(categorias);

//         const { data: acciones } = await supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id');
//         if (acciones) setAccionesDB(acciones);

//         // Traer Catálogo ODS
//         const { data: odsData } = await supabase.from('ods').select('id, numero, nombre').eq('activo', true).order('numero');
//         if (odsData) setOdsDB(odsData);

//         // Traer Reportes del Usuario
//         const { data: misReportes } = await supabase
//           .from('reportes')
//           .select('id, mes, anio, estado, periodo_inicio, periodo_fin')
//           .eq('usuario_id', userId)
//           .order('periodo_inicio', { ascending: false });

//         if (misReportes) {
//           const formateados = misReportes.map(r => ({
//             ...r,
//             nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`
//           }));
//           setReportes(formateados);
//         }
//       } catch (error) {
//         console.error("Error cargando datos de Supabase:", error);
//       }
//     };
//     fetchDatos();
//   }, []);

//   // ==========================================
//   // CARGAR ACTIVIDADES DEL REPORTE SELECCIONADO
//   // ==========================================
//   const seleccionarReporte = async (reporte: any) => {
//     setReporteSeleccionado(reporte);
//     setActividades([]); // Limpiamos la vista mientras carga

//     try {
//       if (!currentUserId) return;

//       const mesStr = String(reporte.mes).padStart(2, '0');
//       const fechaInicio = reporte.periodo_inicio || `${reporte.anio}-${mesStr}-01`;
//       const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate(); 
//       const fechaFin = reporte.periodo_fin || `${reporte.anio}-${mesStr}-${ultimoDia}`;

//       // Traer actividades del mes
//       const { data: actividadesMes, error: errAct } = await supabase
//         .from('actividades')
//         .select(`
//           id, nombre, tipo_actividad, fecha_evento, hora_inicio, hora_fin,
//           lugar, calle, colonia, municipio_id, descripcion, rango_edad_beneficiarios, estado, creado_por_usuario_id
//         `)
//         .eq('creado_por_usuario_id', currentUserId) 
//         .gte('fecha_evento', fechaInicio)    
//         .lte('fecha_evento', fechaFin)       
//         .order('fecha_evento', { ascending: true }); 

//       if (errAct) throw errAct;
//       if (!actividadesMes || actividadesMes.length === 0) return;

//       const actividadesCompletas = await Promise.all(
//         actividadesMes.map(async (act) => {
          
//           // -- A. Traer Beneficiarios --
//           const { data: benefData } = await supabase.from('actividad_beneficiarios').select('categoria_id, hombres, mujeres, total').eq('actividad_id', act.id);
//           let beneficiariosObj: any = {};
//           if (benefData) {
//             benefData.forEach((b: any) => {
//               beneficiariosObj[b.categoria_id] = { hombres: b.hombres.toString(), mujeres: b.mujeres.toString(), total: b.total.toString() };
//             });
//           }

//           // -- B. Traer Acciones --
//           const { data: accData } = await supabase.from('actividad_acciones').select('tipo_accion_id, cantidad').eq('actividad_id', act.id);
//           let accionesObj: any = {};
//           if (accData) {
//             accData.forEach((a: any) => {
//               const tipoObj = accionesDB.find(t => t.id === a.tipo_accion_id);
//               const nombreAccion = tipoObj ? tipoObj.nombre : 'Acción';
//               accionesObj[nombreAccion] = a.cantidad.toString();
//             });
//           }

//           // -- C. Traer Sostenibilidad --
//           const { data: sostData } = await supabase.from('actividad_sostenibilidad').select('area_id').eq('actividad_id', act.id);
//           let sostenibilidadObj = { economico: false, social: false, ambiental: false };
//           sostData?.forEach((s: any) => {
//             if (s.area_id === 1) sostenibilidadObj.economico = true;
//             if (s.area_id === 2) sostenibilidadObj.social = true;
//             if (s.area_id === 3) sostenibilidadObj.ambiental = true;
//           });

//           // -- D. Traer ODS (NUEVO) --
//           const { data: odsRelData } = await supabase.from('actividad_ods').select('ods_id, es_principal').eq('actividad_id', act.id);
//           let odsSeleccionados: number[] = [];
//           if (odsRelData) {
//             const principal = odsRelData.find(o => o.es_principal);
//             const secundarios = odsRelData.filter(o => !o.es_principal);
//             if (principal) odsSeleccionados.push(principal.ods_id);
//             odsSeleccionados.push(...secundarios.map(o => o.ods_id));
//           }

//           // -- E. Traer Evidencias --
//           const { data: evData } = await supabase.from('evidencias').select('id, url_archivo, nombre_archivo').eq('actividad_id', act.id).eq('usuario_id', currentUserId);

//           return {
//             ...act,
//             rango_edad: act.rango_edad_beneficiarios, 
//             domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
//             beneficiarios: beneficiariosObj,
//             acciones: accionesObj,
//             sostenibilidad: sostenibilidadObj,
//             ods_seleccionados: odsSeleccionados, // Añadido
//             evidencias: evData ? evData.map(ev => ({ id: ev.id, url: ev.url_archivo })) : [],
//             es_propia: act.creado_por_usuario_id === currentUserId
//           };
//         })
//       );

//       setActividades(actividadesCompletas);
//     } catch (error) {
//       console.error("Error cargando actividades del mes:", error);
//     }
//   };

//   // ==========================================
//   // HANDLERS DEL FORMULARIO
//   // ==========================================
//   const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
//   };

//   const handleSostenibilidadChange = (tipo: string) => {
//     setActividadEnEdicion((prev: any) => ({
//       ...prev,
//       sostenibilidad: { ...prev.sostenibilidad, [tipo]: !prev.sostenibilidad?.[tipo] }
//     }));
//   };

//   const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setActividadEnEdicion((prev: any) => ({
//       ...prev, domicilio: { ...prev.domicilio, [name]: value }
//     }));
//   };

//   // Lógica de Toggle ODS integrada del otro formulario
//   const toggleOds = (odsId: number) => {
//     if (!esPropietario) return;
//     setActividadEnEdicion((prev: any) => {
//       const arr = prev.ods_seleccionados || [];
//       if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
//       if (arr.length >= 4) { alert('Solo puedes seleccionar un máximo de 4 ODS.'); return prev; }
//       return { ...prev, ods_seleccionados: [...arr, odsId] };
//     });
//   };

//   const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
//     setActividadEnEdicion((prev: any) => {
//       const prevBenef = prev.beneficiarios?.[categoriaId] || {};
//       const updatedBenef = { ...prevBenef, [campo]: value };
      
//       const h = parseInt(updatedBenef.hombres || '0', 10) || 0;
//       const m = parseInt(updatedBenef.mujeres || '0', 10) || 0;
//       updatedBenef.total = (h + m).toString();

//       const newBeneficiarios = { ...prev.beneficiarios, [categoriaId]: updatedBenef };

//       let granTotalHombres = 0; let granTotalMujeres = 0;
//       Object.keys(newBeneficiarios).forEach((key) => {
//         if (key !== '99') {
//           granTotalHombres += parseInt(newBeneficiarios[key].hombres || '0', 10) || 0;
//           granTotalMujeres += parseInt(newBeneficiarios[key].mujeres || '0', 10) || 0;
//         }
//       });

//       newBeneficiarios[99] = {
//         hombres: granTotalHombres.toString(), mujeres: granTotalMujeres.toString(), total: (granTotalHombres + granTotalMujeres).toString()
//       };

//       return { ...prev, beneficiarios: newBeneficiarios };
//     });
//   };

//   const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setActividadEnEdicion((prev: any) => ({
//       ...prev, acciones: { ...prev.acciones, [name]: value }
//     }));
//   };

//   const handleEvidenciaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || !e.target.files.length) return;
//     const file = e.target.files[0];
//     const url = URL.createObjectURL(file);
    
//     setActividadEnEdicion((prev: any) => {
//       const evidenciasActuales = prev.evidencias || [];
//       if (evidenciasActuales.length >= 4) {
//         alert("Máximo 4 evidencias permitidas por actividad.");
//         return prev;
//       }
//       return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
//     });
//   };

//   const eliminarEvidencia = (idEliminar: number) => {
//     setActividadEnEdicion((prev: any) => ({
//       ...prev, evidencias: prev.evidencias.filter((ev: any) => ev.id !== idEliminar)
//     }));
//   };

//   // ==========================================
//   // GUARDAR EN BASE DE DATOS
//   // ==========================================
//   const guardarEdicionActividad = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reporteSeleccionado || !actividadEnEdicion || !currentUserId) return;

//     setGuardando(true);
//     try {
//       let actId = actividadEnEdicion.id;
//       const esNueva = String(actId).startsWith('act-');

//       // SI LA ACTIVIDAD ES PROPIA O ES NUEVA, GUARDAMOS TODO
//       if (actividadEnEdicion.es_propia) {
        
//         const actividadData = {
//           nombre: actividadEnEdicion.nombre,
//           tipo_actividad: actividadEnEdicion.tipo_actividad, // Guarda el texto descriptivo principal
//           fecha_evento: actividadEnEdicion.fecha_evento,
//           hora_inicio: actividadEnEdicion.hora_inicio || null,
//           hora_fin: actividadEnEdicion.hora_fin || null,
//           lugar: actividadEnEdicion.lugar,
//           calle: actividadEnEdicion.domicilio?.calle,
//           colonia: actividadEnEdicion.domicilio?.colonia,
//           rango_edad_beneficiarios: actividadEnEdicion.rango_edad,
//           descripcion: actividadEnEdicion.descripcion,
//           creado_por_usuario_id: currentUserId,
//           estado: 'Borrador',
//           fecha_actualizacion: new Date().toISOString()
//         };

//         if (esNueva) {
//           const { data: insertada, error: errIns } = await supabase.from('actividades').insert({ ...actividadData, fecha_creacion: new Date().toISOString(), beneficiarios_directos: 0, beneficiarios_indirectos: 0 }).select('id').single();
//           if (errIns) throw errIns;
//           actId = insertada.id;
//         } else {
//           const { error: errAct } = await supabase.from('actividades').update(actividadData).eq('id', actId);
//           if (errAct) throw errAct;
//         }

//         // 2. Beneficiarios
//         if (actividadEnEdicion.beneficiarios) {
//           for (const [catIdStr, valores] of Object.entries(actividadEnEdicion.beneficiarios)) {
//             const catId = Number(catIdStr);
//             const val: any = valores;
//             await supabase.from('actividad_beneficiarios').upsert({
//               actividad_id: actId, categoria_id: catId,
//               hombres: parseInt(val.hombres || '0', 10), mujeres: parseInt(val.mujeres || '0', 10), total: parseInt(val.total || '0', 10),
//               actualizado_en: new Date().toISOString(), creado_en: new Date().toISOString()
//             }, { onConflict: 'actividad_id,categoria_id' }); 
//           }
//         }

//         // 3. Acciones
//         if (actividadEnEdicion.acciones) {
//           for (const [nombreAccion, cantidadStr] of Object.entries(actividadEnEdicion.acciones)) {
//             const tipoObj = accionesDB.find(a => a.nombre === nombreAccion);
//             if (!tipoObj) continue;
//             await supabase.from('actividad_acciones').upsert({
//               actividad_id: actId, tipo_accion_id: tipoObj.id,
//               cantidad: parseInt(cantidadStr as string || '0', 10),
//               actualizado_en: new Date().toISOString(), creado_en: new Date().toISOString()
//             }, { onConflict: 'actividad_id,tipo_accion_id' });
//           }
//         }

//         // 4. Sostenibilidad
//         const areasSeleccionadas = [];
//         if (actividadEnEdicion.sostenibilidad?.economico) areasSeleccionadas.push(1);
//         if (actividadEnEdicion.sostenibilidad?.social) areasSeleccionadas.push(2);
//         if (actividadEnEdicion.sostenibilidad?.ambiental) areasSeleccionadas.push(3);
        
//         await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
//         for (const areaId of areasSeleccionadas) {
//           await supabase.from('actividad_sostenibilidad').insert({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() });
//         }

//         // 5. ODS (Nuevo)
//         await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
//         if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
//           const odsPayload = actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({
//             actividad_id: actId,
//             ods_id: odsId,
//             es_principal: idx === 0 // El primero en el array es el principal
//           }));
//           await supabase.from('actividad_ods').insert(odsPayload);
//         }
//       }

//       // 6. Vincular al reporte
//       await supabase.from('reporte_act').upsert({
//         reporte_id: reporteSeleccionado.id, actividad_id: actId,
//         estado_validacion: 'Pendiente', fecha_agregado: new Date().toISOString()
//       }, { onConflict: 'reporte_id,actividad_id' });

//       // LOGICA DE EVIDENCIAS IRÍA AQUÍ (Storage)

//       alert('Actividad guardada exitosamente');
//       setActividadEnEdicion(null);
//       seleccionarReporte(reporteSeleccionado);
      
//     } catch (error: any) {
//       console.error(error);
//       alert('Error al guardar la actividad: ' + error.message);
//     } finally {
//       setGuardando(false);
//     }
//   };

//   const crearNuevaActividad = () => {
//     setActividadEnEdicion({
//       id: `act-${Date.now()}`, 
//       es_propia: true, 
//       nombre: '', tipo_actividad: '', fecha_evento: '', hora_inicio: '', hora_fin: '',
//       ods_seleccionados: [], // Array vacío por defecto
//       sostenibilidad: { economico: false, social: false, ambiental: false },
//       lugar: '', domicilio: { municipio: '', colonia: '', calle: '' },
//       beneficiarios: {}, acciones: {}, rango_edad: '', descripcion: '', evidencias: []
//     });
//   };

//   const getBadgeEstado = (estado: EstadoReporte) => {
//     switch(estado) {
//       case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
//       case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
//       case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
//       case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
//       default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{estado}</span>;
//     }
//   };

//   const esPropietario = actividadEnEdicion?.es_propia !== false;

//   return (
//     <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
//       {/* ================= MODAL DE EDICIÓN ================= */}
//       {actividadEnEdicion && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
//               <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
//                 <Edit2 size={20} className="text-[#00689D]"/> 
//                 {String(actividadEnEdicion.id || '').startsWith('act-') 
//                   ? 'Nueva Actividad' 
//                   : (esPropietario ? 'Editar Actividad' : 'Detalles de Actividad Compartida')}
//               </h3>
//               <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              
//               {!esPropietario && (
//                 <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
//                   <Info className="w-5 h-5 shrink-0 text-[#00689D]"/>
//                   <p><strong>Actividad Compartida:</strong> Este evento fue creado por otro embajador. Puedes consultar los detalles y <strong>subir tus propias evidencias fotográficas</strong>, pero no puedes modificar la información general.</p>
//                 </div>
//               )}

//               <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                
//                 {/* DATOS GENERALES */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad</label>
//                       <input disabled={!esPropietario} required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
//                       <select disabled={!esPropietario} name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]">
//                         <option value="">-- Selecciona --</option>
//                         {accionesDB.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
//                       <input disabled={!esPropietario} type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label>
//                       <input disabled={!esPropietario} type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Fin</label>
//                       <input disabled={!esPropietario} type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-2">Sostenibilidad</label>
//                       <div className="flex gap-4">
//                         {['economico', 'social', 'ambiental'].map(tipo => (
//                           <label key={tipo} className={`flex items-center gap-1.5 text-xs capitalize ${esPropietario ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
//                             <input disabled={!esPropietario} type="checkbox" checked={actividadEnEdicion.sostenibilidad?.[tipo] || false} onChange={() => handleSostenibilidadChange(tipo)} className="rounded text-[#00689D] w-3.5 h-3.5"/>
//                             {tipo}
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   {/* NUEVA SECCIÓN ODS INTEGRADA */}
//                   <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
//                     <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS (Máximo 4 - El primero es el Principal)</label>
//                     <div className="flex flex-wrap gap-2">
//                       {odsDB.map(ods => {
//                         const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
//                         const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
//                         return (
//                           <button 
//                             key={ods.id} 
//                             type="button" 
//                             onClick={() => toggleOds(ods.id)} 
//                             disabled={!esPropietario}
//                             className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all 
//                               ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'}
//                               ${!esPropietario && 'opacity-70 cursor-not-allowed'}`}
//                           >
//                             <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>
//                               {ods.numero}
//                             </span>
//                             {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>

//                 {/* UBICACIÓN */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad</label>
//                       <input disabled={!esPropietario} type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Municipio (ID)</label>
//                       <input disabled={!esPropietario} type="text" name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Colonia</label>
//                       <input disabled={!esPropietario} type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Calle</label>
//                       <input disabled={!esPropietario} type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                   </div>
//                 </div>

//                 {/* BENEFICIARIOS Y CONTADORES DE ACCIONES */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                   <div className="space-y-4">
//                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Beneficiarios</h4>
//                     {categoriasDB.map(cat => {
//                       const esFilaTotal = cat.id === 99;
//                       return (
//                         <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20' : 'bg-gray-50 border-gray-100'}`}>
//                           <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>
//                             {cat.nombre}
//                           </span>
                          
//                           <input 
//                             type="number" 
//                             placeholder="0" 
//                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.total || ''} 
//                             disabled
//                             tabIndex={-1}
//                             className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
//                           />
                          
//                           <input 
//                             type="number" 
//                             placeholder="H" 
//                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || ''} 
//                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
//                             disabled={esFilaTotal || !esPropietario}
//                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
//                           />
                          
//                           <input 
//                             type="number" 
//                             placeholder="M" 
//                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || ''} 
//                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
//                             disabled={esFilaTotal || !esPropietario}
//                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="space-y-4">
//                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Contador de Acciones</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       {accionesDB.map(act => (
//                         <div key={act.id}>
//                           <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate">{act.nombre}</label>
//                           <input disabled={!esPropietario} type="number" name={act.nombre} value={actividadEnEdicion.acciones?.[act.nombre] || ''} onChange={handleAccionChange} className="w-full border border-gray-300 rounded p-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="mt-4">
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Rango de Edad Promedio</label>
//                       <input disabled={!esPropietario} type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
//                     </div>
//                   </div>
//                 </div>

//                 {/* DESCRIPCIÓN */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad</h4>
//                   <textarea disabled={!esPropietario} name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500"/>
//                 </div>

//                 {/* EVIDENCIAS (Siempre Habilitadas) */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">
//                     {esPropietario ? 'Evidencias Fotográficas' : 'Mis Evidencias Fotográficas'} ({actividadEnEdicion.evidencias?.length || 0} / 4)
//                   </h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {actividadEnEdicion.evidencias?.map((ev: any) => (
//                       <div key={ev.id} className="relative aspect-video rounded-xl border overflow-hidden bg-gray-100 group">
//                         <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
//                         <button 
//                           type="button"
//                           onClick={() => eliminarEvidencia(ev.id)}
//                           className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//                         >
//                           <X size={16}/>
//                         </button>
//                       </div>
//                     ))}

//                     {(actividadEnEdicion.evidencias?.length || 0) < 4 && (
//                       <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#00689D] hover:bg-[#00689D]/5 transition-colors bg-gray-50">
//                         <UploadCloud className="w-6 h-6 text-gray-400 mb-1"/>
//                         <span className="text-xs font-bold text-gray-500">Subir foto</span>
//                         <input type="file" accept="image/*" className="hidden" onChange={handleEvidenciaUpload} />
//                       </label>
//                     )}
//                   </div>
//                 </div>

//               </form>
//             </div>

//             <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
//               <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
//                 Cancelar
//               </button>
//               <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md">
//                 {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar {esPropietario ? 'Actividad' : 'Evidencias'}</>}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* CABECERA */}
//       <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
//         <div>
//           <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]"/> Mis Reportes Mensuales</h1>
//           <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
//         </div>
//       </div>

//       {/* CONTENIDO PRINCIPAL */}
//       <div className="flex flex-1 gap-6 min-h-0">
        
//         {/* LISTA DE REPORTES (Izquierda) */}
//         <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden">
//           <div className="p-4 border-b border-gray-100 bg-gray-50">
//             <h3 className="text-sm font-black text-gray-700">Mis Reportes</h3>
//           </div>
//           <div className="flex-1 overflow-y-auto">
//             {reportes.map(reporte => (
//               <div 
//                 key={reporte.id} 
//                 onClick={() => seleccionarReporte(reporte)} 
//                 className={`p-4 border-b cursor-pointer transition-all ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}
//               >
//                 <p className="text-xs font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
//                 <p className={`text-sm mt-2 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-700'}`}>{reporte.nombre_mes}</p>
//                 <div className="mt-2">{getBadgeEstado(reporte.estado)}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* DETALLE DEL REPORTE (Derecha) */}
//         {reporteSeleccionado ? (
//           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
//             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
//               <div>
//                 <h2 className="text-lg font-black text-gray-800">Reporte del mes de {reporteSeleccionado.nombre_mes}</h2>
//                 <p className="text-xs text-gray-600 mt-1">Gestiona las actividades de este periodo</p>
//               </div>
//               <button 
//                 onClick={() => alert('El reporte se enviará cuando hayas completado todas las actividades')}
//                 disabled={reporteSeleccionado.estado === 'Enviado'}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${reporteSeleccionado.estado === 'Enviado' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#00689D] text-white hover:bg-[#00527A]'}`}
//               >
//                 <Send size={16}/> Enviar Reporte
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
//               {reporteSeleccionado.estado !== 'Enviado' && (
//                 <button 
//                   onClick={crearNuevaActividad}
//                   className="w-full mb-6 py-6 px-4 border-2 border-dashed border-[#00689D]/40 rounded-xl text-[#00689D] bg-[#00689D]/5 hover:bg-[#00689D]/10 font-bold transition-colors flex items-center justify-center gap-2"
//                 >
//                   <Plus size={20}/> Agregar Nueva Actividad
//                 </button>
//               )}

//               <div className="space-y-4">
//                 {actividades.length === 0 ? (
//                   <div className="text-center py-12 text-gray-500">
//                     <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30"/>
//                     <p className="font-bold text-lg">No hay actividades registradas</p>
//                     <p className="text-sm">Agrega actividades para este mes</p>
//                   </div>
//                 ) : (
//                   actividades.map((act, idx) => (
//                     <div 
//                       key={act.id} 
//                       onClick={() => {
//                         if (reporteSeleccionado.estado !== 'Enviado') {
//                           setActividadEnEdicion(act);
//                         }
//                       }}
//                       className={`bg-white rounded-xl border shadow-sm transition-all flex items-center p-4 
//                         ${reporteSeleccionado.estado !== 'Enviado' ? 'hover:shadow-md cursor-pointer hover:border-[#00689D]/50 border-gray-200' : 'opacity-80 border-gray-200'}
//                         ${!act.es_propia ? 'border-l-4 border-l-blue-400' : ''}
//                       `}
//                     >
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-3 mb-2">
//                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${!act.es_propia ? 'bg-blue-100 text-blue-700' : 'bg-[#00689D]/10 text-[#00689D]'}`}>
//                             {idx + 1}
//                           </div>
//                           <h4 className="font-bold text-gray-900 truncate">
//                             {act.nombre} {!act.es_propia && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Compartida</span>}
//                           </h4>
//                         </div>
//                         <p className="text-xs text-gray-600 ml-11 space-x-2">
//                           <span>{act.fecha_evento?.split('T')[0]}</span>
//                           <span>•</span>
//                           <span>{act.tipo_actividad || 'Actividad Genérica'}</span>
//                           {act.evidencias?.length > 0 && (
//                             <>
//                               <span>•</span>
//                               <span className="text-blue-600 font-semibold">{act.evidencias.length}/4 evidencias subidas</span>
//                             </>
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
//             <div className="text-center text-gray-500">
//               <FileText className="w-16 h-16 mx-auto mb-4 opacity-20"/>
//               <p className="font-bold text-lg">Selecciona un mes</p>
//               <p className="text-sm">Elige un reporte para gestionar sus actividades</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Send, AlertCircle, Clock, CheckCircle2, 
  Plus, X, Save, UploadCloud, Edit2, Loader2, Info, Globe
} from 'lucide-react';

import { supabase } from '@/lib/supabase'; 

type EstadoReporte = 'Sin empezar' | 'Borrador' | 'Enviado' | 'Regresado';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function EmbajaReporte() {
  // ESTADO DE REPORTES
  const [reportes, setReportes] = useState<any[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [actividades, setActividades] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // ESTADO DE EDICIÓN
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  // CATÁLOGOS DE BD
  const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
  const [accionesDB, setAccionesDB] = useState<any[]>([]);
  const [odsDB, setOdsDB] = useState<any[]>([]); 
  const [municipiosDB, setMunicipiosDB] = useState<any[]>([]);

  // ==========================================
  // FETCH INICIAL: Catálogos y Reportes
  // ==========================================
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;

        if (!userId) return;
        setCurrentUserId(userId);

        const { data: categorias } = await supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id');
        // Le inyectamos virtualmente la fila de total para la interfaz
        if (categorias) setCategoriasDB([...categorias, { id: 99, nombre: 'Total Beneficiarios' }]);

        const { data: acciones } = await supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id');
        if (acciones) setAccionesDB(acciones);

        const { data: odsData } = await supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero');
        if (odsData) setOdsDB(odsData);

        const { data: munData } = await supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre');
        if (munData) setMunicipiosDB(munData);

        // Traer Reportes del Usuario
        const { data: misReportes } = await supabase
          .from('reportes')
          .select('id, mes, anio, estado, periodo_inicio, periodo_fin')
          .eq('usuario_id', userId)
          .order('periodo_inicio', { ascending: false });

        if (misReportes) {
          const formateados = misReportes.map(r => ({
            ...r,
            nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`
          }));
          setReportes(formateados);
        }
      } catch (error) {
        console.error("Error cargando datos de Supabase:", error);
      }
    };
    fetchDatos();
  }, []);

  // ==========================================
  // CARGAR ACTIVIDADES DEL REPORTE SELECCIONADO
  // ==========================================
  const seleccionarReporte = async (reporte: any) => {
    setReporteSeleccionado(reporte);
    setActividades([]); // Limpiamos la vista mientras carga

    try {
      if (!currentUserId) return;

      const mesStr = String(reporte.mes).padStart(2, '0');
      const fechaInicio = reporte.periodo_inicio || `${reporte.anio}-${mesStr}-01`;
      const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate(); 
      const fechaFin = reporte.periodo_fin || `${reporte.anio}-${mesStr}-${ultimoDia}`;

      // Traer actividades del mes usando JOIN para rapidez
      const { data: actividadesMes, error: errAct } = await supabase
        .from('actividades')
        .select(`
          *,
          municipios(nombre),
          actividad_beneficiarios(categoria_id, hombres, mujeres, total),
          actividad_acciones(tipo_accion_id, cantidad),
          actividad_sostenibilidad(area_id),
          actividad_ods(ods_id, es_principal, ods(numero, nombre)),
          evidencias(id, url_archivo)
        `)
        .eq('creado_por_usuario_id', currentUserId) 
        .gte('fecha_evento', fechaInicio)    
        .lte('fecha_evento', fechaFin)       
        .order('fecha_evento', { ascending: true }); 

      if (errAct) throw errAct;
      if (!actividadesMes || actividadesMes.length === 0) return;

      const actividadesCompletas = actividadesMes.map((act: any) => {
        let beneficiariosObj: any = {};
        act.actividad_beneficiarios?.forEach((b: any) => {
          beneficiariosObj[b.categoria_id] = { hombres: b.hombres?.toString(), mujeres: b.mujeres?.toString(), total: b.total?.toString() };
        });

        let odsSeleccionados: number[] = [];
        if (act.actividad_ods) {
          const principal = act.actividad_ods.find((o: any) => o.es_principal);
          const secundarios = act.actividad_ods.filter((o: any) => !o.es_principal);
          if (principal) odsSeleccionados.push(principal.ods_id);
          odsSeleccionados.push(...secundarios.map((o:any) => o.ods_id));
        }

        return {
          ...act,
          rango_edad: act.rango_edad_beneficiarios,
          domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
          beneficiarios: beneficiariosObj,
          ods_seleccionados: odsSeleccionados,
          evidencias: act.evidencias ? act.evidencias.map((ev:any) => ({ id: ev.id, url: ev.url_archivo })) : [],
          es_propia: act.creado_por_usuario_id === currentUserId
        };
      });

      setActividades(actividadesCompletas);
    } catch (error) {
      console.error("Error cargando actividades del mes:", error);
    }
  };

  // ==========================================
  // HANDLERS DEL FORMULARIO
  // ==========================================
  const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion((prev: any) => ({
      ...prev, domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value }
    }));
  };

  const toggleOds = (odsId: number) => {
    if (!esPropietario) return;
    setActividadEnEdicion((prev: any) => {
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
      if (arr.length >= 4) { alert('Solo puedes seleccionar un máximo de 4 ODS.'); return prev; }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
    setActividadEnEdicion((prev: any) => {
      const prevBenef = prev.beneficiarios?.[categoriaId] || {};
      const updatedBenef = { ...prevBenef, [campo]: value };
      
      return {
        ...prev,
        beneficiarios: {
          ...prev.beneficiarios,
          [categoriaId]: updatedBenef
        }
      };
    });
  };

  const handleEvidenciaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    setActividadEnEdicion((prev: any) => {
      const evidenciasActuales = prev.evidencias || [];
      if (evidenciasActuales.length >= 4) {
        alert("Máximo 4 evidencias permitidas por actividad.");
        return prev;
      }
      return { ...prev, evidencias: [...evidenciasActuales, { id: Date.now(), url, file }] };
    });
  };

  const eliminarEvidencia = (idEliminar: number) => {
    setActividadEnEdicion((prev: any) => ({
      ...prev, evidencias: prev.evidencias.filter((ev: any) => ev.id !== idEliminar)
    }));
  };

  // ==========================================
  // GUARDAR EN BASE DE DATOS
  // ==========================================
  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion || !currentUserId) return;

    setGuardando(true);
    try {
      let actId = actividadEnEdicion.id;
      const esNueva = String(actId).startsWith('act-');

      // SI LA ACTIVIDAD ES PROPIA O ES NUEVA, GUARDAMOS TODO EL FORMULARIO
      if (actividadEnEdicion.es_propia) {
        
        const actividadData = {
          nombre: actividadEnEdicion.nombre,
          tipo_actividad: actividadEnEdicion.tipo_actividad, 
          fecha_evento: actividadEnEdicion.fecha_evento,
          hora_inicio: actividadEnEdicion.hora_inicio || null,
          hora_fin: actividadEnEdicion.hora_fin || null,
          lugar: actividadEnEdicion.lugar,
          municipio_id: actividadEnEdicion.domicilio?.municipio || null,
          calle: actividadEnEdicion.domicilio?.calle,
          colonia: actividadEnEdicion.domicilio?.colonia,
          rango_edad_beneficiarios: actividadEnEdicion.rango_edad,
          descripcion: actividadEnEdicion.descripcion,
          creado_por_usuario_id: currentUserId,
          estado: 'Borrador',
          fecha_actualizacion: new Date().toISOString()
        };

        if (esNueva) {
          const { data: insertada, error: errIns } = await supabase.from('actividades').insert({ 
            ...actividadData, 
            fecha_creacion: new Date().toISOString(), 
            beneficiarios_directos: 0, 
            beneficiarios_indirectos: 0 
          }).select('id').single();
          
          if (errIns) throw errIns;
          actId = insertada.id;
        } else {
          const { error: errAct } = await supabase.from('actividades').update(actividadData).eq('id', actId);
          if (errAct) throw errAct;
        }

        // 2. Beneficiarios (Ignorando la fila 99)
        if (actividadEnEdicion.beneficiarios) {
          for (const [catIdStr, valores] of Object.entries(actividadEnEdicion.beneficiarios)) {
            const catId = Number(catIdStr);
            if (catId === 99) continue; 
            
            const val: any = valores;
            await supabase.from('actividad_beneficiarios').upsert({
              actividad_id: actId, categoria_id: catId,
              hombres: parseInt(val.hombres || '0', 10), 
              mujeres: parseInt(val.mujeres || '0', 10), 
              total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
              actualizado_en: new Date().toISOString(), 
              creado_en: new Date().toISOString()
            }, { onConflict: 'actividad_id,categoria_id' }); 
          }
        }

        // 3. Acción (Automática basada en el select)
        await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
        if (actividadEnEdicion.tipo_actividad) {
          const tipoObj = accionesDB.find(a => a.nombre === actividadEnEdicion.tipo_actividad);
          if (tipoObj) {
            await supabase.from('actividad_acciones').insert({
              actividad_id: actId, tipo_accion_id: tipoObj.id, cantidad: 1, creado_en: new Date().toISOString()
            });
          }
        }

        // 4. Sostenibilidad (Automática basada en ODS)
        const areasSeleccionadas = new Set<number>();
        actividadEnEdicion.ods_seleccionados?.forEach((odsId: number) => {
          const odsObj = odsDB.find(o => o.id === odsId);
          if (!odsObj || !odsObj.categoria_sostenibilidad) return;
          
          const cat = odsObj.categoria_sostenibilidad.toLowerCase();
          if (cat.includes('econ')) areasSeleccionadas.add(1);
          if (cat.includes('social') || cat.includes('sociedad')) areasSeleccionadas.add(2);
          if (cat.includes('ambient') || cat.includes('biosfera')) areasSeleccionadas.add(3);
          if (cat.includes('transversal') || cat.includes('alianza')) {
            areasSeleccionadas.add(1); areasSeleccionadas.add(2); areasSeleccionadas.add(3);
          }
        });

        await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
        for (const areaId of Array.from(areasSeleccionadas)) {
          await supabase.from('actividad_sostenibilidad').insert({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() });
        }

        // 5. ODS 
        await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
        if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
          const odsPayload = actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({
            actividad_id: actId,
            ods_id: odsId,
            es_principal: idx === 0 
          }));
          await supabase.from('actividad_ods').insert(odsPayload);
        }
      }

      // 6. Vincular al reporte
      await supabase.from('reporte_act').upsert({
        reporte_id: reporteSeleccionado.id, actividad_id: actId,
        estado_validacion: 'Pendiente', fecha_agregado: new Date().toISOString()
      }, { onConflict: 'reporte_id,actividad_id' });

      // LÓGICA DE EVIDENCIAS IRÍA AQUÍ (Storage de Supabase, lo dejo preparado para tu backend)

      alert('Actividad guardada exitosamente');
      setActividadEnEdicion(null);
      seleccionarReporte(reporteSeleccionado);
      
    } catch (error: any) {
      console.error(error);
      alert('Error al guardar la actividad: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const crearNuevaActividad = () => {
    setActividadEnEdicion({
      id: `act-${Date.now()}`, 
      es_propia: true, 
      nombre: '', tipo_actividad: '', fecha_evento: '', hora_inicio: '', hora_fin: '',
      ods_seleccionados: [], 
      lugar: '', domicilio: { municipio: '', colonia: '', calle: '' },
      beneficiarios: {}, rango_edad: '', descripcion: '', evidencias: []
    });
  };

  const getBadgeEstado = (estado: EstadoReporte) => {
    switch(estado) {
      case 'Enviado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1.5"/> Enviado</span>;
      case 'Borrador': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><FileText className="w-3 h-3 mr-1.5"/> Borrador</span>;
      case 'Regresado': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1.5"/> Regresado</span>;
      case 'Sin empezar': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600"><Clock className="w-3 h-3 mr-1.5"/> Sin empezar</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{estado}</span>;
    }
  };

  const esPropietario = actividadEnEdicion?.es_propia !== false;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
      {/* ================= MODAL DE EDICIÓN ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-[#00689D]"/> 
                {String(actividadEnEdicion.id || '').startsWith('act-') 
                  ? 'Nueva Actividad' 
                  : (esPropietario ? 'Editar Actividad' : 'Detalles de Actividad Compartida')}
              </h3>
              <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              
              {!esPropietario && (
                <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
                  <Info className="w-5 h-5 shrink-0 text-[#00689D]"/>
                  <p><strong>Actividad Compartida:</strong> Este evento fue creado por otro embajador. Puedes consultar los detalles y <strong>subir tus propias evidencias fotográficas</strong>, pero no puedes modificar la información general.</p>
                </div>
              )}

              <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                
                {/* DATOS GENERALES */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad</label>
                      <input disabled={!esPropietario} required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
                      <select disabled={!esPropietario} name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
                      <input disabled={!esPropietario} type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label>
                      <input disabled={!esPropietario} type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fin</label>
                      <input disabled={!esPropietario} type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS (Máximo 4 - El primero es el Principal)</label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button 
                            key={ods.id} 
                            type="button" 
                            onClick={() => toggleOds(ods.id)} 
                            disabled={!esPropietario}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all 
                              ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'}
                              ${!esPropietario && 'opacity-70 cursor-not-allowed'}`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>
                              {ods.numero}
                            </span>
                            {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* UBICACIÓN */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad</label>
                      <input disabled={!esPropietario} type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Municipio</label>
                      <select 
                        disabled={!esPropietario} 
                        name="municipio" 
                        value={actividadEnEdicion.domicilio?.municipio || ''} 
                        onChange={handleDomicilioChange} 
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"
                      >
                        <option value="">-- Selecciona --</option>
                        {municipiosDB.map(mun => (
                          <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia</label>
                      <input disabled={!esPropietario} type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle</label>
                      <input disabled={!esPropietario} type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"/>
                    </div>
                  </div>
                </div>

                {/* BENEFICIARIOS Y CONTADORES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Beneficiarios</h4>
                    {categoriasDB.map(cat => {
                      const esFilaTotal = cat.id === 99;

                      let valH = 0, valM = 0;
                      if (esFilaTotal) {
                        categoriasDB.forEach(c => {
                          if (c.id !== 99) {
                            valH += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.hombres || '0', 10);
                            valM += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.mujeres || '0', 10);
                          }
                        });
                      } else {
                        valH = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || '0', 10);
                        valM = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || '0', 10);
                      }

                      const strTotal = (valH + valM) > 0 ? (valH + valM).toString() : '';
                      const strH = valH > 0 ? valH.toString() : '';
                      const strM = valM > 0 ? valM.toString() : '';

                      return (
                        <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20' : 'bg-gray-50 border-gray-100'}`}>
                          <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>
                            {cat.nombre}
                          </span>
                          
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={strTotal} 
                            disabled
                            tabIndex={-1}
                            className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
                          />
                          
                          <input 
                            type="number" 
                            placeholder="H" 
                            value={strH} 
                            onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
                            disabled={esFilaTotal || !esPropietario}
                            className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                          />
                          
                          <input 
                            type="number" 
                            placeholder="M" 
                            value={strM} 
                            onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
                            disabled={esFilaTotal || !esPropietario}
                            className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal || !esPropietario ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Rango de Edad Promedio</h4>
                    <input disabled={!esPropietario} type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 outline-none focus:border-[#00689D]"/>
                  </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad</h4>
                  <textarea disabled={!esPropietario} name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500"/>
                </div>

                {/* EVIDENCIAS (Siempre Habilitadas) */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">
                    {esPropietario ? 'Evidencias Fotográficas' : 'Mis Evidencias Fotográficas'} ({actividadEnEdicion.evidencias?.length || 0} / 4)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actividadEnEdicion.evidencias?.map((ev: any) => (
                      <div key={ev.id} className="relative aspect-video rounded-xl border overflow-hidden bg-gray-100 group">
                        <img src={ev.url} alt="Evidencia" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => eliminarEvidencia(ev.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    ))}

                    {(actividadEnEdicion.evidencias?.length || 0) < 4 && (
                      <label className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#00689D] hover:bg-[#00689D]/5 transition-colors bg-gray-50">
                        <UploadCloud className="w-6 h-6 text-gray-400 mb-1"/>
                        <span className="text-xs font-bold text-gray-500">Subir foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleEvidenciaUpload} />
                      </label>
                    )}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-md">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar {esPropietario ? 'Actividad' : 'Evidencias'}</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Calendar className="text-[#00689D]"/> Mis Reportes Mensuales</h1>
          <p className="text-sm text-gray-500 mt-1">Completa y reporta las actividades de cada mes</p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* LISTA DE REPORTES (Izquierda) */}
        <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-black text-gray-700">Mis Reportes</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {reportes.map(reporte => (
              <div 
                key={reporte.id} 
                onClick={() => seleccionarReporte(reporte)} 
                className={`p-4 border-b cursor-pointer transition-all ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}
              >
                <p className="text-xs font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
                <p className={`text-sm mt-2 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-700'}`}>{reporte.nombre_mes}</p>
                <div className="mt-2">{getBadgeEstado(reporte.estado)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DETALLE DEL REPORTE (Derecha) */}
        {reporteSeleccionado ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black text-gray-800">Reporte del mes de {reporteSeleccionado.nombre_mes}</h2>
                <p className="text-xs text-gray-600 mt-1">Gestiona las actividades de este periodo</p>
              </div>
              <button 
                onClick={() => alert('El reporte se enviará cuando hayas completado todas las actividades')}
                disabled={reporteSeleccionado.estado === 'Enviado'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${reporteSeleccionado.estado === 'Enviado' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#00689D] text-white hover:bg-[#00527A]'}`}
              >
                <Send size={16}/> Enviar Reporte
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {reporteSeleccionado.estado !== 'Enviado' && (
                <button 
                  onClick={crearNuevaActividad}
                  className="w-full mb-6 py-6 px-4 border-2 border-dashed border-[#00689D]/40 rounded-xl text-[#00689D] bg-[#00689D]/5 hover:bg-[#00689D]/10 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20}/> Agregar Nueva Actividad
                </button>
              )}

              <div className="space-y-4">
                {actividades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30"/>
                    <p className="font-bold text-lg">No hay actividades registradas</p>
                    <p className="text-sm">Agrega actividades para este mes</p>
                  </div>
                ) : (
                  actividades.map((act, idx) => (
                    <div 
                      key={act.id} 
                      onClick={() => {
                        if (reporteSeleccionado.estado !== 'Enviado') {
                          setActividadEnEdicion(act);
                        }
                      }}
                      className={`bg-white rounded-xl border shadow-sm transition-all flex items-center p-4 
                        ${reporteSeleccionado.estado !== 'Enviado' ? 'hover:shadow-md cursor-pointer hover:border-[#00689D]/50 border-gray-200' : 'opacity-80 border-gray-200'}
                        ${!act.es_propia ? 'border-l-4 border-l-blue-400' : ''}
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${!act.es_propia ? 'bg-blue-100 text-blue-700' : 'bg-[#00689D]/10 text-[#00689D]'}`}>
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-gray-900 truncate">
                            {act.nombre} {!act.es_propia && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Compartida</span>}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 ml-11 space-x-2">
                          <span>{act.fecha_evento?.split('T')[0]}</span>
                          <span>•</span>
                          <span>{act.tipo_actividad || 'Actividad Genérica'}</span>
                          {act.evidencias?.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-semibold">{act.evidencias.length}/4 evidencias subidas</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20"/>
              <p className="font-bold text-lg">Selecciona un mes</p>
              <p className="text-sm">Elige un reporte para gestionar sus actividades</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}