import { FormEvent, useState } from "react";
import { useAuth } from "@/app/providers/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    countryCode: "+591",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/inventory");
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
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
        placeholder="Nombre completo" 
        value={formData.name}
        onChange={handleChange("name")}
        required
      />
      <Input 
        placeholder="Email" 
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        required
      />
      <Input 
        placeholder="Teléfono" 
        type="tel"
        value={formData.phoneNumber}
        onChange={handleChange("phoneNumber")}
        required
      />
      <Input 
        placeholder="Contraseña" 
        type="password" 
        value={formData.password}
        onChange={handleChange("password")}
        required
        minLength={8}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}

