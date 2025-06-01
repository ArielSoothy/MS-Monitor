// Azure Function Configuration
// This file contains the configuration for your deployed Azure Function

const config = {
  // Update this URL after deploying your Azure Function
  AZURE_FUNCTION_URL: import.meta.env.VITE_AZURE_FUNCTION_URL || 'https://your-function-app.azurewebsites.net/api/ai-chat',
  
  // Fallback to mock responses if Azure Function is not available
  ENABLE_MOCK_FALLBACK: true,
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
};

// Helper function to check if Azure Function is properly configured
export const isAzureFunctionConfigured = (): boolean => {
  return config.AZURE_FUNCTION_URL && 
         !config.AZURE_FUNCTION_URL.includes('your-function-app') &&
         config.AZURE_FUNCTION_URL.startsWith('https://');
};

// Helper function to make Azure Function requests with retry logic
export const callAzureFunction = async (
  message: string, 
  context: any, 
  preferredService: string = 'auto'
): Promise<string> => {
  if (!isAzureFunctionConfigured()) {
    throw new Error('Azure Function not configured');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT);
      
      const response = await fetch(config.AZURE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          preferredService
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Function error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < config.MAX_RETRIES) {
        console.warn(`Azure Function attempt ${attempt + 1} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, config.RETRY_DELAY));
      }
    }
  }
  
  throw lastError || new Error('Azure Function failed after all retries');
};

export default config;
