# Guía UI/UX - Learning Models HUB
## Diseño de Interfaz y Experiencia de Usuario

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Diseñador:** Sistema Learning Models

---

## 📋 Tabla de Contenidos

1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Sistema de Diseño](#sistema-de-diseño)
3. [Componentes UI](#componentes-ui)
4. [Flujos de Usuario](#flujos-de-usuario)
5. [Patrones de Interacción](#patrones-de-interacción)
6. [Responsive Design](#responsive-design)
7. [Accesibilidad](#accesibilidad)

---

## 🎨 Filosofía de Diseño

### Concepto Central: "Asistente Inteligente y Calmado"

El sistema no debe ser una carga, sino un asistente que libera al equipo. La interfaz debe sentirse:

#### **1. Limpia y Clara**
- ✅ Evitar el desorden visual
- ✅ Cada elemento tiene un propósito
- ✅ Espaciado generoso entre elementos
- ✅ Jerarquía visual clara

#### **2. Intuitiva**
- ✅ Usuario deduce cómo hacer las cosas sin manual
- ✅ Patrones de diseño familiares (Google-like)
- ✅ Feedback inmediato en cada acción
- ✅ Mensajes de error claros y accionables

#### **3. Eficiente**
- ✅ Minimizar clics para tareas comunes
- ✅ Atajos de teclado donde aplica
- ✅ Autocompletado y sugerencias
- ✅ Acciones rápidas en contexto

---

## 🎨 Sistema de Diseño

### Paleta de Colores

#### **Colores Primarios**
```css
--primary-main: #CDDC39      /* Verde Lima - Acción principal */
--primary-light: #E6EE9C     /* Verde Lima Claro - Hover */
--primary-dark: #AFB42B      /* Verde Lima Oscuro - Pressed */
```

#### **Colores Secundarios**
```css
--secondary-main: #424242    /* Gris Oscuro - Texto principal */
--secondary-light: #6D6D6D   /* Gris Medio - Texto secundario */
--secondary-dark: #1B1B1B    /* Gris Muy Oscuro - Headers */
```

#### **Colores de Estado**
```css
--success: #4CAF50           /* Verde - Éxito */
--warning: #FF9800           /* Naranja - Advertencia */
--error: #F44336             /* Rojo - Error */
--info: #2196F3              /* Azul - Información */
```

#### **Colores de Fondo**
```css
--background-default: #FAFAFA  /* Gris Muy Claro - Fondo general */
--background-paper: #FFFFFF    /* Blanco - Cards y modales */
--background-sidebar: #263238  /* Gris Azulado - Sidebar */
```

### Tipografía

#### **Familia de Fuentes**
```css
font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
```

#### **Escala Tipográfica**
```css
--h1: 2.5rem (40px)    /* Títulos principales */
--h2: 2rem (32px)      /* Títulos de sección */
--h3: 1.75rem (28px)   /* Subtítulos */
--h4: 1.5rem (24px)    /* Headers de cards */
--h5: 1.25rem (20px)   /* Títulos pequeños */
--h6: 1rem (16px)      /* Labels destacados */
--body1: 1rem (16px)   /* Texto principal */
--body2: 0.875rem (14px) /* Texto secundario */
--caption: 0.75rem (12px) /* Texto pequeño */
```

#### **Pesos de Fuente**
```css
--light: 300
--regular: 400
--medium: 500
--bold: 700
```

### Espaciado

Sistema de espaciado basado en múltiplos de 8px:

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
```

### Bordes y Sombras

#### **Border Radius**
```css
--radius-sm: 4px    /* Botones, inputs */
--radius-md: 8px    /* Cards */
--radius-lg: 12px   /* Modales */
--radius-xl: 16px   /* Elementos destacados */
```

#### **Sombras (Elevación)**
```css
--shadow-1: 0 1px 3px rgba(0,0,0,0.12)     /* Hover sutil */
--shadow-2: 0 2px 6px rgba(0,0,0,0.16)     /* Cards */
--shadow-3: 0 4px 12px rgba(0,0,0,0.20)    /* Modales */
--shadow-4: 0 8px 24px rgba(0,0,0,0.24)    /* Dropdowns */
```

---

## 🧩 Componentes UI

### 1. Layout Principal

#### **Estructura**
```
┌─────────────────────────────────────────────┐
│ Header (64px height)                        │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main Content Area               │
│ (240px)  │                                  │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

#### **Sidebar (Navegación)**
- **Ancho:** 240px (expandido), 64px (colapsado)
- **Color de fondo:** `#263238` (Gris azulado oscuro)
- **Items:**
  - Ícono + Texto (expandido)
  - Solo ícono (colapsado)
  - Hover: Fondo `rgba(255,255,255,0.08)`
  - Activo: Borde izquierdo verde lima + fondo `rgba(205,220,57,0.12)`

#### **Header**
- **Altura:** 64px
- **Contenido:**
  - Logo (izquierda)
  - Breadcrumbs (centro)
  - Notificaciones + Avatar (derecha)
- **Sombra:** `shadow-1`

#### **Main Content**
- **Padding:** 24px
- **Max-width:** 1440px (centrado)
- **Background:** `#FAFAFA`

---

### 2. Cards

#### **Card Estándar**
```css
background: white
border-radius: 8px
padding: 24px
box-shadow: 0 2px 6px rgba(0,0,0,0.16)
```

**Estructura:**
```
┌─────────────────────────────────┐
│ Card Header                     │
│ ─────────────────────────────── │
│                                 │
│ Card Content                    │
│                                 │
│ ─────────────────────────────── │
│ Card Actions (opcional)         │
└─────────────────────────────────┘
```

#### **Card de KPI (Dashboard)**
```css
min-height: 140px
display: flex
flex-direction: column
justify-content: space-between
```

**Contenido:**
- Título (caption, gris medio)
- Valor principal (h3, bold, negro)
- Tendencia (body2, verde/rojo con ícono ▲/▼)

---

### 3. Botones

#### **Botón Primario**
```css
background: #CDDC39
color: #000000
padding: 10px 24px
border-radius: 4px
font-weight: 500
text-transform: uppercase
letter-spacing: 0.5px

hover: background: #E6EE9C
active: background: #AFB42B
```

#### **Botón Secundario**
```css
background: transparent
border: 1px solid #CDDC39
color: #CDDC39

hover: background: rgba(205,220,57,0.08)
```

#### **Botón de Texto**
```css
background: transparent
color: #CDDC39
padding: 8px 16px

hover: background: rgba(205,220,57,0.08)
```

#### **Botón de Ícono**
```css
width: 40px
height: 40px
border-radius: 50%

hover: background: rgba(0,0,0,0.04)
```

---

### 4. Formularios

#### **Input de Texto**
```css
height: 56px
border: 1px solid rgba(0,0,0,0.23)
border-radius: 4px
padding: 16px 14px

focus: border-color: #CDDC39
       border-width: 2px
       
error: border-color: #F44336
```

**Label:**
- Posición: Arriba del input
- Color: `rgba(0,0,0,0.6)`
- Tamaño: 12px
- Transición suave al focus

#### **Select / Dropdown**
- Mismo estilo que input de texto
- Ícono de flecha a la derecha
- Menú desplegable con `shadow-4`

#### **Checkbox / Radio**
```css
size: 20px
color: #CDDC39 (checked)
border: 2px solid rgba(0,0,0,0.54) (unchecked)
```

#### **Switch**
```css
width: 52px
height: 32px
track-color: rgba(0,0,0,0.38) (off)
track-color: rgba(205,220,57,0.5) (on)
thumb-color: #CDDC39 (on)
```

---

### 5. Tablas

#### **Estructura**
```
┌─────────────────────────────────────────┐
│ Table Toolbar                           │
│ (Búsqueda, Filtros, Acciones)          │
├─────────────────────────────────────────┤
│ Header Row (sticky)                     │
├─────────────────────────────────────────┤
│ Data Row 1                              │
│ Data Row 2                              │
│ ...                                     │
├─────────────────────────────────────────┤
│ Pagination                              │
└─────────────────────────────────────────┘
```

#### **Estilos**
```css
Header:
  background: #F5F5F5
  font-weight: 500
  padding: 16px
  border-bottom: 2px solid #E0E0E0

Row:
  padding: 16px
  border-bottom: 1px solid #E0E0E0
  
  hover: background: rgba(205,220,57,0.04)
  
Row Alternada:
  background: #FAFAFA
```

#### **Acciones en Fila**
- Íconos de acción a la derecha
- Aparecen al hover
- Tooltip en hover

---

### 6. Modales / Dialogs

#### **Estructura**
```css
max-width: 600px
border-radius: 12px
box-shadow: 0 8px 24px rgba(0,0,0,0.24)
```

**Layout:**
```
┌─────────────────────────────────┐
│ Dialog Title          [X]       │
├─────────────────────────────────┤
│                                 │
│ Dialog Content                  │
│                                 │
├─────────────────────────────────┤
│         [Cancelar] [Confirmar]  │
└─────────────────────────────────┘
```

#### **Backdrop**
```css
background: rgba(0,0,0,0.5)
backdrop-filter: blur(2px)
```

---

### 7. Notificaciones / Snackbar

#### **Posición**
- Bottom-center (por defecto)
- Top-right (para notificaciones persistentes)

#### **Estilos por Tipo**
```css
Success:
  background: #4CAF50
  color: white
  icon: ✓

Error:
  background: #F44336
  color: white
  icon: ✕

Warning:
  background: #FF9800
  color: white
  icon: ⚠

Info:
  background: #2196F3
  color: white
  icon: ℹ
```

#### **Duración**
- Success: 3 segundos
- Error: 5 segundos
- Warning: 4 segundos
- Info: 3 segundos

---

## 🔄 Flujos de Usuario

### Flujo 1: Login

```
1. Pantalla de Login
   ↓
2. Ingresa credenciales
   ↓
3. [Validación]
   ├─ ✓ Éxito → Redirección según rol
   └─ ✗ Error → Mensaje de error + retry
   
Redirección por Rol:
- Admin/Director → Dashboard Financiero
- Therapist → Hub de Terapeuta
- Editor → Lista de Pacientes
```

**UX Considerations:**
- ✅ Mostrar/ocultar contraseña
- ✅ Recordar usuario (checkbox)
- ✅ Link a "Olvidé mi contraseña"
- ✅ Botón de Google Sign-In prominente

---

### Flujo 2: Registro de Pago

```
1. Dashboard/Pagos → Click "+ Registrar Pago"
   ↓
2. Modal de Registro se abre
   ↓
3. Seleccionar Paciente (autocomplete)
   ↓
4. Sistema sugiere monto pendiente
   ↓
5. Usuario confirma o edita monto
   ↓
6. Seleccionar método de pago
   ↓
7. [Opcional] Adjuntar boleta desde Drive
   ↓
8. Click "Guardar"
   ↓
9. Confirmación visual (snackbar)
   ↓
10. Tabla se actualiza en tiempo real
```

**UX Considerations:**
- ✅ Autocompletado de paciente con búsqueda fuzzy
- ✅ Monto sugerido automáticamente
- ✅ Integración directa con Google Drive Picker
- ✅ Validación en tiempo real
- ✅ Feedback visual inmediato

---

### Flujo 3: Completar Formulario de Sesión

```
1. Hub de Terapeuta → Ver tarea pendiente
   ↓
2. Click "Ir ahora"
   ↓
3. Formulario se abre en Paso 1
   ↓
4. Completar "Información General"
   ↓
5. Seleccionar objetivos de la sesión
   ↓
6. Secciones relevantes aparecen dinámicamente
   ↓
7. Completar cada sección
   ↓
8. Navegación con Stepper
   ↓
9. Revisión final
   ↓
10. Click "Guardar Sesión"
   ↓
11. Confirmación + Redirección a Hub
```

**UX Considerations:**
- ✅ Stepper muestra progreso
- ✅ Validación por sección
- ✅ Cálculos automáticos (PPM, etc.)
- ✅ Guardado automático de borrador
- ✅ Poder navegar entre pasos libremente

---

### Flujo 4: Consultar Ficha de Paciente

```
1. Lista de Pacientes → Click en paciente
   ↓
2. Ficha del paciente se abre
   ↓
3. Tabs de navegación:
   ├─ Historial Clínico (default)
   ├─ Detalles y Contacto
   ├─ Gestión de Pagos
   └─ Asistente de Reporte (futuro)
   ↓
4. Usuario navega entre tabs
   ↓
5. Puede editar información
   ↓
6. Puede ver sesiones pasadas
   ↓
7. Puede registrar nuevo pago
```

**UX Considerations:**
- ✅ Tabs para organizar información
- ✅ Header siempre visible con nombre del paciente
- ✅ Acciones rápidas en header
- ✅ Historial cronológico de sesiones
- ✅ Gráficos de progreso

---

## 🎯 Patrones de Interacción

### 1. Feedback Inmediato

#### **Loading States**
```
Botón:
  - Click → Spinner + "Guardando..."
  - Éxito → ✓ + "Guardado"
  - Error → ✗ + "Error"

Tabla:
  - Cargando → Skeleton screens
  - Vacía → Empty state con ilustración

Formulario:
  - Validando → Spinner en campo
  - Válido → ✓ verde
  - Inválido → ✗ rojo + mensaje
```

#### **Confirmaciones**
```
Acciones Destructivas:
  - Eliminar → Dialog de confirmación
  - Cancelar → Dialog de confirmación si hay cambios

Acciones Exitosas:
  - Snackbar verde con ✓
  - Auto-dismiss en 3 segundos
```

---

### 2. Navegación

#### **Breadcrumbs**
```
Dashboard > Pacientes > Juan Pérez > Sesión #123
```
- Cada nivel es clickeable
- Último nivel no es link
- Separador: >

#### **Tabs**
- Indicador visual del tab activo (borde inferior verde)
- Transición suave entre tabs
- Contenido se carga lazy

#### **Sidebar**
- Item activo: Borde izquierdo + fondo
- Hover: Fondo sutil
- Collapse/Expand con animación

---

### 3. Búsqueda y Filtros

#### **Búsqueda**
```
Input con ícono de lupa
Placeholder: "Buscar por nombre..."
Búsqueda en tiempo real (debounce 300ms)
Resultados destacan término buscado
```

#### **Filtros**
```
Chips para filtros activos
Click en chip → Remueve filtro
Botón "Limpiar filtros"
Contador de resultados
```

---

### 4. Validaciones

#### **En Tiempo Real**
- Validar mientras el usuario escribe (debounce)
- Mostrar error solo después de blur
- Ícono de estado en el campo

#### **Mensajes de Error**
```
Formato:
  [Ícono ✗] Mensaje claro y accionable
  
Ejemplos:
  ✗ El email no es válido
  ✗ Este campo es requerido
  ✗ La contraseña debe tener al menos 8 caracteres
```

---

## 📱 Responsive Design

### Breakpoints

```css
--xs: 0px      /* Mobile portrait */
--sm: 600px    /* Mobile landscape */
--md: 960px    /* Tablet */
--lg: 1280px   /* Desktop */
--xl: 1920px   /* Large desktop */
```

### Adaptaciones por Dispositivo

#### **Mobile (< 600px)**
- Sidebar se convierte en drawer
- Tabs se convierten en select
- Tablas se convierten en cards
- Formularios en columna única
- Botones full-width

#### **Tablet (600px - 960px)**
- Sidebar colapsado por defecto
- Grids de 2 columnas
- Formularios en 2 columnas
- Tablas con scroll horizontal

#### **Desktop (> 960px)**
- Layout completo
- Sidebar expandido
- Grids de 3-4 columnas
- Tablas completas

---

## ♿ Accesibilidad

### Principios WCAG 2.1 (Nivel AA)

#### **1. Contraste de Color**
```
Texto normal: Mínimo 4.5:1
Texto grande: Mínimo 3:1
Elementos UI: Mínimo 3:1
```

#### **2. Navegación por Teclado**
- ✅ Todos los elementos interactivos accesibles con Tab
- ✅ Focus visible (outline verde lima)
- ✅ Skip links para navegación rápida
- ✅ Atajos de teclado documentados

#### **3. Screen Readers**
- ✅ Labels en todos los inputs
- ✅ ARIA labels donde sea necesario
- ✅ Roles ARIA apropiados
- ✅ Live regions para cambios dinámicos

#### **4. Formularios**
- ✅ Labels asociados con inputs
- ✅ Mensajes de error descriptivos
- ✅ Instrucciones claras
- ✅ Validación accesible

---

## 🎨 Guía de Estilo Visual

### Do's ✅

1. **Usar espaciado consistente** (múltiplos de 8px)
2. **Mantener jerarquía visual clara**
3. **Usar íconos de Material Icons**
4. **Feedback inmediato en cada acción**
5. **Mensajes de error claros y accionables**
6. **Animaciones sutiles y rápidas** (200-300ms)
7. **Colores de estado consistentes**
8. **Tipografía legible** (mínimo 14px)

### Don'ts ❌

1. **No usar más de 3 niveles de jerarquía visual**
2. **No usar animaciones largas** (> 500ms)
3. **No usar colores fuera de la paleta**
4. **No usar más de 2 fuentes diferentes**
5. **No ocultar información crítica**
6. **No usar placeholders como labels**
7. **No usar solo color para transmitir información**
8. **No usar texto menor a 12px**

---

## 📐 Grids y Layouts

### Grid System

```css
Container:
  max-width: 1440px
  padding: 0 24px
  margin: 0 auto

Grid:
  display: grid
  gap: 24px
  
  /* Desktop */
  grid-template-columns: repeat(12, 1fr)
  
  /* Tablet */
  @media (max-width: 960px)
    grid-template-columns: repeat(8, 1fr)
  
  /* Mobile */
  @media (max-width: 600px)
    grid-template-columns: repeat(4, 1fr)
```

### Spacing Scale

```
Componentes pequeños: 8px
Componentes medianos: 16px
Secciones: 24px
Páginas: 32px
```

---

## 🎬 Animaciones y Transiciones

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0.0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
```

### Duraciones

```css
--duration-shortest: 150ms  /* Hover, focus */
--duration-shorter: 200ms   /* Fade, slide */
--duration-short: 250ms     /* Expand, collapse */
--duration-standard: 300ms  /* Modal, drawer */
--duration-complex: 375ms   /* Multi-step */
```

### Ejemplos

```css
/* Hover en botón */
transition: background-color 200ms ease-out

/* Modal aparece */
transition: opacity 300ms ease-out,
            transform 300ms ease-out

/* Drawer se abre */
transition: transform 300ms ease-in-out
```

---

## 📝 Conclusión

Esta guía UI/UX establece los fundamentos visuales y de interacción para Learning Models HUB. Al seguir estos principios y patrones, garantizamos:

✅ **Consistencia** en toda la aplicación  
✅ **Usabilidad** intuitiva para todos los usuarios  
✅ **Accesibilidad** para personas con discapacidades  
✅ **Escalabilidad** para futuras funcionalidades  
✅ **Profesionalismo** en la presentación  

---

**Documento creado:** Octubre 2025  
**Última actualización:** Octubre 2025  
**Versión:** 1.0
