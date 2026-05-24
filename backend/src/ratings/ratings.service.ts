import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  upsert(dto: CreateRatingDto, userId: string) {
    return this.prisma.rating.upsert({
      where: { postId_userId: { postId: dto.postId, userId } },
      update: { score: dto.score },
      create: { postId: dto.postId, userId, score: dto.score },
    });
  }

  async getSummary(postId: string) {
    const ratings = await this.prisma.rating.findMany({ where: { postId } });
    const count = ratings.length;
    const avg = count > 0 ? ratings.reduce((s, r) => s + r.score, 0) / count : null;
    return { postId, avgRating: avg, count };
  }
}
