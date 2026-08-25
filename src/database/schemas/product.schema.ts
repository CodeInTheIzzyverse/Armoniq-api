import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Image } from './embedded';

export type ProductDocument = Product & Document;

@Schema({
	timestamps: true,
	collection: 'products',
})
export class Product {
	@Prop({ type: String, required: true, trim: true })
	name!: string;

	@Prop({ type: String, required: true, unique: true, lowercase: true })
	slug!: string;

	@Prop({ type: String, trim: true })
	description?: string;

	@Prop({ type: Number, required: true, min: 0 })
	price!: number;

	@Prop({ type: Number, required: true, min: 0, default: 0 })
	stock!: number;

	@Prop({ type: [Image], default: [] })
	images!: Image[];

	@Prop({ type: Types.ObjectId, ref: 'Category', required: true })
	categoryId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Subcategory' })
	subcategoryId?: Types.ObjectId;

	@Prop({ type: Object, default: {} })
	specifications?: Record<string, unknown>;

	@Prop({ type: Number, default: 0, min: 0, max: 5 })
	rating!: number;

	@Prop({ type: Number, default: 0, min: 0 })
	reviewCount!: number;

	@Prop({ type: Boolean, default: false })
	isFeatured!: boolean;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ subcategoryId: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: 1 });
ProductSchema.index({ name: 'text' });
