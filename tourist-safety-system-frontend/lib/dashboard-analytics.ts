// Analytics and reporting utilities for the admin dashboard

export interface DashboardMetrics {
  totalTourists: number
  activeTourists: number
  totalIncidents: number
  openIncidents: number
  resolvedIncidents: number
  averageResponseTime: number
  safetyScore: number
  criticalAlerts: number
}

export interface IncidentTrend {
  date: string
  emergency: number
  medical: number
  theft: number
  lost: number
  total: number
}

export interface ResponseTimeMetrics {
  critical: { average: number; target: number }
  high: { average: number; target: number }
  medium: { average: number; target: number }
  low: { average: number; target: number }
}

export interface ZoneActivity {
  zoneId: string
  zoneName: string
  touristCount: number
  incidentCount: number
  riskLevel: number
  safetyScore: number
}

export class DashboardAnalytics {
  private static instance: DashboardAnalytics
  private metricsHistory: Map<string, DashboardMetrics[]> = new Map()

  static getInstance(): DashboardAnalytics {
    if (!DashboardAnalytics.instance) {
      DashboardAnalytics.instance = new DashboardAnalytics()
    }
    return DashboardAnalytics.instance
  }

  // Get current dashboard metrics
  getCurrentMetrics(): DashboardMetrics {
    return {
      totalTourists: 1247,
      activeTourists: 892,
      totalIncidents: 23,
      openIncidents: 7,
      resolvedIncidents: 16,
      averageResponseTime: 4.2,
      safetyScore: 87,
      criticalAlerts: 3,
    }
  }

  // Get incident trends over time
  getIncidentTrends(days = 7): IncidentTrend[] {
    const trends: IncidentTrend[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Mock data - in real implementation, this would query the database
      const emergency = Math.floor(Math.random() * 5) + 1
      const medical = Math.floor(Math.random() * 8) + 2
      const theft = Math.floor(Math.random() * 12) + 3
      const lost = Math.floor(Math.random() * 6) + 1

      trends.push({
        date: date.toISOString().split("T")[0],
        emergency,
        medical,
        theft,
        lost,
        total: emergency + medical + theft + lost,
      })
    }

    return trends
  }

  // Get response time metrics by priority
  getResponseTimeMetrics(): ResponseTimeMetrics {
    return {
      critical: { average: 2.1, target: 3.0 },
      high: { average: 4.8, target: 5.0 },
      medium: { average: 8.2, target: 10.0 },
      low: { average: 15.5, target: 20.0 },
    }
  }

  // Get zone activity data
  getZoneActivity(): ZoneActivity[] {
    return [
      {
        zoneId: "zone-1",
        zoneName: "Times Square",
        touristCount: 234,
        incidentCount: 3,
        riskLevel: 2,
        safetyScore: 85,
      },
      {
        zoneId: "zone-2",
        zoneName: "Central Park",
        touristCount: 189,
        incidentCount: 1,
        riskLevel: 1,
        safetyScore: 92,
      },
      {
        zoneId: "zone-3",
        zoneName: "Brooklyn Bridge",
        touristCount: 156,
        incidentCount: 2,
        riskLevel: 2,
        safetyScore: 88,
      },
      {
        zoneId: "zone-4",
        zoneName: "Financial District",
        touristCount: 98,
        incidentCount: 0,
        riskLevel: 1,
        safetyScore: 95,
      },
    ]
  }

