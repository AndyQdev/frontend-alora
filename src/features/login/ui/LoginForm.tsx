import { FormEvent, useState } from "react";
import { useAuth } from "@/app/providers/auth";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 w-80">
      <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <Button type="submit" className="w-full">Iniciar sesión</Button>
    </form>
  );
}
