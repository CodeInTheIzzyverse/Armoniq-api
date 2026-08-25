import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({
	timestamps: true,
	collection: 'reviews',
})
export class Review {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Product', required: true })
	productId!: Types.ObjectId;

	@Prop({ type: Number, required: true, min: 1, max: 5 })
	rating!: number;

	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, trim: true })
	comment?: string;

	@Prop({ type: Boolean, default: false })
	isApproved!: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
