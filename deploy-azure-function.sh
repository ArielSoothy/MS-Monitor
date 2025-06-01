#!/bin/bash

# Azure Functions Deployment Script for macOS/Linux
# This script deploys the AI proxy function to Azure

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Check if required parameters are provided
if [ "$#" -lt 2 ]; then
    print_color $RED "❌ Usage: $0 <FunctionAppName> <ResourceGroup> [OpenAIKey] [ClaudeKey]"
    print_color $WHITE "Example: $0 ms-monitor-ai-proxy myResourceGroup sk-... sk-ant-..."
    exit 1
fi

FUNCTION_APP_NAME=$1
RESOURCE_GROUP=$2
OPENAI_KEY=$3
CLAUDE_KEY=$4

print_color $GREEN "🚀 Deploying AI Proxy Function to Azure..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_color $RED "❌ Azure CLI is not installed. Please install it first."
    print_color $WHITE "Install with: brew install azure-cli"
    exit 1
fi

# Login check
if ! az account show &> /dev/null; then
    print_color $YELLOW "🔑 Logging into Azure..."
    az login
fi

# Navigate to functions directory
cd azure-functions

# Install dependencies
print_color $BLUE "📦 Installing dependencies..."
npm install

# Create zip package
print_color $BLUE "📦 Creating deployment package..."
zip -r ../ai-proxy-deployment.zip . -x "node_modules/.cache/*" "*.log"

# Go back to root
cd ..

# Deploy to Azure
print_color $BLUE "🌐 Deploying to Azure Function App: $FUNCTION_APP_NAME"
az functionapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FUNCTION_APP_NAME" \
    --src ai-proxy-deployment.zip

# Set environment variables if provided
if [ ! -z "$OPENAI_KEY" ]; then
    print_color $YELLOW "🔑 Setting OpenAI API key..."
    az functionapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$FUNCTION_APP_NAME" \
        --settings "OPENAI_API_KEY=$OPENAI_KEY"
fi

if [ ! -z "$CLAUDE_KEY" ]; then
    print_color $YELLOW "🔑 Setting Claude API key..."
    az functionapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$FUNCTION_APP_NAME" \
        --settings "CLAUDE_API_KEY=$CLAUDE_KEY"
fi

# Get function URL
FUNCTION_URL=$(az functionapp function show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FUNCTION_APP_NAME" \
    --function-name ai-proxy \
    --query "invokeUrlTemplate" \
    --output tsv 2>/dev/null)

print_color $GREEN "✅ Deployment complete!"
print_color $CYAN "🔗 Function URL: $FUNCTION_URL"
print_color $YELLOW "📝 Update your React app to use this URL for AI calls"

# Clean up
rm -f ai-proxy-deployment.zip

print_color $MAGENTA "\n🎯 Next steps:"
print_color $WHITE "1. Update AIPipelineAssistant.tsx to use the function URL"
print_color $WHITE "2. Test the deployment with a sample request"
print_color $WHITE "3. Monitor logs in Azure Portal if needed"

# Create a test command
print_color $MAGENTA "\n🧪 Test your deployment with:"
print_color $WHITE "curl -X POST '$FUNCTION_URL' \\"
print_color $WHITE "  -H 'Content-Type: application/json' \\"
print_color $WHITE "  -d '{\"message\":\"Hello, what can you help me with?\"}'"
