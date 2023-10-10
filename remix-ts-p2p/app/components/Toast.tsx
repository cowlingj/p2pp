import { CssVarsProvider, extendTheme, useColorScheme, useTheme } from "@mui/joy";
import { ToastContainer } from "react-toastify";

declare module '@mui/joy/styles' {
  interface CssVarsThemeOptions {
    [key: string]: string
  }
}

export default function Toast() {
  const theme = useTheme();
  const extendedTheme = extendTheme({
    cssVarPrefix: 'toastify',
    'color-light': theme.vars.palette.background.surface,
    'color-dark': theme.vars.palette.background.level2,
    'color-error': theme.palette.danger.plainColor,
    'color-warning': theme.vars.palette.warning.plainColor,
    'color-success': theme.palette.success.plainColor,
    'color-info': theme.palette.primary.plainColor,
    'text-color-light': theme.vars.palette.text.primary,
    'text-color-dark': theme.palette.text.primary,
  });

  const { mode } = useColorScheme();
  return <CssVarsProvider theme={extendedTheme}><ToastContainer theme={mode === 'dark' ? 'dark' : 'light'} /></CssVarsProvider>
}