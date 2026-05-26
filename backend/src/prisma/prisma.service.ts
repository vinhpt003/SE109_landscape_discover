import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Đã kết nối Database thành công!');
    } catch (e) {
      // Don't crash the whole app when the database isn't available in local/dev.
      // Log the issue and continue; runtime DB operations will still fail if used.
      console.warn('⚠️ Could not connect to the database:', e?.message ?? e);
    }
  }
}
