import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../enums';

export type UserDocument = User & Document;

@Schema({
	timestamps: true,
	collection: 'users',
})
export class User {
	@Prop({
		type: String,
		enum: UserRole,
		required: true,
		default: UserRole.CLIENT,
	})
	role!: UserRole;

	@Prop({ type: String, required: true })
	firstName!: string;

	@Prop({ type: String, required: true })
	lastName!: string;

	@Prop({
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	})
	email!: string;

	@Prop({ type: String, required: true })
	passwordHash!: string;

	@Prop({ type: String, trim: true })
	phone?: string;

	@Prop({ type: String })
	avatar?: string;

	@Prop({ type: Boolean, default: true })
	isActive!: boolean;

	@Prop({ type: Boolean, default: false })
	isEmailVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
