# Scoreboard Pacífico (Wails) — Documentación Técnica

Información técnica del proyecto: arquitectura, stack, desarrollo, build y empaquetado.
Para el uso de la aplicación, ver [README.md](./README.md).

Este proyecto es una **reescritura del scoreboard original con Electron+React** (`hockey-2`) sobre **Wails v2 + Go**, manteniendo la misma funcionalidad y UX.

## 🧱 Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Shell de escritorio | [Wails](https://wails.io) v2 | 2.16.0 |
| Backend | Go | 1.26 (mín. 1.22) |
| UI | React + ReactDOM | 19.1 |
| Bundler | Vite | 7.x |
| Routing | react-router-dom (HashRouter) | 7.8.0 |
| CLI | wails | v2.16.0 |

- **Lenguajes:** Go (shell) + JavaScript/JSX (UI). Sin TypeScript.
- **Backend:** ninguno operativo — la app es 100% cliente. El struct `App` de Go existe solo como ancla de Wails (startup/context), sin métodos expuestos ni API.
- **Estilos:** CSS plano (`frontend/src/styles.css`, propiedades CSS personalizadas + `clamp()` responsive), portado 1:1 del original. Incluye escalado proporcional para TV/4K (ver [Escalado para TV](#-escalado-para-tv)).

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│  Binario Go (wails.Run)                                 │
│  main.go — ventana 1200×800, título "Scoreboard Pacífico"│
│  app.go  — struct App (startup, sin métodos enlazados)   │
│                                                          │
│  //go:embed all:frontend/dist  ◄── frontend compilado    │
│         │                                                │
│         ▼  assetserver (HTTP interno)                    │
│  ┌──────────────────────────────────────────────┐        │
│  │  Webview (WKWebView / WebView2 / WebKit)     │        │
│  │  HashRouter:                                 │        │
│  │    #/        → ConfigPage                    │        │
│  │    #/display → ScoreboardPage                │        │
│  │  Estado: React Context + localStorage        │        │
│  │  Audio: HTML5 Audio (buzzer .wav)            │        │
│  └──────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

- **Dev (`wails dev`):** Vite levanta el frontend con hot-reload (puerto 34115 por defecto) y Wails lo sirve en la ventana; `wails dev` regenera los bindings en `frontend/wailsjs/`.
- **Prod (`wails build`):** `vite build` → `frontend/dist/` → embebido en el binario con `go:embed`. Cero dependencias en runtime.
- **Persistencia:** clave `hockeyScoreboardConfig` en `localStorage` del webview (mismo esquema que el proyecto Electron). El estado del partido es `useState` efímero.
- **Audio:** `frontend/public/sounds/mixkit-bell-ring-buzzer-2962.wav` con loader multi-ruta (`BASE_URL`, `/sounds/`, `./sounds/`, URL resuelta).
- **Logos:** PNGs en `frontend/public/logo/`; la lista consumida por la UI es `frontend/src/logo-list.json`.

## 📁 Estructura del proyecto

```
hockey-2/
├── main.go                        # Opciones de la app (tamaño, embed de assets)
├── app.go                         # Struct App + startup
├── go.mod / go.sum
├── wails.json                     # Config del CLI Wails (scripts de frontend)
├── build/                         # Recursos de empaquetado + binarios generados
│   ├── appicon.png
│   ├── darwin/Info.plist          # Bundle de macOS
│   └── windows/                   # icon.ico (logo del proyecto), info.json, plantilla NSIS sin usar
├── frontend/
│   ├── index.html                 # Shell HTML
│   ├── package.json               # React, react-router-dom, Vite
│   ├── vite.config.js
│   ├── public/
│   │   ├── logo/*.png             # Logos de equipos (camuvi, huachipato, nuevo-pacifico, ohiggins)
│   │   └── sounds/*.wav           # Buzzer
│   ├── wailsjs/                   # Bindings Go↔JS (generados por wails dev/build)
│   └── src/
│       ├── main.jsx               # Raíz ReactDOM + ConfigProvider
│       ├── App.jsx                # Rutas HashRouter
│       ├── pages/ConfigPage.jsx   # Pantalla de configuración (#/)
│       ├── pages/ScoreboardPage.jsx # Marcador (#/display)
│       ├── components/Team.jsx    # Panel de equipo (goles, faltas, t. muerto)
│       ├── components/Timer.jsx   # Reloj central
│       ├── context/ConfigContext.jsx # Estado + localStorage
│       ├── logo-list.json         # Lista de logos
│       └── styles.css             # Estilos principales + responsive
├── README.md
└── README.TECHNICAL.md
```

## 🔧 Desarrollo

Requisitos: **Go 1.22+**, **Node.js 18+**, **Wails CLI v2**.

```bash
# Instalar Wails CLI (una vez)
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Clonar e instalar dependencias del frontend
git clone https://github.com/mickyys/hockey-2.git
cd hockey-2
cd frontend && npm install && cd ..

# Desarrollo con hot-reload (frontend + Go)
wails dev

# Diagnóstico del entorno
wails doctor
```

No se necesitan variables de entorno ni servicios externos.

## 📜 Comandos

| Comando | Descripción |
|---------|-------------|
| `wails dev` | Desarrollo: Vite con hot-reload + ventana Wails, regenera bindings |
| `wails build` | Build de producción (embed de `frontend/dist` + binario firmado en macOS) |
| `wails build -platform windows/amd64` | Cross-compile a Windows → `build/bin/tablero-hockey.exe` (portátil, sin instalador; requiere `CGO_ENABLED=0` desde macOS/Linux) |
| `wails build -clean` | Build limpio |
| `wails doctor` | Diagnóstico del entorno |
| `cd frontend && npm run dev` | Solo Vite (útil para iterar UI sin Go) |
| `cd frontend && npm run build` | Solo build del frontend a `frontend/dist/` |

## 🛣️ Rutas

Routing con **HashRouter** (rutas tipo `#/display`), definidas en `frontend/src/App.jsx` — ideal para Wails porque las rutas hash nunca llegan al asset server:

| Ruta | Página | Descripción |
|------|--------|-------------|
| `#/` | `ConfigPage` | Formulario de configuración; navega a `#/display` al guardar |
| `#/display` | `ScoreboardPage` | Marcador; redirige a `#/` si no hay configuración |

## 📺 Escalado para TV

La UI escala proporcionalmente en televisores 32"–65" (1080p y 4K):

- **Fuente raíz proporcional** (`styles.css`): sobre 1920px de ancho, `html { font-size: max(16px, min(100vw / 120, 100vh / 67.5)) }` → 16px @1920×1080, 32px @3840×2160. Limitado por altura para no desbordar en 16:10/ultrawide.
- Todo lo expresado en **`rem`** (marcador, controles, configuración) escala con ese valor base; los `clamp()` con caps en `rem` crecen en consecuencia.
- Los caps antiguos en `px` (cabeceras de equipo, faltas, controles flotantes, color pickers) se convirtieron a `rem`.
- Los valores en `vw`/`vh` (timer principal, columnas, colores) ya escalaban por sí solos.
- `PERIODO` se estilizó con `rem`/`clamp()` (antes sin estilo base era ilegible a distancia).

Verificado con Playwright a 1920×1080 y 3840×2160: composición proporcional, sin desbordes.

## ⚙️ Esquema de configuración

Persistido en `localStorage` (`hockeyScoreboardConfig`). Campos principales (definidos en `DEFAULT_CONFIG`, `frontend/src/pages/ConfigPage.jsx`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `homeTeam` / `awayTeam` | string | Nombres de equipos |
| `homeColor` / `awayColor` | string (hex) | Colores de equipo |
| `homeLogo` / `awayLogo` | string | Ruta del logo o vacío ("Sin logo") |
| `periodMinutes` / `periodSeconds` | number | Duración del período (mín. 1s) |
| `periodDurationSeconds` | number | Duración total en segundos |
| `totalPeriods` | number (1–4) | Cantidad de períodos |
| `halftimeMinutes` / `halftimeSeconds` | number | Duración del entretiempo |
| `halftimeDurationSeconds` | number | Entretiempo en segundos |
| `halftimeAfterPeriod` | number | Tras qué período inicia el entretiempo |
| `showPeriod` | boolean | Mostrar número de período |
| `showTimer` | boolean | Mostrar reloj principal |

`ScoreboardPage.jsx` resuelve claves antiguas vía `getDurationSeconds()` (compatibilidad con configs que usaban `periodDuration`/`halftimeDuration` en minutos).

## 🧪 Testing

- **Estado actual:** aún sin tests portados. El proyecto original (CRA) tenía un único test (`App.test.js`, comprobaba el texto "Configuración del Tablero").
- **Para añadir:** instalar `vitest` + `@testing-library/react` en `frontend/` y añadir un script `"test": "vitest"` al `package.json` de `frontend/`.

## 🚚 Build y empaquetado

- **Salida:** `build/bin/` (macOS: `hockey-wails.app`; Windows: `tablero-hockey.exe` portátil — **sin instalador, sin autostart, sin servicio Windows**).
- **Icono Windows:** `build/windows/icon.ico` = `logo.ico` del proyecto original (incrustado en el .exe).
- **Metadatos del .exe:** bloque `info` de `wails.json` (productName "Scoreboard Pacífico", productVersion 1.0.0, copyright) — visibles en Propiedades → Detalles de Windows.
- **Requisito en destino:** WebView2 Runtime (incluido en Win11 y casi todo Win10; sin instalador, la app no lo instala).
- **Assets:** `//go:embed all:frontend/dist` en `main.go` — el frontend va dentro del binario.
- **Recursos de empaquetado:** `build/appicon.png` (macOS), `build/windows/` (icono + info.json; la plantilla NSIS del template queda sin usar), `build/darwin/Info.plist`.
- Config adicional en `wails.json` (`outputfilename: "tablero-hockey"`, `frontend:install`, `frontend:build`, `info`).

### Compilación por sistema operativo

Requisitos comunes: **Go 1.22+**, **Node 18+** y la **Wails CLI v2** (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`, con `$(go env GOPATH)/bin` en el `PATH`). Dependencias nativas según el SO: `wails doctor` detecta la distribución y muestra el comando exacto (macOS: Xcode Command Line Tools; Windows: WebView2 Runtime; Linux: gcc + libgtk3 + libwebkit).

| SO | Comando | Artefacto | Notas |
|----|---------|-----------|-------|
| **macOS** (arm64/x64) | `wails build` | `build/bin/hockey-wails.app` (binario interno `tablero-hockey`) | Compilar en el host; bundle `.app` + embed de assets |
| **Windows** (nativo) | `wails build` | `build/bin/tablero-hockey.exe` | Portátil, sin instalador; requiere WebView2 Runtime en destino |
| **Windows** (cross desde macOS/Linux) | `CGO_ENABLED=0 wails build -platform windows/amd64` | `build/bin/tablero-hockey.exe` | Cross-compile probado desde macOS; `CGO_ENABLED=0` evita toolchain C |
| **Linux** (AMD64/ARM64) | `wails build` (o `wails build -tags webkit2_41`) | `build/bin/tablero-hockey` | Solo compilación nativa; `libwebkit2gtk-4.1-dev` (Ubuntu 24.04+) necesita `-tags webkit2_41` |

**Matriz origen → destino:**

| Desde \ Hacia | macOS | Windows | Linux |
|---------------|:-----:|:-------:|:-----:|
| macOS | ✅ | ✅ (`CGO_ENABLED=0`) | ❌ |
| Windows | ❌ | ✅ | ❌ |
| Linux | ❌ | ✅ (`CGO_ENABLED=0`) | ✅ |

- ❌ = requiere compilar en el SO destino: macOS exige su toolchain (cgo/ObjC, firmado y bundle); Linux depende de WebKitGTK, sin SDK cross.
- Otras arquitecturas: `-platform windows/arm64`, `linux/arm64` (p. ej. Raspberry Pi); en macOS el host define la arquitectura.
- Verificación rápida: `file build/bin/tablero-hockey.exe` → `PE32+ x86-64` (Windows), `*.app/Contents/MacOS/tablero-hockey` → `Mach-O arm64` (macOS).
- Guía con ejemplos paso a paso en [README.md § Compilar](./README.md#-compilar). Plataformas soportadas oficiales: [wails.io/docs/gettingstarted/installation](https://wails.io/docs/gettingstarted/installation).

## 🔄 CI/CD

**Sin CI — decisión consciente (build local).** Si se quiere añadir después: workflow de GitHub Actions que ejecute `CGO_ENABLED=0 wails build -platform windows/amd64` y suba `build/bin/tablero-hockey.exe` a Releases por tag (el firmado con `signtool` requeriría secrets).

## 🔐 Notas de seguridad

- A diferencia de la versión Electron, **no hay `nodeIntegration`/`contextIsolation`** que configurar: el frontend corre en un webview aislado sin acceso a Node/Go salvo los bindings explícitos de Wails.
- El struct `App` no expone métodos, por lo que el frontend **no puede invocar código Go** (solo usa la runtime de Wails: eventos, etc.).
- `localStorage` vive en el perfil del webview de la app.

## 🧹 Diferencias y loose ends respecto al proyecto original

- **Service worker (`sw.js`)** y **`scripts/prepare-offline.js`**: no portados (no se usaban en el original).
- **Generación de lista de logos** (`generate-logo-list.js`): no portada; se usa directamente `frontend/src/logo-list.json` (que era el que la UI importaba de todos modos).
- **Fuente `'Digital 7'`**: sigue sin empaquetarse — cae a la fuente del sistema (sans-serif).
- **Cadena de scripts CRA** (prestart/prebuild/copy-electron): eliminada; Vite + `wails build` la reemplazan.
- **`PUBLIC_URL`** de CRA → sustituido por `import.meta.env.BASE_URL` de Vite en el loader del buzzer.
- **CI/CD y releases**: pendientes de portar (ver arriba).
- **Tests**: pendientes de portar.

## 📝 Licencia

Proyecto privado — © 2024 Hector Martinez
