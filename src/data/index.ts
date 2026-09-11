import { type ElementType } from "react";
import { Leaf, HeartHandshake, Lightbulb } from "lucide-react";

export interface ODS {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
}

export interface Evento {
  year: string;
  title: string;
  location: string;
  description: string;
  image: string;
  ods: number[];
}

export interface LineaAccion {
  number: string;
  icon: ElementType;
  title: string;
  description: string;
}

export const ods: ODS[] = [
  { id: 1, nombre: "Fin de la pobreza", color: "#E5243B", descripcion: "Poner fin a la pobreza en todas sus formas..." },
  { id: 2, nombre: "Hambre cero", color: "#DDA63A", descripcion: "Poner fin al hambre, mejorar la nutrición..." },
  { id: 3, nombre: "Salud y bienestar", color: "#4C9F38", descripcion: "Garantizar una vida sana y promover el bienestar..." },
  { id: 4, nombre: "Educación de calidad", color: "#C5192D", descripcion: "Garantizar una educación inclusiva, equitativa..." },
  { id: 5, nombre: "Igualdad de género", color: "#FF3A21", descripcion: "Lograr la igualdad de género y promover el empoderamiento..." },
  { id: 6, nombre: "Agua limpia y saneamiento", color: "#26BDE2", descripcion: "Garantizar la disponibilidad y gestión sostenible..." },
  { id: 7, nombre: "Energía asequible y no contaminante", color: "#FCC30B", descripcion: "Garantizar el acceso a una energía asequible..." },
  { id: 8, nombre: "Trabajo decente y crecimiento económico", color: "#A21942", descripcion: "Promover el crecimiento económico sostenible..." },
  { id: 9, nombre: "Industria, innovación e infraestructura", color: "#FD6925", descripcion: "Construir infraestructuras resilientes..." },
  { id: 10, nombre: "Reducción de las desigualdades", color: "#DD1367", descripcion: "Reducir las desigualdades dentro de los países..." },
  { id: 11, nombre: "Ciudades y comunidades sostenibles", color: "#FD9D24", descripcion: "Lograr ciudades y asentamientos humanos inclusivos..." },
  { id: 12, nombre: "Producción y consumo responsables", color: "#BF8B2E", descripcion: "Garantizar modalidades de consumo y producción sostenibles..." },
  { id: 13, nombre: "Acción por el clima", color: "#3F7E44", descripcion: "Adoptar medidas urgentes para combatir el cambio climático..." },
  { id: 14, nombre: "Vida submarina", color: "#0A97D9", descripcion: "Conservar y utilizar sosteniblemente los océanos..." },
  { id: 15, nombre: "Vida de ecosistemas terrestres", color: "#56C02B", descripcion: "Proteger y restaurar los ecosistemas terrestres..." },
  { id: 16, nombre: "Paz, justicia e instituciones sólidas", color: "#00689D", descripcion: "Promover sociedades pacíficas e inclusivas..." },
  { id: 17, nombre: "Alianzas para lograr los objetivos", color: "#19486A", descripcion: "Fortalecer las alianzas para el desarrollo sostenible..." },
];

export const eventos: Evento[] = [
  // Mantuve tus eventos aquí para cuando los necesites renderizar
  { year: "2024", title: "Juventudes participando por el cambio", location: "Sinaloa, México", description: "Encuentros y actividades...", image: "https://images...", ods: [4, 10, 17] },
  // ... (agrega el resto de tus eventos aquí)
];

export const lineasAccion: LineaAccion[] = [
  { number: "01", icon: Leaf, title: "Medio ambiente", description: "Impulsamos acciones de educación ambiental..." },
  { number: "02", icon: HeartHandshake, title: "Inclusión y comunidad", description: "Creamos espacios donde distintas voces puedan participar..." },
  { number: "03", icon: Lightbulb, title: "Juventud y participación", description: "Fortalecemos las capacidades de las juventudes..." },
];