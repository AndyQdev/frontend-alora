import { createContext, PropsWithChildren, useContext, useState } from "react";

type User = { id: string; email: string } | null;
type AuthCtx = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>(null);

  async function login(email: string, _password: string) {
    // Demo: login fake si email no vacío
    if (email) setUser({ id: "1", email });
  }
  function logout() { setUser(null); }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
