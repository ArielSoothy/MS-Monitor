import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Settings, Eye, EyeOff, ExternalLink } from 'lucide-react';
import styles from './AIPipelineAssistant.module.css';
import { mockPipelines } from '../data/mockData';
import { callAzureFunction, isAzureFunctionConfigured } from '../config/azureFunction';
import type { Pipeline, Alert } from '../types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIPipelineAssistantProps {
  currentPage?: string;
  selectedPipelines?: Pipeline[];
  recentAlerts?: Alert[];
}

const AIPipelineAssistant: React.FC<AIPipelineAssistantProps> = ({ 
  currentPage = 'overview',
  selectedPipelines = [],
  recentAlerts = [] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string; service?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API keys from localStorage on mount
  useEffect(() => {
    const storedOpenaiKey = localStorage.getItem('ai-assistant-openai-key');
    const storedClaudeKey = localStorage.getItem('ai-assistant-claude-key');
    if (storedOpenaiKey) {
      setOpenaiApiKey(storedOpenaiKey);
    }
    if (storedClaudeKey) {
      setClaudeApiKey(storedClaudeKey);
    }
    // For demo purposes, show the API key input if no keys are found
    if (!storedOpenaiKey && !storedClaudeKey) {
      setShowApiKeyInput(true);
    }
  }, []);

  // Prevent body scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveOpenaiKey = () => {
    const trimmedKey = openaiApiKey.trim();
    if (trimmedKey && (trimmedKey.startsWith('sk-') || trimmedKey.length > 20)) {
      localStorage.setItem('ai-assistant-openai-key', trimmedKey);
      const usingAzureFunction = isAzureFunctionConfigured();
      const message = usingAzureFunction 
        ? '🔑 OpenAI API key saved! Ready to use Azure Function for secure AI responses. Enterprise-grade security and performance.'
        : '🔑 OpenAI API key saved! I can now provide enhanced responses using GPT-4.\n\n*Note: Due to browser CORS restrictions, the assistant currently uses advanced mock intelligence for demonstration. In production, this would connect through a secure backend proxy.*';
      addMessage('assistant', message);
    } else if (trimmedKey) {
      localStorage.setItem('ai-assistant-openai-key', trimmedKey);
      addMessage('assistant', '⚠️ OpenAI API key saved. Currently using enhanced mock intelligence for demonstration. In production, this would integrate with GPT-4.');
    }
  };

  const saveClaudeKey = () => {
    const trimmedKey = claudeApiKey.trim();
    if (trimmedKey && (trimmedKey.startsWith('sk-ant-') || trimmedKey.length > 30)) {
      localStorage.setItem('ai-assistant-claude-key', trimmedKey);
      const usingAzureFunction = isAzureFunctionConfigured();
      const message = usingAzureFunction 
        ? '🔑 Claude API key saved! Ready to use Azure Function for secure AI responses. Enterprise-grade Anthropic integration.'
        : '🔑 Claude API key saved! I can now provide enhanced responses using Claude AI.\n\n*Note: Due to browser CORS restrictions, the assistant currently uses advanced mock intelligence for demonstration. In production, this would connect through a secure backend proxy.*';
      addMessage('assistant', message);
    } else if (trimmedKey) {
      localStorage.setItem('ai-assistant-claude-key', trimmedKey);
      addMessage('assistant', '⚠️ Claude API key saved. Currently using enhanced mock intelligence for demonstration. In production, this would integrate with Claude AI.');
    }
  };

  const clearApiKeys = () => {
    localStorage.removeItem('ai-assistant-openai-key');
    localStorage.removeItem('ai-assistant-claude-key');
    setOpenaiApiKey('');
    setClaudeApiKey('');
    setShowApiKeyInput(false);
    setTestResult(null);
  };

  const testOpenaiConnection = async () => {
    if (!openaiApiKey.trim()) {
      setTestResult({
        success: false,
        message: 'No OpenAI API key provided',
        details: 'Please enter your OpenAI API key before testing the connection.',
        service: 'OpenAI'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiApiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const gptModels = data.data.filter((model: any) => model.id.includes('gpt'));
        setTestResult({
          success: true,
          message: `✅ OpenAI connection successful! Found ${gptModels.length} GPT models available.`,
          details: `Available models: ${gptModels.slice(0, 3).map((m: any) => m.id).join(', ')}${gptModels.length > 3 ? '...' : ''}`,
          service: 'OpenAI'
        });
      } else {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let details = errorData;

        if (response.status === 401) {
          errorMessage = 'Authentication failed';
          details = 'Invalid API key. Please check your OpenAI API key and try again.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded';
          details = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden';
          details = 'Your API key may not have the required permissions.';
        }

        setTestResult({
          success: false,
          message: `❌ OpenAI ${errorMessage}`,
          details: details,
          service: 'OpenAI'
        });
      }
    } catch (error) {
      let errorMessage = 'Connection failed';
      let details = 'Unknown error occurred';

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error (CORS)';
        details = 'Browser blocked the request due to CORS policy. This is expected - the AI assistant will use enhanced mock responses instead.';
      } else if (error instanceof Error) {
        details = error.message;
      }

      setTestResult({
        success: false,
        message: `❌ OpenAI ${errorMessage}`,
        details: details,
        service: 'OpenAI'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testClaudeConnection = async () => {
    if (!claudeApiKey.trim()) {
      setTestResult({
        success: false,
        message: 'No Claude API key provided',
        details: 'Please enter your Claude API key before testing the connection.',
        service: 'Claude'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `✅ Claude connection successful! Model: claude-3-haiku`,
          details: `API response: ${data.content?.[0]?.text || 'Connection verified'}`,
          service: 'Claude'
        });
      } else {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let details = errorData;

        if (response.status === 401) {
          errorMessage = 'Authentication failed';
          details = 'Invalid API key. Please check your Claude API key and try again.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded';
          details = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden';
          details = 'Your API key may not have the required permissions.';
        }

        setTestResult({
          success: false,
          message: `❌ Claude ${errorMessage}`,
          details: details,
          service: 'Claude'
        });
      }
    } catch (error) {
      let errorMessage = 'Connection failed';
      let details = 'Unknown error occurred';

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error (CORS)';
        details = 'Browser blocked the request due to CORS policy. This is expected - the AI assistant will use enhanced mock responses instead.';
      } else if (error instanceof Error) {
        details = error.message;
      }

      setTestResult({
        success: false,
        message: `❌ Claude ${errorMessage}`,
        details: details,
        service: 'Claude'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getSystemContext = () => {
    const context = {
      currentPage,
      totalPipelines: mockPipelines.length,
      healthyPipelines: mockPipelines.filter(p => p.status === 'healthy').length,
      failedPipelines: mockPipelines.filter(p => p.status === 'failed').length,
      warningPipelines: mockPipelines.filter(p => p.status === 'warning').length,
      processingPipelines: mockPipelines.filter(p => p.status === 'processing').length,
      recentFailures: mockPipelines.filter(p => p.status === 'failed').slice(0, 5),
      criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
      sources: [...new Set(mockPipelines.map(p => p.source))],
      selectedPipelines: selectedPipelines.length > 0 ? selectedPipelines : undefined
    };
    return context;
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    const context = getSystemContext();
    
    // Enhanced pipeline analysis with realistic intelligence
    if (lowerQuery.includes('failed') && lowerQuery.includes('linkedin')) {
      const failedLinkedIn = mockPipelines.filter(p => 
        p.source === 'LinkedIn' && p.status === 'failed'
      );
      return `🔍 **LinkedIn Pipeline Analysis**\n\nFound ${failedLinkedIn.length} failed LinkedIn pipelines:\n\n${failedLinkedIn.map(p => 
        `• **${p.name}**\n  ❌ Failed ${Math.floor((Date.now() - p.lastRun.getTime()) / (1000 * 60))} minutes ago\n  📊 Failure Rate: ${p.failureRate}%\n  ⚡ Last Success: ${p.avgProcessingTime.toFixed(1)}min processing\n  🔗 Reason: ${p.lastFailureReason || 'LinkedIn API rate limit exceeded (429)'}`
      ).join('\n\n')}\n\n**🚨 Root Cause Analysis:**\n• Pattern: All failures occur during 8-10 AM UTC (peak usage)\n• API Response: HTTP 429 - Rate limit exceeded\n• Correlation: 3 other orgs reporting similar issues on LinkedIn Developer Forums\n\n**⚡ Immediate Actions:**\n1. Activate backup LinkedIn app credentials\n2. Implement exponential backoff (2^n seconds)\n3. Distribute requests across 4-hour windows\n4. Enable circuit breaker pattern\n\n**📈 Predictive Insight:** Based on historical patterns, expect resolution by 14:00 UTC when LinkedIn API quotas reset.`;
    }

    if (lowerQuery.includes('slowest') || lowerQuery.includes('slow')) {
      const slowPipelines = mockPipelines
        .sort((a, b) => b.avgProcessingTime - a.avgProcessingTime)
        .slice(0, 5);
      return `⚡ **Performance Analysis - Slowest Pipelines**\n\n${slowPipelines.map((p, index) => 
        `**${index + 1}. ${p.name}** (${p.source})\n📊 Current: ${p.avgProcessingTime.toFixed(1)}min | SLA: ${p.slaRequirement}min | Trend: ${p.avgProcessingTime > p.slaRequirement ? '📈 Degrading' : '📉 Stable'}\n🔍 Records/Run: ${p.recordsProcessed.toLocaleString()}\n💾 Data Volume: ${(p.recordsProcessed * 0.5).toFixed(1)}GB\n⚠️ ${p.avgProcessingTime > p.slaRequirement ? 'SLA BREACH' : 'Within SLA'}`
      ).join('\n\n')}\n\n**🧠 ML Performance Insights:**\n• **Bottleneck Detection:** ${slowPipelines[0].name} showing 40% CPU saturation\n• **Data Growth:** 15% increase in processing time over 30 days\n• **Resource Correlation:** Memory usage spike during ${slowPipelines[0].source} peak hours\n\n**🚀 Optimization Recommendations:**\n1. **Scale Up:** Add 2 additional processing nodes for ${slowPipelines[0].source}\n2. **Optimize:** Implement parallel processing for large datasets\n3. **Cache:** Add Redis layer for repeated API calls\n4. **Schedule:** Distribute heavy workloads outside peak hours (8-10 AM UTC)\n\n**💰 Cost Impact:** Current delays cost ~$2,400/month in compute overruns.`;
    }

    if (lowerQuery.includes('european') || lowerQuery.includes('eu')) {
      const euPipelines = mockPipelines.filter(p => p.region === 'EU');
      const euStatus = {
        healthy: euPipelines.filter(p => p.status === 'healthy').length,
        warning: euPipelines.filter(p => p.status === 'warning').length,
        failed: euPipelines.filter(p => p.status === 'failed').length
      };
      return `🇪🇺 **European Data Operations Dashboard**\n\n**Regional Overview:**\n• 📍 Total EU Pipelines: ${euPipelines.length}\n• ✅ Healthy: ${euStatus.healthy} (${Math.round((euStatus.healthy/euPipelines.length)*100)}%)\n• ⚠️ Warning: ${euStatus.warning}\n• ❌ Failed: ${euStatus.failed}\n\n**🛡️ GDPR Compliance Status:**\n• Data Residency: ✅ All data processed within EU boundaries\n• Retention Policy: ✅ 90-day automated deletion active\n• Encryption: ✅ AES-256 at rest, TLS 1.3 in transit\n• Audit Logs: ✅ Complete trail maintained\n\n**📊 Geographic Distribution:**\n• Ireland (eu-west-1): 45% of workload\n• Frankfurt (eu-central-1): 35% of workload\n• Stockholm (eu-north-1): 20% of workload\n\n**⚡ Performance Metrics:**\n• Average Latency: 245ms (15% better than US regions)\n• Data Transfer Costs: €450/month (within budget)\n• Cross-AZ Replication: 99.9% success rate\n\n**🚨 Recent EU-Specific Alerts:**\n• Ireland DC: Minor network latency spike (+50ms)\n• Frankfurt: Maintenance window scheduled for Saturday 02:00 CET\n• Stockholm: All systems optimal`;
    }

    // Enhanced critical alerts with detailed incident response
    if (lowerQuery.includes('critical') && lowerQuery.includes('alert')) {
      return `🚨 **Critical Alert Incident Response Dashboard**\n\n**Active Critical Alerts: ${context.criticalAlerts}**\n\n**🔥 P0 - LinkedIn ThreatActors Pipeline**\n• Severity: Critical\n• Duration: 45 minutes\n• Impact: 15% failure rate (SLA: <5%)\n• Affected Records: 12,000 threat actor profiles\n• Business Impact: HIGH - Missing APT group updates\n\n**⚠️ P1 - Azure AD Authentication Failures**\n• Severity: High\n• Duration: 1.2 hours\n• Pattern: Intermittent 401 errors every 15 minutes\n• Root Cause: Token refresh race condition\n• Mitigation: Circuit breaker activated\n\n**📊 P2 - Twitter Sentiment Analysis Degradation**\n• Severity: Medium\n• Accuracy: 82% (SLA: >85%)\n• Affected Models: 3 ML pipelines\n• Trend: Declining since API v2 migration\n\n**🎯 Automated Response Actions Taken:**\n1. ✅ Incident created in ServiceNow (INC-2024-06-001)\n2. ✅ P0 escalation to on-call engineer (Response: 3min)\n3. ✅ Backup authentication tokens activated\n4. ✅ Customer notification prepared (pending approval)\n\n**🔍 Investigation Priority Matrix:**\n1. **LinkedIn Auth** (Revenue Impact: High)\n2. **Azure AD Token Refresh** (User Impact: Medium)\n3. **Twitter ML Model Retraining** (Quality Impact: Low)\n\n**📞 War Room Status:** Active - Teams channel #incident-response-001`;
    }

    // Advanced root cause analysis with historical correlation
    if (lowerQuery.includes('twitter') && (lowerQuery.includes('fail') || lowerQuery.includes('3 hour'))) {
      return `🔍 **Advanced Root Cause Analysis: Twitter Pipeline**\n\n**Pattern Recognition:**\n• ⏰ Failure Pattern: Every 2h 47min ± 13min\n• 📈 Correlation Score: 0.94 with API rate limits\n• 🕐 Peak Failures: 08:00, 10:47, 13:34, 16:21 UTC\n\n**📊 Historical Data Analysis (90 days):**\n• Similar pattern detected: March 15-22, 2024\n• Previous root cause: Twitter API v1.1 → v2 migration\n• Resolution time: 4.2 hours average\n• Cost impact: $1,200 in retry operations\n\n**🧠 ML Pattern Detection:**\n\`\`\`\nAnomaly Score: 8.7/10\nConfidence: 94%\nPredicted Resolution: 2.3 hours\nSimilar Incidents: 3 (all resolved)\n\`\`\`\n\n**🔧 Technical Deep Dive:**\n• **Error Pattern:** HTTP 429 → 5min backoff → 401 → credential refresh\n• **Token Lifecycle:** 2h 45min (3min shorter than expected)\n• **API Endpoint:** /2/tweets/search/stream (new rate limits)\n• **Request Volume:** 847 req/hour (limit: 300/15min window)\n\n**⚡ Immediate Actions (Auto-Executed):**\n1. ✅ Activated secondary API app (backup tokens)\n2. ✅ Implemented exponential backoff: 2^(attempt) seconds\n3. ✅ Enabled request queuing with Redis\n4. ✅ Reduced polling frequency: 45s → 90s\n\n**🚀 Strategic Recommendations:**\n1. **Upgrade to Twitter API v2 Essential** ($100/month)\n2. **Implement request sharding** across 3 developer accounts\n3. **Add predictive rate limit monitoring** (ML-based)\n4. **Create Twitter API health dashboard**\n\n**📈 Success Metrics:**\n• Target: <2% failure rate\n• Current: 15% → Expected: 3% after fixes\n• ETA: 1.5 hours for full recovery`;
    }

    // Enhanced interactive troubleshooting guide
    if (lowerQuery.includes('help') || lowerQuery.includes('assist') || lowerQuery.includes('debug')) {
      return `🤖 **AI Pipeline Assistant - Advanced Capabilities**\n\n**🔍 Troubleshooting Commands:**\n\`\`\`\n"Analyze failed LinkedIn pipelines"\n"Show slowest performing data sources"\n"Investigate European region status"\n"Critical alert summary with root cause"\n"Twitter API failure pattern analysis"\n"Predict next maintenance window"\n"Cost optimization recommendations"\n"Security anomaly detection"\n\`\`\`\n\n**📊 Advanced Analytics Available:**\n• **Predictive Failure Analysis** - ML-powered failure prediction\n• **Cost Impact Assessment** - Real-time cost analysis\n• **Performance Benchmarking** - Cross-region comparisons\n• **Security Intelligence** - Threat pattern recognition\n• **Capacity Planning** - Resource utilization forecasting\n\n**🚨 Real-Time Monitoring:**\n• Pipeline health checks every 30 seconds\n• Anomaly detection with 95% accuracy\n• Automated incident response workflows\n• Integration with Azure Monitor and Sentinel\n\n**🔧 Supported Actions:**\n• Restart failed pipelines\n• Scale resources automatically\n• Trigger backup procedures\n• Generate compliance reports\n\n**💡 Pro Tip:** Try asking "What should I focus on today?" for personalized recommendations based on current system state and historical patterns.`;
    }

    // Default comprehensive overview
    return `🚀 **Microsoft Threat Intelligence Pipeline AI Assistant**\n\n**📊 Current System Health:**\n• Total Pipelines: ${context.totalPipelines}\n• ✅ Healthy: ${context.healthyPipelines} (${Math.round((context.healthyPipelines / context.totalPipelines) * 100)}%)\n• ⚠️ Warning: ${context.warningPipelines}\n• ❌ Failed: ${context.failedPipelines}\n• 🔄 Processing: ${context.processingPipelines}\n\n**🌍 Multi-Source Intelligence:**\n• **LinkedIn:** Threat actor profiling, company intelligence\n• **Twitter:** Sentiment analysis, trending threats\n• **GitHub:** Code vulnerability scanning, threat campaigns\n• **Office365:** Email threat patterns, phishing detection\n• **Azure AD:** Identity threat monitoring, access anomalies\n\n**🧠 AI-Powered Insights Available:**\n• \`"Predict tomorrow's failures"\` - ML failure forecasting\n• \`"Show cost optimization opportunities"\` - Resource efficiency\n• \`"Analyze threat campaign patterns"\` - Security intelligence\n• \`"Compare region performance"\` - Geographic analysis\n\n**⚡ Quick Actions:**\n• \`"What needs immediate attention?"\`\n• \`"Show me the biggest threats today"\`\n• \`"Optimize pipeline performance"\`\n• \`"Generate executive summary"\`\n\n**🎯 Context-Aware:** I understand you're viewing the ${context.currentPage} page and can provide targeted insights for your current workflow.\n\nWhat specific threat intelligence challenge can I help you solve today?`;
  };

  const callAIAPI = async (message: string): Promise<string> => {
    const hasOpenAI = openaiApiKey.trim();
    const hasClaude = claudeApiKey.trim();
    
    if (!hasOpenAI && !hasClaude) {
      throw new Error('No API key configured');
    }

    const context = getSystemContext();
    
    // Try Azure Function first if configured and we have API keys
    if (isAzureFunctionConfigured()) {
      try {
        const preferredService = hasClaude && hasOpenAI ? 'auto' : hasClaude ? 'claude' : 'openai';
        return await callAzureFunction(message, context, preferredService);
      } catch (azureError) {
        console.warn('Azure Function failed, falling back to direct API calls:', azureError);
        // Fall through to direct API calls if Azure Function fails
      }
    }

    // Fallback to direct API calls (will likely fail due to CORS in browser)
    const systemPrompt = `You are a Microsoft Threat Intelligence pipeline expert assistant. You have access to 160 pipelines monitoring data from LinkedIn, Twitter, Office365, AzureAD, GitHub, and other sources. Help analysts troubleshoot issues and understand patterns.

Current system state:
- Total pipelines: ${context.totalPipelines}
- Healthy: ${context.healthyPipelines}
- Failed: ${context.failedPipelines}
- Warning: ${context.warningPipelines}
- Processing: ${context.processingPipelines}
- Sources: ${context.sources.join(', ')}
- Current page: ${context.currentPage}
- Critical alerts: ${context.criticalAlerts}

Be concise, actionable, and focus on Microsoft threat intelligence scenarios. Use markdown formatting for clarity.`;

    // Try Claude first if available, then OpenAI
    if (hasClaude) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeApiKey.trim(),
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: `${systemPrompt}\n\nUser question: ${message}`
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        return data.content[0].text;
      } catch (claudeError) {
        console.warn('Claude API failed, trying OpenAI:', claudeError);
        // If Claude fails and we have OpenAI, try OpenAI
        if (!hasOpenAI) throw claudeError;
      }
    }

    if (hasOpenAI) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            max_tokens: 1024,
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (openaiError) {
        throw openaiError;
      }
    }

    throw new Error('No working API service available');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      let response: string;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const hasApiKey = openaiApiKey.trim() || claudeApiKey.trim();
      
      if (hasApiKey) {
        // Try AI API first
        try {
          response = await callAIAPI(userMessage);
          
          // If API call succeeds, add success message based on whether Azure Function was used
          const usingAzureFunction = isAzureFunctionConfigured();
          const successMessage = usingAzureFunction 
            ? (isMobile 
                ? "\n\n*✅ **Azure Function Success**: AI response delivered securely through Microsoft Azure serverless architecture! Perfect for enterprise deployment.*"
                : "\n\n*✅ **Azure Function**: Secure AI proxy working correctly.*")
            : (isMobile 
                ? "\n\n*✅ Successfully connected to AI service from mobile device! Your API key is working correctly.*"
                : "\n\n*✅ AI service connected successfully.*");
          response += successMessage;
          
        } catch (apiError) {
          console.warn('AI API failed, using enhanced mock intelligence:', apiError);
          
          // Enhanced fallback messaging for mobile users
          const corsMessage = isMobile 
            ? "\n\n*🔒 **Mobile Demo Mode**: Mobile browsers block direct API calls for security. Your API key is saved and would work through a backend server. The response above uses advanced threat intelligence scenarios for demonstration.*"
            : "\n\n*🔒 **Browser Security**: Direct API calls blocked by CORS policy. In production, this connects through a secure backend proxy. Using enhanced mock intelligence for demonstration.*";
          
          response = generateMockResponse(userMessage) + corsMessage;
        }
      } else {
        // Use enhanced mock intelligence with mobile-specific messaging
        response = generateMockResponse(userMessage);
        
        if (isMobile) {
          response += "\n\n*📱 **Mobile Demo**: Add your OpenAI or Claude API key in settings (⚙️) to test real AI connections. Current responses use advanced mock intelligence for demonstration.*";
        }
      }

      addMessage('assistant', response);
    } catch (error) {
      console.error('Error getting response:', error);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const errorMessage = isMobile 
        ? '📱 The AI assistant is running in enhanced demo mode on mobile. Try asking: "analyze failed pipelines", "show critical alerts", or "performance optimization recommendations".'
        : 'Sorry, I encountered an error. Please try again or check your API key configuration in settings.';
      
      addMessage('assistant', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        title="Ask AI Pipeline Assistant"
      >
        <MessageCircle size={24} />
        <span className={styles.buttonLabel}>AI Assistant</span>
      </button>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <MessageCircle size={20} />
          <div>
            <h3>AI Pipeline Assistant</h3>
            <p>
              Pipeline Intelligence & Troubleshooting
              {isAzureFunctionConfigured() && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(82, 196, 26, 0.2)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                  🚀 Azure Function
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.settingsButton}
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            title="API Settings"
          >
            <Settings size={16} />
          </button>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showApiKeyInput && (
        <div className={styles.apiKeySection}>
          <h4>🔑 AI Service Configuration</h4>
          <p>Choose your preferred AI service and add your API key:</p>
          <div className={styles.scrollHint}>📜 Scroll down to see Claude AI options below OpenAI</div>
          
          {/* OpenAI Section */}
          <div className={styles.apiKeyInstructions}>
            <p><strong>🤖 OpenAI GPT-4</strong></p>
            <p>Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                OpenAI Platform <ExternalLink size={12} />
              </a>
            </p>
          </div>
          <div className={styles.apiKeyInput}>
            <input
              type={showOpenaiKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              className={styles.toggleVisibility}
              type="button"
            >
              {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {openaiApiKey.trim() && !openaiApiKey.trim().startsWith('sk-') && (
            <div className={styles.validationWarning}>
              ⚠️ OpenAI API key should start with "sk-"
            </div>
          )}
          <div className={styles.apiKeyActions}>
            <button 
              onClick={saveOpenaiKey} 
              className={styles.saveButton} 
              disabled={!openaiApiKey.trim()}
              title={!openaiApiKey.trim() ? "Please enter an OpenAI API key" : "Save OpenAI API key"}
            >
              Save OpenAI Key
            </button>
            <button
              onClick={testOpenaiConnection}
              className={styles.testButton}
              disabled={!openaiApiKey.trim() || isTesting}
              title={!openaiApiKey.trim() ? "Please enter an OpenAI API key" : "Test OpenAI connection"}
            >
              {isTesting ? <Loader2 size={14} className={styles.loadingIcon} /> : '🔧'} Test OpenAI
            </button>
          </div>

          {/* Claude Section */}
          <div className={styles.apiKeyInstructions} style={{ marginTop: '1.5rem' }}>
            <p><strong>🧠 Claude (Anthropic)</strong></p>
            <p>Get your API key from{' '}
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                Anthropic Console <ExternalLink size={12} />
              </a>
            </p>
          </div>
          <div className={styles.apiKeyInput}>
            <input
              type={showClaudeKey ? 'text' : 'password'}
              placeholder="sk-ant-..."
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              onClick={() => setShowClaudeKey(!showClaudeKey)}
              className={styles.toggleVisibility}
              type="button"
            >
              {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {claudeApiKey.trim() && !claudeApiKey.trim().startsWith('sk-ant-') && (
            <div className={styles.validationWarning}>
              ⚠️ Claude API key should start with "sk-ant-"
            </div>
          )}
          <div className={styles.apiKeyActions}>
            <button 
              onClick={saveClaudeKey} 
              className={styles.saveButton} 
              disabled={!claudeApiKey.trim()}
              title={!claudeApiKey.trim() ? "Please enter a Claude API key" : "Save Claude API key"}
            >
              Save Claude Key
            </button>
            <button
              onClick={testClaudeConnection}
              className={styles.testButton}
              disabled={!claudeApiKey.trim() || isTesting}
              title={!claudeApiKey.trim() ? "Please enter a Claude API key" : "Test Claude connection"}
            >
              {isTesting ? <Loader2 size={14} className={styles.loadingIcon} /> : '🔧'} Test Claude
            </button>
          </div>

          {/* Clear All Button */}
          {(localStorage.getItem('ai-assistant-openai-key') || localStorage.getItem('ai-assistant-claude-key')) && (
            <div className={styles.apiKeyActions} style={{ marginTop: '1rem' }}>
              <button onClick={clearApiKeys} className={styles.clearButton}>
                Clear All Keys
              </button>
            </div>
          )}
          
          {testResult && (
            <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testError}`}>
              <div className={styles.testMessage}>
                {testResult.service && `[${testResult.service}] `}{testResult.message}
              </div>
              {testResult.details && (
                <div className={styles.testDetails}>{testResult.details}</div>
              )}
            </div>
          )}
          
          <div className={styles.costWarning}>
            💡 Cost: ~$0.01 per query with GPT-4 or Claude (very affordable for demos)
          </div>
          <div className={styles.demoNote}>
            <strong>No API key?</strong> Try the built-in Microsoft threat intelligence responses - they work without any setup!
          </div>
          {/* Extra padding to ensure Claude section is always reachable */}
          <div style={{ height: '2rem' }}></div>
        </div>
      )}

      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <MessageCircle size={48} />
            <h4>Welcome to AI Pipeline Assistant!</h4>
            <p>I can help you with pipeline monitoring, troubleshooting, and threat intelligence analysis.</p>
            {!openaiApiKey && !claudeApiKey && (
              <div>
                <p className={styles.mockNote}>
                  🚀 Try me now! I have built-in intelligence that works perfectly on mobile and all devices without any setup.
                </p>
                <p className={styles.demoNote}>
                  <strong>Enhanced AI Available:</strong> Click ⚙️ settings to add OpenAI or Claude API keys for even smarter responses (works best on desktop due to browser security policies).
                </p>
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
                  <p className={styles.mockNote}>
                    📱 <strong>Mobile Optimized:</strong> Running in enhanced demo mode - perfect for showcasing Microsoft threat intelligence capabilities!
                  </p>
                )}
              </div>
            )}
            {(openaiApiKey || claudeApiKey) && (
              <div>
                <p className={styles.aiReadyNote}>
                  🤖 AI Assistant is ready with {openaiApiKey && claudeApiKey ? 'OpenAI & Claude' : openaiApiKey ? 'OpenAI GPT-4' : 'Claude'} capabilities! Ask me anything about your pipelines.
                </p>
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
                  <p className={styles.mockNote}>
                    📱 Note: Mobile browsers may fall back to enhanced demo mode due to security restrictions.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.type]}`}
          >
            <div className={styles.messageContent}>
              {message.content.split('\n').map((line, index) => (
                <div key={index}>
                  {line.startsWith('**') && line.endsWith('**') ? (
                    <strong>{line.slice(2, -2)}</strong>
                  ) : line.startsWith('• ') ? (
                    <li style={{ marginLeft: '1rem' }}>{line.slice(2)}</li>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>
            <div className={styles.messageTime}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <Loader2 size={16} className={styles.loadingIcon} />
              AI is analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about pipelines, alerts, or troubleshooting..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className={styles.sendButton}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIPipelineAssistant;
