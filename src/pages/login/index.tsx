import LoginForm from "@/features/login/ui/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold">Iniciar sesión</h2>
      <LoginForm />
      <Link to="/register" className="text-blue-600">Crear cuenta</Link>
      <p className="text-xs text-gray-500">Demo: tras iniciar sesión te llevará al layout protegido.</p>
    </div>
  );
}
