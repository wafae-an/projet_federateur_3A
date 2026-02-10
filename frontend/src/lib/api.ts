// VigiHome API client configuration
const API_BASE_URL = 'http://localhost:8000';

// Types for the API response
export interface NormalActivity {
  timestamp: string;
  activity: string;
  source?: 'predicted' | 'manual';
}

export interface AbnormalActivity {
  timestamp: string;
  activity: string;
  priority: 'high' | 'medium' | 'low';
  source?: 'predicted' | 'manual';
}

export interface RealtimeMonitoringResponse {
  normal_activities: NormalActivity[];
  abnormal_activities: AbnormalActivity[];
}

// Fetch realtime monitoring data from FastAPI backend
export async function fetchRealtimeMonitoring(): Promise<RealtimeMonitoringResponse> {
  const response = await fetch(`${API_BASE_URL}/monitoring/realtime`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Utility to get priority color classes
export function getPriorityStyles(priority: AbnormalActivity['priority']) {
  const styles = {
    high: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      text: 'text-red-700',
      badge: 'bg-red-500 text-white',
      icon: 'bg-red-200',
      label: 'Haute',
    },
    medium: {
      border: 'border-orange-300',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      badge: 'bg-orange-500 text-white',
      icon: 'bg-orange-200',
      label: 'Moyenne',
    },
    low: {
      border: 'border-yellow-300',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      badge: 'bg-yellow-500 text-white',
      icon: 'bg-yellow-200',
      label: 'Basse',
    },
  };
  return styles[priority];
}
