const { app } = require('@azure/functions');

app.http('ai-proxy', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'ai-chat',
    handler: async (request, context) => {
        context.log('AI Proxy function triggered');

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400'
                }
            };
        }

        try {
            // Get API keys from environment variables
            const openaiApiKey = process.env.OPENAI_API_KEY;
            const claudeApiKey = process.env.CLAUDE_API_KEY;

            if (!openaiApiKey && !claudeApiKey) {
                return {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: 'No AI API keys configured on server',
                        fallback: true
                    })
                };
            }

            // Parse request body
            const requestBody = await request.json();
            const { message, context: systemContext, preferredService = 'auto' } = requestBody;

            if (!message) {
                return {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Message is required' })
                };
            }

            // Build system prompt with context
            const systemPrompt = `You are a Microsoft Threat Intelligence pipeline expert assistant. You have access to 160 pipelines monitoring data from LinkedIn, Twitter, Office365, AzureAD, GitHub, and other sources. Help analysts troubleshoot issues and understand patterns.

Current system state:
- Total pipelines: ${systemContext?.totalPipelines || 160}
- Healthy: ${systemContext?.healthyPipelines || 135}
- Failed: ${systemContext?.failedPipelines || 8}
- Warning: ${systemContext?.warningPipelines || 12}
- Processing: ${systemContext?.processingPipelines || 5}
- Sources: ${systemContext?.sources?.join(', ') || 'LinkedIn, Twitter, Office365, AzureAD, GitHub, Others'}
- Current page: ${systemContext?.currentPage || 'overview'}
- Critical alerts: ${systemContext?.criticalAlerts || 3}

Be concise, actionable, and focus on Microsoft threat intelligence scenarios. Use markdown formatting for clarity. Provide specific technical recommendations and analysis.`;

            let aiResponse;
            let serviceUsed;

            // Try Claude first if available and preferred, otherwise OpenAI
            if (claudeApiKey && (preferredService === 'claude' || preferredService === 'auto')) {
                try {
                    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': claudeApiKey,
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

                    if (!claudeResponse.ok) {
                        throw new Error(`Claude API error: ${claudeResponse.status}`);
                    }

                    const claudeData = await claudeResponse.json();
                    aiResponse = claudeData.content[0].text;
                    serviceUsed = 'Claude AI';
                } catch (claudeError) {
                    context.log('Claude API failed:', claudeError.message);
                    
                    // Fall back to OpenAI if available
                    if (!openaiApiKey) {
                        throw claudeError;
                    }
                }
            }

            // Try OpenAI if Claude failed or not preferred
            if (!aiResponse && openaiApiKey) {
                try {
                    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${openaiApiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
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

                    if (!openaiResponse.ok) {
                        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
                    }

                    const openaiData = await openaiResponse.json();
                    aiResponse = openaiData.choices[0].message.content;
                    serviceUsed = 'OpenAI GPT-4';
                } catch (openaiError) {
                    context.log('OpenAI API failed:', openaiError.message);
                    throw openaiError;
                }
            }

            if (!aiResponse) {
                throw new Error('No AI service was able to generate a response');
            }

            // Add service attribution
            const responseWithAttribution = `${aiResponse}\n\n*✅ Response generated by ${serviceUsed} via secure Azure Function proxy.*`;

            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    response: responseWithAttribution,
                    service: serviceUsed,
                    timestamp: new Date().toISOString()
                })
            };

        } catch (error) {
            context.log('Error in AI proxy:', error);
            
            return {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'AI service temporarily unavailable',
                    fallback: true,
                    details: error.message
                })
            };
        }
    }
});
