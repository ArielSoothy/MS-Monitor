# MS Monitor Dashboard

[![Deploy to GitHub Pages](https://github.com/arielsooth/ms-monitor-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/arielsooth/ms-monitor-dashboard/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://arielsooth.github.io/ms-monitor-dashboard/)

A modern, enterprise-grade React-based Threat Intelligence Pipeline Monitoring Dashboard for Microsoft MSTIC (Microsoft Threat Intelligence Center).

![MS Monitor Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=MS+Monitor+Dashboard)

## 🚀 Features

### Core Monitoring
- **Real-time Pipeline Monitoring**: Track 160+ threat intelligence pipelines across multiple data sources
- **System Health Overview**: Comprehensive dashboard with key metrics and system status
- **Performance Analytics**: Processing times, failure rates, and throughput monitoring
- **Multi-source Support**: Monitor pipelines from LinkedIn, Twitter, Office365, AzureAD, GitHub, ThreatIntel, Exchange, Teams, SharePoint, and PowerBI

### User Experience
- **Modern UI**: Dark theme inspired by Azure portal with responsive design
- **Interactive Visualizations**: Charts and graphs using Recharts library
- **Advanced Filtering**: Search, filter, and sort capabilities across all components
- **Keyboard Shortcuts**: Full keyboard navigation support (Alt+1-4 for pages, ? for help)
- **Error Boundaries**: Graceful error handling with retry mechanisms
- **Loading States**: Smooth transitions with skeleton loading animations

### Alert Management
- **Comprehensive Alert System**: Multi-level severity tracking (Low, Medium, High, Critical)
- **Alert Rules Management**: Configure and manage monitoring rules
- **Historical Tracking**: Alert trend analysis and resolution tracking
- **Real-time Notifications**: Live alert updates and status changes

### Data Lineage
- **Visual Flow Representation**: Interactive diagram showing data movement
- **Source-to-Destination Tracking**: Complete pipeline visualization
- **Health Status Indicators**: Real-time status of each pipeline stage
- **Performance Metrics**: Processing times and throughput at each stage

## 🛠 Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.x for fast development and optimized builds
- **Routing**: React Router DOM v7 for single-page application navigation
- **Styling**: CSS Modules with custom properties for theming
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for interactive data visualizations
- **Performance**: React.memo, lazy loading, and code splitting
- **Quality**: ESLint with TypeScript support

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: npm (comes with Node.js) or yarn

## 🚀 Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arielsooth/ms-monitor-dashboard.git
   cd ms-monitor-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run deploy` | Deploy to GitHub Pages |

## 🗂 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── AboutModal.tsx      # Project information modal
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   ├── KeyboardHelpModal.tsx # Keyboard shortcuts help
│   ├── LoadingSkeleton.tsx # Loading state components
│   └── Navigation.tsx      # Main navigation bar
├── pages/                  # Page components (lazy loaded)
│   ├── Overview.tsx        # Dashboard overview with metrics
│   ├── Pipelines.tsx       # Pipeline management interface
│   ├── DataLineage.tsx     # Data flow visualization
│   └── Alerts.tsx          # Alert management system
├── hooks/                  # Custom React hooks
│   └── useKeyboardShortcuts.ts # Keyboard navigation
├── data/                   # Mock data and utilities
│   └── mockData.ts         # Generated pipeline and alert data
├── types/                  # TypeScript definitions
│   └── index.ts            # Core interfaces and types
└── styles/                 # Global styles and themes
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Navigate to Overview |
| `Alt + 2` | Navigate to Pipelines |
| `Alt + 3` | Navigate to Data Lineage |
| `Alt + 4` | Navigate to Alerts |
| `Ctrl + I` | Show About modal |
| `?` | Show keyboard shortcuts help |
| `Escape` | Close open modals |
| `Ctrl + R` | Refresh page |

## 🎨 Design System

### Color Palette
- **Primary**: Microsoft Blue (#0078d4)
- **Success**: Green (#52c41a)
- **Warning**: Orange (#faad14)
- **Error**: Red (#f5222d)
- **Background**: Dark theme (#1a1a1a, #2d2d2d)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Responsive sizing**: Fluid typography with CSS clamp()

## 🚀 Deployment

### GitHub Pages (Automatic)

The project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch**: Triggers GitHub Actions workflow
2. **Automatic build**: Vite builds the project
3. **Deploy**: Built files are deployed to GitHub Pages
4. **Live URL**: https://arielsooth.github.io/ms-monitor-dashboard/

### Manual Deployment

```bash
# Install gh-pages if not already installed
npm install --save-dev gh-pages

# Deploy to GitHub Pages
npm run deploy
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for local development:

```env
# Development
VITE_API_BASE_URL=http://localhost:3001
VITE_ENABLE_MOCK_DATA=true

# Production
VITE_API_BASE_URL=https://api.mstic.microsoft.com
VITE_ENABLE_MOCK_DATA=false
```

### Vite Configuration

The project uses optimized Vite configuration with:
- **Code splitting**: Vendor, charts, icons, and router chunks
- **Source maps**: Enabled for debugging
- **Asset optimization**: Minification and compression
- **GitHub Pages**: Configured base path

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft MSTIC Team** for threat intelligence pipeline architecture inspiration
- **Azure Portal** for design system and UI patterns
- **React Community** for excellent ecosystem and tools
- **Vite Team** for blazing fast build tooling

## 📧 Contact

**Ariel Sooth** - [GitHub](https://github.com/arielsooth)

**Project Link**: https://github.com/arielsooth/ms-monitor-dashboard

---

<div align="center">
  <strong>Built with ❤️ for Microsoft MSTIC</strong>
</div>
</content>
