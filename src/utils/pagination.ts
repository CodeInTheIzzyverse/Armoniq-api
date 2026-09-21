export interface PaginationOptions {
	skip: number;
	limit: number;
	page: number;
}

export function getPaginationOptions(
	page: number = 1,
	limit: number = 10,
): PaginationOptions {
	const safePage = Math.max(1, page);
	const safeLimit = Math.max(1, Math.min(limit, 100));
	const skip = (safePage - 1) * safeLimit;

	return {
		skip,
		limit: safeLimit,
		page: safePage,
	};
}
