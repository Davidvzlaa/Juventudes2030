export const mockSnapshot = {
  reporte: {
    folio: "REP-2026-0001",
    periodo_inicio: "2026-09-01",
    periodo_fin: "2026-09-30",
    estado: "Borrador"
  },
  embajador: {
    nombre: "Juan",
    apellido: "Pérez",
    correo: "juan@example.com"
  },
  actividades: [
    {
      id: 1,
      nombre: "Taller de Reciclaje",
      fecha_evento: "2026-09-15",
      lugar: "Centro Comunitario",
      municipio: "Los Mochis",
      ods: [{ numero: 13, nombre: "Acción por el clima" }],
      evidencias: [
        // Usamos fotos de prueba públicas para diseñar
        { id: 101, url_archivo: "https://picsum.photos/id/10/400/300" },
        { id: 102, url_archivo: "https://picsum.photos/id/11/400/300" }
      ]
    },
    {
      id: 2,
      nombre: "Limpieza de Parque",
      fecha_evento: "2026-09-20",
      lugar: "Parque Sinaloa",
      municipio: "Los Mochis",
      ods: [{ numero: 15, nombre: "Vida de ecosistemas terrestres" }],
      evidencias: [
        { id: 103, url_archivo: "https://picsum.photos/id/12/400/300" }
      ]
    }
  ]
};