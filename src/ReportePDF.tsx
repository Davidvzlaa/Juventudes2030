
// // import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
// //   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
// //   foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
// //   bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
// //   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
// // });

// // export const ReportePDF = ({ snapshot, categorias = [], acciones = [] }: any) => {
// //   if (!snapshot || !snapshot.actividades) return null;

// //   return (
// //     <Document>
// //       <Page size="LETTER" style={styles.page}>
        
// //         {snapshot.actividades.map((actividad: any, index: number) => {
          
// //           // ===============================================================
// //           // ADAPTADORES INTELIGENTES (Para leer directo de Supabase)
// //           // ===============================================================
          
// //           // 1. ODS Principal
// //           let odsText = actividad.ods_principal || '';
// //           if (!odsText && actividad.actividad_ods) {
// //             const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
// //             if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;
// //           }

// //           // 2. Ubicación
// //           const municipioText = actividad.domicilio?.municipio || actividad.municipios?.nombre || actividad.municipio || '';
// //           const coloniaText = actividad.domicilio?.colonia || actividad.colonia || '';
// //           const calleText = actividad.domicilio?.calle || actividad.calle || '';
// //           const lugarText = actividad.lugar || '';

// //           // 3. Fechas y Horas (limpieza visual)
// //           const fechaAjustada = actividad.fecha_evento?.split('T')[0] || '';
// //           const horaInicio = actividad.hora_inicio?.slice(0, 5) || '';
// //           const horaFin = actividad.hora_fin?.slice(0, 5) || '';

// //           // 4. Sostenibilidad (Buscar el Check 'X')
// //           let econ = actividad.sostenibilidad?.economico === true;
// //           let soc = actividad.sostenibilidad?.social === true;
// //           let amb = actividad.sostenibilidad?.ambiental === true;
          
// //           // Si viene crudo desde BD (arreglo)
// //           if (actividad.actividad_sostenibilidad) {
// //             econ = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
// //             soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
// //             amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
// //           }

// //           // 5. Rango de Edad
// //           const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';

// //           return (
// //             <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
// //               {actividad.anulada && (
// //                 <View style={styles.bannerAnulado}>
// //                   <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - NO CONTABILIZA EN ESTADÍSTICAS ***</Text>
// //                 </View>
// //               )}

// //               {/* ================= DATOS DEL PROYECTO ================= */}
// //               <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
// //                 <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
// //                 <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
// //               </View>
              
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
// //                 <View style={[styles.cellData, styles.w35]}><Text>{actividad.tipo_actividad}</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
// //                 <View style={[styles.cellData, styles.w10]}><Text>{horaInicio}</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
// //                 <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{horaFin}</Text></View>
// //               </View>
              
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
// //                 <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsText}</Text></View>
// //               </View>
              
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
// //                 <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{econ ? 'X' : ''}</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
// //                 <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{soc ? 'X' : ''}</Text></View>
// //                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
// //                 <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{amb ? 'X' : ''}</Text></View>
// //               </View>

// //               {/* ================= UBICACIÓN ================= */}
// //               <Text style={styles.sectionHeader}>Ubicación</Text>
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
// //                 <View style={[styles.cellData, styles.noBorderRight]}><Text>{lugarText}</Text></View>
// //               </View>
// //               <View style={styles.row}>
// //                 <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
// //                 <View style={[styles.colContent, styles.noBorderRight]}>
// //                   <View style={[styles.row, styles.noBorderBottom]}>
// //                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
// //                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{municipioText}</Text></View>
// //                   </View>
// //                   <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
// //                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
// //                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{coloniaText}</Text></View>
// //                   </View>
// //                   <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
// //                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
// //                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{calleText}</Text></View>
// //                   </View>
// //                 </View>
// //               </View>

// //               {/* ================= REGISTRO DE ACTIVIDADES ================= */}
// //               <Text style={styles.sectionHeader}>Registro de actividades</Text>
              
// //               <View style={[styles.row, { alignItems: 'stretch' }]}>
                
