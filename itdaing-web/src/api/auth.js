// @deprecated 이 파일은 사용하지 않는 것을 권장합니다. services/authService.js를 사용하세요.
import { post, get } from "../utils/api";
import { setTokens, clearTokens } from "../utils/tokenStorage";

export async function login(req) {
	const res = await post("/auth/login", req, false);
	if (res.success && res.data?.accessToken) {
		setTokens(res.data.accessToken, res.data.refreshToken ?? null);
	}
	return res;
}

export async function signupConsumer(req) {
	return post("/auth/signup/consumer", req, false);
}

export async function signupSeller(req) {
	return post("/auth/signup/seller", req, false);
}

export async function getMyProfile() {
	return get("/users/me", true);
}

export async function refreshToken(refreshToken) {
	const res = await post("/auth/refresh", { refreshToken }, false);
	if (res.success && res.data?.accessToken) {
		setTokens(res.data.accessToken, res.data.refreshToken ?? null);
	}
	return res;
}

export async function logout(optionalRefreshToken) {
	const res = await post(
		"/auth/logout",
		optionalRefreshToken ? { refreshToken: optionalRefreshToken } : undefined,
		true
	);
	if (res.success) {
		clearTokens();
	}
	return res;
}


