import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function RegisterForm() {
  return (
    <form className="space-y-3 w-80">
      <Input placeholder="Nombre" />
      <Input placeholder="Email" />
      <Input placeholder="Contraseña" type="password" />
      <Button className="w-full">Crear cuenta</Button>
    </form>
  );
}
