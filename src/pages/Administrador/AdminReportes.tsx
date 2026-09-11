// // import React, { useState, useEffect } from 'react';
// // import { 
// //   Inbox, FileText, Edit2, X, Save, Settings2
// // } from 'lucide-react';
// // import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// // // IMPORTA TU CLIENTE DE SUPABASE AQUÍ
// // // import { supabase } from '@/lib/supabase'; 

// // // ==========================================
// // // 1. ESTILOS Y COMPONENTE DEL PDF 
// // // ==========================================
// // const styles = StyleSheet.create({
// //   page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
// //   table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
// //   row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
// //   colContent: { flexDirection: 'column', flex: 1 },
// //   sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
// //   cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
// //   cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
// //   cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
// //   noBorderRight: { borderRightWidth: 0 },
// //   noBorderBottom: { borderBottomWidth: 0 },
// //   w10: { width: '10%' }, w15: { width: '15%' }, w20: { width: '20%' }, w30: { width: '30%' },
// //   w35: { width: '35%' }, w40: { width: '40%' }, w50: { width: '50%' }, w60: { width: '60%' }, w85: { width: '85%' },
// //   textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
// //   textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
// //   textCenter: { textAlign: 'center', fontSize: 8 },
// //   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 100 },
// //   foto: { width: '22%', height: 80, objectFit: 'cover', backgroundColor: '#e5e5e5' },
// //   bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
// //   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
// // });

// // // AHORA RECIBE LOS CATÁLOGOS COMO PROPS
// // const ReportePDF = ({ snapshot, categorias, acciones }: any) => {
// //   if (!snapshot || !snapshot.actividades) return null;

// //   return (
// //     <Document>
// //       <Page size="LETTER" style={styles.page}>
// //         {snapshot.actividades.map((actividad: any, index: number) => (
// //           <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
// //             {actividad.anulada && (
// //               <View style={styles.bannerAnulado}>
// //                 <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - NO CONTABILIZA EN ESTADÍSTICAS ***</Text>
// //               </View>
// //             )}

// //             {/* DATOS DEL PROYECTO */}
// //             <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
// //               <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
// //               <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{actividad.fecha_evento}</Text></View>
// //             </View>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
// //               <View style={[styles.cellData, styles.w35]}><Text>{actividad.tipo_actividad}</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
// //               <View style={[styles.cellData, styles.w10]}><Text>{actividad.hora_inicio}</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
// //               <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{actividad.hora_fin}</Text></View>
// //             </View>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
// //               <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{actividad.ods_principal}</Text></View>
// //             </View>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
// //               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.economico ? 'X' : ''}</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
// //               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.social ? 'X' : ''}</Text></View>
// //               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
// //               <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.ambiental ? 'X' : ''}</Text></View>
// //             </View>
            
// //             {/* UBICACIÓN */}
// //             <Text style={styles.sectionHeader}>Ubicación</Text>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
// //               <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.lugar}</Text></View>
// //             </View>
// //             <View style={styles.row}>
// //               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
// //               <View style={[styles.colContent, styles.noBorderRight]}>
// //                 <View style={[styles.row, styles.noBorderBottom]}>
// //                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
// //                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.municipio}</Text></View>
// //                 </View>
// //                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
// //                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
// //                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.colonia}</Text></View>
// //                 </View>
// //                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
// //                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
// //                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.calle}</Text></View>
// //                 </View>
// //               </View>
// //             </View>

// //             {/* REGISTRO DE ACTIVIDADES Y ACCIONES */}
// //             <Text style={styles.sectionHeader}>Registro de actividades</Text>
// //             <View style={[styles.row, { alignItems: 'stretch' }]}>
              
// //               {/* BENEFICIARIOS (DINÁMICOS DESDE BD) */}
// //               <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
// //                 <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
// //                   <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
// //                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
// //                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
// //                   </View>
// //                   <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
// //                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
// //                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
// //                   </View>
// //                   <View style={[styles.w30, { flexDirection: 'column' }]}>
// //                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
// //                     <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
// //                       <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
// //                       <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
// //                     </View>
// //                   </View>
// //                 </View>

// //                 {categorias.map((cat: any, i: number) => {
// //                   const isLast = i === categorias.length - 1;
// //                   // Buscamos por categoria_id que es lo más seguro en BD
// //                   const datos = actividad.beneficiarios?.[cat.id] || {}; 
// //                   return (
// //                     <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined]}>
// //                       <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
// //                       <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{datos.total || ''}</Text></View>
// //                       <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{datos.hombres || ''}</Text></View>
// //                       <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{datos.mujeres || ''}</Text></View>
// //                     </View>
// //                   );
// //                 })}
// //               </View>

// //               {/* ACCIONES (DINÁMICAS DESDE BD) */}
// //               <View style={[styles.w40, { flexDirection: 'column' }]}>
// //                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Número de acciones</Text></View>
                
// //                 {acciones.map((acc: any) => (
// //                   <View key={acc.id} style={styles.row}>
// //                     <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
// //                     {/* El esquema indica que guardas el "tipo" como texto en actividad_acciones */}
// //                     <View style={[styles.cellData, styles.w40, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.acciones?.[acc.nombre] || ''}</Text></View>
// //                   </View>
// //                 ))}
                
// //                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad</Text></View>
// //                 <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text>{actividad.rango_edad || ''}</Text></View>
// //               </View>
// //             </View>

// //             <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
// //             <View style={[styles.row, { minHeight: 40, padding: 5, alignItems: 'flex-start' }]}><Text>{actividad.descripcion}</Text></View>
// //             <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
// //             <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
// //               {[0, 1, 2, 3].map((index) => (
// //                 <View key={index} style={styles.foto} />
// //               ))}
// //             </View>
// //           </View>
// //         ))}
// //       </Page>
// //     </Document>
// //   );
// // };


// // // ==========================================
// // // 3. PANTALLA PRINCIPAL ADMIN
// // // ==========================================
// // export default function AdminReportes() {
// //   const [reportes, setReportes] = useState<any[]>([]); // Aquí cargarás reportesMock o BD
// //   const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
// //   const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useState(false);
// //   const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
  
// //   // ESTADOS PARA LOS CATÁLOGOS DINÁMICOS DE BD
// //   const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
// //   const [accionesDB, setAccionesDB] = useState<any[]>([]);

// //   // FETCH DE SUPABASE AL CARGAR EL COMPONENTE
// //   // FETCH DE SUPABASE AL CARGAR EL COMPONENTE
// //   useEffect(() => {
// //     const fetchCatalogos = async () => {
// //       try {
// //         // === CUANDO CONECTES SUPABASE, DESCOMENTA ESTO Y BORRA EL MOCK ===
// //         /*
// //         const { data: catData, error: errCat } = await supabase
// //           .from('categorias_beneficiarios')
// //           .select('id, nombre')
// //           .order('id');
        
// //         if (catData) setCategoriasDB(catData);

// //         const { data: accData, error: errAcc } = await supabase
// //           .from('tipos_accion')
// //           .select('id, nombre')
// //           .order('id');
        
// //         if (accData) setAccionesDB(accData);
// //         */

// //         // ==========================================
// //         // MOCK TEMPORAL (Exactamente igual a tu tabla de DB)
// //         // ==========================================
// //         setCategoriasDB([
// //           { id: 1, nombre: 'Niñez de 1 a 11 años' },
// //           { id: 2, nombre: 'Jovenes de 12 a 29 años' },
// //           { id: 3, nombre: 'Adultos de 30 a 59 años' },
// //           { id: 4, nombre: 'Adultos Mayores de 60 años en adelante' },
// //           { id: 5, nombre: 'Personas con discapacidad' },
// //           { id: 6, nombre: 'Población indigena' },
// //           { id: 7, nombre: 'Diversidad sexual' },
// //           { id: 8, nombre: 'Desplazados / Refugiados' },
// //           { id: 9, nombre: 'Mujeres embarazadas / Lactantes' },
// //           { id: 10, nombre: 'Población General ( impacto ambiental)' },
// //           { id: 11, nombre: 'Otros:' },
// //           { id: 99, nombre: 'Total Beneficiarios' } // Para mantener tu fila de totales
// //         ]);

// //         setAccionesDB([
// //           { id: 1, nombre: 'Evento' },
// //           { id: 2, nombre: 'Talleres' },
// //           { id: 3, nombre: 'Capacitaciones' },
// //           { id: 4, nombre: 'Apoyo en especie' },
// //           { id: 99, nombre: 'TOTAL' }
// //         ]);

// //         // Cargar Reportes Mockup
// //         setReportes([
// //           {
// //             id: 'REP-001',
// //             embajador: { nombre: 'Luz María Arredondo', municipio: 'Ahome', avatar: 'LM' },
// //             mes: 'Septiembre 2026',
// //             estado: 'Pendiente',
// //             actividades: [
// //               { 
// //                 id: 'act-1', nombre: 'Taller de Reforestación Extrema', tipo_actividad: 'Taller',
// //                 fecha_evento: '15/09/2026', hora_inicio: '10:00', hora_fin: '13:00',
// //                 ods_principal: '13. Acción por el clima',
// //                 sostenibilidad: { economico: false, social: true, ambiental: true },
// //                 lugar: 'CBTIS 43',
// //                 domicilio: { municipio: 'Ahome', colonia: 'Centro', calle: 'Rosales 123' },
                
// //                 // Aquí simulo que la actividad ya trae guardados algunos datos (IDs 2, 4 y 99)
// //                 beneficiarios: { 
// //                   2: { total: 20, hombres: 10, mujeres: 10 }, 
// //                   4: { total: 25, hombres: 10, mujeres: 15 },
// //                   99: { total: 45, hombres: 20, mujeres: 25 } 
// //                 },
// //                 acciones: { 'Talleres': 1, 'TOTAL': 1 },
// //                 rango_edad: '15 a 18 años',
// //                 descripcion: 'Plantamos 50 árboles endémicos.', 
// //                 anulada: false 
// //               }
// //             ]
// //           }
// //         ]);
// //       } catch (error) {
// //         console.error("Error cargando catálogos", error);
// //       }
// //     };
    
// //     fetchCatalogos();
// //   }, []);

// //   const toggleAnularActividad = (actividadId: string) => {
// //     if (!reporteSeleccionado) return;
// //     const reporteActualizado = {
// //       ...reporteSeleccionado,
// //       actividades: reporteSeleccionado.actividades.map((act: any) => 
// //         act.id === actividadId ? { ...act, anulada: !act.anulada } : act
// //       )
// //     };
// //     setReporteSeleccionado(reporteActualizado);
// //     setReportes(reportes.map(r => r.id === reporteActualizado.id ? reporteActualizado : r));
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

