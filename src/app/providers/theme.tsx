import { PropsWithChildren, useEffect } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    document.documentElement.classList.add("bg-gray-50");
  }, []);
  return children as any;
}
