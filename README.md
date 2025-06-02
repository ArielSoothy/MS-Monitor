# MS Monitor - Threat Intelligence Pipeline Dashboard

A React-based monitoring dashboard for Microsoft MSTIC (Microsoft Threat Intelligence Center) data pipelines, built with TypeScript, modern web technologies, and Azure integration.

## 🚀 Live Demo

**Production:** [https://arielsoothy.github.io/MS-Monitor/](https://arielsoothy.github.io/MS-Monitor/)

*Optimized for both desktop and mobile devices with responsive design*

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router DOM** for single-page application routing
- **Recharts** for data visualization and analytics
- **CSS Modules** with dark theme matching Azure portal aesthetic
- **Lucide React** for consistent iconography

### Backend Integration
- **Azure Functions** proxy for secure AI API calls
- **REST API** integration with proper error handling
- **CORS-aware** fallback mechanisms
- **Environment-based** configuration management

### Key Features
- **160+ Mock Pipelines** with realistic threat intelligence sources
- **Real-time Monitoring** with pipeline status tracking
- **AI Assistant** powered by OpenAI/Azure OpenAI integration
- **Data Lineage Visualization** with interactive pipeline flows
- **Alert Management** with priority-based categorization
- **Mobile-First Design** with responsive interface

## 📊 Pipeline Sources

Monitoring pipelines from major threat intelligence sources:
- **LinkedIn** - Social engineering detection
- **Twitter/X** - Threat actor communication
- **Office365** - Email security monitoring  
- **Azure AD** - Identity threat detection
- **GitHub** - Code security scanning
- **Telegram** - Dark web monitoring
- **Discord** - Gaming platform threats
- **And many more...**

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd "MS Monitor"

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to GitHub Pages

## 🔐 AI Integration

The dashboard includes an AI-powered pipeline assistant with multiple integration options:

1. **Azure Function Proxy** (Recommended for production)
2. **Direct API Integration** (Development)
3. **Enhanced Mock Responses** (Demo/offline mode)

See `AI_SETUP.md` for detailed configuration instructions.

## 🌐 Azure Function Deployment

The AI assistant uses mock responses for demonstration purposes. In production, this would integrate with a secure backend proxy for API calls.

## 📱 Mobile Support

Fully responsive design optimized for:
- **Touch Navigation** - Mobile-friendly controls
- **Responsive Layout** - Adapts to all screen sizes  
- **Performance** - Fast loading on mobile networks
- **Accessibility** - Screen reader compatible

## 🏢 Microsoft Integration Patterns

This project demonstrates enterprise-grade patterns used in Microsoft environments:

- **Azure-first Architecture** with Functions and cloud services
- **TypeScript** for enterprise code quality
- **Component-based Design** following React best practices
- **Security** with API key protection and CORS handling
- **Scalability** with modular, maintainable code structure
- **DevOps** with automated deployment pipelines

## 📈 Technical Highlights

- **Type Safety** - Full TypeScript implementation
- **Performance** - Optimized bundle size and loading
- **Security** - API keys protected server-side
- **Accessibility** - WCAG compliant interface
- **Testing** - Comprehensive error handling
- **Documentation** - Clear setup and deployment guides

## 🔍 Monitoring Capabilities

- **Pipeline Health** - Real-time status monitoring
- **Performance Metrics** - Processing time and throughput
- **Failure Analysis** - Error rate tracking and alerting
- **Data Quality** - Record validation and processing stats
- **Trend Analysis** - Historical performance visualization

---

*Built for demonstrating enterprise-grade data pipeline monitoring solutions in Microsoft threat intelligence environments.*