// //   // Se actualizó para recibir el ID numérico de la categoría
// //  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
// //     setActividadEnEdicion((prev: any) => {
// //       // 1. Obtenemos y actualizamos la fila actual
// //       const prevBenef = prev.beneficiarios?.[categoriaId] || {};
// //       const updatedBenef = { ...prevBenef, [campo]: value };
      
// //       // Suma de la fila actual
// //       const h = parseInt(updatedBenef.hombres || '0', 10) || 0;
// //       const m = parseInt(updatedBenef.mujeres || '0', 10) || 0;
// //       updatedBenef.total = (h + m).toString();

// //       // Creamos el nuevo objeto de beneficiarios
// //       const newBeneficiarios = {
// //         ...prev.beneficiarios,
// //         [categoriaId]: updatedBenef
// //       };

// //       // 2. CALCULAMOS EL GRAN TOTAL (Excluyendo la fila 99 de la sumatoria)
// //       let granTotalHombres = 0;
// //       let granTotalMujeres = 0;

// //       Object.keys(newBeneficiarios).forEach((key) => {
// //         if (key !== '99') { // Asumiendo que 99 es el ID de "Total Beneficiarios"
// //           granTotalHombres += parseInt(newBeneficiarios[key].hombres || '0', 10) || 0;
// //           granTotalMujeres += parseInt(newBeneficiarios[key].mujeres || '0', 10) || 0;
// //         }
// //       });

// //       // Actualizamos la fila del Gran Total (ID: 99)
// //       newBeneficiarios[99] = {
// //         hombres: granTotalHombres.toString(),
// //         mujeres: granTotalMujeres.toString(),
// //         total: (granTotalHombres + granTotalMujeres).toString()
// //       };

// //       return {
// //         ...prev,
// //         beneficiarios: newBeneficiarios
// //       };
// //     });
// //   };

// //   // Se actualizó para manejar el nombre de la acción según la DB
// //   const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const { name, value } = e.target;
// //     setActividadEnEdicion((prev: any) => ({
// //       ...prev,
// //       acciones: { ...prev.acciones, [name]: value }
// //     }));
// //   };

// //   const guardarEdicionActividad = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!reporteSeleccionado || !actividadEnEdicion) return;

// //     // Aquí iría tu update a Supabase de la actividad

// //     const reporteActualizado = {
// //       ...reporteSeleccionado,
// //       actividades: reporteSeleccionado.actividades.map((act: any) => 
// //         act.id === actividadEnEdicion.id ? actividadEnEdicion : act
// //       )
// //     };
    
// //     setReporteSeleccionado(reporteActualizado);
// //     setReportes(reportes.map(r => r.id === reporteActualizado.id ? reporteActualizado : r));
// //     setActividadEnEdicion(null);
// //   };

// //   const snapshotParaPDF = reporteSeleccionado ? {
// //     ...reporteSeleccionado,
// //     actividades: ocultarAnuladasPDF ? reporteSeleccionado.actividades.filter((a: any) => !a.anulada) : reporteSeleccionado.actividades
// //   } : null;

// //   return (
// //     <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
// //       {/* ================= MODAL DE EDICIÓN ================= */}
// //       {actividadEnEdicion && (
// //         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
// //           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
// //             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
// //               <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
// //                 <Edit2 size={20} className="text-[#00689D]"/> Editar Registro de Actividad
// //               </h3>
// //               <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
// //                 <X size={24} />
// //               </button>
// //             </div>
            
// //             <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
// //               <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                
// //                 {/* SECCIÓN 1 y 2 IGUALES... */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
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
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Actividad</label>
// //                       <input type="text" name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
// //                       <input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('/').reverse().join('-') || ''} onChange={(e) => setActividadEnEdicion({...actividadEnEdicion, fecha_evento: e.target.value.split('-').reverse().join('/')})} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Inicio (Hora)</label>
// //                       <input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Fin (Hora)</label>
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

// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la actividad</label>
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

// //                 {/* SECCIÓN 3: BENEFICIARIOS Y ACCIONES DINÁMICAS */}
// //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //                   <div className="space-y-4">
// //                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Beneficiarios</h4>
// //                     {/* Iteramos sobre el catálogo traído de la base de datos */}
// //                     {categoriasDB.map(cat => {
// //                       const esFilaTotal = cat.id === 99; // Identificamos la fila del Gran Total

// //                       return (
// //                         <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20' : 'bg-gray-50 border-gray-100'}`}>
// //                           <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>
// //                             {cat.nombre}
// //                           </span>
                          
// //                           {/* Campo TOTAL */}
// //                           <input 
// //                             type="number" 
// //                             placeholder="0" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.total || ''} 
// //                             disabled
// //                             tabIndex={-1}
// //                             className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500 opacity-80'}`}
// //                           />
                          
// //                           {/* Campo H (Hombres) */}
// //                           <input 
// //                             type="number" 
// //                             placeholder="H" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || ''} 
// //                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
// //                             disabled={esFilaTotal}
// //                             tabIndex={esFilaTotal ? -1 : undefined}
// //                             className={`w-1/5 text-center border rounded p-1 text-xs transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed pointer-events-none select-none' : 'border-gray-300 focus:outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]'}`}
// //                           />
                          
// //                           {/* Campo M (Mujeres) */}
// //                           <input 
// //                             type="number" 
// //                             placeholder="M" 
// //                             value={actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || ''} 
// //                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
// //                             disabled={esFilaTotal}
// //                             tabIndex={esFilaTotal ? -1 : undefined}
// //                             className={`w-1/5 text-center border rounded p-1 text-xs transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed pointer-events-none select-none' : 'border-gray-300 focus:outline-none focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D]'}`}
// //                           />
// //                         </div>
// //                       );
// //                     })}
// //                   </div>

// //                   <div className="space-y-4">
// //                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Acciones</h4>
// //                     <div className="grid grid-cols-2 gap-3">
// //                       {/* Iteramos sobre los tipos de acción de la BD */}
// //                       {accionesDB.map(act => (
// //                         <div key={act.id}>
// //                           <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate" title={act.nombre}>{act.nombre}</label>
// //                           {/* El input tiene name={act.nombre} para coincidir con la DB */}
// //                           <input type="number" name={act.nombre} value={actividadEnEdicion.acciones?.[act.nombre] || ''} onChange={handleAccionChange} className="w-full border border-gray-300 rounded p-1.5 text-sm"/>
// //                         </div>
// //                       ))}
// //                     </div>
// //                     <div className="mt-4">
// //                       <label className="block text-xs font-bold text-gray-600 mb-1">Rango de edad</label>
// //                       <input type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* SECCIÓN 4: DESCRIPCIÓN */}
// //                 <div className="space-y-4">
// //                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción</h4>
// //                   <textarea name="descripcion" rows={4} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
// //                 </div>

// //               </form>
// //             </div>

// //             <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
// //               <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">
// //                 Cancelar
// //               </button>
// //               <button form="form-edicion" type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md">
// //                 <Save size={20}/> Guardar y Actualizar PDF
// //               </button>
// //             </div>

// //           </div>
// //         </div>
// //       )}

// //       {/* CABECERA Y PANEL PRINCIPAL */}
// //       <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between shrink-0">
// //         <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
// //       </div>

// //       <div className="flex flex-1 gap-6 min-h-0">
// //         <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
// //           <div className="flex-1 overflow-y-auto">
// //             {reportes.map(reporte => (
// //               <div key={reporte.id} onClick={() => setReporteSeleccionado(reporte)} className={`p-4 border-b cursor-pointer ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}>
// //                 <p className="text-xs font-black uppercase text-gray-400">{reporte.mes}</p>
// //                 <p className={`text-sm mt-1 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold'}`}>{reporte.embajador.nombre}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {reporteSeleccionado ? (
// //           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
// //             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between shrink-0">
// //               <h2 className="text-lg font-black"><FileText className="inline text-[#00689D] mr-2"/> Expediente: {reporteSeleccionado.mes}</h2>
// //             </div>
// //             <div className="flex-1 flex overflow-hidden">
// //               <div className="flex-1 bg-gray-600 flex flex-col">
// //                 <PDFViewer width="100%" height="100%" className="border-none">
// //                   {/* Pasamos los catálogos en vivo al PDF */}
// //                   <ReportePDF 
// //                     snapshot={snapshotParaPDF} 
// //                     categorias={categoriasDB} 
// //                     acciones={accionesDB} 
// //                   />
// //                 </PDFViewer>
// //               </div>

// //               <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
// //                 <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
// //                   <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas</span></div>
// //                   <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
// //                     <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-5.5' : 'left-1'}`} />
// //                   </button>
// //                 </div>

