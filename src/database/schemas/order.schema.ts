import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../enums';
import { AddressSnapshot, OrderItem } from './embedded';

export type OrderDocument = Order & Document;

@Schema({
	timestamps: true,
	collection: 'orders',
})
export class Order {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({ type: [OrderItem], required: true, default: [] })
	items!: OrderItem[];

	@Prop({ type: Number, required: true, min: 0 })
	subtotal!: number;

	@Prop({ type: Number, required: true, min: 0, default: 0 })
	shippingCost!: number;

	@Prop({ type: Number, required: true, min: 0 })
	total!: number;

	@Prop({
		type: String,
		enum: OrderStatus,
		required: true,
		default: OrderStatus.PENDING,
	})
	status!: OrderStatus;

	@Prop({
		type: String,
		enum: PaymentMethod,
		required: true,
	})
	paymentMethod!: PaymentMethod;

	@Prop({
		type: String,
		enum: PaymentStatus,
		required: true,
		default: PaymentStatus.PENDING,
	})
	paymentStatus!: PaymentStatus;

	@Prop({ type: AddressSnapshot, required: true })
	shippingAddress!: AddressSnapshot;

	@Prop({ type: String })
	trackingNumber?: string;

	@Prop({ type: String, trim: true })
	notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });
