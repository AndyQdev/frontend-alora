export const formatMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(n);