// //                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
// //                   {reporteSeleccionado.actividades.map((act: any, idx: number) => (
// //                     <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
// //                       <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
// //                       <div className="flex gap-2">
// //                         <button onClick={() => setActividadEnEdicion(act)} className="flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700">Editar</button>
// //                         <button onClick={() => toggleAnularActividad(act.id)} className={`flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border ${act.anulada ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'}`}>
// //                           {act.anulada ? 'Restaurar' : 'Anular'}
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="flex-1 bg-white rounded-2xl flex items-center justify-center text-gray-400">Selecciona un reporte.</div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import { 
//   Inbox, FileText, Edit2, X, Save, Settings2, Plus, Calendar, Loader2
// } from 'lucide-react';
// import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// // IMPORTA TU CLIENTE DE SUPABASE AQUÍ
// import { supabase } from '@/lib/supabase'; 

// const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// // ==========================================
// // 1. ESTILOS Y COMPONENTE DEL PDF 
// // ==========================================
// const styles = StyleSheet.create({
//   page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
//   table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
//   row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
//   colContent: { flexDirection: 'column', flex: 1 },
//   sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
//   cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
//   cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
//   noBorderRight: { borderRightWidth: 0 },
//   noBorderBottom: { borderBottomWidth: 0 },
//   w10: { width: '10%' }, w15: { width: '15%' }, w20: { width: '20%' }, w30: { width: '30%' },
//   w35: { width: '35%' }, w40: { width: '40%' }, w50: { width: '50%' }, w60: { width: '60%' }, w85: { width: '85%' },
//   textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
//   textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
//   textCenter: { textAlign: 'center', fontSize: 8 },
//   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 100 },
//   foto: { width: '22%', height: 80, objectFit: 'cover', backgroundColor: '#e5e5e5' },
//   bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
// });

// const ReportePDF = ({ snapshot, categorias, acciones }: any) => {
//   if (!snapshot || !snapshot.actividades) return null;

//   return (
//     <Document>
//       <Page size="LETTER" style={styles.page}>
//         {snapshot.actividades.map((actividad: any, index: number) => (
//           <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
//             {actividad.anulada && (
//               <View style={styles.bannerAnulado}>
//                 <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - NO CONTABILIZA EN ESTADÍSTICAS ***</Text>
//               </View>
//             )}

//             {/* DATOS DEL PROYECTO */}
//             <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
//               <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
//               <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{actividad.fecha_evento}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
//               <View style={[styles.cellData, styles.w35]}><Text>{actividad.tipo_actividad}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
//               <View style={[styles.cellData, styles.w10]}><Text>{actividad.hora_inicio}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
//               <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{actividad.hora_fin}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
//               <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{actividad.ods_principal}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
//               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.economico ? 'X' : ''}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
//               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.social ? 'X' : ''}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
//               <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.ambiental ? 'X' : ''}</Text></View>
//             </View>
            
//             {/* UBICACIÓN */}
//             <Text style={styles.sectionHeader}>Ubicación</Text>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
//               <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.lugar}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
//               <View style={[styles.colContent, styles.noBorderRight]}>
//                 <View style={[styles.row, styles.noBorderBottom]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.municipio}</Text></View>
//                 </View>
//                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.colonia}</Text></View>
//                 </View>
//                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.calle}</Text></View>
//                 </View>
//               </View>
//             </View>

//             {/* REGISTRO DE ACTIVIDADES Y ACCIONES */}
//             <Text style={styles.sectionHeader}>Registro de actividades</Text>
//             <View style={[styles.row, { alignItems: 'stretch' }]}>
              
//               <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                 <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
//                   <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
//                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
//                   </View>
//                   <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
//                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
//                   </View>
//                   <View style={[styles.w30, { flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
//                     <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
//                       <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
//                       <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
//                     </View>
//                   </View>
//                 </View>

//                 {categorias.map((cat: any, i: number) => {
//                   const isLast = i === categorias.length - 1;
//                   const datos = actividad.beneficiarios?.[cat.id] || {}; 
//                   return (
//                     <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined]}>
//                       <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
//                       <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{datos.total || ''}</Text></View>
//                       <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{datos.hombres || ''}</Text></View>
//                       <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{datos.mujeres || ''}</Text></View>
//                     </View>
//                   );
//                 })}
//               </View>

//               <View style={[styles.w40, { flexDirection: 'column' }]}>
//                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Número de acciones</Text></View>
                 
//                 {acciones.map((acc: any) => (
//                   <View key={acc.id} style={styles.row}>
//                     <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
//                     <View style={[styles.cellData, styles.w40, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.acciones?.[acc.nombre] || ''}</Text></View>
//                   </View>
//                 ))}
                 
//                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad</Text></View>
//                 <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text>{actividad.rango_edad || ''}</Text></View>
//               </View>
//             </View>

//             <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
//             <View style={[styles.row, { minHeight: 40, padding: 5, alignItems: 'flex-start' }]}><Text>{actividad.descripcion}</Text></View>
//             <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
//             <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
//               {[0, 1, 2, 3].map((index) => (
//                 <View key={index} style={styles.foto}>
//                   {actividad.evidencias && actividad.evidencias[index] ? (
//                     <Text style={{textAlign:'center', marginTop: 35, fontSize: 6, color: '#666'}}>Evidencia {index+1}</Text>
//                   ) : null}
//                 </View>
//               ))}
//             </View>
//           </View>
//         ))}
//       </Page>
//     </Document>
//   );
// };


// // ==========================================
// // 3. PANTALLA PRINCIPAL ADMIN
// // ==========================================
// export default function AdminReportes() {
//   const [reportes, setReportes] = useState<any[]>([]);
//   const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
//   const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useState(false);
//   const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);

//   const [guardando, setGuardando] = useState(false);
   
//   // Catálogos
//   const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
//   const [accionesDB, setAccionesDB] = useState<any[]>([]);

//   // Estados Habilitar Mes
//   const [showHabilitarModal, setShowHabilitarModal] = useState(false);
//   const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
//   const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
//   const [procesandoMes, setProcesandoMes] = useState(false);

//   // FETCH DE DATOS REALES
//   const fetchData = async () => {
//     try {
//       const { data: catData } = await supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id');
//       if (catData) setCategoriasDB(catData);

//       const { data: accData } = await supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id');
//       if (accData) setAccionesDB(accData);

//       const { data: repData } = await supabase
//         .from('reportes')
//         .select(`
//           id, mes, anio, estado, 
//           usuarios!reportes_usuario_id_fkey (
//             nombre, apellido
//           )
//         `)
//         .order('anio', { ascending: false })
//         .order('mes', { ascending: false });

//       if (repData) {
//         const formateados = repData.map((r: any) => ({
//           ...r,
//           nombre_mes: `${MESES[r.mes - 1]} ${r.anio}`,
//           embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
//           actividades: []
//         }));
//         setReportes(formateados);
//       }
//     } catch (error) {
//       console.error("Error cargando datos:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleHabilitarMes = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setProcesandoMes(true);
//     try {
//       const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
      
//       if (existing && existing.length > 0) {
//         alert("Este mes ya fue habilitado previamente.");
//         setProcesandoMes(false);
//         return;
//       }

//       const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
      
//       if (embajadores && embajadores.length > 0) {
//         const strMes = String(nuevoMes).padStart(2, '0');
//         const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
        
//         const inserts = embajadores.map((emb: any) => ({
//           usuario_id: emb.usuario_id,
//           mes: nuevoMes,
//           anio: nuevoAnio,
//           periodo_inicio: `${nuevoAnio}-${strMes}-01`,
//           periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
//           estado: 'Borrador' // Usamos 'Borrador' para respetar la restricción de la BD
//         }));

//         const { error } = await supabase.from('reportes').insert(inserts);
//         if (error) alert("Error habilitando el mes: " + error.message);
//         else {
//           alert("Mes habilitado exitosamente para todos los embajadores.");
//           setShowHabilitarModal(false);
//           fetchData();
//         }
//       } else {
//         alert("No hay embajadores activos en el sistema para asignarles el reporte.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Ocurrió un error inesperado.");
//     } finally {
//       setProcesandoMes(false);
//     }
//   };

//   const seleccionarReporte = async (reporte: any) => {
//     setReporteSeleccionado(reporte);
    
//     // Buscamos las actividades del embajador que correspondan al mes y año de este reporte
//     const strMes = String(reporte.mes).padStart(2, '0');
//     const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();
//     const fechaInicio = `${reporte.anio}-${strMes}-01`;
//     const fechaFin = `${reporte.anio}-${strMes}-${ultimoDia}`;

//     // Necesitamos el usuario_id del reporte actual para filtrar sus actividades
//     const { data: repInfo } = await supabase.from('reportes').select('usuario_id').eq('id', reporte.id).single();
//     if (!repInfo) return;

//     const { data: actividadesMes } = await supabase
//       .from('actividades')
//       .select('*')
//       .eq('creado_por_usuario_id', repInfo.usuario_id)
//       .gte('fecha_evento', fechaInicio)
//       .lte('fecha_evento', fechaFin);

//     if (!actividadesMes || actividadesMes.length === 0) {
//       setReporteSeleccionado({ ...reporte, actividades: [] });
//       return;
//     }

//     const actividadesCompletas = await Promise.all(
//       actividadesMes.map(async (act: any) => {
//         // Beneficiarios
//         const { data: benefData } = await supabase.from('actividad_beneficiarios').select('*').eq('actividad_id', act.id);
//         let beneficiariosObj: any = {};
//         benefData?.forEach((b: any) => {
//           beneficiariosObj[b.categoria_id] = { hombres: b.hombres.toString(), mujeres: b.mujeres.toString(), total: b.total.toString() };
//         });

//         // Acciones
//         const { data: accData } = await supabase.from('actividad_acciones').select('*').eq('actividad_id', act.id);
//         let accionesObj: any = {};
//         accData?.forEach((a: any) => {
//           // Buscamos el nombre del tipo de acción correspondiente al ID guardado
//           const tipoAccionObj = accionesDB.find(t => t.id === a.tipo_accion_id);
//           const nombreAccion = tipoAccionObj ? tipoAccionObj.nombre : 'Acción';
//           accionesObj[nombreAccion] = a.cantidad.toString(); 
//         });

//         // Sostenibilidad (consultando áreas asociadas)
//         const { data: sostData } = await supabase.from('actividad_sostenibilidad').select('area_id').eq('actividad_id', act.id);
//         let sostenibilidadObj = { economico: false, social: false, ambiental: false };
//         sostData?.forEach((s: any) => {
//           if (s.area_id === 1) sostenibilidadObj.economico = true;
//           if (s.area_id === 2) sostenibilidadObj.social = true;
//           if (s.area_id === 3) sostenibilidadObj.ambiental = true;
//         });

//         // Evidencias
//         const { data: evData } = await supabase.from('evidencias').select('id, url_archivo').eq('actividad_id', act.id);

//         return {
//           ...act,
//           rango_edad: act.rango_edad_beneficiarios,
//           beneficiarios: beneficiariosObj,
//           acciones: accionesObj,
//           sostenibilidad: sostenibilidadObj,
//           evidencias: evData ? evData.map(ev => ({ id: ev.id, url: ev.url_archivo })) : [],
//           anulada: false
//         };
//       })
//     );

//     setReporteSeleccionado({ ...reporte, actividades: actividadesCompletas });
//   };

//   const toggleAnularActividad = (actividadId: string) => {
//     if (!reporteSeleccionado) return;
//     const reporteActualizado = {
//       ...reporteSeleccionado,
//       actividades: reporteSeleccionado.actividades.map((act: any) => 
//         act.id === actividadId ? { ...act, anulada: !act.anulada } : act
//       )
//     };
//     setReporteSeleccionado(reporteActualizado);
//   };

//   const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
//   };

//   const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setActividadEnEdicion((prev: any) => ({
//       ...prev, domicilio: { ...prev.domicilio, [name]: value }
//     }));
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
//         hombres: granTotalHombres.toString(), mujeres: granTotalMujeres.toString(),
//         total: (granTotalHombres + granTotalMujeres).toString()
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

//   // ==========================================
//   // FUNCIÓN DE GUARDADO MAESTRO A LA BASE DE DATOS
//   // ==========================================
//   const guardarEdicionActividad = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reporteSeleccionado || !actividadEnEdicion) return;

//     setGuardando(true);
//     try {
//       const actId = actividadEnEdicion.id;

//       // 1. Actualizar tabla 'actividades'
//       const { error: errAct } = await supabase
//         .from('actividades')
//         .update({
//           nombre: actividadEnEdicion.nombre,
//           tipo_actividad: actividadEnEdicion.tipo_actividad,
//           fecha_evento: actividadEnEdicion.fecha_evento,
//           hora_inicio: actividadEnEdicion.hora_inicio || null,
//           hora_fin: actividadEnEdicion.hora_fin || null,
//           ods_principal: actividadEnEdicion.ods_principal,
//           lugar: actividadEnEdicion.lugar,
//           rango_edad_beneficiarios: actividadEnEdicion.rango_edad,
//           descripcion: actividadEnEdicion.descripcion,
//           fecha_actualizacion: new Date().toISOString()
//         })
//         .eq('id', actId);

//       if (errAct) throw errAct;

//       // 2. Actualizar Beneficiarios en 'actividad_beneficiarios' (Upsert o borrar e insertar)
//       if (actividadEnEdicion.beneficiarios) {
//         for (const [catIdStr, valores] of Object.entries(actividadEnEdicion.beneficiarios)) {
//           const catId = Number(catIdStr);
//           const val: any = valores;

//           await supabase.from('actividad_beneficiarios').upsert({
//             actividad_id: actId,
//             categoria_id: catId,
//             hombres: parseInt(val.hombres || '0', 10),
//             mujeres: parseInt(val.mujeres || '0', 10),
//             total: parseInt(val.total || '0', 10),
//             actualizado_en: new Date().toISOString()
//           }, { onConflict: 'actividad_id,categoria_id' }); // Nota: Asegúrate de tener índice único si usas onConflict, o borramos antes.
//         }
//       }

//       // 3. Actualizar Acciones en 'actividad_acciones'
//       if (actividadEnEdicion.acciones) {
//         for (const [nombreAccion, cantidadStr] of Object.entries(actividadEnEdicion.acciones)) {
//           const tipoObj = accionesDB.find(a => a.nombre === nombreAccion);
//           if (!tipoObj) continue;

//           await supabase.from('actividad_acciones').upsert({
//             actividad_id: actId,
//             tipo_accion_id: tipoObj.id,
//             cantidad: parseInt(cantidadStr as string || '0', 10),
//             actualizado_en: new Date().toISOString()
//           }, { onConflict: 'actividad_id,tipo_accion_id' });
//         }
//       }

//       // 4. Vincular la actividad al reporte formalmente en 'reporte_act' si no estaba vinculada
//       await supabase.from('reporte_act').upsert({
//         reporte_id: reporteSeleccionado.id,
//         actividad_id: actId,
//         estado_validacion: 'Pendiente',
//         fecha_agregado: new Date().toISOString()
//       }, { onConflict: 'reporte_id,actividad_id' });

//       alert("¡Actividad guardada y sincronizada con la base de datos con éxito!");
//       setActividadEnEdicion(null);
//       seleccionarReporte(reporteSeleccionado); // Recargar vista

//     } catch (error: any) {
//       console.error("Error guardando en BD:", error);
//       alert("Hubo un error al guardar la actividad: " + (error.message || error));
//     } finally {
//       setGuardando(false);
//     }
//   };

//   const snapshotParaPDF = reporteSeleccionado ? {
//     ...reporteSeleccionado,
//     actividades: ocultarAnuladasPDF ? reporteSeleccionado.actividades.filter((a: any) => !a.anulada) : reporteSeleccionado.actividades
//   } : null;

//   return (
//     <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
//       {/* ================= MODAL HABILITAR MES ================= */}
//       {showHabilitarModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
//                 <Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes
//               </h3>
//               <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleHabilitarMes} className="p-6 space-y-4">
//               <p className="text-sm text-gray-600 mb-4">Habilitar un mes creará los registros vacíos correspondientes para todos los embajadores activos en el sistema.</p>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Mes</label>
//                 <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>
//                   {MESES.map((m, i) => (
//                     <option key={i+1} value={i+1}>{m}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Año</label>
//                 <input type="number" required min="2024" max="2100" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} />
//               </div>
//               <div className="pt-4 flex gap-3">
//                 <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button type="submit" disabled={procesandoMes} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 disabled:bg-gray-400">
//                   {procesandoMes ? <><Loader2 className="animate-spin" size={16}/> Procesando...</> : 'Habilitar Mes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= MODAL DE EDICIÓN ================= */}
//       {actividadEnEdicion && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
//               <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
//                 <Edit2 size={20} className="text-[#00689D]"/> Editar Registro de Actividad
//               </h3>
//               <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
//               <form id="form-edicion" onSubmit={guardarEdicionActividad} className="space-y-8">
                
//                 {/* SECCIÓN 1: DATOS GENERALES */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
//                       <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">ODS Principal</label>
//                       <input type="text" name="ods_principal" value={actividadEnEdicion.ods_principal || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Actividad</label>
//                       <input type="text" name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
//                       <input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Inicio (Hora)</label>
//                       <input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Fin (Hora)</label>
//                       <input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                   </div>
//                 </div>

//                 {/* SECCIÓN 2: UBICACIÓN */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la actividad</label>
//                       <input type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Municipio</label>
//                       <input type="text" name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                   </div>
//                 </div>

//                 {/* SECCIÓN 3: BENEFICIARIOS Y ACCIONES */}
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
//                             type="number" placeholder="Total" value={actividadEnEdicion.beneficiarios?.[cat.id]?.total || ''} 
//                             disabled tabIndex={-1}
//                             className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500 opacity-80'}`}
//                           />
//                           <input 
//                             type="number" placeholder="H" value={actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || ''} 
//                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} 
//                             disabled={esFilaTotal} tabIndex={esFilaTotal ? -1 : undefined}
//                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed' : 'border-gray-300 focus:border-[#00689D]'}`}
//                           />
//                           <input 
//                             type="number" placeholder="M" value={actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || ''} 
//                             onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} 
//                             disabled={esFilaTotal} tabIndex={esFilaTotal ? -1 : undefined}
//                             className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold cursor-not-allowed' : 'border-gray-300 focus:border-[#00689D]'}`}
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="space-y-4">
//                     <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Acciones</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       {accionesDB.map(act => (
//                         <div key={act.id}>
//                           <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 truncate">{act.nombre}</label>
//                           <input type="number" name={act.nombre} value={actividadEnEdicion.acciones?.[act.nombre] || ''} onChange={handleAccionChange} className="w-full border border-gray-300 rounded p-1.5 text-sm"/>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="mt-4">
//                       <label className="block text-xs font-bold text-gray-600 mb-1">Rango de edad</label>
//                       <input type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
//                     </div>
//                   </div>
//                 </div>

//                 {/* SECCIÓN 4: DESCRIPCIÓN */}
//                 <div className="space-y-4">
//                   <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción</h4>
//                   <textarea name="descripcion" rows={4} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
//                 </div>

//               </form>
//             </div>

//             <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
//               <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
//               <button form="form-edicion" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400">
//                 {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar en Base de Datos</>}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
//       <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
//         <div>
//           <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
//           <p className="text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
//         </div>
//         <button 
//           onClick={() => setShowHabilitarModal(true)}
//           className="flex items-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A] transition-colors shadow-sm"
//         >
//           <Plus size={18} /> Habilitar Nuevo Mes
//         </button>
//       </div>

//       <div className="flex flex-1 gap-6 min-h-0">
        
//         {/* LISTA DE REPORTES (Izquierda) */}
//         <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
//           <div className="p-4 border-b border-gray-100 bg-gray-50">
//             <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
//           </div>
//           <div className="flex-1 overflow-y-auto">
//             {reportes.length === 0 ? (
//               <div className="p-6 text-center text-gray-400 text-sm">No hay reportes generados. Habilita un mes para comenzar.</div>
//             ) : (
//               reportes.map(reporte => (
//                 <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50'}`}>
//                   <p className="text-xs font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
//                   <p className={`text-sm mt-1 ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold'}`}>{reporte.embajador.nombre}</p>
//                   <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${reporte.estado === 'Enviado' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{reporte.estado}</span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* DETALLE DEL REPORTE (Derecha) */}
//         {reporteSeleccionado ? (
//           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
//             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between shrink-0 items-center">
//               <h2 className="text-lg font-black"><FileText className="inline text-[#00689D] mr-2"/> Expediente: {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
//             </div>
//             <div className="flex-1 flex overflow-hidden">
//               <div className="flex-1 bg-gray-600 flex flex-col">
//                 <PDFViewer width="100%" height="100%" className="border-none">
//                   <ReportePDF snapshot={snapshotParaPDF} categorias={categoriasDB} acciones={accionesDB} />
//                 </PDFViewer>
//               </div>

//               <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
//                 <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
//                   <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas</span></div>
//                   <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
//                     <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-5.5' : 'left-1'}`} />
//                   </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                   {reporteSeleccionado.actividades && reporteSeleccionado.actividades.length === 0 ? (
//                     <div className="text-center text-sm text-gray-400 mt-4">Sin actividades en este reporte.</div>
//                   ) : (
//                     reporteSeleccionado.actividades?.map((act: any, idx: number) => (
//                       <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
//                         <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
//                         <div className="flex gap-2">
//                           <button onClick={() => setActividadEnEdicion(act)} className="flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700">Editar</button>
//                           <button onClick={() => toggleAnularActividad(act.id)} className={`flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border ${act.anulada ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'}`}>
//                             {act.anulada ? 'Restaurar' : 'Anular'}
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 bg-white rounded-2xl flex items-center justify-center text-gray-400">Selecciona un reporte de la lista.</div>
//         )}
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from 'react';
// import { 
//   Inbox, FileText, X, Settings2, Plus, Calendar, Loader2, Filter, MapPin
// } from 'lucide-react';
// import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// import { supabase } from '@/lib/supabase'; 

// const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// // ==========================================
// // 1. ESTILOS Y COMPONENTE DEL PDF 
// // ==========================================
// const styles = StyleSheet.create({
//   page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
//   table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
//   row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
//   colContent: { flexDirection: 'column', flex: 1 },
//   sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
//   cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
//   cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
//   noBorderRight: { borderRightWidth: 0 },
//   noBorderBottom: { borderBottomWidth: 0 },
//   w10: { width: '10%' }, w15: { width: '15%' }, w20: { width: '20%' }, w30: { width: '30%' },
//   w35: { width: '35%' }, w40: { width: '40%' }, w50: { width: '50%' }, w60: { width: '60%' }, w85: { width: '85%' },
//   textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
//   textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
//   textCenter: { textAlign: 'center', fontSize: 8 },
//   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 100 },
//   foto: { width: '22%', height: 80, objectFit: 'cover', backgroundColor: '#e5e5e5' },
//   bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
// });

// const ReportePDF = ({ snapshot, categorias, acciones }: any) => {
//   if (!snapshot || !snapshot.actividades) return null;

//   return (
//     <Document>
//       <Page size="LETTER" style={styles.page}>
//         {snapshot.actividades.map((actividad: any, index: number) => (
//           <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
//             {actividad.anulada && (
//               <View style={styles.bannerAnulado}>
//                 <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - NO CONTABILIZA EN ESTADÍSTICAS ***</Text>
//               </View>
//             )}

//             {/* DATOS DEL PROYECTO */}
//             <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
//               <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
//               <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{actividad.fecha_evento}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
//               <View style={[styles.cellData, styles.w35]}><Text>{actividad.tipo_actividad}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
//               <View style={[styles.cellData, styles.w10]}><Text>{actividad.hora_inicio}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
//               <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{actividad.hora_fin}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
//               <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{actividad.ods_principal}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
//               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.economico ? 'X' : ''}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
//               <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.social ? 'X' : ''}</Text></View>
//               <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
//               <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.sostenibilidad?.ambiental ? 'X' : ''}</Text></View>
//             </View>
            
//             {/* UBICACIÓN */}
//             <Text style={styles.sectionHeader}>Ubicación</Text>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
//               <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.lugar}</Text></View>
//             </View>
//             <View style={styles.row}>
//               <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
//               <View style={[styles.colContent, styles.noBorderRight]}>
//                 <View style={[styles.row, styles.noBorderBottom]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.municipio}</Text></View>
//                 </View>
//                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.colonia}</Text></View>
//                 </View>
//                 <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
//                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{actividad.domicilio?.calle}</Text></View>
//                 </View>
//               </View>
//             </View>

//             {/* REGISTRO DE ACTIVIDADES Y ACCIONES */}
//             <Text style={styles.sectionHeader}>Registro de actividades</Text>
//             <View style={[styles.row, { alignItems: 'stretch' }]}>
              
//               <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                 <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
//                   <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
//                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
//                   </View>
//                   <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
//                     <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
//                   </View>
//                   <View style={[styles.w30, { flexDirection: 'column' }]}>
//                     <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
//                     <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
//                       <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
//                       <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
//                     </View>
//                   </View>
//                 </View>

//                 {categorias.map((cat: any, i: number) => {
//                   const isLast = i === categorias.length - 1;
//                   const datos = actividad.beneficiarios?.[cat.id] || {}; 
//                   return (
//                     <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined]}>
//                       <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
//                       <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{datos.total || ''}</Text></View>
//                       <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{datos.hombres || ''}</Text></View>
//                       <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{datos.mujeres || ''}</Text></View>
//                     </View>
//                   );
//                 })}
//               </View>

//               <View style={[styles.w40, { flexDirection: 'column' }]}>
//                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Número de acciones</Text></View>
                 
//                 {acciones.map((acc: any) => (
//                   <View key={acc.id} style={styles.row}>
//                     <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
//                     <View style={[styles.cellData, styles.w40, styles.noBorderRight]}><Text style={styles.textCenter}>{actividad.acciones?.[acc.nombre] || ''}</Text></View>
//                   </View>
//                 ))}
                 
//                 <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad</Text></View>
//                 <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text>{actividad.rango_edad || ''}</Text></View>
//               </View>
//             </View>

//             <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
//             <View style={[styles.row, { minHeight: 40, padding: 5, alignItems: 'flex-start' }]}><Text>{actividad.descripcion}</Text></View>
//             <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
//             <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
//               {[0, 1, 2, 3].map((index) => (
//                 <View key={index} style={styles.foto}>
//                   {actividad.evidencias && actividad.evidencias[index] ? (
//                     <Text style={{textAlign:'center', marginTop: 35, fontSize: 6, color: '#666'}}>Evidencia {index+1}</Text>
//                   ) : null}
//                 </View>
//               ))}
//             </View>
//           </View>
//         ))}
//       </Page>
//     </Document>
//   );
// };


// // ==========================================
// // 3. PANTALLA PRINCIPAL ADMIN
// // ==========================================
// export default function AdminReportes() {
//   const [reportes, setReportes] = useState<any[]>([]);
//   const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
//   const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useState(false);

//   // Filtros
//   const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Enviado' | 'Borrador'>('Enviado'); // Por defecto 'Enviado'
//   const [filtroMes, setFiltroMes] = useState<string>('Todos');
//   const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
  
//   // Catálogos
//   const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
//   const [accionesDB, setAccionesDB] = useState<any[]>([]);
//   const [municipiosList, setMunicipiosList] = useState<any[]>([]);

//   // Estados Habilitar Mes
//   const [showHabilitarModal, setShowHabilitarModal] = useState(false);
//   const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
//   const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
//   const [procesandoMes, setProcesandoMes] = useState(false);

//   // FETCH DE DATOS REALES
//   const fetchData = async () => {
//     try {
//       // Catálogos
//       const { data: catData } = await supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id');
//       if (catData) setCategoriasDB(catData);

//       const { data: accData } = await supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id');
//       if (accData) setAccionesDB(accData);

//       const { data: munData } = await supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre');
//       if (munData) setMunicipiosList(munData);

//       // Mapear qué embajador pertenece a qué municipio
//       const { data: embData } = await supabase.from('embajadores').select('usuario_id, municipios(nombre)');
//       const embMap = new Map();
//       embData?.forEach(e => {
//         embMap.set(e.usuario_id, (e.municipios as any)?.nombre || 'Sin municipio');
//       });

//       // Traer Reportes
//       const { data: repData } = await supabase
//         .from('reportes')
//         .select(`
//           id, mes, anio, estado, usuario_id,
//           usuarios!reportes_usuario_id_fkey (
//             nombre, apellido
//           )
//         `)
//         .order('anio', { ascending: false })
//         .order('mes', { ascending: false });

//       if (repData) {
//         const formateados = repData.map((r: any) => ({
//           ...r,
//           nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`,
//           embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
//           municipio_nombre: embMap.get(r.usuario_id) || 'Desconocido',
//           actividades: []
//         }));
//         setReportes(formateados);
//       }
//     } catch (error) {
//       console.error("Error cargando datos:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleHabilitarMes = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setProcesandoMes(true);
//     try {
//       const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
      
//       if (existing && existing.length > 0) {
//         alert("Este mes ya fue habilitado previamente.");
//         setProcesandoMes(false);
//         return;
//       }

//       const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
      
//       if (embajadores && embajadores.length > 0) {
//         const strMes = String(nuevoMes).padStart(2, '0');
//         const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
        
//         const inserts = embajadores.map((emb: any) => ({
//           usuario_id: emb.usuario_id,
//           mes: nuevoMes,
//           anio: nuevoAnio,
//           periodo_inicio: `${nuevoAnio}-${strMes}-01`,
//           periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
//           estado: 'Borrador'
//         }));

//         const { error } = await supabase.from('reportes').insert(inserts);
//         if (error) alert("Error habilitando el mes: " + error.message);
//         else {
//           alert("Mes habilitado exitosamente para todos los embajadores.");
//           setShowHabilitarModal(false);
//           fetchData();
//         }
//       } else {
//         alert("No hay embajadores activos en el sistema para asignarles el reporte.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Ocurrió un error inesperado.");
//     } finally {
//       setProcesandoMes(false);
//     }
//   };

//   const seleccionarReporte = async (reporte: any) => {
//     setReporteSeleccionado(reporte);
    
//     const strMes = String(reporte.mes).padStart(2, '0');
//     const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();
//     const fechaInicio = `${reporte.anio}-${strMes}-01`;
//     const fechaFin = `${reporte.anio}-${strMes}-${ultimoDia}`;

//     const { data: actividadesMes } = await supabase
//       .from('actividades')
//       .select('*')
//       .eq('creado_por_usuario_id', reporte.usuario_id)
//       .gte('fecha_evento', fechaInicio)
//       .lte('fecha_evento', fechaFin);

//     if (!actividadesMes || actividadesMes.length === 0) {
//       setReporteSeleccionado({ ...reporte, actividades: [] });
//       return;
//     }

//     const actividadesCompletas = await Promise.all(
//       actividadesMes.map(async (act: any) => {
//         // Beneficiarios
//         const { data: benefData } = await supabase.from('actividad_beneficiarios').select('*').eq('actividad_id', act.id);
//         let beneficiariosObj: any = {};
//         benefData?.forEach((b: any) => {
//           beneficiariosObj[b.categoria_id] = { hombres: b.hombres.toString(), mujeres: b.mujeres.toString(), total: b.total.toString() };
//         });

//         // Acciones
//         const { data: accData } = await supabase.from('actividad_acciones').select('*').eq('actividad_id', act.id);
//         let accionesObj: any = {};
//         accData?.forEach((a: any) => {
//           const tipoAccionObj = accionesDB.find(t => t.id === a.tipo_accion_id);
//           const nombreAccion = tipoAccionObj ? tipoAccionObj.nombre : 'Acción';
//           accionesObj[nombreAccion] = a.cantidad.toString(); 
//         });

//         // Sostenibilidad 
//         const { data: sostData } = await supabase.from('actividad_sostenibilidad').select('area_id').eq('actividad_id', act.id);
//         let sostenibilidadObj = { economico: false, social: false, ambiental: false };
//         sostData?.forEach((s: any) => {
//           if (s.area_id === 1) sostenibilidadObj.economico = true;
//           if (s.area_id === 2) sostenibilidadObj.social = true;
//           if (s.area_id === 3) sostenibilidadObj.ambiental = true;
//         });

//         // Evidencias
//         const { data: evData } = await supabase.from('evidencias').select('id, url_archivo').eq('actividad_id', act.id);

//         return {
//           ...act,
//           rango_edad: act.rango_edad_beneficiarios,
//           beneficiarios: beneficiariosObj,
//           acciones: accionesObj,
//           sostenibilidad: sostenibilidadObj,
//           evidencias: evData ? evData.map(ev => ({ id: ev.id, url: ev.url_archivo })) : [],
//           anulada: false
//         };
//       })
//     );

//     setReporteSeleccionado({ ...reporte, actividades: actividadesCompletas });
//   };

//   const toggleAnularActividad = (actividadId: string) => {
//     if (!reporteSeleccionado) return;
//     const reporteActualizado = {
//       ...reporteSeleccionado,
//       actividades: reporteSeleccionado.actividades.map((act: any) => 
//         act.id === actividadId ? { ...act, anulada: !act.anulada } : act
//       )
//     };
//     setReporteSeleccionado(reporteActualizado);
//   };

//   const snapshotParaPDF = reporteSeleccionado ? {
//     ...reporteSeleccionado,
//     actividades: ocultarAnuladasPDF ? reporteSeleccionado.actividades.filter((a: any) => !a.anulada) : reporteSeleccionado.actividades
//   } : null;

//   // LOGICA DEL FILTRO
//   const reportesFiltrados = reportes.filter(r => {
//     const matchEstado = filtroEstado === 'Todos' || r.estado === filtroEstado;
//     const matchMes = filtroMes === 'Todos' || String(r.mes) === filtroMes;
//     const matchMunicipio = filtroMunicipio === 'Todos' || r.municipio_nombre === filtroMunicipio;
//     return matchEstado && matchMes && matchMunicipio;
//   });

//   return (
//     <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
//       {/* ================= MODAL HABILITAR MES ================= */}
//       {showHabilitarModal && (
//         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
//               <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
//                 <Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes
//               </h3>
//               <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleHabilitarMes} className="p-6 space-y-4">
//               <p className="text-sm text-gray-600 mb-4">Habilitar un mes creará los registros vacíos correspondientes para todos los embajadores activos en el sistema.</p>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Mes</label>
//                 <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>
//                   {MESES.map((m, i) => (
//                     <option key={i+1} value={i+1}>{m}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Año</label>
//                 <input type="number" required min="2024" max="2100" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} />
//               </div>
//               <div className="pt-4 flex gap-3">
//                 <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
//                 <button type="submit" disabled={procesandoMes} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 disabled:bg-gray-400">
//                   {procesandoMes ? <><Loader2 className="animate-spin" size={16}/> Procesando...</> : 'Habilitar Mes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
//       <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
//         <div>
//           <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
//           <p className="text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
//         </div>
//         <button 
//           onClick={() => setShowHabilitarModal(true)}
//           className="flex items-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A] transition-colors shadow-sm"
//         >
//           <Plus size={18} /> Habilitar Nuevo Mes
//         </button>
//       </div>

//       <div className="flex flex-1 gap-6 min-h-0">
        
//         {/* LISTA DE REPORTES Y FILTROS (Izquierda) */}
//         <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          
//           {/* Header */}
//           <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
//             <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
//             <span className="text-xs bg-[#00689D] text-white px-2 py-0.5 rounded-full font-bold">{reportesFiltrados.length}</span>
//           </div>

//           {/* Filtros */}
//           <div className="border-b border-gray-100 bg-white flex flex-col">
//             {/* Tabs de Estado */}
//             <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
//               <button onClick={() => setFiltroEstado('Todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Todos' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Todos</button>
//               <button onClick={() => setFiltroEstado('Enviado')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Enviado' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Enviados</button>
//               <button onClick={() => setFiltroEstado('Borrador')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Borrador' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Borrador</button>
//             </div>
            
//             {/* Dropdowns Mes y Municipio */}
//             <div className="p-3 space-y-3 bg-white">
//               <div>
//                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Mes</label>
//                 <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
//                   <option value="Todos">Todos los meses</option>
//                   {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Municipio</label>
//                 <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
//                   <option value="Todos">Todos los municipios</option>
//                   {municipiosList.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             {reportesFiltrados.length === 0 ? (
//               <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full">
//                 <Filter size={32} className="mb-2 opacity-20"/>
//                 No hay expedientes que coincidan con estos filtros.
//               </div>
//             ) : (
//               reportesFiltrados.map(reporte => (
//                 <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer transition-colors ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
//                   <div className="flex justify-between items-start mb-1">
//                     <p className="text-[10px] font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
//                     <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${reporte.estado === 'Enviado' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{reporte.estado}</span>
//                   </div>
//                   <p className={`text-sm ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-800'}`}>{reporte.embajador.nombre}</p>
//                   <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {reporte.municipio_nombre}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* DETALLE DEL REPORTE (Derecha) */}
//         {reporteSeleccionado ? (
//           <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
//             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between shrink-0 items-center">
//               <h2 className="text-lg font-black"><FileText className="inline text-[#00689D] mr-2"/> Expediente: {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
//             </div>
//             <div className="flex-1 flex overflow-hidden">
//               <div className="flex-1 bg-gray-600 flex flex-col">
//                 <PDFViewer width="100%" height="100%" className="border-none">
//                   <ReportePDF snapshot={snapshotParaPDF} categorias={categoriasDB} acciones={accionesDB} />
//                 </PDFViewer>
//               </div>

//               <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
//                 <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
//                   <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas</span></div>
//                   <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
//                     <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-5.5' : 'left-1'}`} />
//                   </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                   {reporteSeleccionado.actividades && reporteSeleccionado.actividades.length === 0 ? (
//                     <div className="text-center text-sm text-gray-400 mt-4">Sin actividades en este reporte.</div>
//                   ) : (
//                     reporteSeleccionado.actividades?.map((act: any, idx: number) => (
//                       <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
//                         <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
//                         <div className="flex gap-2">
//                           {/* Botón de editar comentado porque no está implementado el modal en esta vista
//                            <button onClick={() => setActividadEnEdicion(act)} className="flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700">Editar</button>
//                           */}
//                           <button onClick={() => toggleAnularActividad(act.id)} className={`w-full flex justify-center py-1.5 text-xs font-bold rounded-lg border transition-colors ${act.anulada ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
//                             {act.anulada ? 'Restaurar Actividad' : 'Anular en Auditoría'}
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex-1 bg-white rounded-2xl flex items-center justify-center flex-col text-gray-400">
//              <FileText size={48} className="mb-4 opacity-20"/>
//              <p className="font-bold">Selecciona un expediente</p>
//              <p className="text-sm">Usa los filtros de la izquierda para encontrar reportes.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { 
  Inbox, FileText, Edit2, X, Save, Settings2, Plus, Calendar, Loader2, Filter, MapPin, Globe, AlertTriangle
} from 'lucide-react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

