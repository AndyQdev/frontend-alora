import RegisterForm from "@/features/register/ui/RegisterForm";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <h2 className="text-2xl font-bold">Registro</h2>
      <RegisterForm />
      <Link to="/login" className="text-blue-600">Ya tengo cuenta</Link>
    </div>
  );
}
