import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class OrderItem {
	@Prop({ type: Types.ObjectId, ref: 'Product', required: true })
	productId!: Types.ObjectId;

	@Prop({ type: String, required: true })
	name!: string;

	@Prop({ type: Number, required: true, min: 0 })
	price!: number;

	@Prop({ type: Number, required: true, min: 1 })
	quantity!: number;

	@Prop({ type: String })
	image?: string;

	@Prop({ type: Number, required: true, min: 0 })
	subtotal!: number;
}
