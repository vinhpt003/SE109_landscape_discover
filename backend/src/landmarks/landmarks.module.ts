import { Module } from '@nestjs/common';
import { LandmarksService } from './landmarks.service';
import { LandmarksController } from './landmarks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [LandmarksController],
  providers: [LandmarksService],
  imports: [PrismaModule],
})
export class LandmarksModule {}
