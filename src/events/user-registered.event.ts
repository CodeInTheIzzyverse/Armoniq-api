export class UserRegisteredEvent {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly firstName: string,
		public readonly verificationToken: string,
	) {}
}
