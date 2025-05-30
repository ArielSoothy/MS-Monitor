# MS Monitor Dashboard> **Threat Intelligence Pipeline Monitoring Dashboard for Microsoft MSTIC**A comprehensive, enterprise-ready React dashboard for monitoring and managing threat intelligence data pipelines. Built with modern web technologies and designed with Microsoft's design language in mind.## 🚀 Live Demo[View Live Dashboard](https://arielsooth.github.io/ms-monitor-dashboard/)## 📋 Features### 🎯 **Real-time Monitoring**- **160+ Pipeline Monitoring**: Track pipelines across LinkedIn, Twitter, Office365, AzureAD, GitHub, and more- **Live Metrics**: Real-time ingestion rates, processing times, and health status- **Auto-refresh**: Automatic data updates every 5 seconds### 📊 **Comprehensive Analytics**- **Interactive Charts**: Built with Recharts for responsive data visualization- **System Health Score**: Calculated health metrics across all pipelines- **Performance Metrics**: Processing times, failure rates, and throughput analysis- **Alert Management**: Priority-based alert system with severity levels### 🗺️ **Data Lineage Visualization**- **Interactive Flow Diagrams**: Visual representation of data flow through pipelines- **Source-to-Destination Mapping**: Track data from ingestion to final destination- **Real-time Data Quality Metrics**: Monitor data quality at each stage### ⚡ **Performance Optimized**- **Lazy Loading**: Code splitting for optimal performance- **React.memo**: Optimized component re-rendering- **Virtual Scrolling**: Efficient handling of large datasets- **Loading Skeletons**: Enhanced user experience during data loading### 🎨 **Modern UI/UX**- **Microsoft-inspired Design**: Dark theme similar to Azure portal- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile- **Keyboard Shortcuts**: Full keyboard navigation support- **Accessibility**: WCAG compliant with proper ARIA labels## 🛠️ Technology Stack### **Frontend Framework**- **React 19** with TypeScript for type safety- **Vite** for lightning-fast development and building- **React Router DOM** for single-page application routing### **Visualization & UI**- **Recharts** for interactive charts and data visualization- **Lucide React** for consistent iconography- **CSS Modules** for scoped styling and maintainability### **Performance & Optimization**- **React.lazy()** and **Suspense** for code splitting- **React.memo()** for component optimization- **React Window** for virtual scrolling in large lists- **Error Boundaries** for graceful error handling### **Development Tools**- **ESLint** for code quality and consistency- **TypeScript** for static type checking- **GitHub Pages** for deployment and hosting## 🚀 Quick Start### Prerequisites- **Node.js** (v18 or higher)- **npm** or **yarn**### Installation1. **Clone the repository**   ```bash   git clone https://github.com/arielsooth/ms-monitor-dashboard.git
   cd ms-monitor-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Deployment to GitHub Pages

```bash
npm run deploy
```

## 🎮 Keyboard Shortcuts

The dashboard includes comprehensive keyboard shortcuts for efficient navigation:

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Navigate to Overview |
| `Alt + 2` | Navigate to Pipelines |
| `Alt + 3` | Navigate to Data Lineage |
| `Alt + 4` | Navigate to Alerts |
| `?` | Show keyboard shortcuts help |
| `Ctrl + I` | Show about information |
| `Escape` | Close modals |
| `Ctrl + R` | Refresh page |

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AboutModal/      # About information modal
│   ├── ErrorBoundary/   # Error handling component
│   ├── LoadingSkeleton/ # Loading state components
│   ├── Navigation/      # Main navigation bar
│   └── KeyboardHelpModal/ # Keyboard shortcuts help
├── pages/               # Main application pages
│   ├── Overview/        # Dashboard overview page
│   ├── Pipelines/       # Pipeline management page
│   ├── DataLineage/     # Data flow visualization
│   └── Alerts/          # Alert management page
├── hooks/               # Custom React hooks
│   └── useKeyboardShortcuts/ # Keyboard shortcut handler
├── data/                # Mock data and types
├── types/               # TypeScript type definitions
└── styles/              # Global styles and themes
```

## 🎯 Key Components

### **Overview Dashboard**
- System health score calculation
- Real-time ingestion rate monitoring
- Pipeline status distribution charts
- Top failing pipelines identification

### **Pipeline Management**
- Virtual scrolling for 160+ pipelines
- Advanced filtering and sorting
- Real-time status updates
- Performance metrics tracking

### **Data Lineage**
- Interactive SVG-based flow diagrams
- Node highlighting and path tracing
- Real-time data quality metrics
- Source system health monitoring

### **Alert System**
- Priority-based alert management
- Alert trend analysis
- Rule-based alerting configuration
- Historical alert tracking

## 🔧 Configuration

### **Environment Variables**
The application uses Vite's environment variables. Create a `.env` file for local development:

```env
VITE_API_BASE_URL=your_api_url_here
VITE_REFRESH_INTERVAL=5000
```

### **GitHub Pages Deployment**
The project is configured for GitHub Pages deployment with:
- **Base URL**: `/ms-monitor-dashboard/`
- **Build Output**: `dist/` directory
- **Deployment Script**: `npm run deploy`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft MSTIC** for the threat intelligence pipeline inspiration
- **Recharts** team for the excellent charting library
- **Lucide** for the beautiful icon set
- **React** team for the amazing framework

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- **GitHub**: [@arielsooth](https://github.com/arielsooth)
- **Project Link**: [https://github.com/arielsooth/ms-monitor-dashboard](https://github.com/arielsooth/ms-monitor-dashboard)

---

**Built with ❤️ for the cybersecurity community**
