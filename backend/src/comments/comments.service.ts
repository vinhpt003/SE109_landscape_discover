import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  findByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { userId: true, userName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateCommentDto, userId: string) {
    return this.prisma.comment.create({
      data: { ...dto, userId },
      include: { user: { select: { userId: true, userName: true, avatar: true } } },
    });
  }

  async remove(commentId: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({ where: { commentId } });
    if (!comment) throw new NotFoundException('Bình luận không tồn tại');
    if (comment.userId !== userId && role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    return this.prisma.comment.delete({ where: { commentId } });
  }
}
