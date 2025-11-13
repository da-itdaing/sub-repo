import { useEffect, useState } from "react";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const API_BASE =
  RAW_BASE.length > 0 && RAW_BASE.endsWith("/")
    ? RAW_BASE.slice(0, -1)
    : RAW_BASE;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
    code?: string;
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load mock data: ${path} (${response.status})`);
  }
  return (await response.json()) as T;
}

async function fetchApi<T>(path: string, fallback?: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${url} (${response.status})`);
    }
    const body = (await response.json()) as ApiResponse<T> | T;
    if (typeof body === "object" && body !== null && "success" in body) {
      const wrapped = body as ApiResponse<T>;
      if (wrapped.success) {
        return wrapped.data as T;
      }
      throw new Error(wrapped.error?.message ?? "API 응답 에러");
    }
    return body as T;
  } catch (error) {
    if (fallback) {
      console.warn(`[mockDataService] API 요청 실패(${url}), 정적 JSON으로 대체합니다.`, error);
      return fetchJson<T>(fallback);
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export interface Category {
  id: number;
  name: string;
  type?: "POPUP" | "CONSUMER";
}

export interface Region {
  id: number;
  name: string;
}

export interface Feature {
  id: number;
  name: string;
}

export interface ZoneCell {
  id: number;
  label: string;
  lat: number;
  lng: number;
  maxCapacity: number;
  status: "AVAILABLE" | "RESERVED" | "UNAVAILABLE";
  reservedBy?: number;
  features: number[];
  notice?: string;
}

export interface Zone {
  id: number;
  name: string;
  regionId: number;
  status: "AVAILABLE" | "UNAVAILABLE";
  maxCapacity?: number;
  notice?: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  cells: ZoneCell[];
}

export interface PopupSummary {
  id: number;
  title: string;
  sellerId: number;
  zoneId: number;
  cellId: number;
  cellName?: string;
  categoryIds: number[];
  featureIds: number[];
  styleTags: string[];
  thumbnail: string;
  gallery: string[];
  locationName?: string;
  address?: string;
  hours?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  startDate: string;
  endDate: string;
  operatingHours: Array<{ day: string; time: string }>;
  description: string;
  viewCount: number;
  favoriteCount: number;
  reviewSummary: {
    average: number;
    total: number;
    distribution: number[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
}

export interface Message {
  messageId: string;
  authorId: number;
  authorRole: "ADMIN" | "SELLER" | "CONSUMER";
  body: string;
  createdAt: string;
  attachments: MessageAttachment[];
}

export interface MessageThread {
  threadId: string;
  participants: {
    sender: { id: number; role: "ADMIN" | "SELLER" | "CONSUMER"; name: string };
    receiver: { id: number; role: "ADMIN" | "SELLER" | "CONSUMER"; name: string };
  };
  subject: string;
  messages: Message[];
  unreadBy: number[];
  updatedAt: string;
}

export interface ThreadListItem {
  id: string;
  title: string;
  lastSnippet?: string;
  updatedAt: string;
  unreadCount: number;
  counterpart: {
    id: number | null;
    name: string;
    role: "ADMIN" | "SELLER" | "CONSUMER";
  };
}

type ThreadListApiResponse = {
  items: Array<{
    threadId: number;
    subject: string;
    lastSnippet?: string;
    updatedAt?: string;
    unreadForMe: number;
    counterpart?: {
      id: number;
      name: string;
      role: "ADMIN" | "SELLER" | "CONSUMER";
    };
  }>;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export interface Seller {
  id: number;
  name: string;
  description?: string;
  profileImage?: string;
  mainArea?: string;
  sns?: string;
  email: string;
  category?: string;
  phone?: string;
}

type SellerApiDto = {
  id: number;
  name: string;
  description?: string | null;
  profileImage?: string | null;
  mainArea?: string | null;
  sns?: string | null;
  email: string;
  category?: string | null;
  phone?: string | null;
};

export interface ReviewItem {
  id: number;
  popupId: number;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  rating: number;
  date: string;
  content: string;
  images: string[];
}

export const mockApi = {
  categories: async () => {
    const items = await fetchApi<Array<{ id: number; name: string; type?: "POPUP" | "CONSUMER" }>>(
      "/api/master/categories",
      "/mock/common/categories.json"
    );
    return items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type ?? "POPUP",
    }));
  },
  regions: () =>
    fetchApi<Region[]>("/api/master/regions", "/mock/common/regions.json"),
  features: () =>
    fetchApi<Feature[]>("/api/master/features", "/mock/common/features.json"),
  zones: () => fetchApi<Zone[]>("/api/zones", "/mock/admin/zones.json"),
  popups: () => fetchApi<PopupSummary[]>("/api/popups", "/mock/popup/popups.json"),
  messageThreads: async (role: "SELLER" | "ADMIN" = "SELLER") => {
    const fallbackCounterpart =
      role === "SELLER"
        ? { id: null, name: "관리자", role: "ADMIN" as const }
        : { id: null, name: "판매자", role: "SELLER" as const };

    const raw = await fetchApi<ThreadListApiResponse | MessageThread[]>(
      `/api/inquiries?role=${role}`,
      "/mock/messages/threads.json"
    );

    if (Array.isArray(raw)) {
      return raw.map(item => {
        const participants = [item.participants.sender, item.participants.receiver];
        const counterpart =
          participants.find(p => p.role.toUpperCase() !== role) ??
          (role === "SELLER"
            ? participants.find(p => p.role === "ADMIN")
            : participants.find(p => p.role === "SELLER"));

        const lastMessage = item.messages[item.messages.length - 1];

        return {
          id: item.threadId,
          title: item.subject,
          lastSnippet: lastMessage?.body ?? "",
          updatedAt: item.updatedAt ?? lastMessage?.createdAt ?? new Date().toISOString(),
          unreadCount: item.unreadBy?.length ?? 0,
          counterpart: counterpart
            ? { id: counterpart.id, name: counterpart.name, role: counterpart.role }
            : fallbackCounterpart
        } satisfies ThreadListItem;
      });
    }

    return raw.items.map(item => ({
      id: String(item.threadId),
      title: item.subject,
      lastSnippet: item.lastSnippet,
      updatedAt: item.updatedAt ?? new Date().toISOString(),
      unreadCount: item.unreadForMe ?? 0,
      counterpart: item.counterpart
        ? {
            id: item.counterpart.id,
            name: item.counterpart.name,
            role: item.counterpart.role
          }
        : fallbackCounterpart
    }));
  },
  sellers: async () => {
    const items = await fetchApi<SellerApiDto[]>("/api/sellers", "/mock/sellers/sellers.json");
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      profileImage: item.profileImage ?? undefined,
      mainArea: item.mainArea ?? undefined,
      sns: item.sns ?? undefined,
      email: item.email,
      category: item.category ?? undefined,
      phone: item.phone ?? undefined,
    }));
  },
  reviews: () =>
    fetchApi<ReviewItem[]>("/api/popups/reviews", "/mock/reviews/reviews.json")
};

/**
 * React Hook - JSON 데이터를 로드하고 상태를 반환한다.
 * 로딩/에러 상태를 필요로 하는 화면에서 재사용한다.
 */
export function useMockQuery<T>(key: string, loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loader()
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
  }, [key, loader]);

  return { data, loading, error };
}

