import { Module } from '@nestjs/common';
import { SavedPostsService } from './saved-posts.service';
import { SavedPostsController } from './saved-posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SavedPostsController],
  providers: [SavedPostsService],
})
export class SavedPostsModule {}
