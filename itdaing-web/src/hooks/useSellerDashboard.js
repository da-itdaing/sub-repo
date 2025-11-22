import { useCallback, useEffect, useState } from "react";
import { sellerService } from "../services/sellerService";

export function useSellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await sellerService.getMyDashboard();
      setData(dashboard);
      return dashboard;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      // 오류는 state에 이미 반영됨
    });
  }, [refresh]);

  return { data, loading, error, refresh };
}

export default useSellerDashboard;
