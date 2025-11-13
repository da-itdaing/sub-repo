export const ROUTES = {
	home: "/",
	login: "/login",
	signupStep1: "/signup/1",
	signupStep2: "/signup/2",
	explore: "/nearby",
	popupDetail: (id: number | string) => `/popup/${id}`,
	popupDetailPattern: "/popup/:id",
	me: "/mypage",
	seller: {
		dashboard: "/seller/dashboard",
		profile: "/seller/profile",
	},
} as const;

export type AppRoute =
	| typeof ROUTES.home
	| typeof ROUTES.login
	| typeof ROUTES.signupStep1
	| typeof ROUTES.signupStep2
	| typeof ROUTES.explore
	| typeof ROUTES.me
	| typeof ROUTES.seller.dashboard
	| typeof ROUTES.seller.profile;


