import React, { useState, useEffect } from 'react';
import { 
  Inbox, FileText, Edit2, X, Save, Settings2, Plus, Calendar, Loader2, Filter, MapPin, Globe, AlertTriangle, RefreshCw, Lock
} from 'lucide-react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase'; 

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ==========================================
// 1. ESTILOS DEL PDF
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

// ==========================================
// 2. COMPONENTE PDF (Lógica visual y formateo)
// ==========================================
const ReportePDF = ({ snapshot, categorias = [], acciones = [] }: any) => {
  if (!snapshot || !snapshot.actividades) return null;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {snapshot.actividades.map((actividad: any, index: number) => {
          
          // Lógica: Propia o Colaborativa
          const esPropia = actividad.creado_por_usuario_id === snapshot.usuario_id;
          const tipoActividadText = esPropia ? 'Propia' : 'Colaborativa';

          // Lógica: ODS Principal
          let odsText = actividad.ods_principal || '';
          if (!odsText && actividad.actividad_ods) {
            const odsPrin = actividad.actividad_ods.find((o: any) => o.es_principal);
            if (odsPrin?.ods) odsText = `${odsPrin.ods.numero}. ${odsPrin.ods.nombre}`;
          }

          const municipioText = actividad.municipios?.nombre || actividad.domicilio?.municipio || actividad.municipio || '';
          const coloniaText = actividad.colonia || actividad.domicilio?.colonia || '';
          const calleText = actividad.calle || actividad.domicilio?.calle || '';
          const lugarText = actividad.lugar || '';

          // Lógica: Formateo de fecha en español largo
          let fechaAjustada = '';
          if (actividad.fecha_evento) {
            const partes = actividad.fecha_evento.split('T')[0].split('-');
            const fechaObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            fechaAjustada = format(fechaObj, "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
            fechaAjustada = fechaAjustada.charAt(0).toUpperCase() + fechaAjustada.slice(1);
          }

          // LÓGICA: Formateo de Horas a formato 12h (AM/PM)
          const formatearHoraAMPM = (horaStr: string) => {
            if (!horaStr) return '';
            const partes = horaStr.split(':');
            if (partes.length < 2) return horaStr;
            let horas = parseInt(partes[0], 10);
            const minutos = partes[1];
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12;
            horas = horas ? horas : 12; // La hora 0 se vuelve 12
            return `${horas.toString().padStart(2, '0')}:${minutos} ${ampm}`;
          };

          const horaInicio = formatearHoraAMPM(actividad.hora_inicio?.slice(0, 5));
          const horaFin = formatearHoraAMPM(actividad.hora_fin?.slice(0, 5));

          let econ = false, soc = false, amb = false;
          if (actividad.actividad_sostenibilidad) {
            econ = actividad.actividad_sostenibilidad.some((s:any) => s.area_id === 1);
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

              <Text style={styles.sectionHeader}>Datos del Proyecto</Text>
              <View style={styles.row}>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Nombre</Text></View>
                <View style={[styles.cellData, styles.w35]}><Text>{actividad.nombre}</Text></View>
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Fecha</Text></View>
                <View style={[styles.cellData, styles.w35, styles.noBorderRight]}><Text>{fechaAjustada}</Text></View>
              </View>
              
              <View style={styles.row}>
                {/* AQUI MOSTRAMOS SI ES PROPIA O COLABORATIVA */}
                <View style={[styles.cellHeaderCenter, styles.w15]}><Text>Actividad</Text></View>
                <View style={[styles.cellData, styles.w35]}><Text>{tipoActividadText}</Text></View>
                {/* AQUI VAN LAS HORAS FORMATEADAS AM/PM */}
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
                  
                  {/* SE RESTAURÓ EL CUADRO DE RANGO DE EDAD */}
                  <View style={[styles.cellHeaderCenter, styles.noBorderRight, { borderBottomWidth: 1, backgroundColor: '#f0f0f0' }]}><Text>Rango de edad</Text></View>
                  <View style={[styles.colContent, styles.noBorderRight, { padding: 5, flex: 1, minHeight: 40 }]}><Text style={styles.textCenter}>{rangoEdadText}</Text></View>
                </View>

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


// ==========================================
// 3. PANTALLA PRINCIPAL ADMIN
// ==========================================
export default function AdminReportes() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<any>(null);
  const [ocultarAnuladasPDF, setOcultarAnuladasPDF] = useState(false);
  
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

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
  const [mesesDisponibles, setMesesDisponibles] = useState<{mes: number, anio: number, nombre: string}[]>([]);

  const [showHabilitarModal, setShowHabilitarModal] = useState(false);
  const [nuevoMes, setNuevoMes] = useState(new Date().getMonth() + 1);
  const [nuevoAnio, setNuevoAnio] = useState(new Date().getFullYear());
  const [procesandoMes, setProcesandoMes] = useState(false);

  const [showDeshabilitarModal, setShowDeshabilitarModal] = useState(false);
  const [mesDeshabilitar, setMesDeshabilitar] = useState<string>('');
  const [procesandoDeshabilitar, setProcesandoDeshabilitar] = useState(false);

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

      if (catRes.data) setCategoriasDB([...catRes.data, { id: 99, nombre: 'Total Beneficiarios' }]);
      if (accRes.data) setAccionesDB(accRes.data);
      if (odsRes.data) setOdsDB(odsRes.data);
      if (munRes.data) setMunicipiosList(munRes.data);

      const embMap = new Map();
      embRes.data?.forEach(e => embMap.set(e.usuario_id, (e.municipios as any)?.nombre || 'Sin municipio'));

      if (repRes.data) {
        const formateados = repRes.data.map((r: any) => ({
          ...r,
          nombre_mes: `${MESES[(r.mes || 1) - 1]} ${r.anio}`,
          embajador: { nombre: `${r.usuarios?.nombre || ''} ${r.usuarios?.apellido || ''}`.trim() || 'Sin Nombre' },
          municipio_nombre: embMap.get(r.usuario_id) || 'Desconocido',
          actividades: []
        }));
        setReportes(formateados);

        const unicos = new Map();
        repRes.data.forEach((r: any) => {
          const key = `${r.mes}-${r.anio}`;
          if (!unicos.has(key)) {
            unicos.set(key, { mes: r.mes, anio: r.anio, nombre: `${MESES[(r.mes || 1) - 1]} ${r.anio}` });
          }
        });
        setMesesDisponibles(Array.from(unicos.values()));
      }
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleHabilitarMes = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesandoMes(true);
    try {
      const { data: existing } = await supabase.from('reportes').select('id').eq('mes', nuevoMes).eq('anio', nuevoAnio).limit(1);
      if (existing && existing.length > 0) return alert("Este mes ya fue habilitado previamente.");
      
      const { data: embajadores } = await supabase.from('embajadores').select('usuario_id').eq('activo', true);
      if (embajadores && embajadores.length > 0) {
        const strMes = String(nuevoMes).padStart(2, '0');
        const ultimoDia = new Date(nuevoAnio, nuevoMes, 0).getDate();
        const inserts = embajadores.map((emb: any) => ({
          usuario_id: emb.usuario_id, mes: nuevoMes, anio: nuevoAnio,
          periodo_inicio: `${nuevoAnio}-${strMes}-01`, periodo_fin: `${nuevoAnio}-${strMes}-${ultimoDia}`,
          estado: 'Borrador'
        }));
        const { error } = await supabase.from('reportes').insert(inserts);
        if (error) throw error;
        alert("Mes habilitado exitosamente.");
        setShowHabilitarModal(false);
        fetchData();
      } else {
        alert("No hay embajadores activos en el sistema.");
      }
    } catch (error: any) { alert("Ocurrió un error: " + error.message); } 
    finally { setProcesandoMes(false); }
  };

  const handleDeshabilitarMes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mesDeshabilitar) return alert("Selecciona un mes de la lista");
    setProcesandoDeshabilitar(true);
    try {
      const [mesSeleccionado, anioSeleccionado] = mesDeshabilitar.split('-').map(Number);
      const { error } = await supabase.from('reportes')
        .update({ estado: 'Deshabilitado' })
        .eq('mes', mesSeleccionado).eq('anio', anioSeleccionado).in('estado', ['Borrador', 'Rechazada']); 
      
      if (error) throw error;
      alert("Mes deshabilitado con éxito.");
      setShowDeshabilitarModal(false);
      fetchData(); 
    } catch (error: any) { alert("Error al deshabilitar el mes: " + error.message); } 
    finally { setProcesandoDeshabilitar(false); }
  };

  const seleccionarReporte = async (reporte: any) => {
    setReporteSeleccionado(reporte); 
    
    const strMes = String(reporte.mes).padStart(2, '0');
    const ultimoDia = new Date(reporte.anio, reporte.mes, 0).getDate();
    
    const { data: actividadesMes } = await supabase.from('actividades').select(`
        *, municipios(nombre),
        actividad_beneficiarios(categoria_id, hombres, mujeres, total),
        actividad_acciones(tipo_accion_id, cantidad),
        actividad_sostenibilidad(area_id),
        actividad_ods(ods_id, es_principal, ods(numero, nombre)),
        evidencias(id, url_archivo)
      `)
      .eq('creado_por_usuario_id', reporte.usuario_id)
      .gte('fecha_evento', `${reporte.anio}-${strMes}-01`)
      .lte('fecha_evento', `${reporte.anio}-${strMes}-${ultimoDia}`)
      .order('fecha_evento', { ascending: true });

    if (!actividadesMes || actividadesMes.length === 0) {
      setReporteSeleccionado({ ...reporte, actividades: [] });
      return;
    }

    const { data: repActs } = await supabase.from('reporte_act').select('actividad_id, estado_validacion, comentarios_admin').eq('reporte_id', reporte.id);
    const validacionMap = new Map();
    repActs?.forEach(ra => validacionMap.set(ra.actividad_id, { anulada: ra.estado_validacion === 'Rechazada', comentario: ra.comentarios_admin || '' }));

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
        tipo_accion_id_real: act.actividad_acciones?.[0]?.tipo_accion_id?.toString() || '',
        domicilio: { calle: act.calle || '', colonia: act.colonia || '', municipio: act.municipio_id || '' },
        beneficiarios: beneficiariosObj,
        ods_seleccionados: odsSeleccionados,
        evidencias: act.evidencias ? act.evidencias.map((ev:any) => ({ id: ev.id, url: ev.url_archivo })) : [],
        anulada: validacionData.anulada,
        motivo_anulacion: validacionData.comentario
      };
    });

    setReporteSeleccionado({ ...reporte, actividades: actividadesCompletas });
  };

  const toggleAnularActividad = (actividadId: number, anuladaActual: boolean) => {
    if (!anuladaActual) setModalAnular({ visible: true, actividadId, comentario: '' });
    else procesarCambioEstado(actividadId, 'Aprobada', null);
  };

  const procesarCambioEstado = async (actividadId: number, nuevoEstadoVal: string, comentario: string | null) => {
    if (!reporteSeleccionado) return;
    if (nuevoEstadoVal === 'Rechazada' && !comentario?.trim()) return alert("Debes ingresar un motivo.");

    try {
      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from('reporte_act').upsert({
        reporte_id: reporteSeleccionado.id, actividad_id: actividadId, estado_validacion: nuevoEstadoVal,
        comentarios_admin: comentario, validado_por_usuario_id: authData.user?.id, fecha_validacion: new Date().toISOString()
      }, { onConflict: 'reporte_id,actividad_id' });

      if (error) throw error;

      setReporteSeleccionado({
        ...reporteSeleccionado,
        actividades: reporteSeleccionado.actividades.map((act: any) => 
          act.id === actividadId ? { ...act, anulada: nuevoEstadoVal === 'Rechazada', motivo_anulacion: comentario || '' } : act
        )
      });
      setModalAnular({ visible: false, actividadId: null, comentario: '' });
    } catch (error) { alert("Error al actualizar estado."); }
  };

  const handleChangeSimple = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion({ ...actividadEnEdicion, [name]: value });
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActividadEnEdicion((prev: any) => ({ ...prev, domicilio: { ...prev.domicilio, [name]: name === 'municipio' ? Number(value) : value } }));
  };

  const toggleOds = (odsId: number) => {
    setActividadEnEdicion((prev: any) => {
      const arr = prev.ods_seleccionados || [];
      if (arr.includes(odsId)) return { ...prev, ods_seleccionados: arr.filter((id: number) => id !== odsId) };
      if (arr.length >= 4) { alert('Máximo 4 ODS.'); return prev; }
      return { ...prev, ods_seleccionados: [...arr, odsId] };
    });
  };

  const handleBeneficiarioChange = (categoriaId: number, campo: string, value: string) => {
    setActividadEnEdicion((prev: any) => ({
      ...prev, beneficiarios: { ...prev.beneficiarios, [categoriaId]: { ...prev.beneficiarios?.[categoriaId], [campo]: value } }
    }));
  };

  const guardarEdicionActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporteSeleccionado || !actividadEnEdicion) return;

    setGuardando(true);
    try {
      const actId = actividadEnEdicion.id;
      const tipoAccionIdInt = parseInt(actividadEnEdicion.tipo_accion_id_real, 10);
      const tipoObj = accionesDB.find(a => a.id === tipoAccionIdInt);

      let odsPrincipalText = '';
      if (actividadEnEdicion.ods_seleccionados?.length > 0) {
        const odsPrin = odsDB.find(o => o.id === actividadEnEdicion.ods_seleccionados[0]);
        if (odsPrin) odsPrincipalText = `${odsPrin.numero}. ${odsPrin.nombre}`;
      }

      const { error: errAct } = await supabase.from('actividades').update({
        nombre: actividadEnEdicion.nombre, tipo_actividad: tipoObj?.nombre || null, 
        fecha_evento: actividadEnEdicion.fecha_evento,
        hora_inicio: actividadEnEdicion.hora_inicio || null, hora_fin: actividadEnEdicion.hora_fin || null,
        lugar: actividadEnEdicion.lugar, municipio_id: actividadEnEdicion.domicilio?.municipio || null,
        calle: actividadEnEdicion.domicilio?.calle, colonia: actividadEnEdicion.domicilio?.colonia,
        rango_edad_beneficiarios: actividadEnEdicion.rango_edad, rango_edad: actividadEnEdicion.rango_edad,
        ods_principal: odsPrincipalText, descripcion: actividadEnEdicion.descripcion,
        fecha_actualizacion: new Date().toISOString()
      }).eq('id', actId);
      if (errAct) throw errAct;

      await supabase.from('actividad_beneficiarios').delete().eq('actividad_id', actId);
      if (actividadEnEdicion.beneficiarios) {
        const benefPayload = Object.entries(actividadEnEdicion.beneficiarios)
          .filter(([id]) => Number(id) !== 99)
          .map(([id, val]: any) => ({
            actividad_id: actId, categoria_id: Number(id),
            hombres: parseInt(val.hombres || '0', 10), mujeres: parseInt(val.mujeres || '0', 10),
            total: parseInt(val.hombres || '0', 10) + parseInt(val.mujeres || '0', 10),
            actualizado_en: new Date().toISOString()
          })).filter(b => b.total > 0);
        if (benefPayload.length > 0) await supabase.from('actividad_beneficiarios').insert(benefPayload);
      }

      await supabase.from('actividad_acciones').delete().eq('actividad_id', actId);
      if (!isNaN(tipoAccionIdInt)) {
        await supabase.from('actividad_acciones').insert({ actividad_id: actId, tipo_accion_id: tipoAccionIdInt, cantidad: 1, creado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() });
      }

      const areasSeleccionadas = new Set<number>();
      actividadEnEdicion.ods_seleccionados?.forEach((odsId: number) => {
        const cat = odsDB.find(o => o.id === odsId)?.categoria_sostenibilidad?.toLowerCase() || '';
        if (cat.includes('econ')) areasSeleccionadas.add(1);
        if (cat.includes('social') || cat.includes('sociedad')) areasSeleccionadas.add(2);
        if (cat.includes('ambient') || cat.includes('biosfera')) areasSeleccionadas.add(3);
        if (cat.includes('transversal') || cat.includes('alianza')) { areasSeleccionadas.add(1); areasSeleccionadas.add(2); areasSeleccionadas.add(3); }
      });

      await supabase.from('actividad_sostenibilidad').delete().eq('actividad_id', actId);
      if (areasSeleccionadas.size > 0) {
        await supabase.from('actividad_sostenibilidad').insert(Array.from(areasSeleccionadas).map(areaId => ({ actividad_id: actId, area_id: areaId, creado_en: new Date().toISOString() })));
      }

      await supabase.from('actividad_ods').delete().eq('actividad_id', actId);
      if (actividadEnEdicion.ods_seleccionados?.length > 0) {
        await supabase.from('actividad_ods').insert(actividadEnEdicion.ods_seleccionados.map((odsId: number, idx: number) => ({ actividad_id: actId, ods_id: odsId, es_principal: idx === 0 })));
      }

      alert('Actividad modificada exitosamente');
      setActividadEnEdicion(null);
      seleccionarReporte(reporteSeleccionado); 
      
    } catch (error: any) { alert('Error al guardar: ' + error.message); } 
    finally { setGuardando(false); }
  };

  const snapshotParaPDF = reporteSeleccionado ? {
    ...reporteSeleccionado,
    actividades: ocultarAnuladasPDF ? reporteSeleccionado.actividades.filter((a: any) => !a.anulada) : reporteSeleccionado.actividades
  } : null;

  const reportesFiltrados = reportes.filter(r => {
    return (filtroEstado === 'Todos' || r.estado === filtroEstado) &&
           (filtroMes === 'Todos' || `${r.mes}-${r.anio}` === filtroMes) &&
           (filtroMunicipio === 'Todos' || r.municipio_nombre === filtroMunicipio);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      
      {/* ================= MODAL ANULACIÓN ================= */}
      {modalAnular.visible && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><AlertTriangle size={20} className="text-red-600" /> Motivo de anulación</h3>
              <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <textarea autoFocus rows={4} className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none shadow-sm" placeholder="Ej. Faltan evidencias claras..." value={modalAnular.comentario} onChange={e => setModalAnular({ ...modalAnular, comentario: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalAnular({ visible: false, actividadId: null, comentario: '' })} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button onClick={() => procesarCambioEstado(modalAnular.actividadId!, 'Rechazada', modalAnular.comentario)} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDICIÓN ================= */}
      {actividadEnEdicion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 rounded-t-2xl">
              <h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><Edit2 size={20} className="text-[#00689D]"/> Editar Registro de Actividad</h3>
              <button onClick={() => setActividadEnEdicion(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
              <form id="form-edicion-admin" onSubmit={guardarEdicionActividad} className="space-y-8">
                
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Datos Generales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
                      <input required type="text" name="nombre" value={actividadEnEdicion.nombre || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-[#00689D] outline-none"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Acción Principal</label>
                      <select name="tipo_accion_id_real" value={actividadEnEdicion.tipo_accion_id_real || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#00689D]">
                        <option value="">-- Selecciona --</option>
                        {accionesDB.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label><input type="date" name="fecha_evento" value={actividadEnEdicion.fecha_evento?.split('T')[0] || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Inicio</label><input type="time" name="hora_inicio" value={actividadEnEdicion.hora_inicio?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Fin</label><input type="time" name="hora_fin" value={actividadEnEdicion.hora_fin?.slice(0,5) || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <label className="flex items-center gap-1 text-xs font-bold text-[#00689D] mb-2"><Globe size={14}/> Alineación ODS <span className="font-normal text-gray-500">(Máximo 4)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {odsDB.map(ods => {
                        const isSelected = actividadEnEdicion.ods_seleccionados?.includes(ods.id);
                        const isPrincipal = actividadEnEdicion.ods_seleccionados?.[0] === ods.id;
                        return (
                          <button key={ods.id} type="button" onClick={() => toggleOds(ods.id)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${isSelected ? (isPrincipal ? 'bg-[#00689D] text-white' : 'bg-blue-100 text-blue-800 border-blue-300') : 'bg-white text-gray-500'}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-white text-[#00689D]' : 'bg-gray-100'}`}>{ods.numero}</span>
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
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Lugar</label><input type="text" name="lugar" value={actividadEnEdicion.lugar || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Municipio</label><select name="municipio" value={actividadEnEdicion.domicilio?.municipio || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"><option value="">-- Selecciona --</option>{municipiosList.map(mun => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Colonia</label><input type="text" name="colonia" value={actividadEnEdicion.domicilio?.colonia || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Calle</label><input type="text" name="calle" value={actividadEnEdicion.domicilio?.calle || ''} onChange={handleDomicilioChange} className="w-full border border-gray-300 rounded-lg p-2 text-sm"/></div>
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
                          if (c.id !== 99) { valH += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.hombres || '0', 10); valM += parseInt(actividadEnEdicion.beneficiarios?.[c.id]?.mujeres || '0', 10); }
                        });
                      } else { valH = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.hombres || '0', 10); valM = parseInt(actividadEnEdicion.beneficiarios?.[cat.id]?.mujeres || '0', 10); }

                      return (
                        <div key={cat.id} className={`flex gap-2 items-center p-2 rounded-lg border ${esFilaTotal ? 'bg-[#00689D]/5 border-[#00689D]/20' : 'bg-gray-50 border-gray-100'}`}>
                          <span className={`w-1/3 text-[10px] leading-tight ${esFilaTotal ? 'font-black text-[#00689D]' : 'font-bold text-gray-600'}`}>{cat.nombre}</span>
                          <input type="number" placeholder="0" value={(valH+valM)>0 ? valH+valM : ''} disabled tabIndex={-1} className={`w-1/5 border text-center rounded p-1 text-xs cursor-not-allowed ${esFilaTotal ? 'bg-[#00689D]/10 text-[#00689D] font-bold' : 'bg-gray-100 text-gray-500'}`} />
                          <input type="number" placeholder="H" value={valH>0 ? valH : ''} onChange={e => handleBeneficiarioChange(cat.id, 'hombres', e.target.value)} disabled={esFilaTotal} className={`w-1/5 text-center border rounded p-1 text-xs ${esFilaTotal ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:border-[#00689D]'}`} />
                          <input type="number" placeholder="M" value={valM>0 ? valM : ''} onChange={e => handleBeneficiarioChange(cat.id, 'mujeres', e.target.value)} disabled={esFilaTotal} className={`w-1/5 text-center border rounded p-1 text-xs ${esFilaTotal ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:border-[#00689D]'}`} />
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
                  <h4 className="text-sm font-black text-[#00689D] uppercase tracking-wider border-b pb-2">Descripción</h4>
                  <textarea name="descripcion" rows={3} value={actividadEnEdicion.descripcion || ''} onChange={handleChangeSimple} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#00689D] outline-none resize-none"/>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setActividadEnEdicion(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button form="form-edicion-admin" type="submit" disabled={guardando} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#00689D] hover:bg-[#00527A] flex items-center justify-center gap-2 shadow-md">
                {guardando ? <><Loader2 className="animate-spin" size={18}/> Guardando...</> : <><Save size={20}/> Guardar Cambios</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL CERRAR MES ================= */}
      {showDeshabilitarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Lock size={20} className="text-red-600"/> Cerrar Mes</h3>
              <button onClick={() => setShowDeshabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleDeshabilitarMes} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Esta acción bloqueará todos los reportes "Borrador". Los embajadores ya no podrán agregar ni editar información.</p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Seleccionar Periodo</label>
                <select required className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-red-500 outline-none" value={mesDeshabilitar} onChange={e => setMesDeshabilitar(e.target.value)}>
                  <option value="" disabled>-- Selecciona un periodo --</option>
                  {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowDeshabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100">Cancelar</button>
                <button type="submit" disabled={procesandoDeshabilitar} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL HABILITAR MES ================= */}
      {showHabilitarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><Calendar size={20} className="text-[#00689D]"/> Habilitar Reportes</h3>
              <button onClick={() => setShowHabilitarModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleHabilitarMes} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Creará registros vacíos para todos los embajadores activos.</p>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Mes</label><select required className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={nuevoMes} onChange={e => setNuevoMes(Number(e.target.value))}>{MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}</select></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Año</label><input type="number" required className="w-full border border-gray-300 rounded-lg p-2 text-sm" value={nuevoAnio} onChange={e => setNuevoAnio(Number(e.target.value))} /></div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowHabilitarModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-300">Cancelar</button>
                <button type="submit" disabled={procesandoMes} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#00689D]">Habilitar Mes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CABECERA Y PANEL PRINCIPAL ============ */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="text-[#00689D]"/> Bandeja de Auditoría</h1>
          <p className="text-sm text-gray-500 mt-1">Revisa los expedientes enviados por los embajadores</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => setShowDeshabilitarModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 border border-red-200"><Lock size={18} /> Cerrar Mes</button>
          <button onClick={() => setShowHabilitarModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#00689D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#00527A]"><Plus size={18} /> Habilitar Nuevo Mes</button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* === IZQUIERDA: LISTA Y FILTROS === */}
        <div className="w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-700">Expedientes</h3>
            <span className="text-xs bg-[#00689D] text-white px-2 py-0.5 rounded-full font-bold">{reportesFiltrados.length}</span>
          </div>

          <div className="border-b border-gray-100 bg-white flex flex-col">
            <div className="flex p-2 gap-1 border-b border-gray-100 bg-gray-50/50">
              <button onClick={() => setFiltroEstado('Todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Todos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Todos</button>
              <button onClick={() => setFiltroEstado('Enviado')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Enviado' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Enviados</button>
              <button onClick={() => setFiltroEstado('Borrador')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'Borrador' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}>Borrador</button>
            </div>
            <div className="p-3 space-y-3 bg-white">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Filtrar por Mes</label>
                <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded p-1.5 outline-none focus:border-[#00689D]">
                  <option value="Todos">Todos los meses generados</option>
                  {mesesDisponibles.map((m, i) => <option key={i} value={`${m.mes}-${m.anio}`}>{m.nombre}</option>)}
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
              <div className="p-6 text-center text-gray-400 text-sm flex flex-col items-center justify-center h-full"><Filter size={32} className="mb-2 opacity-20"/> No hay expedientes.</div>
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

        {/* === DERECHA: DETALLE Y PDF === */}
        {reporteSeleccionado ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-w-0">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black"><FileText className="inline text-[#00689D] mr-2"/> Expediente: {reporteSeleccionado.nombre_mes} - {reporteSeleccionado.embajador.nombre}</h2>
              <button onClick={() => seleccionarReporte(reporteSeleccionado)} className="text-[#00689D] flex items-center gap-1.5 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"><RefreshCw size={14}/> Refrescar datos</button>
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
                          <button onClick={() => setActividadEnEdicion(act)} title="Editar actividad" className="flex items-center justify-center px-3 py-1.5 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"><Edit2 size={16} /></button>
                          <button onClick={() => toggleAnularActividad(act.id, act.anulada)} className={`flex-1 flex justify-center items-center py-1.5 text-xs font-bold rounded-lg border transition-colors ${act.anulada ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
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
          <div className="flex-1 bg-white rounded-2xl flex items-center justify-center flex-col text-gray-400"><FileText size={48} className="mb-4 opacity-20"/><p className="font-bold">Selecciona un expediente</p></div>
        )}
      </div>
    </div>
  );
}