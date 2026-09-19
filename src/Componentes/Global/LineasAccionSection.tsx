import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { 
  MapPin, Calendar as CalendarIcon, Check, ChevronsUpDown, X, Filter, Search, Clock,
  Loader2
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "../../components/ui/carousel";
import { supabase } from "../../lib/supabase";

// Mapeo de colores para bordes/fondos por si la imagen falla
const odsColors: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D',
  5: '#FF3A21', 6: '#26BDE2', 7: '#FCC30B', 8: '#A21942',
  9: '#FD6925', 10: '#DD1367', 11: '#FD9D24', 12: '#BF8B2E',
  13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B', 16: '#00689D',
  17: '#19486A'
};

export default function ExplorarActividades() {
  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================
  const [municipiosDB, setMunicipiosDB] = useState<any[]>([]);
  const [openMunicipios, setOpenMunicipios] = useState(false);
  const [municipiosSel, setMunicipiosSel] = useState<number[]>([]); 
  
  const [tipoFecha, setTipoFecha] = useState<string>("todas");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [actividades, setActividades] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. CARGAR CATÁLOGO DE MUNICIPIOS
  useEffect(() => {
    const fetchMunicipios = async () => {
      const { data } = await supabase.from("municipios").select("id, nombre").eq("activo", true).order("nombre");
      if (data) setMunicipiosDB(data);
    };
    fetchMunicipios();
  }, []);

  // 2. MOTOR DE BÚSQUEDA Y FILTRADO
  const buscarActividades = async () => {
    setCargando(true);
    try {
      const hoy = new Date();
      let fechaInicio = hoy.toISOString(); 
      let fechaFin: string | undefined;

      if (tipoFecha === "semana") {
        fechaInicio = startOfWeek(hoy, { weekStartsOn: 1 }).toISOString();
        fechaFin = endOfWeek(hoy, { weekStartsOn: 1 }).toISOString();
      } else if (tipoFecha === "mes") {
        fechaInicio = startOfMonth(hoy).toISOString();
        fechaFin = endOfMonth(hoy).toISOString();
      } else if (tipoFecha === "rango" && dateRange?.from) {
        fechaInicio = dateRange.from.toISOString();
        if (dateRange.to) fechaFin = dateRange.to.toISOString();
      }

      if (new Date(fechaInicio) < hoy) {
        fechaInicio = hoy.toISOString();
      }

      let query = supabase
        .from("actividades")
        .select(`
          id, nombre, fecha_evento, hora_inicio, hora_fin, lugar, descripcion, estado,
          municipios (nombre),
          usuarios!actividades_creado_por_usuario_id_fkey (nombre, apellido),
          actividad_ods (
            es_principal,
            ods (numero, nombre, imagen)
          )
        `)
        .eq("estado", "Programada") // <--- CAMBIO AQUÍ: Solo muestra las actividades publicadas (excluye Borrador y Cancelado)
        .gte("fecha_evento", fechaInicio)
        .order("fecha_evento", { ascending: true }); 

      if (fechaFin) query = query.lte("fecha_evento", fechaFin);

if (municipiosSel.length > 0) {
  // Construye un string con los IDs seleccionados, ej: "1,2,3"
  const idsString = municipiosSel.join(',');
  // Busca actividades donde el municipio_id esté en la lista OR sea nulo
  query = query.or(`municipio_id.in.(${idsString}),municipio_id.is.null`);
}

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const procesadas = data.map((act: any) => {
          const listaOds = act.actividad_ods
            ?.map((rel: any) => ({ ...rel.ods, es_principal: rel.es_principal }))
            .sort((a: any, b: any) => (a.es_principal === b.es_principal ? 0 : a.es_principal ? -1 : 1)) || [];
          return { ...act, listaOds };
        });
        setActividades(procesadas);
      }
    } catch (error) {
      console.error("Error al cargar actividades:", error);
    } finally {
      setCargando(false);
    }
  };

  // 3. EJECUTAR BÚSQUEDA
  useEffect(() => {
    buscarActividades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFecha, dateRange, municipiosSel, refreshTrigger]); 

  // 4. SUSCRIPCIÓN REALTIME
  useEffect(() => {
    const canal = supabase
      .channel('vigilante-bd')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividades' }, () => {
        setRefreshTrigger(prev => prev + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'actividad_ods' }, () => {
        setRefreshTrigger(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const toggleMunicipio = (id: number) => {
    setMunicipiosSel((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const limpiarFiltros = () => {
    setMunicipiosSel([]);
    setTipoFecha("todas");
    setDateRange(undefined);
  };

  const hayFiltrosActivos = municipiosSel.length > 0 || tipoFecha !== "todas" || dateRange;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      
      {/* ================= PANEL DE FILTROS ================= */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-black text-[#00689D]">
            <Filter size={20} /> Explorar Actividades
          </h3>
          {hayFiltrosActivos && (
            <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700">
              <X className="mr-2 h-4 w-4" /> Limpiar filtros
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          {/* Ubicación */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Ubicación</label>
            <Popover open={openMunicipios} onOpenChange={setOpenMunicipios}>
              <PopoverTrigger role="combobox" aria-expanded={openMunicipios} className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between bg-gray-50 hover:bg-gray-100")}>
                <span className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-[#00689D] shrink-0" />
                  <span className="truncate font-semibold text-gray-700">
                    {municipiosSel.length === 0 ? "Todo Sinaloa" : `${municipiosSel.length} seleccionados`}
                  </span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[300px] p-0 bg-white z-50 shadow-xl border border-gray-100 rounded-xl" align="start">
                <Command>
                  <CommandInput placeholder="Buscar municipio..." />
                  <CommandList className="max-h-[200px]">
                    <CommandEmpty>No se encontró el municipio.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem 
                        value="todos" 
                        onSelect={() => { setMunicipiosSel([]); setOpenMunicipios(false); }} 
                        className="font-bold text-[#00689D]"
                      >
                        <Check className={cn("mr-2 h-4 w-4", municipiosSel.length === 0 ? "opacity-100" : "opacity-0")} />
                        Ver todo el Estado
                      </CommandItem>
                      
                      {municipiosDB.map((mun) => (
                        <CommandItem 
                          key={mun.id} 
                          value={mun.nombre} 
                          onSelect={() => toggleMunicipio(mun.id)} 
                          className="font-medium text-gray-700"
                        >
                          <Check className={cn("mr-2 h-4 w-4 text-[#00689D]", municipiosSel.includes(mun.id) ? "opacity-100" : "opacity-0")} />
                          {mun.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Cuándo</label>
            <Select value={tipoFecha} onValueChange={(val) => { if (val !== null) setTipoFecha(val) }}>
              <SelectTrigger className="bg-gray-50 hover:bg-gray-100 font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-[#00689D] shrink-0" />
                  <SelectValue placeholder="Cualquier fecha" />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white z-50 shadow-xl border border-gray-100 rounded-xl">
                <SelectItem value="todas">Próximos eventos (Todos)</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
                <SelectItem value="rango">Período específico...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón Buscar */}
          <div className="flex items-end mt-2 lg:mt-0">
            <Button onClick={buscarActividades} className="w-full lg:w-auto bg-[#00689D] font-bold text-white hover:bg-[#061A2D] rounded-xl flex gap-2">
              <Search size={16} /> Buscar
            </Button>
          </div>
        </div>

        {/* CALENDARIO RANGO ESPECÍFICO */}
        {tipoFecha === "rango" && (
          <div className="mt-4 flex animate-in slide-in-from-top-2 flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Selecciona el período</label>
            <Popover>
              <PopoverTrigger id="date" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start text-left font-semibold md:w-[300px]", !dateRange && "text-gray-400")}>
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#00689D]" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, "LLL dd, y", { locale: es })} - ${format(dateRange.to, "LLL dd, y", { locale: es })}` : format(dateRange.from, "LLL dd, y", { locale: es })
                  ) : "Elige un rango de fechas"}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white z-50 shadow-xl border border-gray-100 rounded-xl" align="start">
                <Calendar 
                  mode="range" 
                  defaultMonth={dateRange?.from} 
                  selected={dateRange} 
                  onSelect={setDateRange} 
                  numberOfMonths={1} 
                  locale={es} 
                  classNames={{
                    range_start: "bg-[#061A2D] text-white hover:bg-[#061A2D] hover:text-white rounded-l-md rounded-r-none",
                    range_end: "bg-[#061A2D] text-white hover:bg-[#061A2D] hover:text-white rounded-r-md rounded-l-none",
                    range_middle: "aria-selected:bg-[#E6F0F5] aria-selected:text-gray-900 rounded-none",
                    today: "bg-gray-100 text-gray-900 font-bold",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* BADGES ACTIVOS */}
        {municipiosSel.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {municipiosSel.map((id) => {
              const mun = municipiosDB.find(m => m.id === id);
              if (!mun) return null;
              
              return (
                <Badge 
                  key={id} 
                  variant="secondary" 
                  className="flex items-center gap-1.5 bg-blue-50 text-[#00689D] hover:bg-blue-100 rounded-lg px-3 py-1"
                >
                  {mun.nombre}
                  
                  {/* Envolvemos la X en un botón para asegurar que registre el clic */}
                  <button
                    type="button"
                    className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                      e.preventDefault(); // Evita recargas de formulario si está dentro de uno
                      e.stopPropagation(); // Evita que se abra el desplegable de fondo
                      toggleMunicipio(id); // Quita el municipio
                    }}
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                  
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CAROUSEL DE EVENTOS ================= */}
      <div className="mt-10 mb-8">
        <h2 className="text-xl font-black text-gray-800 mb-6">Próximos Eventos</h2>
        
        {cargando ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#00689D] w-10 h-10" />
          </div>
        ) : actividades.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
            <p className="font-bold text-lg text-gray-500">No hay actividades programadas</p>
            <p className="text-sm text-gray-400">Intenta ampliando los filtros de fecha o ubicación.</p>
          </div>
        ) : (
          <div className="relative w-full px-10 sm:px-12 md:px-14">
            <Carousel 
              opts={{ 
                align: "start",
                loop: false 
              }} 
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6 py-4">
                {actividades.map((act) => (
                  <CarouselItem 
                    key={act.id} 
                    className="pl-4 sm:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex"
                  >
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col w-full h-full">
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-[#00689D]/10 text-[#00689D] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                            {act.municipios?.nombre || 'General'}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{act.nombre}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{act.descripcion}</p>
                        
                        {act.listaOds && act.listaOds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {act.listaOds.map((ods: any) => (
                              <div 
                                key={ods.numero}
                                title={`${ods.numero}. ${ods.nombre} ${ods.es_principal ? '(Principal)' : ''}`}
                                className={`flex h-8 w-8 items-center justify-center rounded-full overflow-hidden shadow-sm bg-white shrink-0
                                  ${ods.es_principal ? 'border-2' : 'border border-gray-200'}`}
                                style={ods.es_principal ? { borderColor: odsColors[ods.numero] } : {}}
                              >
                                {ods.imagen ? (
                                  <img src={ods.imagen} alt={`ODS ${ods.numero}`} className={`w-full h-full object-contain ${ods.es_principal ? 'p-[1px]' : ''}`} />
                                ) : (
                                  <span className="text-[10px] font-bold" style={{ color: odsColors[ods.numero] }}>{ods.numero}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2 mt-auto">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {format(new Date(act.fecha_evento.split('T')[0] + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {act.hora_inicio?.slice(0,5)} - {act.hora_fin?.slice(0,5)}
                          </div>
                          <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <span className="truncate">{act.lugar}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border-t border-gray-100 p-4 text-xs font-bold text-gray-500 text-center">
                        Organizado por: {act.usuarios?.nombre} 
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-10 md:-left-12 disabled:hidden border-[#00689D] text-[#00689D] hover:bg-[#00689D] hover:text-white" />
              <CarouselNext className="absolute -right-10 md:-right-12 disabled:hidden border-[#00689D] text-[#00689D] hover:bg-[#00689D] hover:text-white" />
            </Carousel>
          </div>
        )}
      </div>

    </div>
  );
}