// import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
// import SEBIDESLogo from './assets/SEBIDES.png';
// import JUVENTUDESLogo from './assets/LOGO JUVENTUDES 20230.png';

// // ==========================================
// // UTILIDADES DEL PDF
// // ==========================================
// const toNumber = (value: unknown): number => {
//   const parsed = Number(value);
//   return Number.isFinite(parsed) ? parsed : 0;
// };

// const safeText = (value: unknown, fallback = ''): string => {
//   if (value === null || value === undefined) return fallback;
//   return String(value);
// };

// const formatDate = (value: unknown): string => {
//   if (!value) return '';
//   try {
//     const datePart = String(value).split('T')[0];
//     const [year, month, day] = datePart.split('-').map(Number);
//     if (!year || !month || !day) return '';
//     const date = new Date(year, month - 1, day);
//     if (Number.isNaN(date.getTime())) return '';
//     const result = format(date, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
//     return result.charAt(0).toUpperCase() + result.slice(1);
//   } catch {
//     return '';
//   }
// };

// const formatTimeAMPM = (value: unknown): string => {
//   if (!value) return '';
//   const parts = String(value).split(':');
//   if (parts.length < 2) return String(value);
//   const hoursRaw = Number(parts[0]);
//   const minutes = parts[1];
//   if (!Number.isFinite(hoursRaw)) return String(value);
//   const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
//   const hours12 = hoursRaw % 12 || 12;
//   return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
// };

// const getBeneficiarios = (actividad: any, categoriaId: number) => {
//   const dbRow = actividad?.actividad_beneficiarios?.find(
//     (item: any) => item.categoria_id === categoriaId
//   );
//   const uiRow = actividad?.beneficiarios?.[categoriaId];
//   return {
//     hombres: toNumber(dbRow?.hombres ?? uiRow?.hombres),
//     mujeres: toNumber(dbRow?.mujeres ?? uiRow?.mujeres),
//   };
// };

// const getSectorData = (actividad: any, sectorId: number) => {
//   const dbRow = actividad?.actividad_sectores?.find(
//     (item: any) => item.sector_id === sectorId
//   );
//   const uiRow = actividad?.sectores?.[sectorId];

//   const hombres = toNumber(dbRow?.hombres ?? uiRow?.hombres);
//   const mujeres = toNumber(dbRow?.mujeres ?? uiRow?.mujeres);
//   const total = toNumber(dbRow?.total ?? uiRow?.total ?? (hombres + mujeres));

//   return { hombres, mujeres, total };
// };

// // ==========================================
// // 1. ESTILOS DEL PDF
// // ==========================================
// const styles = StyleSheet.create({
//   page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
//   table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
//   row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
//   colContent: { flexDirection: 'column', flex: 1 },
//   sectionHeader: { backgroundColor: '#651D32',color: '#FFFFFF',fontSize: 8, fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
//   cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   cellHeaderCenter: { fontWeight: 'bold', backgroundColor: '#DEDEDE', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
//   cellData: { padding: 3, borderRightWidth: 1, backgroundColor: '#FFFFFF', borderColor: '#000',  justifyContent: 'center' },
//   noBorderRight: { borderRightWidth: 0 },
//   noBorderBottom: { borderBottomWidth: 0 },
//   w10: { width: '10%' }, w15: { width: '15%' }, w17: { width: '17%' }, w18: { width: '18%' },
//   w20: { width: '20%' }, w30: { width: '30%' }, w35: { width: '35%' }, w40: { width: '40%' },
//   w50: { width: '50%' }, w60: { width: '60%' }, w70: { width: '70%' }, w85: { width: '85%' },
//   w100: { width: '100%' },
//   textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
//   textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
//   textCenter: { textAlign: 'center', fontSize: 8 },
//   evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
//   foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
//   bannerAnulado: { backgroundColor: '#fee2e2', padding: 6, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
//   textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 },

//   portadaPage: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', position: 'relative', flexDirection: 'column' },
//   franjaSuperior: { position: 'absolute', top: 0, left: 0, right: 0, height: 12, backgroundColor: '#651D32' },
//   franjaDorada: { position: 'absolute', top: 12, left: 0, right: 0, height: 3, backgroundColor: '#BC955C' },
//   portadaLogos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 60 },
//   portadaTitleBox: { borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#651D32', paddingVertical: 20, marginBottom: 40, alignItems: 'center' },
//   portadaDependencia: { fontSize: 10, color: '#666666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
//   portadaTituloPrincipal: { fontSize: 22, fontWeight: 'bold', color: '#651D32', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 },
//   portadaSubtitulo: { fontSize: 14, color: '#333333', fontWeight: 'bold', textTransform: 'uppercase' },
//   portadaSeccionBox: { marginBottom: 30 },
//   portadaSeccionTitulo: { fontSize: 11, fontWeight: 'bold', color: '#651D32', backgroundColor: '#F3F4F6', padding: 6, textTransform: 'uppercase', borderLeftWidth: 3, borderColor: '#651D32', marginBottom: 10 },
//   portadaInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#E5E7EB' },
//   portadaInfoCell: { width: '50%', padding: 8, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' },
//   portadaInfoLabel: { fontSize: 8, color: '#666666', textTransform: 'uppercase', marginBottom: 3 },
//   portadaInfoValue: { fontSize: 11, color: '#000000', fontWeight: 'bold' },
//   portadaMetricasRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
//   portadaMetricaCaja: { width: '23%', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
//   portadaMetricaNumero: { fontSize: 24, fontWeight: 'bold', color: '#651D32', marginBottom: 4 },
//   portadaMetricaTexto: { fontSize: 7, color: '#666666', textTransform: 'uppercase', textAlign: 'center', fontWeight: 'bold' },
//   portadaFooter: { position: 'absolute', bottom: 40, left: 40, right: 40, alignItems: 'center', borderTopWidth: 1, borderColor: '#CCCCCC', paddingTop: 10 },
//   portadaFooterText: { fontSize: 8, color: '#999999', textAlign: 'center' }
// });

// // ==========================================
// // 2. COMPONENTE PDF
// // ==========================================
// export default function ReportePDF({ snapshot, categorias = [], acciones = [], sectores = [] }: any) {
//   if (!snapshot) return null;

//   const actividades = Array.isArray(snapshot.actividades) ? snapshot.actividades : [];

//   return (
//     <Document>
//       <Page size="LETTER" style={styles.portadaPage}>
//         <View style={styles.franjaSuperior} />
//         <View style={styles.franjaDorada} />
//         <View style={styles.portadaLogos}>
//           <Image src={SEBIDESLogo} style={{ width: 250 }} />
//           <Image src={JUVENTUDESLogo} style={{ height: 40 }} />
//         </View>
//         <View style={styles.portadaTitleBox}>
//           <Text style={styles.portadaDependencia}>Secretaría de Bienestar y Desarrollo Sustentable</Text>
//           <Text style={styles.portadaTituloPrincipal}>Reporte Mensual de Resultados</Text>
//           <Text style={styles.portadaSubtitulo}>Programa Juventudes 2030</Text>
//         </View>
//         <View style={styles.portadaSeccionBox}>
//           <Text style={styles.portadaSeccionTitulo}>I. Datos de Identificación del Embajador</Text>
//           <View style={styles.portadaInfoGrid}>
//             <View style={styles.portadaInfoCell}>
//               <Text style={styles.portadaInfoLabel}>Nombre Completo</Text>
//               <Text style={styles.portadaInfoValue}>{safeText(snapshot.embajador?.nombre).toUpperCase()}</Text>
//             </View>
//             <View style={styles.portadaInfoCell}>
//               <Text style={styles.portadaInfoLabel}>Periodo Reportado</Text>
//               <Text style={styles.portadaInfoValue}>{safeText(snapshot.nombre_mes).toUpperCase()}</Text>
//             </View>
//             <View style={styles.portadaInfoCell}>
//               <Text style={styles.portadaInfoLabel}>Municipio</Text>
//               <Text style={styles.portadaInfoValue}>{safeText(snapshot.municipio_nombre).toUpperCase()}</Text>
//             </View>
//             <View style={styles.portadaInfoCell}>
//               <Text style={styles.portadaInfoLabel}>Estatus del Expediente</Text>
//               <Text style={styles.portadaInfoValue}>ENTREGADO</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.portadaSeccionBox}>
//           <Text style={styles.portadaSeccionTitulo}>II. Resumen Cuantitativo de Impacto</Text>
//           {(() => {
//             const actividadesValidas = actividades.filter((a: any) => !a.anulada);
//             const totalActividades = actividadesValidas.length;
//             const creadas = actividadesValidas.filter((a: any) => a.creado_por_usuario_id === snapshot.usuario_id).length;
//             const colaborativas = totalActividades - creadas;

//             let beneficiariosTotales = 0;
//             actividadesValidas.forEach((act: any) => {
//               if (!act.es_externa && act.beneficiarios) {
//                 Object.keys(act.beneficiarios).forEach((catId) => {
//                   if (Number(catId) !== 99) {
//                     beneficiariosTotales += toNumber(act.beneficiarios[catId]?.total);
//                   }
//                 });
//               }
//             });

//             return (
//               <View style={styles.portadaMetricasRow}>
//                 <View style={styles.portadaMetricaCaja}>
//                   <Text style={styles.portadaMetricaNumero}>{totalActividades}</Text>
//                   <Text style={styles.portadaMetricaTexto}>Actividades{'\n'}Realizadas</Text>
//                 </View>
//                 <View style={styles.portadaMetricaCaja}>
//                   <Text style={styles.portadaMetricaNumero}>{creadas}</Text>
//                   <Text style={styles.portadaMetricaTexto}>Iniciativas{'\n'}Propias</Text>
//                 </View>
//                 <View style={styles.portadaMetricaCaja}>
//                   <Text style={styles.portadaMetricaNumero}>{colaborativas}</Text>
//                   <Text style={styles.portadaMetricaTexto}>Asistencias /{'\n'}Colaboraciones</Text>
//                 </View>
//                 <View style={[styles.portadaMetricaCaja, { borderColor: '#BC955C', backgroundColor: '#FFFDF9' }]}>
//                   <Text style={[styles.portadaMetricaNumero, { color: '#BC955C' }]}>{beneficiariosTotales}</Text>
//                   <Text style={styles.portadaMetricaTexto}>Total de{'\n'}Beneficiados</Text>
//                 </View>
//               </View>
//             );
//           })()}
//         </View>

