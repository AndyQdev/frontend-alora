import { PropsWithChildren } from "react";
import { QueryProvider } from "./query";
import { AuthProvider, StoreProvider } from "./auth";
import { ThemeProvider } from "./theme";
import { Toaster } from "@/shared/ui/sonner";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
