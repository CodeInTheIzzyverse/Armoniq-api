import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SlideDocument = Slide & Document;

@Schema({
	timestamps: true,
	collection: 'slides',
})
export class Slide {
	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, trim: true })
	description?: string;

	@Prop({ type: String, required: true })
	image!: string;

	@Prop({ type: String, trim: true })
	link?: string;

	@Prop({ type: Number, required: true, default: 0 })
	order!: number;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;
}

export const SlideSchema = SchemaFactory.createForClass(Slide);
