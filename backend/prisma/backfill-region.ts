import 'dotenv/config';
import { PrismaClient, Region } from '@prisma/client';

const prisma = new PrismaClient();

// Map địa điểm seed → vùng miền (Bắc / Trung / Nam).
// Dùng để gán region cho các Location đã tồn tại mà không cần re-seed (giữ nguyên data).
const REGION_BY_NAME: Record<string, Region> = {
  'Vịnh Hạ Long': 'North',
  'Sa Pa': 'North',
  'Phố cổ Hội An': 'Central',
  'Hoàng Thành Huế': 'Central',
  'Vườn Quốc gia Phong Nha – Kẻ Bàng': 'Central',
  'Mũi Né – Phan Thiết': 'South',
  'Đà Lạt': 'South',
  'Miền Tây Sông Nước': 'South',
};

async function main() {
  console.log('🗺  Backfilling Location.region...\n');

  for (const [locationName, region] of Object.entries(REGION_BY_NAME)) {
    const result = await prisma.location.updateMany({
      where: { locationName },
      data: { region },
    });
    console.log(`   ${result.count > 0 ? '✔' : '–'} ${locationName} → ${region} (${result.count} updated)`);
  }

  const unmapped = await prisma.location.findMany({
    where: { region: null },
    select: { locationName: true },
  });
  if (unmapped.length > 0) {
    console.log(`\n⚠️  ${unmapped.length} location(s) chưa có region:`);
    unmapped.forEach(l => console.log(`   - ${l.locationName}`));
  }

  console.log('\n✅ Backfill completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
