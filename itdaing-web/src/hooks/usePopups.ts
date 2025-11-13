import { useEffect, useState } from "react";
import { PopupSummary, ReviewItem, Seller, mockApi } from "../services/mockDataService";

let cachedPopups: PopupSummary[] | null = null;
let popupsInflight: Promise<PopupSummary[]> | null = null;

let cachedSellers: Seller[] | null = null;
let sellersInflight: Promise<Seller[]> | null = null;

let cachedReviews: ReviewItem[] | null = null;
let reviewsInflight: Promise<ReviewItem[]> | null = null;

async function loadPopups(): Promise<PopupSummary[]> {
  if (cachedPopups) {
    return cachedPopups;
  }
  if (!popupsInflight) {
    popupsInflight = mockApi.popups().then(result => {
      cachedPopups = result;
      popupsInflight = null;
      return result;
    });
  }
  return popupsInflight;
}

async function loadSellers(): Promise<Seller[]> {
  if (cachedSellers) return cachedSellers;
  if (!sellersInflight) {
    sellersInflight = mockApi.sellers().then(result => {
      cachedSellers = result;
      sellersInflight = null;
      return result;
    });
  }
  return sellersInflight;
}

async function loadReviews(): Promise<ReviewItem[]> {
  if (cachedReviews) return cachedReviews;
  if (!reviewsInflight) {
    reviewsInflight = mockApi.reviews().then(result => {
      cachedReviews = result;
      reviewsInflight = null;
      return result;
    });
  }
  return reviewsInflight;
}

export function preloadPopups() {
  void loadPopups();
}

export function usePopups() {
  const [data, setData] = useState<PopupSummary[] | null>(cachedPopups);
  const [loading, setLoading] = useState(!cachedPopups);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedPopups) {
      setData(cachedPopups);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    loadPopups()
      .then(result => {
        if (mounted) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function usePopupById(id: number) {
  const { data, loading, error } = usePopups();
  const popup = data?.find(item => item.id === id) ?? null;
  return { popup, loading, error };
}

export function getCachedPopupById(id: number) {
  return cachedPopups?.find(item => item.id === id) ?? null;
}

export function useSellerById(id: number) {
  if (id <= 0) {
    return { seller: null as Seller | null, loading: false, error: null as Error | null };
  }
  const [seller, setSeller] = useState<Seller | null>(cachedSellers?.find(s => s.id === id) ?? null);
  const [loading, setLoading] = useState(!seller);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    loadSellers()
      .then(list => {
        if (!mounted) return;
        const found = list.find(s => s.id === id) ?? null;
        setSeller(found);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  return { seller, loading, error };
}

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[] | null>(cachedSellers ? [...cachedSellers] : null);
  const [loading, setLoading] = useState(!cachedSellers);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedSellers) {
      setSellers([...cachedSellers]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    loadSellers()
      .then(list => {
        if (!mounted) return;
        setSellers(list);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data: sellers, loading, error };
}

export function useReviewsByPopupId(popupId: number) {
  if (popupId <= 0) {
    return { reviews: [] as ReviewItem[], loading: false, error: null as Error | null, average: 0 };
  }
  const [reviews, setReviews] = useState<ReviewItem[]>(
    cachedReviews?.filter(r => r.popupId === popupId) ?? []
  );
  const [loading, setLoading] = useState(!cachedReviews);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    loadReviews()
      .then(list => {
        if (!mounted) return;
        setReviews(list.filter(r => r.popupId === popupId));
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [popupId]);

  const average =
    reviews.length > 0 ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length : 0;

  return { reviews, loading, error, average };
}

export function useAllReviews(popupIds?: number[]) {
  const [reviews, setReviews] = useState<ReviewItem[] | null>(
    cachedReviews ? [...cachedReviews] : null
  );
  const [loading, setLoading] = useState(!cachedReviews);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    loadReviews()
      .then(list => {
        if (!mounted) return;
        setReviews([...list]);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    reviews && popupIds && popupIds.length > 0
      ? reviews.filter(item => popupIds.includes(item.popupId))
      : reviews ?? [];

  return { reviews: filtered, loading, error };
}

