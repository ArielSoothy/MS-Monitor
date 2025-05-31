import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  Clock, 
  Info, 
  RefreshCw,
  Target,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import { SimpleDecisionTree } from '../utils/decisionTree';
import { MockDataGenerator, FEATURE_EXPLANATIONS } from '../utils/mockDataGenerator';
import { PipelinePrediction, DecisionTreeModel } from '../types';
import HowItWorksModal from '../components/HowItWorksModal';
import InfoTooltip from '../components/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import styles from './PredictiveInsights.module.css';

const PredictiveInsights: React.FC = () => {
  const [model, setModel] = useState<DecisionTreeModel | null>(null);
  const [predictions, setPredictions] = useState<PipelinePrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PipelinePrediction | null>(null);
  const [isTraining, setIsTraining] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showModelExplanation, setShowModelExplanation] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Train the model and generate predictions
  const trainModel = useMemo(() => {
    const trainingData = MockDataGenerator.generateHistoricalData(mockPipelines, 1000);
    const enhancedData = MockDataGenerator.addSeasonalPatterns(trainingData);
    
    const tree = new SimpleDecisionTree(4, 10);
    return tree.train(enhancedData);
  }, []); // Only run once on component mount

  // Generate predictions for all pipelines
  const generatePredictions = (model: DecisionTreeModel): PipelinePrediction[] => {
    return mockPipelines.map(pipeline => {
      const features = MockDataGenerator.extractCurrentFeatures(pipeline);
      const tree = new SimpleDecisionTree();
      const prediction = tree.predict(model.tree, features);
      
      // Calculate risk score (0-100)
      const riskScore = prediction.willFail 
        ? 50 + (prediction.confidence * 50) 
        : 50 - (prediction.confidence * 50);

      // Generate reasoning
      const reasoning = generateReasoning(features, prediction.path);

      return {
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
        willFail: prediction.willFail,
        confidence: prediction.confidence,
        riskScore: Math.round(riskScore),
        reasoning,
        features,
        lastUpdated: new Date()
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  };

  // Generate human-readable reasoning
  const generateReasoning = (features: any, _path: string[]): string[] => {
    const reasons = [];
    
    if (features.hoursSinceLastRun > 4) {
      reasons.push(`Pipeline hasn't run for ${features.hoursSinceLastRun.toFixed(1)} hours`);
    }
    
    if (features.avgFailureRate > 15) {
      reasons.push(`High historical failure rate (${features.avgFailureRate.toFixed(1)}%)`);
    }
    
    if (features.dataVolumeVariance > 60) {
      reasons.push(`Unusual data volume variance (${features.dataVolumeVariance.toFixed(1)}%)`);
    }
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (features.dayOfWeek === 1 && features.hourOfDay >= 7 && features.hourOfDay <= 10) {
      reasons.push('Monday morning - high failure period');
    }
    
    if (features.dayOfWeek === 0 || features.dayOfWeek === 6) {
      reasons.push(`Weekend operation (${dayNames[features.dayOfWeek]}) - reduced monitoring`);
    }
    
    if (features.hourOfDay >= 23 || features.hourOfDay <= 5) {
      reasons.push('Off-hours operation - limited support availability');
    }
    
    if (features.hourOfDay >= 17 && features.hourOfDay <= 19) {
      reasons.push('End-of-day volume spike period');
    }
    
    return reasons.length > 0 ? reasons : ['Normal operating conditions'];
  };

  // Initialize model and predictions
  useEffect(() => {
    setIsTraining(true);
    
    // Simulate training time for realism
    setTimeout(() => {
      setModel(trainModel);
      const initialPredictions = generatePredictions(trainModel);
      setPredictions(initialPredictions);
      setIsTraining(false);
    }, 1500);
  }, [trainModel]);

  // Update predictions every minute
  useEffect(() => {
    if (!model) return;

    const interval = setInterval(() => {
      const updatedPredictions = generatePredictions(model);
      setPredictions(updatedPredictions);
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [model]);

  const atRiskPipelines = predictions.filter(p => p.willFail).slice(0, 5);
  const highConfidencePredictions = predictions.filter(p => p.confidence > 0.7);

  const getStatusColor = (riskScore: number) => {
    if (riskScore >= 70) return styles.critical;
    if (riskScore >= 50) return styles.warning;
    return styles.healthy;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isTraining) {
    return (
      <div className={styles.container}>
        <div className={styles.trainingOverlay}>
          <div className={styles.trainingContent}>
            <RefreshCw className={styles.spinningIcon} size={48} />
            <h2>Training Prediction Model</h2>
            <p>Analyzing 1,000 historical pipeline records...</p>
            <div className={styles.trainingProgress}>
              <div className={styles.progressBar}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Brain className={styles.headerIcon} />
            <div>
              <h1>
                Predictive Insights
                <button 
                  className={styles.infoButton}
                  onClick={() => setShowModelExplanation(true)}
                  title="How does this model work?"
                >
                  <HelpCircle size={18} />
                </button>
              </h1>
              <p>AI-powered pipeline health prediction using decision tree analysis</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.howItWorksButton}
              onClick={() => setShowHowItWorks(true)}
              title="Learn how this system works"
            >
              <HelpCircle size={16} />
              How does it work?
            </button>
            <div className={styles.lastUpdate}>
              <Clock size={16} />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
            <button 
              className={styles.modelButton}
              onClick={() => setShowModelDetails(!showModelDetails)}
            >
              <Target size={16} />
              Model Details
            </button>
          </div>
        </div>
      </header>

      <div className={styles.disclaimer}>
        <Info size={16} />
        <span>Predictions based on historical patterns - proof of concept for demonstration</span>
      </div>

      {/* Model Performance Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target className={styles.iconAccuracy} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{((model?.accuracy ?? 0) * 100).toFixed(1)}%</div>
            <div className={styles.statLabel}>
              Model Accuracy
              {getTooltipContent('modelAccuracy') && (
                <InfoTooltip 
                  {...getTooltipContent('modelAccuracy')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle className={styles.iconRisk} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{atRiskPipelines.length}</div>
            <div className={styles.statLabel}>
              Pipelines at Risk
              {getTooltipContent('pipelinesAtRisk') && (
                <InfoTooltip 
                  {...getTooltipContent('pipelinesAtRisk')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp className={styles.iconConfidence} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{highConfidencePredictions.length}</div>
            <div className={styles.statLabel}>
              High Confidence
              {getTooltipContent('highConfidencePredictions') && (
                <InfoTooltip 
                  {...getTooltipContent('highConfidencePredictions')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChart3 className={styles.iconSamples} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>1,000</div>
            <div className={styles.statLabel}>
              Training Samples
              {getTooltipContent('trainingSamples') && (
                <InfoTooltip 
                  {...getTooltipContent('trainingSamples')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* At Risk Pipelines */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={20} />
            Pipelines at Risk (Next 2 Hours)
          </h2>
          
          {atRiskPipelines.length === 0 ? (
            <div className={styles.noRisk}>
              <Target size={48} />
              <h3>All Pipelines Looking Good!</h3>
              <p>No pipelines are predicted to fail in the next 2 hours.</p>
            </div>
          ) : (
            <div className={styles.riskGrid}>
              {atRiskPipelines.map(prediction => (
                <div 
                  key={prediction.pipelineId} 
                  className={`${styles.riskCard} ${getStatusColor(prediction.riskScore)}`}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitle}>{prediction.pipelineName}</div>
                    <div className={styles.riskScore}>
                      {prediction.riskScore}%
                      {getTooltipContent('riskScore') && (
                        <InfoTooltip 
                          {...getTooltipContent('riskScore')!} 
                          position="left"
                          size="medium"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.riskDetails}>
                    <div className={styles.confidence}>
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      {getTooltipContent('predictionConfidence') && (
                        <InfoTooltip 
                          {...getTooltipContent('predictionConfidence')!} 
                          position="bottom"
                          size="medium"
                        />
                      )}
                    </div>
                    
                    <div className={styles.reasoning}>
                      <ul>
                        {prediction.reasoning.slice(0, 2).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                        {prediction.reasoning.length > 2 && (
                          <li>+{prediction.reasoning.length - 2} more factors</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Details */}
        {showModelDetails && model && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Brain size={20} />
              Decision Tree Model
              {getTooltipContent('decisionTreeModel') && (
                <InfoTooltip 
                  {...getTooltipContent('decisionTreeModel')!} 
                  position="bottom"
                  size="large"
                />
              )}
            </h2>
            
            <div className={styles.modelDetails}>
              <div className={styles.modelInfo}>
                <h3>Model Information</h3>
                <div className={styles.modelStats}>
                  <div>Training Date: {model.trainingDate.toLocaleDateString()}</div>
                  <div>Max Depth: 4 levels</div>
                  <div>Min Samples per Leaf: 10</div>
                  <div>Training Accuracy: {(model.accuracy * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className={styles.featureImportance}>
                <h3>
                  Feature Importance
                  {getTooltipContent('featureImportance') && (
                    <InfoTooltip 
                      {...getTooltipContent('featureImportance')!} 
                      position="bottom"
                      size="large"
                    />
                  )}
                </h3>
                <div className={styles.importanceChart}>
                  {Object.entries(model.featureImportance).map(([feature, importance]) => (
                    <div key={feature} className={styles.importanceRow}>
                      <div className={styles.featureName}>
                        {FEATURE_EXPLANATIONS[feature as keyof typeof FEATURE_EXPLANATIONS]?.name || feature}
                      </div>
                      <div className={styles.importanceBar}>
                        <div 
                          className={styles.importanceFill}
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <div className={styles.importanceValue}>
                        {(importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Details Modal */}
      {selectedPrediction && (
        <div className={styles.modal} onClick={() => setSelectedPrediction(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedPrediction.pipelineName}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedPrediction(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.predictionSummary}>
                <div className={`${styles.predictionResult} ${selectedPrediction.willFail ? styles.willFail : styles.willNotFail}`}>
                  <div className={styles.predictionText}>
                    {selectedPrediction.willFail ? 'WILL LIKELY FAIL' : 'SHOULD RUN NORMALLY'}
                  </div>
                  <div className={styles.predictionConfidence}>
                    {(selectedPrediction.confidence * 100).toFixed(1)}% confidence
                  </div>
                  <div className={styles.riskScoreDisplay}>
                    Risk Score: {selectedPrediction.riskScore}%
                  </div>
                </div>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Why this prediction?</h3>
                <ul className={styles.reasoningList}>
                  {selectedPrediction.reasoning.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.featuresSection}>
                <h3>Current Features</h3>
                <div className={styles.featureGrid}>
                  {Object.entries(selectedPrediction.features).map(([feature, value]) => {
                    const explanation = FEATURE_EXPLANATIONS[feature as keyof typeof FEATURE_EXPLANATIONS];
                    return (
                      <div key={feature} className={styles.featureCard}>
                        <div className={styles.featureValue}>
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </div>
                        <div className={styles.featureName}>{explanation?.name || feature}</div>
                        <div className={styles.featureDescription}>{explanation?.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Explanation Modal */}
      {showModelExplanation && (
        <div className={styles.modal} onClick={() => setShowModelExplanation(false)}>
          <div className={styles.modelExplanationModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>How the Prediction Model Works</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModelExplanation(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.explanationSection}>
                <h3>🧠 The Algorithm: Decision Tree</h3>
                <p>
                  Our model uses a <strong>Decision Tree</strong> - think of it like a flowchart that asks yes/no questions 
                  about your pipeline to predict if it will fail in the next 2 hours.
                </p>
                
                <div className={styles.algorithmSteps}>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                      <h4>Data Collection</h4>
                      <p>We analyze 1,000 historical pipeline runs with their success/failure outcomes</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                      <h4>Feature Analysis</h4>
                      <p>For each pipeline, we look at 5 key factors: hours since last run, failure rate, data volume variance, day of week, and time of day</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                      <h4>Tree Building</h4>
                      <p>The algorithm finds the best questions to ask (like "Has it been more than 4 hours since last run?") to separate healthy from failing pipelines</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>4</div>
                    <div className={styles.stepContent}>
                      <h4>Prediction</h4>
                      <p>For a new pipeline, we follow the decision path and get a prediction with confidence score</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>📊 What We Look At (Features)</h3>
                <div className={styles.featureExplanations}>
                  <div className={styles.featureExplanation}>
                    <h4>⏰ Hours Since Last Run</h4>
                    <p>Pipelines that haven't run recently often have accumulated issues. If it's been more than 4-6 hours, failure risk increases significantly.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📈 Average Failure Rate</h4>
                    <p>Historical reliability matters. Pipelines with 15%+ failure rates are inherently riskier than those with 2% failure rates.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📊 Data Volume Variance</h4>
                    <p>Unusual data volumes can overwhelm processing capacity. High variance (60%+) often signals incoming problems.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📅 Day of Week</h4>
                    <p>Monday mornings show higher failure rates (post-weekend maintenance effects). Weekends have less monitoring coverage.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>🕐 Hour of Day</h4>
                    <p>Off-hours (nights/weekends) have higher failure rates due to reduced monitoring and support availability.</p>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>🎯 Example Decision Path</h3>
                <div className={styles.decisionExample}>
                  <div className={styles.decisionPath}>
                    <div className={styles.decisionNode}>
                      <strong>Question 1:</strong> Has it been more than 4 hours since last run?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → Higher Risk</span>
                        <span className={styles.noPath}>NO → Continue...</span>
                      </div>
                    </div>
                    
                    <div className={styles.decisionNode}>
                      <strong>Question 2:</strong> Is the failure rate above 15%?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → High Risk</span>
                        <span className={styles.noPath}>NO → Continue...</span>
                      </div>
                    </div>
                    
                    <div className={styles.decisionNode}>
                      <strong>Question 3:</strong> Is it Monday morning (7-10 AM)?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → 85% Failure Risk</span>
                        <span className={styles.noPath}>NO → 15% Failure Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>✅ Why This Approach Works</h3>
                <div className={styles.whyItWorks}>
                  <div className={styles.benefit}>
                    <h4>Interpretable</h4>
                    <p>Every prediction comes with clear reasoning you can explain to stakeholders</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Fast</h4>
                    <p>Decision trees make predictions in milliseconds, perfect for real-time monitoring</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Realistic</h4>
                    <p>80% accuracy reflects real-world performance - not suspiciously perfect</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Actionable</h4>
                    <p>Identifies specific risk factors teams can address proactively</p>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>⚠️ Limitations & Considerations</h3>
                <ul className={styles.limitations}>
                  <li><strong>Proof of Concept:</strong> This is a demonstration model, not production-ready</li>
                  <li><strong>Training Data:</strong> Uses simulated historical data with realistic patterns</li>
                  <li><strong>Simple Features:</strong> Real systems would include more sophisticated metrics</li>
                  <li><strong>Static Model:</strong> Production systems would retrain regularly with new data</li>
                  <li><strong>Human Oversight:</strong> Predictions should always be validated by domain experts</li>
                </ul>
              </div>

              <div className={styles.explanationFooter}>
                <p><strong>Perfect for interviews:</strong> Shows you understand ML fundamentals, can explain complex concepts simply, and think about practical production considerations!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="predictiveInsights"
      />
    </div>
  );
};

export default PredictiveInsights;
