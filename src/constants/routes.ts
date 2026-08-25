export const API_ROUTES = {
	AUTH: {
		BASE: 'auth',
		REGISTER: 'register',
		LOGIN: 'login',
		LOGOUT: 'logout',
		REFRESH: 'refresh',
		VERIFY_EMAIL: 'verify-email',
		RESEND_VERIFICATION: 'resend-verification',
		FORGOT_PASSWORD: 'forgot-password',
		RESET_PASSWORD: 'reset-password',
	},
	USERS: {
		BASE: 'users',
		PROFILE: 'profile',
	},
	PRODUCTS: {
		BASE: 'products',
	},
	CATEGORIES: {
		BASE: 'categories',
	},
	ORDERS: {
		BASE: 'orders',
	},
	CART: {
		BASE: 'cart',
	},
	REVIEWS: {
		BASE: 'reviews',
	},
	FAVORITES: {
		BASE: 'favorites',
	},
	ADDRESSES: {
		BASE: 'addresses',
	},
	BANNERS: {
		BASE: 'banners',
	},
	SLIDES: {
		BASE: 'slides',
	},
	BLOG: {
		BASE: 'blog',
	},
	STORE_SETTINGS: {
		BASE: 'store-settings',
	},
	HEALTH: {
		BASE: 'health',
		LIVE: 'live',
		READY: 'ready',
	},
} as const;
