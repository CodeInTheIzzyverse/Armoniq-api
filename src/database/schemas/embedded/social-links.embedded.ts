import { Prop } from '@nestjs/mongoose';

export class SocialLinks {
	@Prop({ type: String, trim: true })
	facebook?: string;

	@Prop({ type: String, trim: true })
	instagram?: string;

	@Prop({ type: String, trim: true })
	twitter?: string;

	@Prop({ type: String, trim: true })
	youtube?: string;

	@Prop({ type: String, trim: true })
	tiktok?: string;
}
