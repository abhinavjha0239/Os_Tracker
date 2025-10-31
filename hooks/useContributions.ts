import { useState, useCallback } from 'react';
import { Contributions } from '@/lib/types';

export function useContributions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(
    async (username: string, repoUrl: string): Promise<Contributions | null> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          username,
          repoUrl,
        });
        const response = await fetch(`/api/contributions?${params}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch contributions');
        }

        const contributions: Contributions = await response.json();
        return contributions;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchContributions, loading, error };
}
