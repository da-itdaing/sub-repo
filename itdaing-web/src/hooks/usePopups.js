import { useEffect, useState } from "react";
import { mockApi } from "../services/mockDataService";

let cachedPopups = null;
let popupsInflight = null;

let cachedSellers = null;
let sellersInflight = null;

let cachedReviews = null;
let reviewsInflight = null;

async function loadPopups(force = false) {
  if (cachedPopups && !force) {
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

async function loadSellers() {
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

async function loadReviews() {
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

export function invalidateReviewsCache() {
  cachedReviews = null;
}

export function preloadPopups() {
  void loadPopups();
}

export function usePopups() {
  const [data, setData] = useState(cachedPopups);
  const [loading, setLoading] = useState(!cachedPopups);
  const [error, setError] = useState(null);

  const refetch = async () => {
    cachedPopups = null;
    setLoading(true);
    try {
      const result = await loadPopups(true);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

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

  return { data, loading, error, refetch };
}

export function usePopupById(id) {
  const { data, loading, error } = usePopups();
  const popup = data?.find(item => item.id === id) ?? null;
  return { popup, loading, error };
}

export function getCachedPopupById(id) {
  return cachedPopups?.find(item => item.id === id) ?? null;
}

export function useSellerById(id) {
  // All hooks must be called unconditionally
  const [seller, setSeller] = useState(cachedSellers?.find(s => s.id === id) ?? null);
  const [loading, setLoading] = useState(!seller && id > 0);
  const [error, setError] = useState(null);

  const refetch = async () => {
    if (id <= 0) return;
    cachedSellers = null;
    setLoading(true);
    try {
      const list = await loadSellers();
      const found = list.find(s => s.id === id) ?? null;
      setSeller(found);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip effect if id is invalid
    if (id <= 0) {
      setSeller(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    let mounted = true;
    setLoading(true);
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

  // Handle invalid id after all hooks are called
  if (id <= 0) {
    return { seller: null, loading: false, error: null, refetch: () => {} };
  }

  return { seller, loading, error, refetch };
}

export function useSellers() {
  const [sellers, setSellers] = useState(cachedSellers ? [...cachedSellers] : null);
  const [loading, setLoading] = useState(!cachedSellers);
  const [error, setError] = useState(null);

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

export function useReviewsByPopupId(popupId) {
  // All hooks must be called unconditionally
  const initial = cachedReviews ? cachedReviews.filter(r => r.popupId === popupId) : [];
  const [reviews, setReviews] = useState(initial);
  const [loading, setLoading] = useState(!cachedReviews && popupId > 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip effect if popupId is invalid
    if (popupId <= 0) {
      setReviews([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    let mounted = true;
    setLoading(true);
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

  // Handle invalid popupId after all hooks are called
  if (popupId <= 0) {
    return { reviews: [], loading: false, error: null, average: 0, refetch: () => {} };
  }

  const average =
    reviews.length > 0 ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length : 0;

  const refetch = async () => {
    if (popupId <= 0) return;
    cachedReviews = null;
    setLoading(true);
    try {
      const list = await loadReviews();
      setReviews(list.filter(r => r.popupId === popupId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return { reviews, loading, error, average, refetch };
}

export function useAllReviews(options = {}) {
  const { popupIds, authorId } = options ?? {};
  const [reviews, setReviews] = useState(cachedReviews ? [...cachedReviews] : null);
  const [loading, setLoading] = useState(!cachedReviews);
  const [error, setError] = useState(null);

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

  const refetch = async () => {
    cachedReviews = null;
    setLoading(true);
    try {
      const list = await loadReviews();
      setReviews([...list]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    reviews && Array.isArray(reviews)
      ? reviews.filter(item => {
          const popupMatch =
            !popupIds || popupIds.length === 0 || popupIds.includes(item.popupId);
          const authorMatch = !authorId || item.author?.id === authorId;
          return popupMatch && authorMatch;
        })
      : [];

  return { reviews: filtered, loading, error, refetch };
}

