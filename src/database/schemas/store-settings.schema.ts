import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ContactInfo, SocialLinks } from './embedded';

export type StoreSettingsDocument = StoreSettings & Document;

@Schema({
	timestamps: true,
	collection: 'store_settings',
})
export class StoreSettings {
	@Prop({ type: String, required: true, trim: true, default: 'Armoniq' })
	storeName!: string;

	@Prop({ type: String })
	favicon?: string;

	@Prop({ type: String })
	headerLogo?: string;

	@Prop({ type: String })
	footerLogo?: string;

	@Prop({ type: ContactInfo, default: () => ({}) })
	contact!: ContactInfo;

	@Prop({ type: SocialLinks, default: () => ({}) })
	socialLinks!: SocialLinks;
}

export const StoreSettingsSchema = SchemaFactory.createForClass(StoreSettings);
