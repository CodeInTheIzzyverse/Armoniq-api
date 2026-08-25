import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
	timestamps: true,
	collection: 'categories',
})
export class Category {
	@Prop({ type: String, required: true, trim: true })
	name!: string;

	@Prop({ type: String, required: true, unique: true, lowercase: true })
	slug!: string;

	@Prop({ type: String, trim: true })
	description?: string;

	@Prop({ type: String })
	image?: string;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 }, { unique: true });
