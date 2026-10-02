# Scoreboard Pacífico 🏒 (Wails)

Aplicación de escritorio para **marcadores de hockey sobre patines**, diseñada para proyectar el marcador de un partido en pantalla durante el juego. Construida con [Wails](https://wails.io) (Go) y React.

Misma funcionalidad que la versión Electron del proyecto original, con Go como único toolchain de backend y los assets embebidos en el binario.

> 📖 ¿Buscas información de desarrollo (stack, scripts, arquitectura, build)? Mira **[README.TECHNICAL.md](./README.TECHNICAL.md)**.

## ✨ Características

- **Marcador de 2 equipos** — nombre, logo y color personalizables para local y visitante.
- **Puntuación y faltas** — goles y faltas por equipo con botones de suma y resta.
- **Tiempos muertos** — 60 segundos de cuenta regresiva, uno por equipo por período (estado DISPONIBLE/USADO).
- **Reloj de período** — cuenta regresiva con inicio, pausa y reinicio; se puede ocultar desde la configuración.
- **Períodos y entretiempo** — de 1 a 4 períodos de duración configurable, con entretiempo automático después del período que indiques.
- **Avance automático de períodos** — al terminar el tiempo, avanza al siguiente; al terminar el último, muestra el estado **FINAL**.
- **Buzzer de audio** — sonido de campana al finalizar período, entretiempo o tiempo muerto.
- **Atajos de teclado** — controla el partido completo sin usar el mouse (ver abajo).
- **Diseño responsive** — se adapta a pantallas desde 480px hasta 1920px+, con escalado proporcional para televisores 32"–65" en 1080p y 4K.
- **Configuración persistente** — los datos se guardan en el almacenamiento local del webview y se recuperan al abrir de nuevo.

## 🎮 Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `Espacio` | Iniciar / pausar el reloj |
| `Enter` | Sonar el buzzer |
| `1` / `2` | Goles del equipo local +1 / −1 |
| `9` / `0` | Goles del equipo visitante +1 / −1 |
| `Q` / `W` | Faltas del equipo local +1 / −1 |
| `O` / `P` | Faltas del equipo visitante +1 / −1 |
| `H` | Tiempo muerto del equipo local |
| `A` | Tiempo muerto del equipo visitante |

> Los atajos se desactivan mientras escribes en un campo de texto.

## 🚀 Uso rápido

1. **Configuración** — Al abrir la app aparece la pantalla *Configuración del Tablero*: define nombres, logos y colores de los equipos, duración del período, cantidad de períodos y entretiempo.
2. **Guardar** — Pulsa **"Guardar y Ver Tablero"** para ir a la pantalla del marcador.
3. **Jugar** — Usa los botones o el teclado para controlar goles, faltas, reloj y tiempos muertos. El enlace flotante **"Configuración"** (abajo a la derecha) te devuelve a la pantalla de ajustes en cualquier momento.

### Valores predeterminados

| Ajuste | Valor por defecto |
|--------|-------------------|
| Equipo local | `LOCAL` — color `#1a3a8f` |
| Equipo visitante | `VISITANTE` — color `#8f1a1a` |
| Períodos | 2 × 20 minutos |
| Entretiempo | 5 minutos, después del período 1 |

Puedes restaurar estos valores con el botón **"Restaurar valores sugeridos"**.

## ⚠️ Nota sobre el guardado

- **Se conserva** (en `localStorage`): la configuración del partido (equipos, colores, duraciones, opciones de visualización).
- **Es temporal**: el marcador en curso (goles, faltas, período, reloj). Si recargas o cierras la app durante el partido, esos datos se pierden.

## 📋 Requisitos

Para **usar** la app: en Windows solo el binario `tablero-hockey.exe` (portátil) + WebView2 Runtime (ya incluido en Windows 11 y la mayoría de Win10).

Para **compilar** desde el código:

- [Go](https://go.dev/dl/) 1.22+ (probado con 1.26)
- Node.js 18+ (recomendado 20)
- [Wails CLI v2](https://wails.io/docs/gettingstarted/installation): `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- macOS (arm64/x64), Windows 10+ o Linux

## 🔨 Compilar

### Requisitos de compilación

- Ver [Requisitos](#-requisitos) (Go 1.22+, Node 18+, Wails CLI v2).
- Dependencias nativas del sistema operativo (ver cada SO abajo).
- Si algo falla, ejecuta **`wails doctor`**: detecta tu distribución y te indica qué instalar.

### Clonar e instalar (cualquier SO)

```bash
git clone https://github.com/mickyys/hockey-2.git
cd hockey-2
cd frontend && npm install && cd ..   # dependencias del frontend
```

### Desarrollo (cualquier SO)

```bash
wails dev    # hot-reload: Vite + ventana Wails
```

### macOS (Apple Silicon o Intel)

```bash
wails build                    # → build/bin/hockey-wails.app
open build/bin/hockey-wails.app
```

Único requisito extra: Xcode Command Line Tools (`xcode-select --install`).

### Windows

**Nativo (Windows 10/11):**

```powershell
wails build                    # → build\bin\tablero-hockey.exe
```

**Cross-compile desde macOS o Linux:**

```bash
CGO_ENABLED=0 wails build -platform windows/amd64   # → build/bin/tablero-hockey.exe
```

`tablero-hockey.exe` es **portátil**: se copia en cualquier Windows 10+ y se ejecuta directamente, sin instalador. La app necesita el **WebView2 Runtime** (incluido en Windows 11 y en la mayoría de Windows 10; si falta, se instala desde [microsoft.com](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) o comprueba con `wails doctor`).

### Linux (AMD64/ARM64)

Se compila **en Linux** (el binario depende de WebKitGTK, así que no admite cross-compile desde macOS/Windows):

```bash
# gcc + libgtk3 + libwebkit: usa wails doctor para ver el comando exacto de tu distro.
# Ejemplos frecuentes:
sudo apt install build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.0-dev   # Debian/Ubuntu ≤ 23.04

wails build                    # → build/bin/tablero-hockey
```

> **Ubuntu 24.04+ / distros sin `libwebkit2gtk-4.0-dev`:** instala `libwebkit2gtk-4.1-dev` y añade la etiqueta `-tags webkit2_41`:
> ```bash
> wails build -tags webkit2_41
> ```

### Matriz de compilación (origen → destino)

| Desde \ Hacia | macOS | Windows | Linux |
|---------------|:-----:|:-------:|:-----:|
| **macOS** | ✅ `wails build` | ✅ `CGO_ENABLED=0 wails build -platform windows/amd64` | ❌ |
| **Windows** | ❌ | ✅ `wails build` | ❌ |
| **Linux** | ❌ | ✅ `CGO_ENABLED=0 wails build -platform windows/amd64` | ✅ `wails build` |

- ✅ soportado nativamente o con cross-compile; ❌ requiere compilar en el SO destino (macOS necesita su toolchain/firmado; Linux necesita WebKitGTK).
- Otras arquitecturas: `-platform windows/arm64`, `linux/arm64` (p. ej. Raspberry Pi), `darwin/amd64` — en macOS compila siempre para la arquitectura del host.
- La compilación es **local**: no hay CI (decisión del proyecto). Detalles y artefactos en [README.TECHNICAL.md](./README.TECHNICAL.md#-compilación-por-sistema-operativo).

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Proyecto privado — © 2024 Hector Martinez

---

**Hecho con ❤️ para la comunidad de hockey sobre patines**
