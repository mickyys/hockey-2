# Scoreboard Pacífico 🏒

Una aplicación de escritorio para marcadores de hockey sobre patines desarrollada con Electron y React.

## 🚀 Características

- ✅ Aplicación de escritorio multiplataforma
- ✅ Interfaz moderna con React 19
- ✅ Generación automática de logos
- ✅ Builds firmados digitalmente para Windows
- ✅ CI/CD automatizado con GitHub Actions
- ✅ Distribución portable y con instalador

## 🛠️ Tecnologías

- **Frontend**: React 19.1.1, React Router DOM 7.8.0
- **Desktop**: Electron 37.2.6
- **Build**: Electron Builder 26.0.12
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## 📋 Requisitos

- Node.js 18+ (recomendado 20)
- npm o yarn
- Windows 10+ (para builds de Windows)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/hockey-2-cloudflare.git
cd hockey-2-cloudflare

# Instalar dependencias
npm install
```

## 💻 Desarrollo

### Modo desarrollo web
```bash
npm start
```

### Modo desarrollo Electron
```bash
npm run electron:dev
```

### Testing
```bash
npm test
```

## 📦 Build y Distribución

### Build local para Windows
```bash
# Build estándar
npm run electron:build:win

# Build offline (sin elevación)
npm run electron:build:offline

# Solo empaquetado (sin publicar)
npm run dist
```

### Build automático con GitHub Actions

#### Por Tag (Automático)
```bash
# Crear y pushear un tag
git tag v1.0.0
git push origin v1.0.0
```

#### Manual desde GitHub
1. Ve a **Actions** → **Build Windows Release**
2. Click en **Run workflow**
3. Configura:
   - **Version**: `1.0.0`
   - **Release type**: `draft`, `prerelease` o `release`
4. Click **Run workflow**

## 🔐 Configuración de Certificados

Para builds firmados, configura estos secrets en GitHub:

| Secret | Descripción |
|--------|-------------|
| `WINDOWS_CERTIFICATE` | Certificado .p12 codificado en base64 |
| `CSC_KEY_PASSWORD` | Contraseña del certificado |
| `GH_TOKEN` | Token de GitHub para releases |

### Generar certificado base64
```bash
base64 -i tu-certificado.p12 | pbcopy
```

## 📁 Estructura del Proyecto

```
hockey-2-cloudflare/
├── public/
│   └── electron.js          # Proceso principal de Electron
├── src/                     # Código fuente React
├── scripts/
│   ├── generate-logo-list.js # Generador automático de logos
│   ├── copy-electron.js     # Script de build
│   └── prepare-offline.js   # Preparación offline
├── assets/                  # Recursos (iconos, logos)
├── .github/workflows/       # CI/CD GitHub Actions
└── dist/                    # Builds generados
```

## 🎯 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Desarrollo web (React) |
| `npm run build` | Build de producción |
| `npm run electron:dev` | Desarrollo Electron |
| `npm run electron:build` | Build Electron |
| `npm run electron:build:win` | Build Windows específico |
| `npm run electron:build:offline` | Build sin elevación |
| `npm test` | Ejecutar tests |

## 🏒 Uso de la Aplicación

1. **Inicio**: Ejecuta la aplicación desde el escritorio
2. **Marcador**: Configura los equipos y comienza el partido
3. **Controles**: Usa los botones para actualizar puntuaciones
4. **Logos**: Los logos se cargan automáticamente desde `/assets/`

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Proyecto privado - © 2024 Hector Martinez

## 🐛 Reportar Issues

Usa el [sistema de issues de GitHub](https://github.com/tu-usuario/hockey-2-cloudflare/issues) para reportar bugs o solicitar features.

## 📊 Releases

Los releases se publican automáticamente en GitHub Releases con los siguientes archivos:

- `Scoreboard-Pacífico-x.x.x-Setup.exe` - Instalador NSIS
- `Scoreboard-Pacífico-x.x.x-portable.exe` - Versión portable

---

**Hecho con ❤️ para la comunidad de hockey sobre patines**
