import { useAuth } from "@/app/providers/auth";
import { Button } from "@/shared/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="h-14 bg-white border-b shadow-sm flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold">React FSD Base</h1>
      <div className="flex items-center gap-3">
        {user && <span className="text-sm text-gray-600">{user.email}</span>}
        {user && <Button onClick={logout}>Salir</Button>}
      </div>
    </nav>
  );
}
