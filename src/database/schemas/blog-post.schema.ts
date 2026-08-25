import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BlogPostStatus } from '../../enums';

export type BlogPostDocument = BlogPost & Document;

@Schema({
	timestamps: true,
	collection: 'blog_posts',
})
export class BlogPost {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	authorId!: Types.ObjectId;

	@Prop({ type: String, required: true, trim: true })
	title!: string;

	@Prop({ type: String, required: true, unique: true, lowercase: true })
	slug!: string;

	@Prop({ type: String, trim: true })
	excerpt?: string;

	@Prop({ type: String, required: true })
	content!: string;

	@Prop({ type: String })
	coverImage?: string;

	@Prop({
		type: String,
		enum: BlogPostStatus,
		required: true,
		default: BlogPostStatus.DRAFT,
	})
	status!: BlogPostStatus;

	@Prop({ type: Date })
	publishedAt?: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ status: 1 });
