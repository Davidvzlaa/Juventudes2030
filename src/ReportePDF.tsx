import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ==========================================
// 1. ESTILOS DEL PDF
// ==========================================
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
  bannerAnulado: { backgroundColor: '#fee2e2', padding: 6, borderBottomWidth: 1, borderColor: '#000', justifyContent: 'center' },
  textAnulado: { color: '#b91c1c', fontWeight: 'bold', textAlign: 'center', fontSize: 9 }
});

// ==========================================
// 2. COMPONENTE PDF
// ==========================================
export default function ReportePDF({ snapshot, categorias = [], acciones = [] }: any) {
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

           // 2. ODS Principal y Complementarios
          let odsText = actividad.ods_principal || '';
          let odsComplementariosText = 'Ninguno'; // Texto por defecto

          if (actividad.actividad_ods) {
            // Buscamos el principal
            const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
            if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;

            // Buscamos los complementarios (los que NO son principales)
            const odsSecundarios = actividad.actividad_ods.filter((o: any) => !o.es_principal);
            if (odsSecundarios.length > 0) {
              // Los unimos separándolos por una coma
              odsComplementariosText = odsSecundarios
                .map((o: any) => o.ods ? `${o.ods.numero}. ${o.ods.nombre}` : '')
                .filter(Boolean)
                .join('  •  '); 
            }
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
          let soc = false, amb = false;
          if (actividad.actividad_sostenibilidad) {
            soc = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 2);
            amb = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 3);
          }

          // 6. Rango de Edad y Motivo Anulación
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
                {/* --- AQUI ESTA LA CORRECCIÓN DE TIPO DE ACTIVIDAD --- */}
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Tipo de Actividad</Text></View>
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
              
              {/* === NUEVA FILA DE ODS COMPLEMENTARIOS === */}
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>ODS COMPLEMENTARIOS</Text></View>
                <View style={[styles.cellData, styles.w85, styles.noBorderRight]}><Text>{odsComplementariosText}</Text></View>
              </View>
              {/* ========================================= */}
              
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Sostenibilidad</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Económico</Text></View>
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
                  actividad.evidencias.map((evidencia: any, index: number) => (
                    <Image key={index} src={evidencia.url_archivo || evidencia.url} style={styles.foto} />
                  ))
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