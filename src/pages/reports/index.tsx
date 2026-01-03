export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Ventas del día</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Productos más vendidos</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Stock crítico</p>
        </div>
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">📊 Reportes</h1>
          <p className="text-muted-foreground">Analiza el rendimiento de tu negocio</p>
        </div>
      </div>
    </div>
  );
}
