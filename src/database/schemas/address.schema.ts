import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({
	timestamps: true,
	collection: 'addresses',
})
export class Address {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: String, required: true, trim: true })
	name!: string;

	@Prop({ type: String, required: true, trim: true })
	address!: string;

	@Prop({ type: String, trim: true })
	details?: string;

	@Prop({ type: String, required: true, trim: true })
	city!: string;

	@Prop({ type: String, required: true, trim: true })
	state!: string;

	@Prop({ type: String, required: true, trim: true })
	country!: string;

	@Prop({ type: String, trim: true })
	postalCode?: string;

	@Prop({ type: Number })
	latitude?: number;

	@Prop({ type: Number })
	longitude?: number;

	@Prop({ type: Boolean, default: false })
	isDefault!: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ userId: 1 });
