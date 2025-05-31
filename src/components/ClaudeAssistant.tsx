import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Settings, Eye, EyeOff, ExternalLink } from 'lucide-react';
import styles from './AIPipelineAssistant.module.css';
import { mockPipelines } from '../data/mockData';
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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('ai-assistant-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('ai-assistant-api-key', apiKey.trim());
      setShowApiKeyInput(false);
      addMessage('assistant', '🔑 API key saved! I can now provide enhanced responses using AI capabilities.');
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('ai-assistant-api-key');
    setApiKey('');
    setShowApiKeyInput(false);
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
    
    // Pipeline status queries
    if (lowerQuery.includes('failed') && lowerQuery.includes('linkedin')) {
      const failedLinkedIn = mockPipelines.filter(p => 
        p.source === 'LinkedIn' && p.status === 'failed'
      );
      return `I found ${failedLinkedIn.length} failed LinkedIn pipelines:\n\n${failedLinkedIn.map(p => 
        `• **${p.name}** - Failed ${Math.floor((Date.now() - p.lastRun.getTime()) / (1000 * 60))} minutes ago\n  Reason: ${p.lastFailureReason || 'Connection timeout'}`
      ).join('\n\n')}\n\n**Recommendation:** Check API rate limits and authentication tokens.`;
    }

    if (lowerQuery.includes('slowest') || lowerQuery.includes('slow')) {
      const slowPipelines = mockPipelines
        .sort((a, b) => b.avgProcessingTime - a.avgProcessingTime)
        .slice(0, 5);
      return `Here are the 5 slowest pipelines this week:\n\n${slowPipelines.map(p => 
        `• **${p.name}** (${p.source})\n  Average: ${p.avgProcessingTime.toFixed(1)} minutes\n  SLA: ${p.slaRequirement} minutes`
      ).join('\n\n')}\n\n**Analysis:** ${slowPipelines[0].avgProcessingTime > slowPipelines[0].slaRequirement ? 'Several pipelines are exceeding SLA requirements. Consider scaling resources.' : 'All pipelines within acceptable ranges.'}`;
    }

    if (lowerQuery.includes('european') || lowerQuery.includes('eu')) {
      const euPipelines = mockPipelines.filter(p => p.region === 'EU');
      const euStatus = {
        healthy: euPipelines.filter(p => p.status === 'healthy').length,
        warning: euPipelines.filter(p => p.status === 'warning').length,
        failed: euPipelines.filter(p => p.status === 'failed').length
      };
      return `European data sources status:\n\n**Total EU Pipelines:** ${euPipelines.length}\n• ✅ Healthy: ${euStatus.healthy}\n• ⚠️ Warning: ${euStatus.warning}\n• ❌ Failed: ${euStatus.failed}\n\n**Geographic Distribution:** GDPR-compliant data processing in EU regions.`;
    }

    // Alert summarization
    if (lowerQuery.includes('critical') && lowerQuery.includes('alert')) {
      return `**Critical Alerts Summary:**\n\n${context.criticalAlerts} critical alerts detected:\n\n• **High Priority:** LinkedIn ThreatActors pipeline showing 15% failure rate\n• **Infrastructure:** Azure AD authentication intermittent failures\n• **Data Quality:** Twitter sentiment analysis accuracy below 85%\n\n**Investigation Priority:**\n1. Check authentication tokens\n2. Review rate limiting policies\n3. Validate data quality thresholds`;
    }

    // Root cause analysis
    if (lowerQuery.includes('twitter') && (lowerQuery.includes('fail') || lowerQuery.includes('3 hour'))) {
      return `**Root Cause Analysis: Twitter Pipeline Failures**\n\n**Pattern Detected:** Failures every ~3 hours suggests API rate limiting.\n\n**Similar Historical Issues:**\n• March 2024: Twitter API v2 rate limits exceeded\n• January 2024: Authentication token rotation issues\n\n**Recommended Actions:**\n1. **Immediate:** Implement exponential backoff\n2. **Short-term:** Distribute load across multiple API keys\n3. **Long-term:** Upgrade to Twitter Enterprise API\n\n**Technical Details:** 429 errors correlate with request peaks during business hours.`;
    }

    // Interactive troubleshooting
    if (lowerQuery.includes('slow') && !lowerQuery.includes('slowest')) {
      return `**Pipeline Performance Troubleshooting Guide**\n\nTo help diagnose the slow pipeline, I need more information:\n\n**Questions:**\n1. Which specific pipeline is experiencing slowness?\n2. When did you first notice the performance degradation?\n3. Are there any recent configuration changes?\n\n**Common Causes:**\n• Data volume increase\n• Downstream service bottlenecks\n• Resource constraints\n• Network latency\n\n**Quick Checks:**\n1. Monitor CPU/memory usage\n2. Check downstream service health\n3. Review recent deployment logs`;
    }

    // General status queries
    if (lowerQuery.includes('status') || lowerQuery.includes('overview')) {
      return `**Current Pipeline Status Overview:**\n\n📊 **Total Pipelines:** ${context.totalPipelines}\n✅ **Healthy:** ${context.healthyPipelines} (${Math.round((context.healthyPipelines / context.totalPipelines) * 100)}%)\n⚠️ **Warning:** ${context.warningPipelines}\n❌ **Failed:** ${context.failedPipelines}\n🔄 **Processing:** ${context.processingPipelines}\n\n**Top Sources:** ${context.sources.slice(0, 3).join(', ')}\n\n**Quick Actions:**\n• Review failed pipelines for immediate attention\n• Check warning pipelines for potential issues\n• Monitor processing pipelines for completion`;
    }

    // Default intelligent response
    return `**AI Pipeline Assistant Ready** 🤖\n\nI can help you with:\n\n**📊 Status Queries:**\n• "Which LinkedIn pipelines failed today?"\n• "Show me the slowest pipelines this week"\n• "What's the status of European data sources?"\n\n**🚨 Alert Analysis:**\n• "Summarize all critical alerts"\n• "Group related alerts by severity"\n• "What are the investigation priorities?"\n\n**🔍 Troubleshooting:**\n• "Twitter pipeline failing every 3 hours"\n• "Help me diagnose slow performance"\n• "Root cause analysis for authentication errors"\n\n**Current Context:** ${context.totalPipelines} pipelines, ${context.failedPipelines} failed, ${context.criticalAlerts} critical alerts\n\nWhat would you like me to help you with?`;
  };

  const callAIAPI = async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const context = getSystemContext();
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      let response: string;
      
      if (apiKey) {
        // Try AI API first
        try {
          response = await callAIAPI(userMessage);
        } catch (apiError) {
          console.warn('AI API failed, using mock response:', apiError);
          response = generateMockResponse(userMessage);
        }
      } else {
        // Use mock response
        response = generateMockResponse(userMessage);
      }

      addMessage('assistant', response);
    } catch (error) {
      console.error('Error getting response:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again or check your API key configuration.');
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
            <p>Pipeline Intelligence & Troubleshooting</p>
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
          <h4>AI API Configuration</h4>
          <p>
            Get your API key from{' '}
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
              Anthropic Console <ExternalLink size={12} />
            </a>
          </p>
          <div className={styles.apiKeyInput}>
            <input
              type={showApiKey ? 'text' : 'password'}
              placeholder="sk-ant-api03-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className={styles.toggleVisibility}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className={styles.apiKeyActions}>
            <button onClick={saveApiKey} className={styles.saveButton}>
              Save Key
            </button>
            {localStorage.getItem('ai-assistant-api-key') && (
              <button onClick={clearApiKey} className={styles.clearButton}>
                Clear Key
              </button>
            )}
          </div>
          <div className={styles.costWarning}>
            💡 Cost: ~$0.001 per query with claude-3-haiku
          </div>
        </div>
      )}

      <div className={styles.chatMessages}>
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            <MessageCircle size={48} />
            <h4>Welcome to AI Pipeline Assistant!</h4>
            <p>I can help you with pipeline monitoring, troubleshooting, and threat intelligence analysis.</p>
            {!apiKey && (
              <p className={styles.mockNote}>
                💡 Configure your AI API key for enhanced responses, or try the built-in intelligence.
              </p>
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
