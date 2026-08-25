import { Prop } from '@nestjs/mongoose';

export class ContactInfo {
	@Prop({ type: String, trim: true })
	email?: string;

	@Prop({ type: String, trim: true })
	phone?: string;

	@Prop({ type: String, trim: true })
	address?: string;
}