//         <View style={styles.portadaFooter}>
//           <Text style={styles.portadaFooterText}>Este documento representa un extracto oficial de las actividades reportadas dentro de la plataforma Juventudes 2030.</Text>
//           <Text style={styles.portadaFooterText}>Gobierno del Estado de Sinaloa — Secretaría de Bienestar y Desarrollo Sustentable</Text>
//         </View>
//       </Page>

//       <Page size="LETTER" style={styles.page}>
//         {actividades.map((actividad: any, index: number) => {
//           const esPropia = actividad.creado_por_usuario_id === snapshot.usuario_id;
//           const esExterna = actividad.es_externa === true;
          
//           let tipoActividadText = 'Colaborativa';
//           if (esExterna) tipoActividadText = 'Participación Externa';
//           else if (esPropia) tipoActividadText = 'Iniciativa Propia';

//           let odsText = actividad.ods_principal || '';
//           let odsComplementariosText = 'Ninguno'; 

//           if (actividad.actividad_ods) {
//             const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
//             if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;

//             const odsSecundarios = actividad.actividad_ods.filter((o: any) => !o.es_principal);
//             if (odsSecundarios.length > 0) {
//               odsComplementariosText = odsSecundarios
//                 .map((o: any) => o.ods ? `${o.ods.numero}. ${o.ods.nombre}` : '')
//                 .filter(Boolean)
//                 .join('  •  '); 
//             }
//           }
          
//           const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
//           const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
//           const calleText = actividad.calle || actividad.domicilio?.calle || '';
//           const lugarText = actividad.lugar || '';

//           const fechaAjustada = formatDate(actividad.fecha_evento);
//           const horaInicio = formatTimeAMPM(actividad.hora_inicio?.slice(0, 5));
//           const horaFin = formatTimeAMPM(actividad.hora_fin?.slice(0, 5));

//           let eco = false, soc = false, amb = false;
//           if (actividad.actividad_sostenibilidad) {
//             eco = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
//             soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
//             amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
//           }

//           const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';
//           const motivoText = actividad.motivo_anulacion ? actividad.motivo_anulacion.toUpperCase() : 'NO CONTABILIZA EN ESTADÍSTICAS';

//           return (
//             <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
//               {actividad.anulada && (
//                 <View style={styles.bannerAnulado}>
//                   <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - {motivoText} ***</Text>
//                 </View>
//               )}

//               {/* DATOS DEL PROYECTO */}
//               <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Embajador(a)</Text></View>
//                 <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{snapshot.embajador?.nombre}</Text></View>
//               </View>
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
//                 <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
//                 <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
//               </View>
              
//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Tipo de Actividad</Text></View>
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
//                 <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS{'\n'}COMPLEMENTARIOS</Text></View>
//                 <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsComplementariosText}</Text></View>
//               </View>

//               {esExterna && (
//                 <View style={[styles.row, { backgroundColor: '#f3e8ff' }]}>
//                   <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ORGANIZADOR EXTERNO</Text></View>
//                   <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text style={{ fontWeight: 'bold', color: '#6b21a8' }}>{safeText(actividad.organizador_externo).toUpperCase()}</Text></View>
//                 </View>
//               )}

//               <View style={styles.row}>
//                 <View style={[styles.cellHeaderCenter, { width: '15%' }]}><Text>Sostenibilidad</Text></View>
//                 <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Económico</Text></View>
//                 <View style={[styles.cellData, { width: '14%' }]}><Text style={styles.textCenterBold}>{eco ? 'X' : ' '}</Text></View>
//                 <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Social</Text></View>
//                 <View style={[styles.cellData, { width: '14%' }]}><Text style={styles.textCenterBold}>{soc ? 'X' : ' '}</Text></View>
//                 <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Ambiental</Text></View>
//                 <View style={[styles.cellData, { width: '14%', borderRightWidth: 0 }]}><Text style={styles.textCenterBold}>{amb ? 'X' : ' '}</Text></View>
//               </View>

//               {/* UBICACIÓN */}
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

//               {/* REGISTRO DE ACTIVIDADES */}
//               <Text style={styles.sectionHeader}>Registro de actividades</Text>
              
//               {esExterna ? (
//                 <View style={[styles.row, { padding: 15, justifyContent: 'center', backgroundColor: '#f9fafb', minHeight: 40 }]}>
//                   <Text style={{ fontSize: 9, color: '#4b5563', fontStyle: 'italic', textAlign: 'center' }}>
//                     * Al tratarse de un evento organizado por una institución externa, no se requiere el desglose demográfico ni el conteo de beneficiarios directos.
//                   </Text>
//                 </View>
//               ) : (
//                 <View style={[styles.row, { alignItems: 'stretch' }]}>
                  
//                   {/* LADO IZQUIERDO */}
//                   <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                    
//                     <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 , backgroundColor: '#DEDEDE'}]}> 
//                       <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                         <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios por Edad</Text></View>
//                       </View>
//                       <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
//                         <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
//                       </View>
//                       <View style={[styles.w30, { flexDirection: 'column' , backgroundColor: '#DEDEDE' }]}>
//                         <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo</Text></View>
//                         <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
//                           <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
//                           <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
//                         </View>
//                       </View>
//                     </View>

