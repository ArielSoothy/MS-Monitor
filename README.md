# Microsoft MSTIC Threat Intelligence Pipeline Monitoring Dashboard

A React-based monitoring dashboard for Microsoft Security Threat Intelligence (MSTIC) pipelines. This dashboard provides real-time monitoring, analytics, and management capabilities for security data pipelines.

## 🚀 Live Demo

Visit the live dashboard: [MS Monitor Dashboard](https://ArielSoothy.github.io/MS-Monitor/)

## ✨ Features

### Pipeline Monitoring
- **160 realistic pipelines** across 10 data sources (LinkedIn, Twitter, Office365, AzureAD, GitHub, ThreatIntel, Exchange, Teams, SharePoint, PowerBI)
- **Real-time status tracking** with health indicators
- **SLA compliance monitoring** with breach detection
- **Regional distribution** across US, EU, APAC, and Global regions

### Advanced Analytics
- **Team performance metrics** with health scoring
- **Data classification tracking** (Public, Internal, Confidential, Restricted)
- **Failure pattern analysis** with categorized error types
- **Processing time trends** and capacity utilization

### Realistic Scenarios
- **Time-based patterns** reflecting business hours and weekly cycles
- **Correlated failures** with dependency chain simulation
- **Maintenance windows** and end-of-month processing spikes
- **Authentic error scenarios** (API rate limits, auth expiry, network timeouts)

### User Experience
- **Microsoft-style dark theme** matching Azure portal aesthetics
- **Responsive design** optimized for desktop and mobile
- **Advanced filtering** by team, region, classification, and status
- **Interactive data lineage** visualization
- **Real-time alerts** and notification system

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router DOM for single-page application navigation
- **Styling**: CSS Modules with custom Microsoft-style theming
- **Charts**: Recharts for interactive data visualizations
- **Icons**: Lucide React for consistent iconography
- **Deployment**: GitHub Actions + GitHub Pages

## 🏗️ Architecture

### Data Generation
The dashboard uses sophisticated mock data generation that creates realistic scenarios:

```typescript
// Pipeline naming convention: {Source}_{DataType}_{Process}_{Region}
// Example: LinkedIn_ProfileData_Ingestion_US

interface Pipeline {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'failed' | 'processing';
  source: string;
  region: 'US' | 'EU' | 'APAC' | 'Global';
  ownerTeam: string;
  slaRequirement: number; // hours
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  // ... additional metadata
}
```

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── Overview.tsx    # Dashboard overview with metrics
│   ├── Pipelines.tsx   # Pipeline management and monitoring
│   ├── DataLineage.tsx # Visual dependency mapping
│   └── Alerts.tsx      # Alert management system
├── data/               # Mock data generation and types
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArielSoothy/MS-Monitor.git
   cd MS-Monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 📊 Dashboard Pages

### Overview
- **Key metrics header** with SLA compliance tracking
- **Team health performance** charts
- **Data classification distribution** analytics
- **Regional pipeline distribution** mapping
- **Recent alerts** and error summaries

### Pipelines
- **Comprehensive pipeline listing** with advanced filtering
- **Status indicators** with real-time updates
- **Detailed configuration** and metadata display
- **Performance metrics** and processing statistics
- **Team and classification** based organization

### Data Lineage
- **Interactive dependency visualization** using actual pipeline relationships
- **Flow direction indicators** showing data movement
- **Dependency chain analysis** for impact assessment
- **Visual pipeline mapping** with source-to-destination flows

### Alerts
- **Real-time alert monitoring** with severity classification
- **Historical alert tracking** and pattern analysis
- **Alert resolution workflow** management
- **Notification configuration** and escalation rules

## 🔧 Configuration

### Environment Variables
The application uses environment-based configuration for different deployment targets:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/MS-Monitor/', // GitHub Pages path
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

### Pipeline Configuration
Customize pipeline sources and characteristics in `src/data/mockData.ts`:

```typescript
const PIPELINE_SOURCES = {
  LinkedIn: {
    dataTypes: ['ProfileData', 'CompanyData', 'PostData'],
    processes: ['Ingestion', 'Processing', 'Analysis'],
    teams: ['Social Intelligence', 'OSINT Analytics'],
    // ... additional configuration
  }
  // ... other sources
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft Security Team for inspiring the dashboard design
- Azure Portal team for the UI/UX patterns
- Open source community for the excellent tooling ecosystem

## 📧 Contact

For questions or support, please open an issue on GitHub or reach out to the development team.

---

**Built with ❤️ for Microsoft Security Intelligence**
