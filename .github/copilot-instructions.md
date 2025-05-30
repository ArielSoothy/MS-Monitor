# Copilot Instructions for MS Monitor Dashboard

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React-based Threat Intelligence Pipeline Monitoring Dashboard for Microsoft MSTIC. The project uses:

- **Framework**: React with TypeScript and Vite
- **Routing**: React Router DOM for single-page application navigation
- **Styling**: CSS modules with a dark theme similar to Azure portal
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization
- **Design**: Modern, responsive design with Microsoft-style navigation

## Key Components
- **Navigation**: Clean navigation bar with Microsoft-style design
- **Pages**: Overview, Pipelines, DataLineage, Alerts
- **Mock Data**: 160 pipelines with realistic names grouped by source (LinkedIn, Twitter, Office365, AzureAD, GitHub, etc.)
- **Pipeline Status**: healthy, warning, failed, processing
- **Metrics**: lastRun, avgProcessingTime, recordsProcessed, failureRate

## Coding Guidelines
- Use TypeScript for type safety
- Follow React hooks patterns
- Use CSS modules for styling
- Maintain responsive design principles
- Keep components modular and reusable
- Use semantic HTML elements
- Follow accessibility best practices