// //                 {/* --- LADO IZQUIERDO: Beneficiarios (w60) --- */}
// //                 <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                  
// //                   {/* Encabezado */}
// //                   <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
// //                     <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
// //                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
// //                       <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
// //                     </View>
// //                     <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
// //                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
// //                       <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
// //                     </View>
// //                     <View style={[styles.w30, { flexDirection: 'column' }]}>
// //                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
// //                       <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
// //                         <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
// //                         <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   {/* Llenado dinámico de Beneficiarios */}
// //                   {categorias.map((cat: any, i: number) => {
// //                     const isLast = i === categorias.length - 1;
                    
// //                     let total = '', hombres = '', mujeres = '';
                    
// //                     // Extraer datos dependiendo de cómo estén formateados
// //                     if (actividad.beneficiarios && actividad.beneficiarios[cat.id]) {
// //                       total = actividad.beneficiarios[cat.id].total || '';
// //                       hombres = actividad.beneficiarios[cat.id].hombres || '';
// //                       mujeres = actividad.beneficiarios[cat.id].mujeres || '';
// //                     } else if (actividad.actividad_beneficiarios) {
// //                       const dbRow = actividad.actividad_beneficiarios.find((b:any) => b.categoria_id === cat.id);
// //                       if (dbRow) {
// //                         total = dbRow.total?.toString() || '';
// //                         hombres = dbRow.hombres?.toString() || '';
// //                         mujeres = dbRow.mujeres?.toString() || '';
// //                       }
// //                     }

// //                     return (
// //                       <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined]}>
// //                         <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
// //                         <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{total}</Text></View>
// //                         <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{hombres}</Text></View>
// //                         <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{mujeres}</Text></View>
// //                       </View>
// //                     );
// //                   })}
// //                 </View>

// //                 {/* --- LADO DERECHO: Acciones y Edades (w40) --- */}
// //                 <View style={[styles.w40, { flexDirection: 'column' }]}>
// //                   <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Tipo de acción</Text></View>
                  
// //                   {/* Llenado dinámico de Acciones */}
// //                   {acciones.map((acc: any) => {
// //                     let cant = '';
// //                     if (actividad.acciones && actividad.acciones[acc.nombre] !== undefined) {
// //                       cant = actividad.acciones[acc.nombre];
// //                     } else if (actividad.actividad_acciones) {
// //                       const dbAct = actividad.actividad_acciones.find((a:any) => a.tipo_accion_id === acc.id);
// //                       if (dbAct) cant = dbAct.cantidad?.toString();
// //                     }

// //                     return (
// //                       <View key={acc.id} style={styles.row}>
// //                         <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
// //                         <View style={[styles.cellData, styles.w40, styles.noBorderRight]}>
// //                           <Text style={styles.textCenter}>{cant}</Text>
// //                         </View>
// //                       </View>
// //                     );
// //                   })}
                  
// //                   {/* Rango de edad */}
// //                   <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}>
// //                     <Text>Rango de edad de los beneficiarios</Text>
// //                   </View>
// //                   <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}>
// //                     <Text style={styles.textCenter}>{rangoEdadText}</Text>
// //                   </View>
// //                 </View>

// //               </View>

// //               {/* ================= DESCRIPCIÓN ================= */}
// //               <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
// //               <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
// //                 <Text>{actividad.descripcion}</Text>
// //               </View>

// //               {/* ================= EVIDENCIAS ================= */}
// //               <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias 4 fotos</Text>
// //               <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
// //                 {[0, 1, 2, 3].map((index) => {
// //                   const evidencia = actividad.evidencias && actividad.evidencias[index]; 
// //                   return evidencia ? (
// //                     <Image key={index} src={evidencia.url_archivo || evidencia.url} style={styles.foto} />
// //                   ) : (
// //                     <View key={index} style={styles.foto} />
// //                   );
// //                 })}
// //               </View>

// //             </View>
// //           );
// //         })}
// //       </Page>
// //     </Document>
// //   );
// // };

// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
//   table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
  
//   // Filas base con stretch para que las celdas siempre midan lo mismo de alto
//   row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
//   colContent: { flexDirection: 'column', flex: 1 },
  
//   // Cabeceras de sección (grises)
//   sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
  
//   // Estilos de celdas
//   cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
//   cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
  
//   // Utilidades para quitar bordes duplicados
//   noBorderRight: { borderRightWidth: 0 },
//   noBorderBottom: { borderBottomWidth: 0 },
  
//   // Utilidades de ancho (%)
//   w10: { width: '10%' },
//   w15: { width: '15%' },
//   w20: { width: '20%' },
//   w30: { width: '30%' },
//   w35: { width: '35%' },
//   w40: { width: '40%' },
//   w50: { width: '50%' },
//   w60: { width: '60%' },
//   w85: { width: '85%' },

//   // Textos específicos para la tabla
//   textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
//   textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
//   textCenter: { textAlign: 'center', fontSize: 8 },

//   // Contenedor de evidencias
//   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
//   foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
//   bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
// });

// export const ReportePDF = ({ snapshot, categorias = [], acciones = [] }: any) => {
//   if (!snapshot || !snapshot.actividades) return null;

//   return (
//     <Document>
//       <Page size="LETTER" style={styles.page}>
        
//         {snapshot.actividades.map((actividad: any, index: number) => {
          
//           // ===============================================================
//           // ADAPTADORES INTELIGENTES (Para leer directo de Supabase)
//           // ===============================================================
          
//           // 1. Propia vs Colaborativa
//           // Si el creador de la actividad es el dueño del reporte, es Propia, si no, es Colaborativa.
//           const esPropia = actividad.creado_por_usuario_id === snapshot.usuario_id;
//           const tipoActividadText = esPropia ? 'Propia' : 'Colaborativa';

//           // 2. ODS Principal
//           let odsText = actividad.ods_principal || '';
//           if (!odsText && actividad.actividad_ods) {
//             const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
//             if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;
//           }

//           // 3. Ubicación (Ajustado para jalar bien de la BD)
//           const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
//           const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
//           const calleText = actividad.calle || actividad.domicilio?.calle || '';
//           const lugarText = actividad.lugar || '';

//           // 4. Fechas y Horas (limpieza visual)
//           const fechaAjustada = actividad.fecha_evento?.split('T')[0] || '';
//           const horaInicio = actividad.hora_inicio?.slice(0, 5) || '';
//           const horaFin = actividad.hora_fin?.slice(0, 5) || '';

//           // 5. Sostenibilidad (Buscar el Check 'X')
//           let econ = actividad.sostenibilidad?.economico === true;
//           let soc = actividad.sostenibilidad?.social === true;
//           let amb = actividad.sostenibilidad?.ambiental === true;
          
//           if (actividad.actividad_sostenibilidad) {
//             econ = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
//             soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
//             amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
//           }

//           // 6. Rango de Edad
//           const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';

//           return (
//             <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
//               {actividad.anulada && (
//                 <View style={styles.bannerAnulado}>
//                   <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - NO CONTABILIZA EN ESTADÍSTICAS ***</Text>
//                 </View>
//               )}

//               {/* ================= DATOS DEL PROYECTO ================= */}
//               <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
//                 <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
//                 <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
//               </View>
              
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
//                 <View style={[styles.cellData, styles.w35]}><Text>{tipoActividadText}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Inicio (Hora)</Text></View>
//                 <View style={[styles.cellData, styles.w10]}><Text>{horaInicio}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fin (Hora)</Text></View>
//                 <View style={[styles.cellData, styles.w10, styles.noBorderRight]}><Text>{horaFin}</Text></View>
//               </View>
              
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS PRINCIPAL</Text></View>
//                 <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsText}</Text></View>
//               </View>
              
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
//                 <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{econ ? 'X' : ''}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w10]}><Text>Social</Text></View>
//                 <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{soc ? 'X' : ''}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Ambiental</Text></View>
//                 <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{amb ? 'X' : ''}</Text></View>
//               </View>

