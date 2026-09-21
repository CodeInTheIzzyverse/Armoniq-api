import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { UserRepository } from '../../repositories/user.repository';
import { UsersService } from '../../services/users.service';
import { UsersController } from '../../controllers/users.controller';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [UsersController],
	providers: [UserRepository, UsersService],
	exports: [UserRepository, UsersService],
})
export class UsersModule {}