import { supabase } from '@/lib/supabase'; 

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ==========================================
// 1. ESTILOS Y COMPONENTE DEL PDF
// ==========================================
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
  table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
  colContent: { flexDirection: 'column', flex: 1 },
  sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
  cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
  cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
  cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
  noBorderRight: { borderRightWidth: 0 },
  noBorderBottom: { borderBottomWidth: 0 },
  w10: { width: '10%' }, w15: { width: '15%' }, w20: { width: '20%' }, w30: { width: '30%' },
  w35: { width: '35%' }, w40: { width: '40%' }, w50: { width: '50%' }, w60: { width: '60%' }, w85: { width: '85%' },
  textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
  textCenter: { textAlign: 'center', fontSize: 8 },
  evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
  foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
  bannerAnulado: { backgroundColor: '#fee2e2', padding: 6, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
  textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
});

const ReportePDF = ({ snapshot, categorias = [], acciones = [] }: any) => {
  if (!snapshot || !snapshot.actividades) return null;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {snapshot.actividades.map((actividad: any, index: number) => {
          
          const esPropia = actividad.creado_por_usuario_id === snapshot.usuario_id;
          const tipoActividadText = esPropia ? 'Propia' : 'Colaborativa';

          let odsText = actividad.ods_principal || '';
          if (!odsText && actividad.actividad_ods) {
            const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
            if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;
          }

          const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
          const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
          const calleText = actividad.calle || actividad.domicilio?.calle || '';
          const lugarText = actividad.lugar || '';

          const fechaAjustada = actividad.fecha_evento?.split('T')[0] || '';
          const horaInicio = actividad.hora_inicio?.slice(0, 5) || '';
          const horaFin = actividad.hora_fin?.slice(0, 5) || '';

          let econ = actividad.sostenibilidad?.economico === true;
          let soc = actividad.sostenibilidad?.social === true;
          let amb = actividad.sostenibilidad?.ambiental === true;
          
          if (actividad.actividad_sostenibilidad) {
            econ = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
            soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
            amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
          }

          const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';

          // LÓGICA DEL MOTIVO DE ANULACIÓN
          const motivoText = actividad.motivo_anulacion ? actividad.motivo_anulacion.toUpperCase() : 'NO CONTABILIZA EN ESTADÍSTICAS';

          return (
            <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
              {actividad.anulada && (
                <View style={styles.bannerAnulado}>
                  <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - {motivoText} ***</Text>
                </View>
              )}

              <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
                <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
                <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
                <View style={[styles.cellData, styles.w35]}><Text>{tipoActividadText}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
                <View style={[styles.cellData, styles.w10]}><Text>{horaInicio}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
                <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{horaFin}</Text></View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
                <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsText}</Text></View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
                <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{econ ? 'X' : ''}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
                <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{soc ? 'X' : ''}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
                <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{amb ? 'X' : ''}</Text></View>
              </View>

              <Text style={styles.sectionHeader}>Ubicación</Text>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
                <View style={[styles.cellData, styles.noBorderRight]}><Text>{lugarText}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
                <View style={[styles.colContent, styles.noBorderRight]}>
                  <View style={[styles.row, styles.noBorderBottom]}>
                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{municipioText}</Text></View>
                  </View>
                  <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{coloniaText}</Text></View>
                  </View>
                  <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
                    <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
                    <View style={[styles.cellData, styles.noBorderRight]}><Text>{calleText}</Text></View>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Registro de actividades</Text>
              <View style={[styles.row, { alignItems: 'stretch' }]}>
                
                <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                  <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
                    <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                      <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
                      <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
                    </View>
                    <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                      <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
                      <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
                    </View>
                    <View style={[styles.w30, { flexDirection: 'column' }]}>
                      <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
                      <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                        <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
                        <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
                      </View>
                    </View>
                  </View>

                  {categorias.map((cat: any, i: number) => {
                    const isLast = i === categorias.length - 1;
                    const esFilaTotal = cat.id === 99;
                    
                    let calcTotal = 0, calcH = 0, calcM = 0;
                    
                    if (esFilaTotal) {
                      categorias.forEach((c: any) => {
                        if (c.id !== 99) {
                          const rowB = actividad.actividad_beneficiarios?.find((b:any) => b.categoria_id === c.id) || actividad.beneficiarios?.[c.id] || {};
                          calcH += parseInt(rowB.hombres || '0', 10);
                          calcM += parseInt(rowB.mujeres || '0', 10);
                        }
                      });
                      calcTotal = calcH + calcM;
                    } else {
                      const rowB = actividad.actividad_beneficiarios?.find((b:any) => b.categoria_id === cat.id) || actividad.beneficiarios?.[cat.id] || {};
                      calcH = parseInt(rowB.hombres || '0', 10);
                      calcM = parseInt(rowB.mujeres || '0', 10);
                      calcTotal = calcH + calcM;
                    }

                    const strTotal = calcTotal > 0 ? calcTotal.toString() : '';
                    const strHombres = calcH > 0 ? calcH.toString() : '';
                    const strMujeres = calcM > 0 ? calcM.toString() : '';

                    return (
                      <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined, esFilaTotal ? { backgroundColor: '#f9f9f9' } : {}]}>
                        <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
                        <View style={[styles.cellData, styles.w20]}><Text style={esFilaTotal ? styles.textCenterBold : styles.textCenter}>{strTotal}</Text></View>
                        <View style={[styles.cellData, styles.w15]}><Text style={esFilaTotal ? styles.textCenterBold : styles.textCenter}>{strHombres}</Text></View>
                        <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={esFilaTotal ? styles.textCenterBold : styles.textCenter}>{strMujeres}</Text></View>
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.w40, { flexDirection: 'column' }]}>
                  <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Tipo de acción</Text></View>
                  
                  {acciones.map((acc: any) => {
                    const isSelected = actividad.tipo_actividad === acc.nombre || actividad.actividad_acciones?.some((a:any) => a.tipo_accion_id === acc.id);
                    const cantX = isSelected ? 'X' : '';

                    return (
                      <View key={acc.id} style={styles.row}>
                        <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
                        <View style={[styles.cellData, styles.w40, styles.noBorderRight]}>
                          <Text style={styles.textCenterBold}>{cantX}</Text>
                        </View>
                      </View>
                    );
                  })}
                  
                  <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad de los beneficiarios</Text></View>
                  <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text style={styles.textCenter}>{rangoEdadText}</Text></View>
                </View>

              </View>

              <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
              <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
                <Text>{actividad.descripcion}</Text>
              </View>

              <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias 4 fotos</Text>
              <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
                {[0, 1, 2, 3].map((index) => {
                  const evidencia = actividad.evidencias && actividad.evidencias[index]; 
                  return evidencia ? (
                    <Image key={index} src={evidencia.url_archivo || evidencia.url} style={styles.foto} />
                  ) : (
                    <View key={index} style={styles.foto} />
                  );
                })}
              </View>

            </View>
          );
        })}
      </Page>
    </Document>
  );
};


