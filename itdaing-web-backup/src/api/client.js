// @deprecated 이 파일은 사용하지 않는 것을 권장합니다. tokenStorage 유틸리티를 사용하세요.
import { getAccessToken as getToken, setTokens as setTokensUtil } from '../utils/tokenStorage';

export function getAccessToken() {
	return getToken();
}

export function setTokens(accessToken, refreshToken) {
	setTokensUtil(accessToken, refreshToken);
}

async function request(method, path, body, init) {
	const headers = {
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
		if (json && typeof json === "object") {
			return json;
		}
		return {
			success: false,
			error: { status: res.status, code: "HTTP_ERROR", message: res.statusText },
		};
	}
	return json;
}

export const api = {
	get: (path, init) => request("GET", path, undefined, init),
	post: (path, body, init) => request("POST", path, body, init),
	put: (path, body, init) => request("PUT", path, body, init),
	patch: (path, body, init) => request("PATCH", path, body, init),
	delete: (path, init) => request("DELETE", path, undefined, init),
};


