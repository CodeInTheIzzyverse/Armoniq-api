import { Prop } from '@nestjs/mongoose';

export class AddressSnapshot {
	@Prop({ type: String, required: true })
	name!: string;

	@Prop({ type: String, required: true })
	address!: string;

	@Prop({ type: String })
	details?: string;

	@Prop({ type: String, required: true })
	city!: string;

	@Prop({ type: String, required: true })
	state!: string;

	@Prop({ type: String, required: true })
	country!: string;

	@Prop({ type: String })
	postalCode?: string;

	@Prop({ type: Number })
	latitude?: number;

	@Prop({ type: Number })
	longitude?: number;
}
