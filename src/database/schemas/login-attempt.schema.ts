import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoginAttemptReason } from '../../enums';

export type LoginAttemptDocument = LoginAttempt & Document;

@Schema({
	collection: 'login_attempts',
})
export class LoginAttempt {
	@Prop({ type: String, required: true, lowercase: true, trim: true })
	email!: string;

	@Prop({ type: Types.ObjectId, ref: 'User' })
	userId?: Types.ObjectId;

	@Prop({ type: String, required: true })
	ip!: string;

	@Prop({ type: String, required: true })
	userAgent!: string;

	@Prop({ type: Date, required: true, default: Date.now })
	timestamp!: Date;

	@Prop({ type: Boolean, required: true })
	success!: boolean;

	@Prop({
		type: String,
		enum: LoginAttemptReason,
		required: true,
	})
	reason!: LoginAttemptReason;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);

LoginAttemptSchema.index({ email: 1 });
LoginAttemptSchema.index({ ip: 1 });
LoginAttemptSchema.index({ timestamp: 1 });
