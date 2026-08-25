import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
	PaymentMethodType,
	PaymentProvider,
	PaymentStatusType,
} from '../../enums';

export type PaymentDocument = Payment & Document;

@Schema({
	timestamps: true,
	collection: 'payments',
})
export class Payment {
	@Prop({ type: Types.ObjectId, ref: 'Order', required: true })
	orderId!: Types.ObjectId;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	userId!: Types.ObjectId;

	@Prop({
		type: String,
		enum: PaymentProvider,
		required: true,
	})
	provider!: PaymentProvider;

	@Prop({
		type: String,
		enum: PaymentMethodType,
		required: true,
	})
	method!: PaymentMethodType;

	@Prop({ type: Number, required: true, min: 0 })
	amount!: number;

	@Prop({ type: String, required: true, default: 'COP' })
	currency!: string;

	@Prop({
		type: String,
		enum: PaymentStatusType,
		required: true,
		default: PaymentStatusType.PENDING,
	})
	status!: PaymentStatusType;

	@Prop({ type: String })
	transactionId?: string;

	@Prop({ type: String, required: true })
	reference!: string;

	@Prop({ type: Object })
	providerResponse?: Record<string, unknown>;

	@Prop({ type: Date })
	paidAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ transactionId: 1 });
