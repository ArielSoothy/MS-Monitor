// Simple Decision Tree Implementation for Pipeline Health Prediction
import { DecisionNode, HistoricalRecord, PredictionFeatures, DecisionTreeModel } from '../types';

export class SimpleDecisionTree {
  private maxDepth: number;
  private minSamplesLeaf: number;

  constructor(maxDepth = 4, minSamplesLeaf = 5) {
    this.maxDepth = maxDepth;
    this.minSamplesLeaf = minSamplesLeaf;
  }

  // Calculate Gini impurity
  private calculateGini(samples: HistoricalRecord[]): number {
    if (samples.length === 0) return 0;
    
    const positives = samples.filter(s => s.willFailInNext2Hours).length;
    const negatives = samples.length - positives;
    const posRatio = positives / samples.length;
    const negRatio = negatives / samples.length;
    
    return 1 - (posRatio * posRatio + negRatio * negRatio);
  }

  // Find best split for a feature
  private findBestSplit(samples: HistoricalRecord[]): { 
    feature: keyof PredictionFeatures; 
    threshold: number; 
    gain: number 
  } | null {
    let bestGain = 0;
    let bestFeature: keyof PredictionFeatures | null = null;
    let bestThreshold = 0;

    const features: (keyof PredictionFeatures)[] = [
      'hoursSinceLastRun', 
      'avgFailureRate', 
      'dataVolumeVariance', 
      'dayOfWeek', 
      'hourOfDay'
    ];

    const parentGini = this.calculateGini(samples);

    for (const feature of features) {
      // Get unique values for this feature and sort them
      const values = [...new Set(samples.map(s => s[feature]))].sort((a, b) => a - b);
      
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        
        const leftSamples = samples.filter(s => s[feature] <= threshold);
        const rightSamples = samples.filter(s => s[feature] > threshold);
        
        if (leftSamples.length === 0 || rightSamples.length === 0) continue;
        
        const leftGini = this.calculateGini(leftSamples);
        const rightGini = this.calculateGini(rightSamples);
        
        const weightedGini = (leftSamples.length / samples.length) * leftGini + 
                           (rightSamples.length / samples.length) * rightGini;
        
        const gain = parentGini - weightedGini;
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }

    return bestFeature ? { feature: bestFeature, threshold: bestThreshold, gain: bestGain } : null;
  }

  // Build the decision tree recursively
  private buildTree(samples: HistoricalRecord[], depth = 0): DecisionNode {
    const failures = samples.filter(s => s.willFailInNext2Hours).length;
    const total = samples.length;
    const failureRate = failures / total;

    // Base cases
    if (depth >= this.maxDepth || 
        total < this.minSamplesLeaf || 
        failures === 0 || 
        failures === total) {
      return {
        prediction: failureRate >= 0.5,
        confidence: Math.max(failureRate, 1 - failureRate),
        sampleCount: total
      };
    }

    const bestSplit = this.findBestSplit(samples);
    if (!bestSplit || bestSplit.gain < 0.01) {
      return {
        prediction: failureRate >= 0.5,
        confidence: Math.max(failureRate, 1 - failureRate),
        sampleCount: total
      };
    }

    const leftSamples = samples.filter(s => s[bestSplit.feature] <= bestSplit.threshold);
    const rightSamples = samples.filter(s => s[bestSplit.feature] > bestSplit.threshold);

    return {
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: this.buildTree(leftSamples, depth + 1),
      right: this.buildTree(rightSamples, depth + 1),
      sampleCount: total
    };
  }

  // Train the model
  train(data: HistoricalRecord[]): DecisionTreeModel {
    const tree = this.buildTree(data);
    
    // Calculate accuracy on training data (in real scenario, use test set)
    let correct = 0;
    for (const sample of data) {
      const prediction = this.predict(tree, sample);
      if (prediction.willFail === sample.willFailInNext2Hours) {
        correct++;
      }
    }
    
    const accuracy = correct / data.length;

    // Calculate feature importance (simplified)
    const featureImportance = this.calculateFeatureImportance(tree);

    return {
      tree,
      accuracy,
      trainingDate: new Date(),
      featureImportance
    };
  }

  // Make a prediction for a single sample
  predict(tree: DecisionNode, features: PredictionFeatures): { 
    willFail: boolean; 
    confidence: number; 
    path: string[] 
  } {
    const path: string[] = [];
    let currentNode = tree;

    while (currentNode.feature && currentNode.threshold !== undefined) {
      const featureValue = features[currentNode.feature];
      const condition = `${currentNode.feature} ${featureValue <= currentNode.threshold ? '≤' : '>'} ${currentNode.threshold.toFixed(2)}`;
      path.push(condition);

      if (featureValue <= currentNode.threshold) {
        currentNode = currentNode.left!;
      } else {
        currentNode = currentNode.right!;
      }
    }

    return {
      willFail: currentNode.prediction || false,
      confidence: currentNode.confidence || 0.5,
      path
    };
  }

  // Calculate feature importance (simplified approach)
  private calculateFeatureImportance(tree: DecisionNode): Record<keyof PredictionFeatures, number> {
    const importance: Record<keyof PredictionFeatures, number> = {
      hoursSinceLastRun: 0,
      avgFailureRate: 0,
      dataVolumeVariance: 0,
      dayOfWeek: 0,
      hourOfDay: 0
    };

    const traverse = (node: DecisionNode, depth: number) => {
      if (node.feature) {
        // Weight importance by depth (higher for nodes closer to root)
        const weight = 1 / (depth + 1);
        importance[node.feature] += weight;
      }
      if (node.left) traverse(node.left, depth + 1);
      if (node.right) traverse(node.right, depth + 1);
    };

    traverse(tree, 0);

    // Normalize to sum to 1
    const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(importance).forEach(key => {
        importance[key as keyof PredictionFeatures] /= total;
      });
    }

    return importance;
  }

  // Extract rules from the tree for human interpretation
  extractRules(tree: DecisionNode, path: string[] = []): string[] {
    if (!tree.feature || tree.threshold === undefined) {
      const prediction = tree.prediction ? 'WILL FAIL' : 'WILL NOT FAIL';
      const confidence = ((tree.confidence || 0.5) * 100).toFixed(1);
      const rule = `IF ${path.join(' AND ')} THEN ${prediction} (${confidence}% confidence)`;
      return [rule];
    }

    const leftPath = [...path, `${tree.feature} ≤ ${tree.threshold.toFixed(2)}`];
    const rightPath = [...path, `${tree.feature} > ${tree.threshold.toFixed(2)}`];

    return [
      ...this.extractRules(tree.left!, leftPath),
      ...this.extractRules(tree.right!, rightPath)
    ];
  }
}
