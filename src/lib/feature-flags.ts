
export interface FeatureFlags {
  showSearch: boolean
  showTesting: boolean
  showLogs: boolean
}

export function getFeatureFlags(): FeatureFlags {
  return {
    showSearch: process.env.NEXT_PUBLIC_SHOW_SEARCH !== 'false',
    showTesting: process.env.NEXT_PUBLIC_SHOW_TESTING !== 'false', 
    showLogs: process.env.NEXT_PUBLIC_SHOW_LOGS !== 'false',
  }
}

export function useFeatureFlags(): FeatureFlags {
  return {
    showSearch: process.env.NEXT_PUBLIC_SHOW_SEARCH !== 'false',
    showTesting: process.env.NEXT_PUBLIC_SHOW_TESTING !== 'false',
    showLogs: process.env.NEXT_PUBLIC_SHOW_LOGS !== 'false',
  }
} 