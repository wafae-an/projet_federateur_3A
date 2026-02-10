import { useState, useEffect, useCallback } from 'react';
import { fetchRealtimeMonitoring, RealtimeMonitoringResponse } from '@/lib/api';

const POLLING_INTERVAL = 15000; // 15 seconds

interface UseRealtimeMonitoringResult {
  data: RealtimeMonitoringResponse | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useRealtimeMonitoring(): UseRealtimeMonitoringResult {
  const [data, setData] = useState<RealtimeMonitoringResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchRealtimeMonitoring();
      setData(response);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Error fetching realtime monitoring:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}
