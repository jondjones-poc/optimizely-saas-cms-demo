export interface HomepageData {
  success: boolean
  data?: any
  error?: string
  timestamp?: string
}

export async function fetchHomepageData(): Promise<HomepageData> {
  try {
    const response = await fetch('/api/optimizely/homepage')
    const result = await response.json()
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        timestamp: result.timestamp
      }
    } else {
      return {
        success: false,
        error: result.error
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch homepage data'
    }
  }
}
