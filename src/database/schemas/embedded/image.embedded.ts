import { Prop } from '@nestjs/mongoose';

export class Image {
	@Prop({ type: String, required: true })
	url!: string;

	@Prop({ type: String, required: true })
	publicId!: string;

	@Prop({ type: String, trim: true })
	alt?: string;

	@Prop({ type: Number, required: true })
	order!: number;
}
