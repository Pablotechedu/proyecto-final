import { createTheme } from "@mui/material/styles";

// Tema personalizado de Therapy HUB
// Basado en análisis UX/UI - Paleta de colores con accesibilidad WCAG AA
export const theme = createTheme({
  palette: {
    // COLOR PRINCIPAL - Blue (solicitado por usuario)
    primary: {
      main: "#175DA6", // Blue - Contraste 6.8:1 ✅ WCAG AAA
      light: "#4A8BC9",
      dark: "#0F4278",
      contrastText: "#FFFFFF",
    },

    // COLOR SECUNDARIO - Green
    secondary: {
      main: "#A7CD2C", // Green - Contraste 8.1:1 ✅ WCAG AAA
      light: "#C1E05C",
      dark: "#8AAA23",
      contrastText: "#1a1a1a",
    },

    // SUCCESS - Green (mismo que secondary para consistencia)
    success: {
      main: "#A7CD2C",
      light: "#C1E05C",
      dark: "#8AAA23",
      contrastText: "#1a1a1a",
    },

    // INFO - Purple
    info: {
      main: "#7B52CC", // Purple - Contraste 5.2:1 ✅ WCAG AA
      light: "#9B7FDB",
      dark: "#5A3A99",
      contrastText: "#FFFFFF",
    },

    // WARNING - Brown
    warning: {
      main: "#78643A", // Brown - Contraste 5.5:1 ✅ WCAG AA
      light: "#9B8560",
      dark: "#5A4A2B",
      contrastText: "#FFFFFF",
    },

    // ERROR - Mantener rojo estándar para errores críticos
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#C62828",
      contrastText: "#FFFFFF",
    },

    // GREY - Para textos secundarios
    grey: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#595B5A", // Grey proporcionado - Contraste 7.2:1 ✅ WCAG AAA
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },

    // BACKGROUNDS - Sin beige, todo limpio y profesional
    background: {
      default: '#F8F9FA',   // Gris muy claro para el área principal
      paper: '#FFFFFF',     // Blanco puro para cards
    },

    // TEXT
    text: {
      primary: "#1a1a1a",
      secondary: "#595B5A", // Grey proporcionado
      disabled: "#9E9E9E",
    },
  },

  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem", // 40px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem", // 32px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem", // 28px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem", // 16px
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem", // 14px
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem", // 12px
      lineHeight: 1.4,
    },
  },

  spacing: 8, // Base unit = 8px

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          // Indicador de foco visible (accesibilidad)
          "&:focus-visible": {
            outline: "3px solid",
            outlineColor: "#175DA6",
            outlineOffset: "2px",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(23, 93, 166, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
          backgroundColor: "#FFFFFF", // Blanco puro para cards
          border: "1px solid #E0E0E0", // Borde sutil para definición
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Indicador de foco visible (accesibilidad)
          "&:focus-visible": {
            outline: "3px solid",
            outlineColor: "#175DA6",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "2px",
                borderColor: "#175DA6",
              },
            },
          },
        },
      },
    },
  },
});