//               {/* ================= UBICACIÓN ================= */}
//               <Text style={styles.sectionHeader}>Ubicación</Text>
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Lugar de la actividad</Text></View>
//                 <View style={[styles.cellData, styles.noBorderRight]}><Text>{lugarText}</Text></View>
//               </View>
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Domicilio</Text></View>
//                 <View style={[styles.colContent, styles.noBorderRight]}>
//                   <View style={[styles.row, styles.noBorderBottom]}>
//                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Municipio</Text></View>
//                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{municipioText}</Text></View>
//                   </View>
//                   <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Colonia</Text></View>
//                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{coloniaText}</Text></View>
//                   </View>
//                   <View style={[styles.row, styles.noBorderBottom, { borderTopWidth: 1 }]}>
//                     <View style={[styles.cellHeaderCenter, styles.w20]}><Text>Calle</Text></View>
//                     <View style={[styles.cellData, styles.noBorderRight]}><Text>{calleText}</Text></View>
//                   </View>
//                 </View>
//               </View>

//               {/* ================= REGISTRO DE ACTIVIDADES ================= */}
//               <Text style={styles.sectionHeader}>Registro de actividades</Text>
              
//               <View style={[styles.row, { alignItems: 'stretch' }]}>
                
//                 {/* --- LADO IZQUIERDO: Beneficiarios (w60) --- */}
//                 <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                  
//                   {/* Encabezado */}
//                   <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 }]}> 
//                     <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios</Text></View>
//                       <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text style={styles.textCenterBold}>Tipo</Text></View>
//                     </View>
//                     <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
//                       <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#000' }}><Text></Text></View>
//                     </View>
//                     <View style={[styles.w30, { flexDirection: 'column' }]}>
//                       <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo (H/M)</Text></View>
//                       <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
//                         <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
//                         <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
//                       </View>
//                     </View>
//                   </View>

//                   {/* Llenado dinámico de Beneficiarios */}
//                   {categorias.map((cat: any, i: number) => {
//                     const isLast = i === categorias.length - 1;
                    
//                     let total = '', hombres = '', mujeres = '';
                    
//                     if (actividad.beneficiarios && actividad.beneficiarios[cat.id]) {
//                       total = actividad.beneficiarios[cat.id].total || '';
//                       hombres = actividad.beneficiarios[cat.id].hombres || '';
//                       mujeres = actividad.beneficiarios[cat.id].mujeres || '';
//                     } else if (actividad.actividad_beneficiarios) {
//                       const dbRow = actividad.actividad_beneficiarios.find((b:any) => b.categoria_id === cat.id);
//                       if (dbRow) {
//                         total = dbRow.total?.toString() || '';
//                         hombres = dbRow.hombres?.toString() || '';
//                         mujeres = dbRow.mujeres?.toString() || '';
//                       }
//                     }

//                     return (
//                       <View key={cat.id} style={[styles.row, isLast ? styles.noBorderBottom : undefined]}>
//                         <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
//                         <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{total}</Text></View>
//                         <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{hombres}</Text></View>
//                         <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{mujeres}</Text></View>
//                       </View>
//                     );
//                   })}
//                 </View>

//                 {/* --- LADO DERECHO: Acciones y Edades (w40) --- */}
//                 <View style={[styles.w40, { flexDirection: 'column' }]}>
//                   <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Tipo de acción</Text></View>
                  
//                   {/* Llenado dinámico de Acciones (Tachado con X) */}
//                   {acciones.map((acc: any) => {
//                     let cantX = '';
//                     if (actividad.acciones && actividad.acciones[acc.nombre]) {
//                       cantX = 'X';
//                     } else if (actividad.actividad_acciones) {
//                       const dbAct = actividad.actividad_acciones.find((a:any) => a.tipo_accion_id === acc.id);
//                       if (dbAct) cantX = 'X';
//                     }

