export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">⚙️ Configuración</h1>
          <p className="text-muted-foreground">Configura tu tienda y preferencias</p>
        </div>
      </div>
    </div>
  );
}
