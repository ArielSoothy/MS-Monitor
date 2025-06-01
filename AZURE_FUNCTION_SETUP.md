# Azure Function AI Proxy Setup Guide

## Overview
The AI Pipeline Assistant now supports secure API calls through Azure Functions, eliminating CORS issues and protecting API keys from client-side exposure.

## Architecture
```
Frontend (React) → Azure Function → OpenAI/Claude APIs
```

## Benefits
- ✅ **Security**: API keys stored securely in Azure, never exposed to browsers
- ✅ **CORS Resolved**: No more browser blocking of AI API calls
- ✅ **Mobile Support**: Works perfectly on all mobile devices
- ✅ **Enterprise Ready**: Scalable, monitored, and logs all requests
- ✅ **Cost Efficient**: Serverless - pay only for usage

## Quick Setup

### 1. Deploy the Azure Function
Run the deployment script:

**Windows (PowerShell):**
```powershell
.\deploy-azure-function.ps1
```

**macOS/Linux:**
```bash
./deploy-azure-function.sh
```

The script will:
- Create Azure resources
- Deploy the function code
- Set up environment variables
- Provide the function URL

### 2. Configure the Frontend
After deployment, update the environment variable:

```bash
# In your .env file or environment
VITE_AZURE_FUNCTION_URL=https://your-function-app.azurewebsites.net/api/ai-chat
```

### 3. Set API Keys in Azure
The deployment script will prompt for your API keys, or set them manually:

```bash
# Set OpenAI API key
az functionapp config appsettings set \
  --resource-group your-resource-group \
  --name your-function-app \
  --settings "OPENAI_API_KEY=sk-..."

# Set Claude API key  
az functionapp config appsettings set \
  --resource-group your-resource-group \
  --name your-function-app \
  --settings "CLAUDE_API_KEY=sk-ant-..."
```

## How It Works

### Request Flow
1. User enters message in AI assistant
2. Frontend checks if Azure Function is configured
3. If configured: Sends request to Azure Function with context
4. Azure Function calls OpenAI/Claude APIs securely
5. Response returned to frontend
6. If Azure Function fails: Falls back to mock responses

### Smart Fallback
- **Azure Function Available**: Uses real AI APIs securely
- **Azure Function Unavailable**: Falls back to enhanced mock responses
- **No API Keys**: Uses built-in threat intelligence responses

## Security Features
- API keys never sent to browser
- HTTPS encryption end-to-end
- Azure AD integration ready
- Request logging and monitoring
- Rate limiting and error handling

## Cost Optimization
- Azure Functions Consumption Plan: Pay per execution
- Typical cost: ~$0.01-0.10 per day for demo usage
- Auto-scaling based on demand
- Built-in monitoring and alerts

## Monitoring
View logs and metrics in Azure Portal:
1. Go to your Function App
2. Click "Monitor" → "Logs"
3. See real-time AI requests and responses

## Troubleshooting

### Function Not Working?
1. Check the function URL in browser - should show CORS error (expected)
2. Verify API keys are set in Azure Portal
3. Check function logs for errors
4. Ensure resource group and function app names are correct

### Still Getting Mock Responses?
- Verify `VITE_AZURE_FUNCTION_URL` environment variable
- Check browser console for errors
- Test the function URL directly with POST request

## Production Considerations
- Use Azure Key Vault for API keys
- Set up Azure AD authentication
- Configure custom domains
- Enable Application Insights monitoring
- Set up CI/CD pipeline for updates

## Interview Demo Benefits
This setup demonstrates:
- **Cloud Architecture**: Serverless design patterns
- **Security Best Practices**: API key protection
- **DevOps Skills**: Automated deployment
- **Problem Solving**: CORS resolution
- **Enterprise Thinking**: Scalable, monitored solution