//                     return (
//                       <View key={acc.id} style={styles.row}>
//                         <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
//                         <View style={[styles.cellData, styles.w40, styles.noBorderRight]}>
//                           <Text style={styles.textCenter}>{cantX}</Text>
//                         </View>
//                       </View>
//                     );
//                   })}
                  
//                   {/* Rango de edad */}
//                   <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}>
//                     <Text>Rango de edad de los beneficiarios</Text>
//                   </View>
//                   <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}>
//                     <Text style={styles.textCenter}>{rangoEdadText}</Text>
//                   </View>
//                 </View>

//               </View>

//               {/* ================= DESCRIPCIÓN ================= */}
//               <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
//               <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
//                 <Text>{actividad.descripcion}</Text>
//               </View>

//               {/* ================= EVIDENCIAS ================= */}
//               <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias 4 fotos</Text>
//               <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
//                 {[0, 1, 2, 3].map((index) => {
//                   const evidencia = actividad.evidencias && actividad.evidencias[index]; 
//                   return evidencia ? (
//                     <Image key={index} src={evidencia.url_archivo || evidencia.url} style={styles.foto} />
//                   ) : (
//                     <View key={index} style={styles.foto} />
//                   );
//                 })}
//               </View>

//             </View>
//           );
//         })}
//       </Page>
//     </Document>
//   );
// };
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
  table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
  
  // Filas base con stretch para que las celdas siempre midan lo mismo de alto
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
  colContent: { flexDirection: 'column', flex: 1 },
  
  // Cabeceras de sección (grises)
  sectionHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
  
  // Estilos de celdas
  cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
  cellHeaderCenter: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
  cellData: { padding: 3, borderRightWidth: 1, borderColor: '#000', flex: 1, minHeight: 18, justifyContent: 'center' },
  
  // Utilidades para quitar bordes duplicados
  noBorderRight: { borderRightWidth: 0 },
  noBorderBottom: { borderBottomWidth: 0 },
  
  // Utilidades de ancho (%)
  w10: { width: '10%' },
  w15: { width: '15%' },
  w20: { width: '20%' },
  w30: { width: '30%' },
  w35: { width: '35%' },
  w40: { width: '40%' },
  w50: { width: '50%' },
  w60: { width: '60%' },
  w85: { width: '85%' },

  // Textos específicos para la tabla
  textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
  textCenter: { textAlign: 'center', fontSize: 8 },

  // Contenedor de evidencias
  evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
  foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
  bannerAnulado: { backgroundColor: '#fee2e2', padding: 4, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
  textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
});
export const ReportePDF = ({ snapshot, categorias = [], acciones = [] }: any) => {
  if (!snapshot || !snapshot.actividades) return null;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {snapshot.actividades.map((actividad: any, index: number) => {
          
          // ===============================================================
          // ADAPTADORES INTELIGENTES
          // ===============================================================
          
          // 1. Propia vs Colaborativa
          const esPropia = actividad.creado_por_usuario_id === snapshot.usuario_id;
          const tipoActividadText = esPropia ? 'Propia' : 'Colaborativa';

          // 2. ODS Principal
          let odsText = actividad.ods_principal || '';
          if (!odsText && actividad.actividad_ods) {
            const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
            if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;
          }
          
          // 3. Ubicación
          const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
          const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
          const calleText = actividad.calle || actividad.domicilio?.calle || '';
          const lugarText = actividad.lugar || '';

          // 4. Fechas y Horas (Ajustado a formato AM/PM)
          let fechaAjustada = '';
          if (actividad.fecha_evento) {
            const partes = actividad.fecha_evento.split('T')[0].split('-');
            const fechaObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            fechaAjustada = format(fechaObj, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
            fechaAjustada = fechaAjustada.charAt(0).toUpperCase() + fechaAjustada.slice(1);
          }

          const formatearHoraAMPM = (horaStr: string) => {
            if (!horaStr) return '';
            const partes = horaStr.split(':');
            if (partes.length < 2) return horaStr;
            let horas = parseInt(partes[0], 10);
            const minutos = partes[1];
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12;
            horas = horas ? horas : 12; // la hora 0 debe ser 12
            return `${horas.toString().padStart(2, '0')}:${minutos} ${ampm}`;
          };

          const horaInicio = formatearHoraAMPM(actividad.hora_inicio?.slice(0, 5));
          const horaFin = formatearHoraAMPM(actividad.hora_fin?.slice(0, 5));

          // 5. Sostenibilidad 
          let econ = actividad.sostenibilidad?.economico === true;
          let soc = actividad.sostenibilidad?.social === true;
          let amb = actividad.sostenibilidad?.ambiental === true;
          
          if (actividad.actividad_sostenibilidad) {
            econ = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
            soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
            amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
          }

          // 6. Rango de Edad
          const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';
          const motivoText = actividad.motivo_anulacion ? actividad.motivo_anulacion.toUpperCase() : 'NO CONTABILIZA EN ESTADÍSTICAS';

          return (
            <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
              {actividad.anulada && (
                <View style={styles.bannerAnulado}>
                  <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - {motivoText} ***</Text>
                </View>
              )}

              {/* ================= DATOS DEL PROYECTO ================= */}
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

              {/* ================= UBICACIÓN ================= */}
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

              {/* ================= REGISTRO DE ACTIVIDADES ================= */}
              <Text style={styles.sectionHeader}>Registro de actividades</Text>
              
              <View style={[styles.row, { alignItems: 'stretch' }]}>
                
                {/* --- LADO IZQUIERDO: Beneficiarios --- */}
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

                  {/* LLENADO DINÁMICO DE BENEFICIARIOS */}
                  {categorias.map((cat: any, i: number) => {
                    const isLast = i === categorias.length - 1;
                    const esFilaTotal = cat.id === 99;
                    
                    let calcH = 0, calcM = 0;

                    if (esFilaTotal) {
                      categorias.forEach((c: any) => {
                        if (c.id !== 99) {
                          const dbRow = actividad.actividad_beneficiarios?.find((b:any) => b.categoria_id === c.id);
                          const uiRow = actividad.beneficiarios?.[c.id];
                          calcH += parseInt(dbRow?.hombres || uiRow?.hombres || '0', 10);
                          calcM += parseInt(dbRow?.mujeres || uiRow?.mujeres || '0', 10);
                        }
                      });
                    } else {
                      const dbRow = actividad.actividad_beneficiarios?.find((b:any) => b.categoria_id === cat.id);
                      const uiRow = actividad.beneficiarios?.[cat.id];
                      calcH = parseInt(dbRow?.hombres || uiRow?.hombres || '0', 10);
                      calcM = parseInt(dbRow?.mujeres || uiRow?.mujeres || '0', 10);
                    }

                    const calcTotal = calcH + calcM;
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

                {/* --- LADO DERECHO: Acciones y Edades --- */}
                <View style={[styles.w40, { flexDirection: 'column' }]}>
                  <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Tipo de acción</Text></View>
                  
                  {acciones.map((acc: any) => {
                    const isSelected = actividad.actividad_acciones?.some((a:any) => a.tipo_accion_id === acc.id);
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

              {/* ================= DESCRIPCIÓN ================= */}
              <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
              <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
                <Text>{actividad.descripcion}</Text>
              </View>
{/* ================= EVIDENCIAS ================= */}
              <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
              <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
                {actividad.evidencias && actividad.evidencias.length > 0 ? (
                  // Si hay evidencias, solo dibujamos las que existen (sin cuadros grises extra)
                  actividad.evidencias.map((evidencia: any, index: number) => (
                    <Image key={index} src={evidencia.url_archivo || evidencia.url} style={styles.foto} />
                  ))
                ) : (
                  // Si no hay evidencias, mostramos la leyenda centrada
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 10, fontStyle: 'italic' }}>
                      El embajador no adjuntó evidencias para esta actividad.
                    </Text>
                  </View>
                )}
              </View>

            </View>
          );
        })}
      </Page>
    </Document>
  );
};