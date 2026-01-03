import { PropsWithChildren } from "react";
import { QueryProvider } from "./query";
import { AuthProvider, StoreProvider } from "./auth";
import { ThemeProvider } from "./theme";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
