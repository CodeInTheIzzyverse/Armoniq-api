import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AuthTokenType } from '../../enums';

export type AuthTokenDocument = AuthToken & Document;

@Schema({
	timestamps: true,
	collection: 'auth_tokens',
})
export class AuthToken {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: String, required: true, unique: true })
	tokenHash!: string;

	@Prop({
		type: String,
		enum: AuthTokenType,
		required: true,
	})
	type!: AuthTokenType;

	@Prop({ type: Date, required: true })
	expiresAt!: Date;

	@Prop({ type: Date })
	usedAt?: Date;

	createdAt!: Date;
	updatedAt!: Date;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);

AuthTokenSchema.index({ userId: 1 });
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
