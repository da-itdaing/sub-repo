import { api, ApiResponse, setTokens } from "./client";

export interface LoginRequest {
	loginId: string;
	password: string;
}
export interface LoginResponse {
	accessToken: string;
	refreshToken?: string;
}

export interface SignupConsumerRequest {
	email: string;
	password: string;
	passwordConfirm: string;
	loginId: string;
	name: string;
	nickname: string;
	ageGroup: number;
	interestCategoryIds: number[];
	styleIds: number[];
	regionIds: number[];
}
export interface SignupSellerRequest {
	email: string;
	password: string;
	passwordConfirm: string;
	loginId: string;
	name: string;
	nickname: string;
	profile: {
		activityRegion: string;
		snsUrl?: string;
		profileImageUrl?: string;
		introduction?: string;
	};
}

export interface UserProfileResponse {
	id: number;
	email: string;
	name: string;
	nickname: string;
	role: "CONSUMER" | "SELLER" | "ADMIN";
}

export async function login(req: LoginRequest): Promise<ApiResponse<LoginResponse>> {
	const res = await api.post<LoginResponse>("/api/auth/login", req);
	if (res.success && res.data?.accessToken) {
		setTokens(res.data.accessToken, res.data.refreshToken ?? null);
	}
	return res;
}

export async function signupConsumer(req: SignupConsumerRequest) {
	return api.post("/api/auth/signup/consumer", req);
}

export async function signupSeller(req: SignupSellerRequest) {
	return api.post("/api/auth/signup/seller", req);
}

export async function getMyProfile(): Promise<ApiResponse<UserProfileResponse>> {
	return api.get<UserProfileResponse>("/api/users/me");
}

export async function refreshToken(refreshToken: string) {
	const res = await api.post<{ accessToken: string; refreshToken?: string }>("/api/auth/refresh", {
		refreshToken,
	});
	if (res.success && res.data?.accessToken) {
		setTokens(res.data.accessToken, res.data.refreshToken ?? null);
	}
	return res;
}

export async function logout(optionalRefreshToken?: string) {
	const res = await api.post<void>("/api/auth/logout", optionalRefreshToken ? { refreshToken: optionalRefreshToken } : undefined);
	if (res.success) {
		setTokens(null, null);
	}
	return res;
}


