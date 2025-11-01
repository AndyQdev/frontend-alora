export const formatDate = (d: string | number | Date) =>
  new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
