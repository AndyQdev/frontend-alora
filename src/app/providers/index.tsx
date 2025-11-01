import { PropsWithChildren } from "react";
import { QueryProvider } from "./query";
import { AuthProvider } from "./auth";
import { ThemeProvider } from "./theme";

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
