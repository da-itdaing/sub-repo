import { useEffect, useState } from "react";

// Vite proxy를 사용하기 위해 항상 상대 경로를 사용
// 개발 환경에서는 Vite proxy가 /api 요청을 http://localhost:8080으로 전달
const API_BASE = "";

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load mock data: ${path} (${response.status})`);
  }
  return response.json();
}

async function fetchApi(path, fallback) {
  // API_BASE가 빈 문자열이면 상대 경로를 사용하여 Vite proxy가 처리하도록 함
  const url = API_BASE ? `${API_BASE}${path}` : path;
  
  // fallback이 있으면 조용히 처리 (에러를 콘솔에 표시하지 않음)
  if (fallback) {
    try {
      // 타임아웃을 위한 AbortController 사용
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃
      
      try {
        const response = await fetch(url, { 
          credentials: "include",
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${url} (${response.status})`);
        }
        const body = await response.json();
        if (typeof body === "object" && body !== null && "success" in body) {
          if (body.success) {
            return body.data;
          }
          throw new Error(body.error?.message ?? "API 응답 에러");
        }
        return body;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      // 네트워크 에러를 조용히 처리하고 fallback 사용
      // 브라우저 콘솔에 나타나는 네트워크 에러는 숨길 수 없지만,
      // 코드 레벨에서 조용히 처리하여 추가 에러를 발생시키지 않음
      try {
        return await fetchJson(fallback);
      } catch (fallbackError) {
        // fallback도 실패하면 에러 발생
        throw fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError));
      }
    }
  }
  
  // fallback이 없으면 일반적인 에러 처리
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${url} (${response.status})`);
    }
    const body = await response.json();
    if (typeof body === "object" && body !== null && "success" in body) {
      if (body.success) {
        return body.data;
      }
      throw new Error(body.error?.message ?? "API 응답 에러");
    }
    return body;
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export const mockApi = {
  categories: async () => {
    const items = await fetchApi(
      "/api/master/categories",
      "/mock/common/categories.json"
    );
    return items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type ?? "POPUP",
    }));
  },
  regions: () => fetchApi("/api/master/regions", "/mock/common/regions.json"),
  features: () => fetchApi("/api/master/features", "/mock/common/features.json"),
  zones: () => fetchApi("/api/zones", "/mock/admin/zones.json"),
  popups: () => fetchApi("/api/popups", "/mock/popup/popups.json"),
  messageThreads: async (role = "SELLER") => {
    const fallbackCounterpart =
      role === "SELLER"
        ? { id: null, name: "관리자", role: "ADMIN" }
        : { id: null, name: "판매자", role: "SELLER" };

    const raw = await fetchApi(
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
            : fallbackCounterpart,
        };
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
            role: item.counterpart.role,
          }
        : fallbackCounterpart,
    }));
  },
  sellers: async () => {
    const items = await fetchApi("/api/sellers", "/mock/sellers/sellers.json");
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
  reviews: () => fetchApi("/api/popups/reviews", "/mock/reviews/reviews.json"),
};

/**
 * React Hook - JSON 데이터를 로드하고 상태를 반환한다.
 * 로딩/에러 상태를 필요로 하는 화면에서 재사용한다.
 */
export function useMockQuery(key, loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

