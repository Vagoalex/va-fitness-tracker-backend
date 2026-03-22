import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserController } from '@/modules/user/user.controller';
import { User, UserSchema } from '@/modules/user/persistence/user.schema';
import { UserService } from '@/modules/user/user.service';
import { USER_COLLECTION_NAME } from '@/core/constants/user.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
