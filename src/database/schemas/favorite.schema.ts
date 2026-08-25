import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({
	timestamps: true,
	collection: 'favorites',
})
export class Favorite {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'Product', required: true })
	productId!: Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });
