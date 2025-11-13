import { useEffect, useState } from "react";
import { PopupSummary, Seller } from "../services/mockDataService";
import { ReviewItem } from "../services/reviewService";
import { popupService } from "../services/popupService";
import { reviewService } from "../services/reviewService";
import { sellerService } from "../services/sellerService";

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
    popupsInflight = popupService.getPopups().then(result => {
      cachedPopups = result;
      popupsInflight = null;
      return result;
    }).catch(error => {
      popupsInflight = null;
      console.error("Failed to load popups:", error);
      throw error;
    });
  }
  return popupsInflight;
}

async function loadSellers(): Promise<Seller[]> {
  if (cachedSellers) return cachedSellers;
  if (!sellersInflight) {
    sellersInflight = sellerService.getSellers().then(result => {
      cachedSellers = result;
      sellersInflight = null;
      return result;
    }).catch(error => {
      sellersInflight = null;
      console.error("Failed to load sellers:", error);
      throw error;
    });
  }
  return sellersInflight;
}

async function loadReviews(): Promise<ReviewItem[]> {
  if (cachedReviews) return cachedReviews;
  if (!reviewsInflight) {
    reviewsInflight = reviewService.getAllReviews().then(result => {
      cachedReviews = result;
      reviewsInflight = null;
      return result;
    }).catch(error => {
      reviewsInflight = null;
      console.error("Failed to load reviews:", error);
      throw error;
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
  const [popup, setPopup] = useState<PopupSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    popupService.getPopupById(id)
      .then(result => {
        if (mounted) {
          setPopup(result);
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
  }, [id]);

  return { popup, loading, error };
}

export function getCachedPopupById(id: number) {
  return cachedPopups?.find(item => item.id === id) ?? null;
}

export function useSellerById(id: number) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (id <= 0) {
      // reset state for invalid id without changing hook order
      setSeller(null);
      setLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    sellerService.getSellerById(id)
      .then(result => {
        if (!mounted) return;
        setSeller(result);
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
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (popupId <= 0) {
      setReviews([]);
      setLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }
    setLoading(true);
    reviewService.getReviewsByPopupId(popupId)
      .then(list => {
        if (!mounted) return;
        // list가 null이나 undefined인 경우 빈 배열로 설정
        setReviews(Array.isArray(list) ? list : []);
        setError(null);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        // 에러 발생 시에도 빈 배열로 설정하여 크래시 방지
        setReviews([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [popupId]);

  // reviews가 null이나 undefined인 경우를 대비하여 안전하게 처리
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const average =
    safeReviews.length > 0 ? safeReviews.reduce((acc, cur) => acc + cur.rating, 0) / safeReviews.length : 0;

  return { reviews: safeReviews, loading, error, average };
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

