import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubcategoryDocument = Subcategory & Document;

@Schema({
	timestamps: true,
	collection: 'subcategories',
})
export class Subcategory {
	@Prop({ type: String, required: true, trim: true })
	name!: string;

	@Prop({ type: String, required: true, unique: true, lowercase: true })
	slug!: string;

	@Prop({ type: Types.ObjectId, ref: 'Category', required: true })
	categoryId!: Types.ObjectId;

	@Prop({ type: String, trim: true })
	description?: string;

	@Prop({ type: String })
	image?: string;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

SubcategorySchema.index({ slug: 1 }, { unique: true });
SubcategorySchema.index({ categoryId: 1 });
