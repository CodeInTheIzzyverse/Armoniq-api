import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({
	timestamps: true,
	collection: 'banners',
})
export class Banner {
	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, required: true })
	image!: string;

	@Prop({ type: String, trim: true })
	link?: string;

	@Prop({ type: Number, required: true, default: 0 })
	position!: number;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;

	@Prop({ type: Date })
	startAt?: Date;

	@Prop({ type: Date })
	endAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