// ==========================================
// 3. PANTALLA PRINCIPAL ADMIN
// ==========================================
export default function AdminReportes() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useState(false);
  
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  // NUEVO: ESTADO PARA EL MODAL DE ANULACIÓN
  const [modalAnular, setModalAnular] = useState<{ visible: boolean; actividadId: number | null; comentario: string }>({
    visible: false, actividadId: null, comentario: ''
  });

  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Enviado' | 'Borrador'>('Enviado'); 
  const [filtroMes, setFiltroMes] = useState<string>('Todos');
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>('Todos');
  
  const [categoriasDB, setCategoriasDB] = useState<any[]>([]);
  const [accionesDB, setAccionesDB] = useState<any[]>([]);
  const [odsDB, setOdsDB] = useState<any[]>([]); 
  const [municipiosList, setMunicipiosList] = useState<any[]>([]);

  const [showHabilitarModal, setShowHabilitarModal] = useState(false);
  const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const [procesandoMes, setProcesandoMes] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, accRes, odsRes, munRes, embRes, repRes] = await Promise.all([
        supabase.from('categorias_beneficiarios').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('tipos_accion').select('id, nombre').eq('activo', true).order('id'),
        supabase.from('ods').select('id, numero, nombre, categoria_sostenibilidad').eq('activo', true).order('numero'),
        supabase.from('municipios').select('id, nombre').eq('activo', true).order('nombre'),
        supabase.from('embajadores').select('usuario_id, municipios(nombre)'),
        supabase.from('reportes')
          .select(`id, mes, anio, estado, usuario_id, usuarios!reportes_usuario_id_fkey(nombre, apellido)`)
          .order('anio', { ascending: false }).order('mes', { ascending: false })
      ]);

      if (catRes.data) {
        setCategoriasDB([...catRes.data, { id: 99, nombre: 'Total Beneficiarios' }]);
      }
      if (accRes.data) setAccionesDB(accRes.data);
      if (odsRes.data) setOdsDB(odsRes.data);
      if (munRes.data) setMunicipiosList(munRes.data);

      const embMap = new Map();
      embRes.data?.forEach(e => {
        embMap.set(e.usuario_id, (e.municipios as any)?.nombre || 'Sin municipio');
      });

      if (repRes.data) {
        const formateados = repRes.data.map((r: any) => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`,
          embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
          municipio_nombre: embMap.get(r.usuario_id) || 'Desconocido',
          actividades: []
        }));
        setReportes(formateados);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHabilitarMes = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesandoMes(true);
    try {
      const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
      if (existing && existing.length > 0) {
        alert("Este mes ya fue habilitado previamente.");
        setProcesandoMes(false);
        return;
      }
      const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
      if (embajadores && embajadores.length > 0) {
        const strMes = String(nuevoMes).padStart(2, '0');
        const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
        const inserts = embajadores.map((emb: any) => ({
          usuario_id: emb.usuario_id,
          mes: nuevoMes,
          anio: nuevoAnio,
          periodo_inicio: `${nuevoAnio}-${strMes}-01`,
          periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
          estado: 'Borrador'
        }));
        const { error } = await supabase.from('reportes').insert(inserts);
        if (error) alert("Error habilitando el mes: " + error.message);
        else {
          alert("Mes habilitado exitosamente.");
          setShowHabilitarModal(false);
          fetchData();
        }
      } else {
        alert("No hay embajadores activos en el sistema para asignarles el reporte.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setProcesandoMes(false);
    }
  };

  const seleccionarReporte = async (reporte: any) => {
    setReporteSeleccionado(reporte);
    
    const strMes = String(reporte.mes).padStart(2, '0');
    const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();
    const fechaInicio = `${reporte.anio}-${strMes}-01`;
    const fechaFin = `${reporte.anio}-${strMes}-${ultimoDia}`;

    const { data: actividadesMes } = await supabase
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
      .eq('creado_por_usuario_id', reporte.usuario_id)
      .gte('fecha_evento', fechaInicio)
      .lte('fecha_evento', fechaFin)
      .order('fecha_evento', { ascending: true });

    if (!actividadesMes || actividadesMes.length === 0) {
      setReporteSeleccionado({ ...reporte, actividades: [] });
      return;
    }

    // EXTRAER COMENTARIOS Y ESTADO DE VALIDACIÓN
    const { data: repActs } = await supabase
      .from('reporte_act')
      .select('actividad_id, estado_validacion, comentarios_admin')
      .eq('reporte_id', reporte.id);

    const validacionMap = new Map();
    repActs?.forEach(ra => {
      validacionMap.set(ra.actividad_id, {
        anulada: ra.estado_validacion === 'Rechazada', // O 'Anulada' según tu constraint
        comentario: ra.comentarios_admin || ''
      });
    });

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

      const validacionData = validacionMap.get(act.id) || { anulada: false, comentario: '' };

      return {
        ...act,
        rango_edad: act.rango_edad_beneficiarios,
        domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
        beneficiarios: beneficiariosObj,
        ods_seleccionados: odsSeleccionados,
        evidencias: act.evidencias ? act.evidencias.map((ev:any) => ({ id: ev.id, url: ev.url_archivo })) : [],
        anulada: validacionData.anulada,
        motivo_anulacion: validacionData.comentario,
        es_propia: act.creado_por_usuario_id === reporte.usuario_id
      };
    });

    setReporteSeleccionado({ ...reporte, actividades: actividadesCompletas });
  };

  // ==========================================
  // LÓGICA DE ANULACIÓN (CON COMENTARIO)
  // ==========================================
  const toggleAnularActividad = (actividadId: number, anuladaActual: boolean) => {
    if (!anuladaActual) {
      // SI NO ESTÁ ANULADA -> ABRIR MODAL PARA PEDIR MOTIVO
      setModalAnular({ visible: true, actividadId, comentario: '' });
    } else {
      // SI YA ESTÁ ANULADA -> RESTAURARLA DIRECTAMENTE (Y LIMPIAR COMENTARIO)
      procesarCambioEstado(actividadId, 'Aprobada', null);
    }
  };

  const procesarCambioEstado = async (actividadId: number, nuevoEstadoVal: string, comentario: string | null) => {
    if (!reporteSeleccionado) return;
    
    // Si estamos anulando, exigimos un motivo
    if (nuevoEstadoVal === 'Rechazada' && !comentario?.trim()) {
      return alert("Debes ingresar un motivo para anular la actividad.");
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('reporte_act').upsert({
        reporte_id: reporteSeleccionado.id,
        actividad_id: actividadId,
        estado_validacion: nuevoEstadoVal,
        comentarios_admin: comentario, // Se guarda el motivo o null si se aprueba
        validado_por_usuario_id: authData.user?.id,
        fecha_validacion: new Date().toISOString()
      }, { onConflict: 'reporte_id,actividad_id' });

      if (error) throw error;

      // Actualizar vista local
      const reporteActualizado = {
        ...reporteSeleccionado,
        actividades: reporteSeleccionado.actividades.map((act: any) => 
          act.id === actividadId ? { 
            ...act, 
            anulada: nuevoEstadoVal === 'Rechazada', 
            motivo_anulacion: comentario || '' 
          } : act
        )
      };
      setReporteSeleccionado(reporteActualizado);
      setModalAnular({ visible: false, actividadId: null, comentario: '' });
      
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la actividad en la base de datos.");
    }
  };

  // ==========================================
  // HANDLERS DEL FORMULARIO DE EDICIÓN PARA ADMIN
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

  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion) return;

    setGuardando(true);
    try {
      const actId = actividadEnEdicion.id;

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
        fecha_actualizacion: new Date().toISOString()
      };

      const { error: errAct } = await supabase.from('actividades').update(actividadData).eq('id', actId);
      if (errAct) throw errAct;

      if (actividadEnEdicion.beneficiarios) {
        for (const [catIdStr, valores] of Object.entries(actividadEnEdicion.beneficiarios)) {
          const catId = Number(catIdStr);
          if (catId === 99) continue; 
          
          const val: any = valores;
          await supabase.from('actividad_beneficiarios').upsert({
            actividad_id: actId, categoria_id: catId,
            hombres: parseInt(val.hombres || '0', 10), mujeres: parseInt(val.mujeres || '0', 10), total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
            actualizado_en: new Date().toISOString()
          }, { onConflict: 'actividad_id,categoria_id' }); 
        }
      }

      await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
      if (actividadEnEdicion.tipo_actividad) {
        const tipoObj = accionesDB.find(a => a.nombre === actividadEnEdicion.tipo_actividad);
        if (tipoObj) {
          await supabase.from('actividad_acciones').insert({
            actividad_id: actId, tipo_accion_id: tipoObj.id, cantidad: 1, creado_en: new Date().toISOString()
          });
        }
      }

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

      await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
      if (actividadEnEdicion.ods_seleccionados && actividadEnEdicion.ods_seleccionados.length > 0) {
        const odsPayload = actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({
          actividad_id: actId, ods_id: odsId, es_principal: idx === 0 
        }));
        await supabase.from('actividad_ods').insert(odsPayload);
      }

      alert('Actividad modificada exitosamente');
      setActividadEnEdicion(null);
      seleccionarReporte(reporteSeleccionado); // Refresca en vivo
      
    } catch (error: any) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const snapshotParaPDF = reporteSeleccionado ? {
    ...reporteSeleccionado,
    actividades: ocultarAnuladasPDF ? reporteSeleccionado.actividades.filter((a: any) => !a.anulada) : reporteSeleccionado.actividades
  } : null;

  const reportesFiltrados = reportes.filter(r => {
    const matchEstado = filtroEstado === 'Todos' || r.estado === filtroEstado;
    const matchMes = filtroMes === 'Todos' || String(r.mes) === filtroMes;
    const matchMunicipio = filtroMunicipio === 'Todos' || r.municipio_nombre === filtroMunicipio;
    return matchEstado && matchMes && matchMunicipio;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
      {/* ================= MODAL DE ANULACIÓN (NUEVO) ================= */}
      {modalAnular.visible && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-600" /> Motivo de anulación
              </h3>
              <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comentario para el embajador:</label>
                <textarea 
                  autoFocus
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none shadow-sm"
                  placeholder="Ej. Faltan evidencias claras, el evento no corresponde a este mes, etc."
                  value={modalAnular.comentario}
                  onChange={e => setModalAnular({ ...modalAnular, comentario: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-2">Este motivo aparecerá en el PDF del expediente indicando por qué la actividad no suma estadísticas.</p>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
                <button 
                  onClick={() => procesarCambioEstado(modalAnular.actividadId!, 'Rechazada', modalAnular.comentario)} 
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 flex justify-center items-center shadow-md transition-colors"
                >
                  Confirmar Anulación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE EDICIÓN ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-[#00689D]"/> Editar Registro de Actividad
              </h3>
              <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              <form id="form-edicion-admin" onSubmit={guardarEdicionActividad} className="space-y-8">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre de la Actividad</label>
                      <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
                      <select name="tipo_actividad" value={actividadEnEdicion.tipo_actividad || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
                      <input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label>
                      <input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Fin</label>
                      <input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="font-normal text-gray-500">(La sostenibilidad se calcula automáticamente)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white border-[#00689D]' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500 hover:border-blue-300'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? (isPrincipal ? 'bg-white text-[#00689D]' : 'bg-blue-200 text-blue-800') : 'bg-gray-100 text-gray-500'}`}>{ods.numero}</span>
                            {ods.nombre} {isPrincipal && <span className="font-normal opacity-80">(Principal)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Ubicación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Lugar de la Actividad</label>
                      <input type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Municipio</label>
                      <select name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {municipiosList.map(mun => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Colonia</label>
                      <input type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Calle</label>
                      <input type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/>
                    </div>
                  </div>
                </div>

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
                          <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>{cat.nombre}</span>
                          <input type="number" placeholder="0" value={strTotal} disabled tabIndex={-1} className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed pointer-events-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-[#00689D]/10 border-[#00689D]/20 text-[#00689D] font-bold' : 'border-gray-200 bg-gray-100 text-gray-500'}`} />
                          <input type="number" placeholder="H" value={strH} onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} disabled={esFilaTotal} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`} />
                          <input type="number" placeholder="M" value={strM} onChange={esFilaTotal ? undefined : (e) => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} disabled={esFilaTotal} className={`w-1/5 text-center border rounded p-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${esFilaTotal ? 'bg-gray-100 text-gray-500 font-bold cursor-not-allowed' : 'border-gray-300 focus:outline-none focus:border-[#00689D]'}`} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Rango de Edad Promedio</h4>
                    <input type="text" name="rango_edad" value={actividadEnEdicion.rango_edad || ''} onChange={handleChangeSimple} placeholder="Ej: 15 a 18 años" className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]"/>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción de la Actividad</h4>
                  <textarea name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button form="form-edicion-admin" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Cambios</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL HABILITAR MES ================= */}
      {showHabilitarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                <Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes
              </h3>
              <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleHabilitarMes} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">Habilitar un mes creará los registros vacíos correspondientes para todos los embajadores activos en el sistema.</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mes</label>
                <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>
                  {MESES.map((m, i) => (
                    <option key={i+1} value={i+1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Año</label>
                <input type="number" required min="2024" max="2100" className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] focus:ring-1 focus:ring-[#00689D] outline-none" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={procesandoMes} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 disabled:bg-gray-400">
                  {procesandoMes ? <><Loader2 className="animate-spin" size={16}/> Procesando...</> : 'Habilitar Mes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
        </div>
        <button 
          onClick={() => setShowHabilitarModal(true)}
          className="flex items-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A] transition-colors shadow-sm"
        >
          <Plus size={18} /> Habilitar Nuevo Mes
        </button>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* LISTA DE REPORTES Y FILTROS (Izquierda) */}
        <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
            <span className="text-xs bg-[#00689D] text-white px-2 py-0.5 rounded-full font-bold">{reportesFiltrados.length}</span>
          </div>

          <div className="border-b border-gray-100 bg-white flex flex-col">
            <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
              <button onClick={() => setFiltroEstado('Todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Todos' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Todos</button>
              <button onClick={() => setFiltroEstado('Enviado')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Enviado' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Enviados</button>
              <button onClick={() => setFiltroEstado('Borrador')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Borrador' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Borrador</button>
            </div>
            
            <div className="p-3 space-y-3 bg-white">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Mes</label>
                <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
                  <option value="Todos">Todos los meses</option>
                  {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Municipio</label>
                <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
                  <option value="Todos">Todos los municipios</option>
                  {municipiosList.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {reportesFiltrados.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full">
                <Filter size={32} className="mb-2 opacity-20"/>
                No hay expedientes que coincidan con estos filtros.
              </div>
            ) : (
              reportesFiltrados.map(reporte => (
                <div key={reporte.id} onClick={() => seleccionarReporte(reporte)} className={`p-4 border-b cursor-pointer transition-colors ${reporteSeleccionado?.id === reporte.id ? 'bg-blue-50 border-l-4 border-l-[#00689D]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black uppercase text-gray-400">{reporte.nombre_mes}</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${reporte.estado === 'Enviado' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{reporte.estado}</span>
                  </div>
                  <p className={`text-sm ${reporteSeleccionado?.id === reporte.id ? 'font-bold text-[#00689D]' : 'font-semibold text-gray-800'}`}>{reporte.embajador.nombre}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {reporte.municipio_nombre}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DETALLE DEL REPORTE (Derecha) */}
        {reporteSeleccionado ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between shrink-0 items-center">
              <h2 className="text-lg font-black"><FileText className="inline text-[#00689D] mr-2"/> Expediente: {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 bg-gray-600 flex flex-col">
                <PDFViewer width="100%" height="100%" className="border-none">
                  <ReportePDF snapshot={snapshotParaPDF} categorias={categoriasDB} acciones={accionesDB} />
                </PDFViewer>
              </div>

              <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Settings2 size={16}/><span className="text-xs font-bold">Ocultar anuladas</span></div>
                  <button onClick={() => setOcultarAnuladasPDF(!ocultarAnuladasPDF)} className={`w-10 h-5 rounded-full relative flex items-center ${ocultarAnuladasPDF ? 'bg-[#00689D]' : 'bg-gray-300'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${ocultarAnuladasPDF ? 'left-[22px]' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {reporteSeleccionado.actividades && reporteSeleccionado.actividades.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 mt-4">Sin actividades en este reporte.</div>
                  ) : (
                    reporteSeleccionado.actividades?.map((act: any, idx: number) => (
                      <div key={act.id} className={`p-3 rounded-xl border ${act.anulada ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                        <p className={`text-sm font-bold truncate mb-3 ${act.anulada ? 'line-through text-red-600' : ''}`}>{idx + 1}. {act.nombre}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setActividadEnEdicion(act)} className="flex-1 flex justify-center py-1.5 text-xs font-bold rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700">Editar</button>
                          
                          <button 
                            onClick={() => toggleAnularActividad(act.id, act.anulada)} 
                            className={`w-full flex justify-center py-1.5 text-xs font-bold rounded-lg border transition-colors ${act.anulada ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          >
                            {act.anulada ? 'Restaurar Actividad' : 'Anular en Auditoría'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl flex items-center justify-center flex-col text-gray-400">
             <FileText size={48} className="mb-4 opacity-20"/>
             <p className="font-bold">Selecciona un expediente</p>
             <p className="text-sm">Usa los filtros de la izquierda para encontrar reportes.</p>
          </div>
        )}
      </div>
    </div>
  );
}