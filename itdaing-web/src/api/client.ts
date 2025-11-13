type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		status: number;
		code: string;
		message: string;
	};
}

const ACCESS_TOKEN_KEY = "itdaing_access_token";
const REFRESH_TOKEN_KEY = "itdaing_refresh_token";

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setTokens(accessToken?: string | null, refreshToken?: string | null) {
	if (accessToken !== undefined) {
		if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
		else localStorage.removeItem(ACCESS_TOKEN_KEY);
	}
	if (refreshToken !== undefined) {
		if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
		else localStorage.removeItem(REFRESH_TOKEN_KEY);
	}
}

async function request<T>(
	method: HttpMethod,
	path: string,
	body?: unknown,
	init?: RequestInit
): Promise<ApiResponse<T>> {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...(init?.headers || {}),
	};
	const token = getAccessToken();
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(path, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
		...init,
	});

	const isJson = res.headers.get("content-type")?.includes("application/json");
	const json = isJson ? await res.json() : undefined;

	if (!res.ok) {
		// 서버 표준 응답 형태를 최대한 따름
		if (json && typeof json === "object") {
			return json as ApiResponse<T>;
		}
		return {
			success: false,
			error: { status: res.status, code: "HTTP_ERROR", message: res.statusText },
		};
	}
	return json as ApiResponse<T>;
}

export const api = {
	get: <T>(path: string, init?: RequestInit) => request<T>("GET", path, undefined, init),
	post: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("POST", path, body, init),
	put: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("PUT", path, body, init),
	patch: <T>(path: string, body?: unknown, init?: RequestInit) => request<T>("PATCH", path, body, init),
	delete: <T>(path: string, init?: RequestInit) => request<T>("DELETE", path, undefined, init),
};


