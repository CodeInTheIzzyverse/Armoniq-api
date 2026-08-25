import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
	timestamps: true,
	collection: 'refresh_tokens',
})
export class RefreshToken {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: String, required: true, unique: true })
	tokenHash!: string;

	@Prop({ type: Date, required: true })
	expiresAt!: Date;

	@Prop({ type: Date })
	revokedAt?: Date;

	@Prop({ type: Types.ObjectId, ref: 'RefreshToken' })
	replacedByTokenId?: Types.ObjectId;

	@Prop({ type: String })
	userAgent?: string;

	@Prop({ type: String })
	ip?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
