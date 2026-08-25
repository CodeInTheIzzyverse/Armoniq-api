import { UserRole } from '../enums';

export const USER_ROLES = {
	CLIENT: UserRole.CLIENT,
	ADMIN: UserRole.ADMIN,
} as const;

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
	[UserRole.CLIENT]: 'Regular customer with shopping capabilities',
	[UserRole.ADMIN]: 'Administrator with full system access',
};