  // Calculate safety score based on various factors
  calculateSafetyScore(
    totalIncidents: number,
    resolvedIncidents: number,
    averageResponseTime: number,
    activeTourists: number,
  ): number {
    // Base score
    let score = 100

    // Deduct points for incident rate
    const incidentRate = totalIncidents / activeTourists
    score -= incidentRate * 1000 // Adjust multiplier as needed

    // Deduct points for slow response times
    if (averageResponseTime > 5) {
      score -= (averageResponseTime - 5) * 2
    }

    // Add points for high resolution rate
    const resolutionRate = resolvedIncidents / totalIncidents
    score += resolutionRate * 10

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // Get performance insights and recommendations
  getPerformanceInsights(): Array<{
    type: "success" | "warning" | "error" | "info"
    title: string
    description: string
    recommendation?: string
  }> {
    const metrics = this.getCurrentMetrics()
    const responseMetrics = this.getResponseTimeMetrics()
    const insights: Array<{
      type: "success" | "warning" | "error" | "info"
      title: string
      description: string
      recommendation?: string
    }> = []

    // Safety score analysis
    if (metrics.safetyScore >= 90) {
      insights.push({
        type: "success",
        title: "Excellent Safety Performance",
        description: `Current safety score of ${metrics.safetyScore} indicates optimal tourist safety conditions.`,
      })
    } else if (metrics.safetyScore >= 75) {
      insights.push({
        type: "warning",
        title: "Good Safety Performance",
        description: `Safety score of ${metrics.safetyScore} is good but has room for improvement.`,
        recommendation: "Focus on reducing incident response times and increasing resolution rates.",
      })
    } else {
      insights.push({
        type: "error",
        title: "Safety Performance Needs Attention",
        description: `Safety score of ${metrics.safetyScore} indicates potential safety concerns.`,
        recommendation: "Immediate review of safety protocols and resource allocation recommended.",
      })
    }

    // Response time analysis
    if (responseMetrics.critical.average > responseMetrics.critical.target) {
      insights.push({
        type: "error",
        title: "Critical Response Time Exceeded",
        description: `Average critical response time of ${responseMetrics.critical.average} minutes exceeds target of ${responseMetrics.critical.target} minutes.`,
        recommendation: "Consider increasing emergency response resources or optimizing dispatch procedures.",
      })
    }

    // Incident resolution rate
    const resolutionRate = (metrics.resolvedIncidents / metrics.totalIncidents) * 100
    if (resolutionRate >= 85) {
      insights.push({
        type: "success",
        title: "High Incident Resolution Rate",
        description: `${resolutionRate.toFixed(1)}% of incidents have been successfully resolved.`,
      })
    } else if (resolutionRate >= 70) {
      insights.push({
        type: "warning",
        title: "Moderate Incident Resolution Rate",
        description: `${resolutionRate.toFixed(1)}% resolution rate could be improved.`,
        recommendation: "Review incident handling procedures and officer training programs.",
      })
    } else {
      insights.push({
        type: "error",
        title: "Low Incident Resolution Rate",
        description: `${resolutionRate.toFixed(1)}% resolution rate requires immediate attention.`,
        recommendation: "Urgent review of incident management processes and resource allocation needed.",
      })
    }

    // Tourist activity analysis
    const activityRate = (metrics.activeTourists / metrics.totalTourists) * 100
    if (activityRate >= 80) {
      insights.push({
        type: "info",
        title: "High Tourist Activity",
        description: `${activityRate.toFixed(1)}% of registered tourists are currently active.`,
        recommendation: "Ensure adequate monitoring resources are available during peak activity periods.",
      })
    }

    return insights
  }

  // Generate executive summary report
  generateExecutiveSummary(): {
    period: string
    keyMetrics: DashboardMetrics
    trends: {
      touristGrowth: number
      incidentChange: number
      responseTimeImprovement: number
    }
    topConcerns: string[]
    recommendations: string[]
  } {
    const metrics = this.getCurrentMetrics()

    return {
      period: "Last 7 Days",
      keyMetrics: metrics,
      trends: {
        touristGrowth: 12, // +12%
        incidentChange: -8, // -8%
        responseTimeImprovement: 15, // 15% faster
      },
      topConcerns: [
        "Critical response time slightly above target",
        "Increased theft incidents in tourist areas",
        "Need for additional multilingual support",
      ],
      recommendations: [
        "Deploy additional emergency response units during peak hours",
        "Increase security presence in high-theft areas",
        "Expand multilingual officer training program",
        "Implement predictive analytics for incident prevention",
      ],
    }
  }

  // Export data for reporting
  exportData(format: "csv" | "json" | "pdf" = "json"): string {
    const data = {
      metrics: this.getCurrentMetrics(),
      trends: this.getIncidentTrends(),
      responseMetrics: this.getResponseTimeMetrics(),
      zoneActivity: this.getZoneActivity(),
      insights: this.getPerformanceInsights(),
      summary: this.generateExecutiveSummary(),
      exportedAt: new Date().toISOString(),
    }

    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2)
      case "csv":
        // Simplified CSV export - in real implementation would be more comprehensive
        return this.convertToCSV(data.trends)
      case "pdf":
        // In real implementation, would generate PDF
        return "PDF export would be generated here"
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) => Object.values(row).join(","))

    return [headers, ...rows].join("\n")
  }
}

// Export singleton instance
export const dashboardAnalytics = DashboardAnalytics.getInstance()
