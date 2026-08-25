import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConnection } from './mongo.connection';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useClass: MongoConnection,
		}),
	],
	providers: [MongoConnection],
	exports: [MongooseModule],
})
export class DatabaseModule {}
