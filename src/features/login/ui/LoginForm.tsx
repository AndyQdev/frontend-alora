import { FormEvent, useState } from "react";
import { useAuth } from "@/app/providers/auth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/caja");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 w-80">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <Input 
        placeholder="Email" 
        type="email"
        value={email} 
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input 
        placeholder="Contraseña" 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