//                     {categorias.map((cat: any) => {
//                       const values = getBeneficiarios(actividad, cat.id);
//                       const calcH = values.hombres;
//                       const calcM = values.mujeres;
//                       const calcTotal = calcH + calcM;

//                       return (
//                         <View key={`cat-${cat.id}`} style={styles.row}>
//                           <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
//                           <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{calcTotal > 0 ? calcTotal : ''}</Text></View>
//                           <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{calcH > 0 ? calcH : ''}</Text></View>
//                           <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{calcM > 0 ? calcM : ''}</Text></View>
//                         </View>
//                       );
//                     })}

//                     <View style={[styles.row, { minHeight: 20, borderBottomWidth: 0 , backgroundColor: '#DEDEDE', borderTopWidth: 1, borderColor: '#000'}]}> 
//                       <View style={[styles.w100, { borderRightWidth: 0, borderColor: '#000', flexDirection: 'column' }]}>
//                         <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sectores Vulnerables</Text></View>
//                       </View>
//                     </View>
                    
//                     {sectores && sectores.length > 0 ? (
//                       sectores.map((sector: any) => {
//                         const values = getSectorData(actividad, sector.id);
//                         const strTotal = values.total > 0 ? values.total.toString() : '';
//                         const strHombres = values.hombres > 0 ? values.hombres.toString() : '';
//                         const strMujeres = values.mujeres > 0 ? values.mujeres.toString() : '';

//                         return (
//                           <View key={`sec-${sector.id}`} style={styles.row}>
//                             <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{sector.nombre}</Text></View>
//                             <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{strTotal}</Text></View>
//                             <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{strHombres}</Text></View>
//                             <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{strMujeres}</Text></View>
//                           </View>
//                         );
//                       })
//                     ) : (
//                       <View style={styles.row}>
//                         <View style={[styles.cellHeader, styles.w50]}><Text style={[styles.textRightBold, { color: '#666' }]}>Sin sectores en sistema</Text></View>
//                         <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenterBold}>-</Text></View>
//                         <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenterBold}>-</Text></View>
//                         <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenterBold}>-</Text></View>
//                       </View>
//                     )}

//                     {(() => {
//                       let totalGlobalH = 0;
//                       let totalGlobalM = 0;
//                       categorias.forEach((c: any) => {
//                         const values = getBeneficiarios(actividad, c.id);
//                         totalGlobalH += values.hombres;
//                         totalGlobalM += values.mujeres;
//                       });
//                       const totalGlobal = totalGlobalH + totalGlobalM;

//                       return (
//                         <View style={[styles.row, styles.noBorderBottom, { minHeight: 24, backgroundColor: '#DEDEDE', borderTopWidth: 1, borderColor: '#000' }]}>
//                           <View style={[styles.cellHeaderCenter, styles.w50]}><Text style={styles.textRightBold}>TOTAL DE BENEFICIARIOS</Text></View>
//                           <View style={[styles.cellHeaderCenter, styles.w20]}><Text style={styles.textCenterBold}>{totalGlobal > 0 ? totalGlobal : ''}</Text></View>
//                           <View style={[styles.cellHeaderCenter, styles.w15]}><Text style={styles.textCenterBold}>{totalGlobalH > 0 ? totalGlobalH : ''}</Text></View>
//                           <View style={[styles.cellHeaderCenter, styles.w15, styles.noBorderRight]}><Text style={styles.textCenterBold}>{totalGlobalM > 0 ? totalGlobalM : ''}</Text></View>
//                         </View>
//                       );
//                     })()}

//                   </View>

//                   {/* LADO DERECHO */}
//                   <View style={[styles.w40, { flexDirection: 'column' }]}>
//                     <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1 }]}><Text>Tipo de acción</Text></View>
                    
//                     {acciones.map((acc: any) => {
//                       const isSelected = actividad.actividad_acciones?.some((a:any) => a.tipo_accion_id === acc.id);
//                       const cantX = isSelected ? 'X' : '';

//                       return (
//                         <View key={acc.id} style={styles.row}>
//                           <View style={[styles.cellHeaderCenter, styles.w60]}><Text>{acc.nombre}</Text></View>
//                           <View style={[styles.cellData, styles.w40, styles.noBorderRight]}>
//                             <Text style={styles.textCenterBold}>{cantX}</Text>
//                           </View>
//                         </View>
//                       );
//                     })}
                    
//                     <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad de los beneficiarios</Text></View>
//                     <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text style={styles.textCenter}>{rangoEdadText}</Text></View>
//                   </View>

//                 </View>
//               )}

//               {/* DESCRIPCIÓN */}
//               <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
//               <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
//                 <Text>{actividad.descripcion}</Text>
//               </View>

//               {/* EVIDENCIAS */}
//               <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
//               <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
//                 {actividad.evidencias && actividad.evidencias.length > 0 ? (
//                   actividad.evidencias
//                     .map((evidencia: any, index: number) => {
//                       const imageUrl = evidencia?.url;
//                       if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) return null;

//                       return (
//                         <Image 
//                           key={index} 
//                           src={{ uri: imageUrl, method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} 
//                           style={styles.foto} 
//                         />
//                       );
//                     })
//                     .filter(Boolean)
//                 ) : (
//                   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                     <Text style={{ color: '#666', fontSize: 10, fontStyle: 'italic' }}>
//                       El embajador no adjuntó evidencias para esta actividad.
//                     </Text>
//                   </View>
//                 )}
//               </View>

