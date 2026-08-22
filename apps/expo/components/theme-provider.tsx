import { createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme } from "tamagui";

export const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (theme: ThemeType | "auto") => void;
  autoTheme: boolean;
}>({
  theme: "light",
  setTheme: () => {
    console.warn("Missing ThemeProvider");
  },
  autoTheme: false,
});

export type ThemeType = "light" | "dark";

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme: ThemeType = "light";
  const setTheme = () => {
    // The current design system is light-only, so stale device preferences
    // must never switch screens back to the legacy dark palette.
    void AsyncStorage.setItem("theme", "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, autoTheme: false }}>
      <Theme name="light">{children}</Theme>
    </ThemeContext.Provider>
  );
};
