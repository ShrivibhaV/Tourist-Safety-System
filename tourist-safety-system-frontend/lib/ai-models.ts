// AI model configurations and utilities for anomaly detection

export interface ModelConfig {
  name: string
  version: string
  accuracy: number
  latency: number // in milliseconds
  isActive: boolean
  lastUpdated: string
}

export interface TrainingData {
  locationPoints: number
  anomalyExamples: number
  normalBehaviorSamples: number
  lastTrainingDate: string
}

export class AIModelManager {
  private static instance: AIModelManager
  private models: Map<string, ModelConfig> = new Map()
  private trainingData: TrainingData

  static getInstance(): AIModelManager {
    if (!AIModelManager.instance) {
      AIModelManager.instance = new AIModelManager()
    }
    return AIModelManager.instance
  }

  constructor() {
    this.initializeModels()
    this.trainingData = {
      locationPoints: 2847392,
      anomalyExamples: 15847,
      normalBehaviorSamples: 892456,
      lastTrainingDate: "2024-01-10T08:00:00Z",
    }
  }

  private initializeModels(): void {
    const defaultModels: ModelConfig[] = [
      {
        name: "Movement Pattern Analyzer",
        version: "2.1.3",
        accuracy: 94.2,
        latency: 120,
        isActive: true,
        lastUpdated: "2024-01-10T08:00:00Z",
      },
      {
        name: "Panic Detection Model",
        version: "1.8.7",
        accuracy: 91.8,
        latency: 95,
        isActive: true,
        lastUpdated: "2024-01-08T14:30:00Z",
      },
      {
        name: "Zone Violation Detector",
        version: "3.0.1",
        accuracy: 98.5,
        latency: 45,
        isActive: true,
        lastUpdated: "2024-01-12T10:15:00Z",
      },
      {
        name: "Risk Assessment Engine",
        version: "2.5.2",
        accuracy: 89.7,
        latency: 200,
        isActive: true,
        lastUpdated: "2024-01-09T16:45:00Z",
      },
    ]

    defaultModels.forEach((model) => {
      this.models.set(model.name, model)
    })
  }

  // Get all models
  getModels(): ModelConfig[] {
    return Array.from(this.models.values())
  }

  // Get active models only
  getActiveModels(): ModelConfig[] {
    return this.getModels().filter((model) => model.isActive)
  }

  // Get model by name
  getModel(name: string): ModelConfig | undefined {
    return this.models.get(name)
  }

  // Update model configuration
  updateModel(name: string, updates: Partial<ModelConfig>): boolean {
    const model = this.models.get(name)
    if (!model) return false

    const updatedModel = { ...model, ...updates, lastUpdated: new Date().toISOString() }
    this.models.set(name, updatedModel)
    return true
  }

  // Toggle model active status
  toggleModel(name: string): boolean {
    const model = this.models.get(name)
    if (!model) return false

    return this.updateModel(name, { isActive: !model.isActive })
  }

  // Get system performance metrics
  getSystemMetrics(): {
    totalModels: number
    activeModels: number
    averageAccuracy: number
    averageLatency: number
    systemHealth: "excellent" | "good" | "fair" | "poor"
  } {
    const activeModels = this.getActiveModels()
    const totalModels = this.getModels().length

    const averageAccuracy =
      activeModels.length > 0 ? activeModels.reduce((sum, model) => sum + model.accuracy, 0) / activeModels.length : 0

    const averageLatency =
      activeModels.length > 0 ? activeModels.reduce((sum, model) => sum + model.latency, 0) / activeModels.length : 0

    let systemHealth: "excellent" | "good" | "fair" | "poor" = "poor"
    if (averageAccuracy >= 95 && averageLatency <= 100) systemHealth = "excellent"
    else if (averageAccuracy >= 90 && averageLatency <= 150) systemHealth = "good"
    else if (averageAccuracy >= 85 && averageLatency <= 200) systemHealth = "fair"

    return {
      totalModels,
      activeModels: activeModels.length,
      averageAccuracy,
      averageLatency,
      systemHealth,
    }
  }

  // Get training data information
  getTrainingData(): TrainingData {
    return this.trainingData
  }

  // Simulate model retraining
  async retrainModel(modelName: string): Promise<boolean> {
    const model = this.models.get(modelName)
    if (!model) return false

    // Simulate training process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate improved accuracy
    const accuracyImprovement = Math.random() * 2 - 1 // -1% to +1%
    const newAccuracy = Math.min(99.9, Math.max(80, model.accuracy + accuracyImprovement))

    return this.updateModel(modelName, {
      accuracy: Number(newAccuracy.toFixed(1)),
      version: this.incrementVersion(model.version),
    })
  }

  // Increment version number
  private incrementVersion(version: string): string {
    const parts = version.split(".")
    const patch = Number.parseInt(parts[2] || "0") + 1
    return `${parts[0]}.${parts[1]}.${patch}`
  }

  // Get model recommendations based on performance
  getModelRecommendations(): Array<{
    model: string
    recommendation: string
    priority: "high" | "medium" | "low"
  }> {
    const recommendations: Array<{
      model: string
      recommendation: string
      priority: "high" | "medium" | "low"
    }> = []

    this.getModels().forEach((model) => {
      if (model.accuracy < 85) {
        recommendations.push({
          model: model.name,
          recommendation: "Model accuracy below threshold. Consider retraining.",
          priority: "high",
        })
      } else if (model.latency > 250) {
        recommendations.push({
          model: model.name,
          recommendation: "High latency detected. Optimize model performance.",
          priority: "medium",
        })
      } else if (!model.isActive) {
        recommendations.push({
          model: model.name,
          recommendation: "Model is inactive. Consider activating if needed.",
          priority: "low",
        })
      }

      // Check if model needs updating (older than 7 days)
      const lastUpdated = new Date(model.lastUpdated)
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate > 7) {
        recommendations.push({
          model: model.name,
          recommendation: `Model hasn't been updated in ${Math.floor(daysSinceUpdate)} days. Consider retraining.`,
          priority: "medium",
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

// Export singleton instance
export const aiModelManager = AIModelManager.getInstance()