//             </View>
//           );
//         })}
//       </Page>
//     </Document>
//   );
// }
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SEBIDESLogo from './assets/SEBIDES.png';
import JUVENTUDESLogo from './assets/LOGO JUVENTUDES 20230.png';

// ==========================================
// UTILIDADES DEL PDF
// ==========================================
const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeText = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const formatDate = (value: unknown): string => {
  if (!value) return '';
  try {
    const datePart = String(value).split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return '';
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return '';
    const result = format(date, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
    return result.charAt(0).toUpperCase() + result.slice(1);
  } catch {
    return '';
  }
};

const formatTimeAMPM = (value: unknown): string => {
  if (!value) return '';
  const parts = String(value).split(':');
  if (parts.length < 2) return String(value);
  const hoursRaw = Number(parts[0]);
  const minutes = parts[1];
  if (!Number.isFinite(hoursRaw)) return String(value);
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';
  const hours12 = hoursRaw % 12 || 12;
  return `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
};

const getBeneficiarios = (actividad: any, categoriaId: number) => {
  const dbRow = actividad?.actividad_beneficiarios?.find(
    (item: any) => item.categoria_id === categoriaId
  );
  const uiRow = actividad?.beneficiarios?.[categoriaId];
  return {
    hombres: toNumber(dbRow?.hombres ?? uiRow?.hombres),
    mujeres: toNumber(dbRow?.mujeres ?? uiRow?.mujeres),
  };
};

const getSectorData = (actividad: any, sectorId: number) => {
  const dbRow = actividad?.actividad_sectores?.find(
    (item: any) => item.sector_id === sectorId
  );
  const uiRow = actividad?.sectores?.[sectorId];

  const hombres = toNumber(dbRow?.hombres ?? uiRow?.hombres);
  const mujeres = toNumber(dbRow?.mujeres ?? uiRow?.mujeres);
  const total = toNumber(dbRow?.total ?? uiRow?.total ?? (hombres + mujeres));

  return { hombres, mujeres, total };
};

// ==========================================
// 1. ESTILOS DEL PDF
// ==========================================
const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
  table: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', minHeight: 18, alignItems: 'stretch' },
  colContent: { flexDirection: 'column', flex: 1 },
  sectionHeader: { backgroundColor: '#651D32',color: '#FFFFFF',fontSize: 8, fontWeight: 'bold', textAlign: 'center', padding: 4, borderBottomWidth: 1, borderColor: '#000' },
  cellHeader: { fontWeight: 'bold', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' },
  cellHeaderCenter: { fontWeight: 'bold', backgroundColor: '#DEDEDE', padding: 3, borderRightWidth: 1, borderColor: '#000', textAlign: 'center', justifyContent: 'center' },
  cellData: { padding: 3, borderRightWidth: 1, backgroundColor: '#FFFFFF', borderColor: '#000',  justifyContent: 'center' },
  noBorderRight: { borderRightWidth: 0 },
  noBorderBottom: { borderBottomWidth: 0 },
  w10: { width: '10%' }, w15: { width: '15%' }, w17: { width: '17%' }, w18: { width: '18%' },
  w20: { width: '20%' }, w30: { width: '30%' }, w35: { width: '35%' }, w40: { width: '40%' },
  w50: { width: '50%' }, w60: { width: '60%' }, w70: { width: '70%' }, w85: { width: '85%' },
  w100: { width: '100%' },
  textRightBold: { textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  textCenterBold: { textAlign: 'center', fontSize: 8, fontWeight: 'bold' },
  textCenter: { textAlign: 'center', fontSize: 8 },
  evidenciasContainer: { flexDirection: 'row', justifyContent: 'space-evenly', padding: 10, minHeight: 120 },
  foto: { width: '22%', height: 100, objectFit: 'cover', backgroundColor: '#e5e5e5' },
  bannerAnulado: { backgroundColor: '#fee2e2', padding: 6, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
  textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 },

  portadaPage: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', position: 'relative', flexDirection: 'column' },
  franjaSuperior: { position: 'absolute', top: 0, left: 0, right: 0, height: 12, backgroundColor: '#651D32' },
  franjaDorada: { position: 'absolute', top: 12, left: 0, right: 0, height: 3, backgroundColor: '#BC955C' },
  portadaLogos: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 60 },
  portadaTitleBox: { borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#651D32', paddingVertical: 20, marginBottom: 40, alignItems: 'center' },
  portadaDependencia: { fontSize: 10, color: '#666666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  portadaTituloPrincipal: { fontSize: 22, fontWeight: 'bold', color: '#651D32', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 },
  portadaSubtitulo: { fontSize: 14, color: '#333333', fontWeight: 'bold', textTransform: 'uppercase' },
  portadaSeccionBox: { marginBottom: 30 },
  portadaSeccionTitulo: { fontSize: 11, fontWeight: 'bold', color: '#651D32', backgroundColor: '#F3F4F6', padding: 6, textTransform: 'uppercase', borderLeftWidth: 3, borderColor: '#651D32', marginBottom: 10 },
  portadaInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#E5E7EB' },
  portadaInfoCell: { width: '50%', padding: 8, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#E5E7EB' },
  portadaInfoLabel: { fontSize: 8, color: '#666666', textTransform: 'uppercase', marginBottom: 3 },
  portadaInfoValue: { fontSize: 11, color: '#000000', fontWeight: 'bold' },
  portadaMetricasRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  portadaMetricaCaja: { width: '23%', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' },
  portadaMetricaNumero: { fontSize: 24, fontWeight: 'bold', color: '#651D32', marginBottom: 4 },
  portadaMetricaTexto: { fontSize: 7, color: '#666666', textTransform: 'uppercase', textAlign: 'center', fontWeight: 'bold' },
  portadaFooter: { position: 'absolute', bottom: 40, left: 40, right: 40, alignItems: 'center', borderTopWidth: 1, borderColor: '#CCCCCC', paddingTop: 10 },
  portadaFooterText: { fontSize: 8, color: '#999999', textAlign: 'center' }
});

// ==========================================
// 2. COMPONENTE PDF
// ==========================================
export default function ReportePDF({ snapshot, categorias = [], acciones = [], sectores = [] }: any) {
  if (!snapshot) return null;

  const actividades = Array.isArray(snapshot.actividades) ? snapshot.actividades : [];

  return (
    <Document>
      <Page size="LETTER" style={styles.portadaPage}>
        <View style={styles.franjaSuperior} />
        <View style={styles.franjaDorada} />
        <View style={styles.portadaLogos}>
          <Image src={SEBIDESLogo} style={{ width: 250 }} />
          <Image src={JUVENTUDESLogo} style={{ height: 40 }} />
        </View>
        <View style={styles.portadaTitleBox}>
          <Text style={styles.portadaDependencia}>Secretaría de Bienestar y Desarrollo Sustentable</Text>
          <Text style={styles.portadaTituloPrincipal}>Reporte Mensual de Resultados</Text>
          <Text style={styles.portadaSubtitulo}>Programa Juventudes 2030</Text>
        </View>
        <View style={styles.portadaSeccionBox}>
          <Text style={styles.portadaSeccionTitulo}>I. Datos de Identificación del Embajador</Text>
          <View style={styles.portadaInfoGrid}>
            <View style={styles.portadaInfoCell}>
              <Text style={styles.portadaInfoLabel}>Nombre Completo</Text>
              <Text style={styles.portadaInfoValue}>{safeText(snapshot.embajador?.nombre).toUpperCase()}</Text>
            </View>
            <View style={styles.portadaInfoCell}>
              <Text style={styles.portadaInfoLabel}>Periodo Reportado</Text>
              <Text style={styles.portadaInfoValue}>{safeText(snapshot.nombre_mes).toUpperCase()}</Text>
            </View>
            <View style={styles.portadaInfoCell}>
              <Text style={styles.portadaInfoLabel}>Municipio</Text>
              <Text style={styles.portadaInfoValue}>{safeText(snapshot.municipio_nombre).toUpperCase()}</Text>
            </View>
            <View style={styles.portadaInfoCell}>
              <Text style={styles.portadaInfoLabel}>Estatus del Expediente</Text>
              <Text style={styles.portadaInfoValue}>ENTREGADO</Text>
            </View>
          </View>
        </View>

        <View style={styles.portadaSeccionBox}>
          <Text style={styles.portadaSeccionTitulo}>II. Resumen Cuantitativo de Impacto</Text>
          {(() => {
            const actividadesValidas = actividades.filter((a: any) => !a.anulada);
            const totalActividades = actividadesValidas.length;
            
            // Lógica corregida: Iniciativas Propias son las que no son colaborativas
            const creadas = actividadesValidas.filter((a: any) => a.es_propia === true).length;
            const colaborativas = actividadesValidas.filter((a: any) => a.es_propia === false).length;

            let beneficiariosTotales = 0;
            actividadesValidas.forEach((act: any) => {
              if (!act.es_externa && act.beneficiarios) {
                Object.keys(act.beneficiarios).forEach((catId) => {
                  if (Number(catId) !== 99) {
                    beneficiariosTotales += toNumber(act.beneficiarios[catId]?.total);
                  }
                });
              } else if (!act.es_externa && act.actividad_beneficiarios) {
                act.actividad_beneficiarios.forEach((ab: any) => {
                  if (Number(ab.categoria_id) !== 99) {
                    beneficiariosTotales += toNumber(ab.total);
                  }
                });
              }
            });

            return (
              <View style={styles.portadaMetricasRow}>
                <View style={styles.portadaMetricaCaja}>
                  <Text style={styles.portadaMetricaNumero}>{totalActividades}</Text>
                  <Text style={styles.portadaMetricaTexto}>Actividades{'\n'}Realizadas</Text>
                </View>
                <View style={styles.portadaMetricaCaja}>
                  <Text style={styles.portadaMetricaNumero}>{creadas}</Text>
                  <Text style={styles.portadaMetricaTexto}>Iniciativas{'\n'}Propias</Text>
                </View>
                <View style={styles.portadaMetricaCaja}>
                  <Text style={styles.portadaMetricaNumero}>{colaborativas}</Text>
                  <Text style={styles.portadaMetricaTexto}>Asistencias /{'\n'}Colaboraciones</Text>
                </View>
                <View style={[styles.portadaMetricaCaja, { borderColor: '#BC955C', backgroundColor: '#FFFDF9' }]}>
                  <Text style={[styles.portadaMetricaNumero, { color: '#BC955C' }]}>{beneficiariosTotales}</Text>
                  <Text style={styles.portadaMetricaTexto}>Total de{'\n'}Beneficiados</Text>
                </View>
              </View>
            );
          })()}
        </View>

        <View style={styles.portadaFooter}>
          <Text style={styles.portadaFooterText}>Este documento representa un extracto oficial de las actividades reportadas dentro de la plataforma Juventudes 2030.</Text>
          <Text style={styles.portadaFooterText}>Gobierno del Estado de Sinaloa — Secretaría de Bienestar y Desarrollo Sustentable</Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        {actividades.map((actividad: any, index: number) => {
          const esPropia = actividad.es_propia === true;
          const esExterna = actividad.es_externa === true;
          
          let tipoActividadTitle = 'Tipo de Actividad';
          let tipoActividadText = 'Colaborativa';
          
          if (esExterna) {
            tipoActividadTitle = 'Institución';
            tipoActividadText = actividad.instituciones?.nombre || actividad.organizador_externo || 'Institución Externa';
          } else if (esPropia) {
            tipoActividadText = 'Iniciativa Propia';
          }

          let odsText = actividad.ods_principal || '';
          let odsComplementariosText = 'Ninguno'; 

          if (actividad.actividad_ods) {
            const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
            if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;

            const odsSecundarios = actividad.actividad_ods.filter((o: any) => !o.es_principal);
            if (odsSecundarios.length > 0) {
              odsComplementariosText = odsSecundarios
                .map((o: any) => o.ods ? `${o.ods.numero}. ${o.ods.nombre}` : '')
                .filter(Boolean)
                .join('  •  '); 
            }
          }
          
          const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
          const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
          const calleText = actividad.calle || actividad.domicilio?.calle || '';
          const lugarText = actividad.lugar || '';

          const fechaAjustada = formatDate(actividad.fecha_evento);
          const horaInicio = formatTimeAMPM(actividad.hora_inicio?.slice(0, 5));
          const horaFin = formatTimeAMPM(actividad.hora_fin?.slice(0, 5));

          let eco = false, soc = false, amb = false;
          if (actividad.actividad_sostenibilidad) {
            eco = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
            soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
            amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
          }

          const rangoEdadText = actividad.rango_edad || actividad.rango_edad_beneficiarios || '';
          const motivoText = actividad.motivo_anulacion ? actividad.motivo_anulacion.toUpperCase() : 'NO CONTABILIZA EN ESTADÍSTICAS';

          return (
            <View key={actividad.id || index} style={[styles.table, { marginBottom: 20 }]} wrap={false}>
              
              {actividad.anulada && (
                <View style={styles.bannerAnulado}>
                  <Text style={styles.textAnulado}>*** ACTIVIDAD ANULADA - {motivoText} ***</Text>
                </View>
              )}

              {/* DATOS DEL PROYECTO */}
              <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Embajador(a)</Text></View>
                <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{snapshot.embajador?.nombre}</Text></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
                <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
                <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>{tipoActividadTitle}</Text></View>
                <View style={[styles.cellData, styles.w35]}>
                  <Text style={esExterna ? { fontWeight: 'bold', color: '#6b21a8' } : {}}>{tipoActividadText}</Text>
                </View>
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
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS{'\n'}COMPLEMENTARIOS</Text></View>
                <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsComplementariosText}</Text></View>
              </View>

              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, { width: '15%' }]}><Text>Sostenibilidad</Text></View>
                <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Económico</Text></View>
                <View style={[styles.cellData, { width: '14%' }]}><Text style={styles.textCenterBold}>{eco ? 'X' : ' '}</Text></View>
                <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Social</Text></View>
                <View style={[styles.cellData, { width: '14%' }]}><Text style={styles.textCenterBold}>{soc ? 'X' : ' '}</Text></View>
                <View style={[styles.cellHeaderCenter, { width: '14%' }]}><Text>Ambiental</Text></View>
                <View style={[styles.cellData, { width: '14%', borderRightWidth: 0 }]}><Text style={styles.textCenterBold}>{amb ? 'X' : ' '}</Text></View>
              </View>

              {/* UBICACIÓN */}
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

              {/* REGISTRO DE ACTIVIDADES */}
              <Text style={styles.sectionHeader}>Registro de actividades</Text>
              
              {esExterna ? (
                <View style={[styles.row, { padding: 15, justifyContent: 'center', backgroundColor: '#f9fafb', minHeight: 40 }]}>
                  <Text style={{ fontSize: 9, color: '#4b5563', fontStyle: 'italic', textAlign: 'center' }}>
                    * Al tratarse de un evento organizado por una institución externa, no se requiere el desglose demográfico ni el conteo de beneficiarios directos.
                  </Text>
                </View>
              ) : (
                <View style={[styles.row, { alignItems: 'stretch' }]}>
                  
                  {/* LADO IZQUIERDO */}
                  <View style={[styles.w60, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                    
                    <View style={[styles.row, { minHeight: 36, borderBottomWidth: 0 , backgroundColor: '#DEDEDE'}]}> 
                      <View style={[styles.w50, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                        <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Beneficiarios por Edad</Text></View>
                      </View>
                      <View style={[styles.w20, { borderRightWidth: 1, borderColor: '#000', flexDirection: 'column' }]}>
                        <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Total</Text></View>
                      </View>
                      <View style={[styles.w30, { flexDirection: 'column' , backgroundColor: '#DEDEDE' }]}>
                        <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sexo</Text></View>
                        <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' }}>
                          <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>H</Text></View>
                          <View style={{ width: '50%', justifyContent: 'center' }}><Text style={styles.textCenterBold}>M</Text></View>
                        </View>
                      </View>
                    </View>

                    {categorias.map((cat: any) => {
                      const values = getBeneficiarios(actividad, cat.id);
                      const calcH = values.hombres;
                      const calcM = values.mujeres;
                      const calcTotal = calcH + calcM;

                      return (
                        <View key={`cat-${cat.id}`} style={styles.row}>
                          <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{cat.nombre}</Text></View>
                          <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{calcTotal > 0 ? calcTotal : ''}</Text></View>
                          <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{calcH > 0 ? calcH : ''}</Text></View>
                          <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{calcM > 0 ? calcM : ''}</Text></View>
                        </View>
                      );
                    })}

                    <View style={[styles.row, { minHeight: 20, borderBottomWidth: 0 , backgroundColor: '#DEDEDE', borderTopWidth: 1, borderColor: '#000'}]}> 
                      <View style={[styles.w100, { borderRightWidth: 0, borderColor: '#000', flexDirection: 'column' }]}>
                        <View style={{ flex: 1, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.textCenterBold}>Sectores Vulnerables</Text></View>
                      </View>
                    </View>
                    
                    {sectores && sectores.length > 0 ? (
                      sectores.map((sector: any) => {
                        const values = getSectorData(actividad, sector.id);
                        const strTotal = values.total > 0 ? values.total.toString() : '';
                        const strHombres = values.hombres > 0 ? values.hombres.toString() : '';
                        const strMujeres = values.mujeres > 0 ? values.mujeres.toString() : '';

                        return (
                          <View key={`sec-${sector.id}`} style={styles.row}>
                            <View style={[styles.cellHeader, styles.w50]}><Text style={styles.textRightBold}>{sector.nombre}</Text></View>
                            <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenter}>{strTotal}</Text></View>
                            <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenter}>{strHombres}</Text></View>
                            <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenter}>{strMujeres}</Text></View>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.row}>
                        <View style={[styles.cellHeader, styles.w50]}><Text style={[styles.textRightBold, { color: '#666' }]}>Sin sectores en sistema</Text></View>
                        <View style={[styles.cellData, styles.w20]}><Text style={styles.textCenterBold}>-</Text></View>
                        <View style={[styles.cellData, styles.w15]}><Text style={styles.textCenterBold}>-</Text></View>
                        <View style={[styles.cellData, styles.w15, styles.noBorderRight]}><Text style={styles.textCenterBold}>-</Text></View>
                      </View>
                    )}

                    {(() => {
                      let totalGlobalH = 0;
                      let totalGlobalM = 0;
                      categorias.forEach((c: any) => {
                        const values = getBeneficiarios(actividad, c.id);
                        totalGlobalH += values.hombres;
                        totalGlobalM += values.mujeres;
                      });
                      const totalGlobal = totalGlobalH + totalGlobalM;

                      return (
                        <View style={[styles.row, styles.noBorderBottom, { minHeight: 24, backgroundColor: '#DEDEDE', borderTopWidth: 1, borderColor: '#000' }]}>
                          <View style={[styles.cellHeaderCenter, styles.w50]}><Text style={styles.textRightBold}>TOTAL DE BENEFICIARIOS</Text></View>
                          <View style={[styles.cellHeaderCenter, styles.w20]}><Text style={styles.textCenterBold}>{totalGlobal > 0 ? totalGlobal : ''}</Text></View>
                          <View style={[styles.cellHeaderCenter, styles.w15]}><Text style={styles.textCenterBold}>{totalGlobalH > 0 ? totalGlobalH : ''}</Text></View>
                          <View style={[styles.cellHeaderCenter, styles.w15, styles.noBorderRight]}><Text style={styles.textCenterBold}>{totalGlobalM > 0 ? totalGlobalM : ''}</Text></View>
                        </View>
                      );
                    })()}

                  </View>

                  {/* LADO DERECHO */}
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
              )}

              {/* DESCRIPCIÓN */}
              <Text style={styles.sectionHeader}>Descripción de la actividad</Text>
              <View style={[styles.row, { minHeight: 60, padding: 5, alignItems: 'flex-start' }]}>
                <Text>{actividad.descripcion}</Text>
              </View>

              {/* EVIDENCIAS */}
              <Text style={[styles.sectionHeader, { borderBottomWidth: 0 }]}>Evidencias</Text>
              <View style={[styles.evidenciasContainer, { borderTopWidth: 1, borderColor: '#000' }]}>
                {actividad.evidencias && actividad.evidencias.length > 0 ? (
                  actividad.evidencias
                    .map((evidencia: any, index: number) => {
                      const imageUrl = evidencia?.url;
                      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) return null;

                      return (
                        <Image 
                          key={index} 
                          src={{ uri: imageUrl, method: 'GET', headers: { 'Cache-Control': 'no-cache' } }} 
                          style={styles.foto} 
                        />
                      );
                    })
                    .filter(Boolean)
                ) : (
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
}