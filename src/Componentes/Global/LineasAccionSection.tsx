import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Check, 
  ChevronsUpDown, 
  X, 
  Filter 
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const MUNICIPIOS_SINALOA = [
  "Ahome", "Angostura", "Badiraguato", "Concordia", "Cosalá",
  "Culiacán", "Choix", "Elota", "Escuinapa", "El Fuerte",
  "Guasave", "Mazatlán", "Mocorito", "Navolato", "Rosario",
  "Salvador Alvarado", "San Ignacio", "Sinaloa"
];

export default function FiltroEventos() {
  const [openMunicipios, setOpenMunicipios] = React.useState(false);
  const [municipiosSel, setMunicipiosSel] = React.useState<string[]>([]);
  
  const [tipoFecha, setTipoFecha] = React.useState<string>("todas");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const toggleMunicipio = (municipio: string) => {
    setMunicipiosSel((prev) =>
      prev.includes(municipio)
        ? prev.filter((m) => m !== municipio)
        : [...prev, municipio]
    );
  };

  const limpiarFiltros = () => {
    setMunicipiosSel([]);
    setTipoFecha("todas");
    setDateRange(undefined);
  };

  const hayFiltrosActivos = municipiosSel.length > 0 || tipoFecha !== "todas" || dateRange;

  return (
    <div className="mx-auto w-full max-w-5xl rounded-xl border bg-white p-5 shadow-sm">
      
      {/* HEADER DEL FILTRO */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[#061A2D]">
          <Filter size={20} className="text-[#00689D]" />
          Filtrar Actividades
        </h3>

        {hayFiltrosActivos && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={limpiarFiltros}
            className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            <X className="mr-2 h-4 w-4" /> Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        
        {/* 1. COMBOBOX DE MUNICIPIOS */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Ubicación (Municipio)
          </label>
          <Popover open={openMunicipios} onOpenChange={setOpenMunicipios}>
            <PopoverTrigger
              role="combobox"
              aria-expanded={openMunicipios}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-between bg-gray-50 hover:bg-gray-100"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate font-normal">
                  {municipiosSel.length === 0
                    ? "Todos los municipios"
                    : `${municipiosSel.length} seleccionados`}
                </span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            
            {/* AQUÍ ESTÁ EL FIX DEL FONDO Y Z-INDEX */}
            <PopoverContent className="w-[300px] p-0 bg-white z-50 shadow-md border border-gray-200" align="start">
              <Command>
                <CommandInput placeholder="Buscar municipio..." />
                <CommandList>
                  <CommandEmpty>No se encontró el municipio.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setMunicipiosSel([]);
                        setOpenMunicipios(false);
                      }}
                      className="font-medium text-[#00689D]"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          municipiosSel.length === 0 ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todos los municipios
                    </CommandItem>
                    
                    {MUNICIPIOS_SINALOA.map((mun) => (
                      <CommandItem
                        key={mun}
                        onSelect={() => toggleMunicipio(mun)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            municipiosSel.includes(mun) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {mun}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* 2. SELECT DE TIPO DE FECHA */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cuándo
          </label>
          <Select
            value={tipoFecha}
            onValueChange={(val) => {
              if (val !== null) setTipoFecha(val)
            }}
          >
            <SelectTrigger className="bg-gray-50 hover:bg-gray-100">
              <span className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Cualquier fecha" />
              </span>
            </SelectTrigger>
            {/* AQUÍ ESTÁ EL FIX DEL FONDO Y Z-INDEX */}
            <SelectContent className="bg-white z-50 shadow-md border border-gray-200">
              <SelectItem value="todas">Cualquier fecha</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="rango">Período específico...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3. BOTÓN BUSCAR */}
        <div className="flex items-end">
          <Button className="w-full bg-[#00689D] font-bold text-white hover:bg-[#061A2D] md:w-auto">
            Buscar Eventos
          </Button>
        </div>
      </div>

      {/* 4. RANGO DE FECHAS (Solo si es "rango") */}
      {tipoFecha === "rango" && (
        <div className="mt-4 flex animate-in slide-in-from-top-2 flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Selecciona el período
          </label>
          <Popover>
            <PopoverTrigger
              id="date"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start text-left font-normal md:w-[300px]",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "LLL dd, y", { locale: es })} - ${format(dateRange.to, "LLL dd, y", { locale: es })}`
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  "Elige un rango de fechas"
                )}
              </span>
            </PopoverTrigger>
            
            {/* AQUÍ ESTÁ EL FIX DEL FONDO Y Z-INDEX */}
            <PopoverContent className="w-auto p-0 bg-white z-50 shadow-md border border-gray-200" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: DateRange | undefined) => setDateRange(range)}
                numberOfMonths={2}
                locale={es} // Calendario en español
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* 5. BADGES DE MUNICIPIOS */}
      {municipiosSel.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {municipiosSel.map((mun) => (
            <Badge 
              key={mun} 
              variant="secondary"
              className="flex items-center gap-1 bg-[#E6F0F5] text-[#00689D] hover:bg-[#D0E3EE]"
            >
              {mun}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMunicipio(mun);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}