import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. Clear existing data (order matters for FK) ────────────────────────
  await prisma.savedPost.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑  Cleared existing data');

  // ── 2. Users ─────────────────────────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  const [admin, editorViet, editorMai, userHung, userLinh] = await Promise.all([
    prisma.user.create({ data: { userName: 'admin',        email: 'admin@wandershare.vn',        password: await hash('admin123'),  role: 'Admin' } }),
    prisma.user.create({ data: { userName: 'editor_viet',  email: 'viet@wandershare.vn',         password: await hash('editor123'), role: 'Editor' } }),
    prisma.user.create({ data: { userName: 'editor_mai',   email: 'mai@wandershare.vn',          password: await hash('editor123'), role: 'Editor' } }),
    prisma.user.create({ data: { userName: 'traveler_hung',email: 'hung@gmail.com',              password: await hash('user123'),   role: 'RegisteredUser' } }),
    prisma.user.create({ data: { userName: 'traveler_linh',email: 'linh@gmail.com',              password: await hash('user123'),   role: 'RegisteredUser' } }),
  ]);

  console.log('👤 Created users:');
  console.log('   Admin         → userName: admin          | password: admin123');
  console.log('   Editor        → userName: editor_viet    | password: editor123');
  console.log('   Editor        → userName: editor_mai     | password: editor123');
  console.log('   RegisteredUser→ userName: traveler_hung  | password: user123');
  console.log('   RegisteredUser→ userName: traveler_linh  | password: user123');

  // ── 3. Locations ─────────────────────────────────────────────────────────
  const [halong, hoian, hue, muine, sapa, phongnha, dalat, cantho] = await Promise.all([
    prisma.location.create({ data: {
      locationName: 'Vịnh Hạ Long',
      description:  'Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi phủ rừng xanh, nằm ở tỉnh Quảng Ninh.',
      coordinates:  '20.9101,107.1839',
    }}),
    prisma.location.create({ data: {
      locationName: 'Phố cổ Hội An',
      description:  'Đô thị cổ giao thương thế kỷ 15–19, được UNESCO công nhận Di sản Thế giới, tỉnh Quảng Nam.',
      coordinates:  '15.8800,108.3380',
    }}),
    prisma.location.create({ data: {
      locationName: 'Hoàng Thành Huế',
      description:  'Di tích lịch sử Kinh đô triều Nguyễn, công trình kiến trúc đồ sộ giữa lòng Thừa Thiên Huế.',
      coordinates:  '16.4698,107.5796',
    }}),
    prisma.location.create({ data: {
      locationName: 'Mũi Né – Phan Thiết',
      description:  'Đồi cát trắng, cát đỏ hùng vĩ cùng bãi biển rực rỡ nắng vàng tại Bình Thuận.',
      coordinates:  '10.9333,108.2833',
    }}),
    prisma.location.create({ data: {
      locationName: 'Sa Pa',
      description:  'Thị trấn trong mây với ruộng bậc thang kỳ vĩ và đỉnh Fansipan hùng tráng ở Lào Cai.',
      coordinates:  '22.3363,103.8438',
    }}),
    prisma.location.create({ data: {
      locationName: 'Vườn Quốc gia Phong Nha – Kẻ Bàng',
      description:  'Hệ thống hang động kỳ vĩ nhất thế giới, Di sản UNESCO tại Quảng Bình.',
      coordinates:  '17.5500,106.2833',
    }}),
    prisma.location.create({ data: {
      locationName: 'Đà Lạt',
      description:  'Thành phố ngàn hoa trên cao nguyên Lâm Viên, nổi tiếng với khí hậu mát mẻ quanh năm.',
      coordinates:  '11.9465,108.4419',
    }}),
    prisma.location.create({ data: {
      locationName: 'Miền Tây Sông Nước',
      description:  'Đồng bằng sông Cửu Long với chợ nổi, vườn trái cây và nét văn hóa sông nước đặc trưng.',
      coordinates:  '10.0341,105.7882',
    }}),
  ]);

  console.log('\n📍 Created 8 locations');

  // ── 4. Posts ─────────────────────────────────────────────────────────────
  const posts = await Promise.all([

    // Hạ Long
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: halong.locationId,
      title:      'Vịnh Hạ Long – Kỳ quan thiên nhiên không thể bỏ lỡ',
      content:    'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên đẹp nhất thế giới, tọa lạc tại vùng biển Đông Bắc Việt Nam thuộc tỉnh Quảng Ninh. Với hơn 1.600 hòn đảo lớn nhỏ, phần lớn là đảo đá vôi không có người ở, vịnh tạo nên một bức tranh thiên nhiên hùng vĩ và thơ mộng.\n\nDu thuyền qua đêm là trải nghiệm không thể bỏ qua khi đến đây. Bạn sẽ được ngắm hoàng hôn trên mặt biển phẳng lặng như gương, thưởng thức hải sản tươi sống và khám phá các hang động kỳ ảo như Hang Sửng Sốt, Hang Đầu Gỗ.\n\nThời điểm lý tưởng nhất để ghé thăm là từ tháng 3 đến tháng 5, khi thời tiết trong lành, biển lặng và không quá nóng. Tránh mùa mưa bão từ tháng 7 đến tháng 9.',
      imageUrl:   'https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80',
      status:     'Publish',
    }}),

    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: halong.locationId,
      title:      'Kayaking Hạ Long – Chèo thuyền khám phá hang động bí ẩn',
      content:    'Nếu bạn yêu thiên nhiên và thích khám phá mạo hiểm, kayaking tại Vịnh Hạ Long chính là hoạt động dành cho bạn. Chèo thuyền kayak luồn lách qua các hang động nhỏ, khám phá những đầm phá ẩn mình sau vách đá – đó là những khoảnh khắc không thể nào quên.\n\nCác điểm kayaking nổi tiếng gồm: Hang Luồn (Ba Hang), Vịnh Lan Hạ và khu vực quanh đảo Ti Tốp. Hướng dẫn viên sẽ luôn đồng hành và đảm bảo an toàn tuyệt đối cho bạn.\n\nChi phí thuê kayak khoảng 100.000–150.000 VNĐ/giờ. Nhiều tour du thuyền đã bao gồm phần kayaking trong gói.',
      imageUrl:   'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80',
      status:     'Publish',
    }}),

    // Hội An
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: hoian.locationId,
      title:      'Hội An về đêm – Thành phố ngàn đèn lồng',
      content:    'Khi màn đêm buông xuống, Phố cổ Hội An biến thành một thế giới huyền ảo với hàng nghìn chiếc đèn lồng nhiều màu sắc lung linh trên mặt sông Thu Bồn. Đây là khoảng thời gian đẹp nhất trong ngày để dạo bộ và tận hưởng không khí cổ kính.\n\nĐừng bỏ lỡ lễ hội thả đèn hoa đăng vào đêm 14 âm lịch hàng tháng – khi đèn điện được tắt đi và cả phố cổ chỉ được thắp sáng bởi ánh đèn lồng. Thả một chiếc đèn hoa đăng xuống sông và ước một điều – trải nghiệm đó sẽ theo bạn mãi mãi.\n\nPhở, cao lầu, mì Quảng và bánh mì Hội An là những món ăn nhất định phải thử khi đến đây.',
      imageUrl:   'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=900&q=80',
      status:     'Publish',
    }}),

    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: hoian.locationId,
      title:      'May đo áo dài ở Hội An – Trải nghiệm văn hóa đặc sắc',
      content:    'Hội An nổi tiếng với nghề may đo thủ công truyền thống. Trong vòng 24–48 giờ, bạn có thể sở hữu một bộ áo dài hoặc vest được đo đúng số với giá cực kỳ hợp lý, chỉ từ 400.000–800.000 VNĐ tùy chất liệu.\n\nCác tiệm may uy tín tập trung trên đường Trần Phú và Lê Lợi. Nhớ mang theo ảnh mẫu quần áo bạn muốn, thợ may Hội An có thể làm theo bất kỳ kiểu dáng nào.\n\nNgoài áo dài, bạn cũng có thể đặt may túi xách, ba lô vải và các phụ kiện thủ công rất độc đáo. Mua sắm ở đây không chỉ là mua đồ – đó là một trải nghiệm văn hóa thực sự.',
      imageUrl:   'https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80',
      status:     'Publish',
    }}),

    // Huế
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: hue.locationId,
      title:      'Hoàng Thành Huế – Dấu ấn triều đại cuối cùng của Việt Nam',
      content:    'Hoàng Thành Huế (Đại Nội) là quần thể kiến trúc cung đình được xây dựng từ năm 1804 dưới triều Nguyễn. Với tổng diện tích hơn 500 ha, đây là một trong những di tích lịch sử-văn hóa lớn nhất và quan trọng nhất Việt Nam.\n\nBước qua Ngọ Môn – cổng chính của Hoàng Thành – bạn sẽ như bước vào một thế giới khác, nơi lịch sử hơn 200 năm được lưu giữ qua từng viên gạch, từng mái ngói. Điện Thái Hòa, Thế Miếu và Cung Diên Thọ là những điểm tham quan không thể bỏ qua.\n\nGiá vé vào cửa: 200.000 VNĐ/người. Nên thuê hướng dẫn viên hoặc audioguide để hiểu sâu hơn về lịch sử từng công trình.',
      imageUrl:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
      status:     'Publish',
    }}),

    // Mũi Né
    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: muine.locationId,
      title:      'Đồi cát Mũi Né – Sa mạc giữa lòng Việt Nam',
      content:    'Những đồi cát trắng và cát đỏ kỳ vĩ tại Mũi Né là điều hiếm thấy ở Đông Nam Á. Đây là điểm đến lý tưởng cho những ai muốn trải nghiệm cảm giác như đang ở giữa sa mạc Sahara ngay trên đất Việt.\n\nCưỡi xe địa hình ATV trên đồi cát là hoạt động được yêu thích nhất. Bạn cũng có thể thuê tấm trượt để lao xuống sườn đồi cát đỏ – vô cùng thú vị và phù hợp với mọi lứa tuổi.\n\nĐến Mũi Né vào buổi sáng sớm để ngắm bình minh trên đồi cát trắng – đây là khoảnh khắc đẹp nhất trong ngày. Tránh đến vào buổi trưa vì cát rất nóng và nắng gắt.',
      imageUrl:   'https://images.unsplash.com/photo-1585016058010-a285b9756fde?w=900&q=80',
      status:     'Publish',
    }}),

    // Sa Pa
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: sapa.locationId,
      title:      'Sa Pa mùa lúa chín – Vẻ đẹp ruộng bậc thang kỳ vĩ',
      content:    'Tháng 9 và tháng 10 là thời điểm vàng để ghé thăm Sa Pa khi ruộng bậc thang bước vào mùa lúa chín. Những thửa ruộng xếp tầng như bậc thang khổng lồ phủ một màu vàng óng ả – khung cảnh đẹp đến mức khó tin là có thật.\n\nMuốn ngắm ruộng bậc thang đẹp nhất, hãy đến bản Cát Cát, Lao Chải – Tả Van hoặc Mù Cang Chải (cách Sa Pa khoảng 4 tiếng). Homestay tại các bản làng dân tộc là lựa chọn tuyệt vời để trải nghiệm văn hóa H\'Mông và Dao đích thực.\n\nFansipan – nóc nhà Đông Dương cao 3.143m – có thể chinh phục bằng cáp treo hoặc leo núi 2 ngày 1 đêm theo cung đường dành cho những bạn yêu trekking.',
      imageUrl:   'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80',
      status:     'Publish',
    }}),

    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: sapa.locationId,
      title:      'Chinh phục Fansipan – Hành trình đến nóc nhà Đông Dương',
      content:    'Fansipan (3.143m) là đỉnh núi cao nhất Việt Nam và toàn bán đảo Đông Dương. Chinh phục Fansipan là giấc mơ của nhiều phượt thủ Việt Nam và du khách quốc tế.\n\nCó hai cách để lên đỉnh Fansipan:\n1. Cáp treo: Nhanh (15 phút), tiện lợi, phù hợp mọi lứa tuổi. Giá vé khứ hồi khoảng 700.000–800.000 VNĐ.\n2. Trekking: 2 ngày 1 đêm xuyên rừng nguyên sinh, đốt lửa trại và ngủ lều trên núi. Trải nghiệm này sẽ thay đổi bạn mãi mãi.\n\nDù chọn cách nào, khoảnh khắc đứng trên đỉnh Fansipan nhìn xuống biển mây bên dưới là một trong những trải nghiệm đỉnh cao nhất cuộc đời.',
      imageUrl:   'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=900&q=80',
      status:     'Publish',
    }}),

    // Phong Nha
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: phongnha.locationId,
      title:      'Phong Nha – Vương quốc hang động dưới lòng đất',
      content:    'Vườn Quốc gia Phong Nha – Kẻ Bàng (Quảng Bình) là Di sản Thiên nhiên Thế giới với hệ thống hang động phong phú và kỳ vĩ nhất hành tinh. Sơn Đoòng – hang động lớn nhất thế giới – tọa lạc nơi đây.\n\nHang Phong Nha, Hang Tối và Paradise Cave là những lựa chọn phù hợp cho khách du lịch thông thường với tour 1 ngày dễ đặt. Với những ai muốn mạo hiểm hơn, tour khám phá Sơn Đoòng (4,5 triệu VNĐ/người, giới hạn 1.000 người/năm) là trải nghiệm không có điểm tương đồng trên thế giới.\n\nDòng sông Son xanh biếc chảy qua rừng rậm và vào lòng hang – cảnh tượng siêu thực mà ảnh chụp không thể truyền tải hết vẻ đẹp thực sự.',
      imageUrl:   'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=900&q=80',
      status:     'Publish',
    }}),

    // Đà Lạt
    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: dalat.locationId,
      title:      'Đà Lạt – Thành phố ngàn hoa và những điều cần biết',
      content:    'Đà Lạt mang trong mình sức hút đặc biệt: thời tiết mát mẻ quanh năm (15–25°C), kiến trúc Pháp cổ điển, hoa nở bốn mùa và ẩm thực đường phố phong phú. Không lạ khi đây là điểm du lịch yêu thích của người Việt Nam.\n\nKhu du lịch thác Datanla, Hồ Tuyền Lâm, Thung lũng Tình Yêu và Làng Cù Lần là những điểm check-in nổi tiếng. Nhưng bí quyết để tận hưởng Đà Lạt thực sự là lang thang vô định qua các con đường thông reo, ghé vào một quán cà phê nhỏ với tách bạc xỉu nóng và ngắm mưa rơi.\n\nĂn gì ở Đà Lạt? Bánh tráng nướng, sữa đậu nành nóng, nem nướng Đà Lạt, bơ sáp và dâu tây tươi ngay tại vườn là những thứ không thể bỏ qua.',
      imageUrl:   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80',
      status:     'Publish',
    }}),

    // Miền Tây
    prisma.post.create({ data: {
      authorId:   editorViet.userId,
      locationId: cantho.locationId,
      title:      'Chợ nổi Cái Răng – Linh hồn của miền Tây sông nước',
      content:    'Chợ nổi Cái Răng tại Cần Thơ là một trong những chợ nổi lớn và nhộn nhịp nhất đồng bằng sông Cửu Long. Nơi đây hoạt động từ 5 giờ sáng, khi bóng tối còn chưa tan hẳn và ánh đèn thuyền le lói trên mặt sông.\n\nMỗi chiếc thuyền bán một loại hàng nông sản khác nhau, và người ta nhận biết bằng cách treo sản phẩm lên cây sào cao. Mít treo trên cao nghĩa là bán mít, khóm treo lên là bán khóm – đơn giản và thú vị như thế.\n\nÂm vực của miền Tây không chỉ có chợ nổi: vườn trái cây Cồn Sơn, làng bánh tráng Thuận Hưng, hay đơn giản là thuê xe đạp lạc vào những con đường bê tông nhỏ ven sông – tất cả đều mang lại cảm giác bình yên và thực đến lạ.',
      imageUrl:   'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=900&q=80',
      status:     'Publish',
    }}),

    // Pending post (chờ duyệt)
    prisma.post.create({ data: {
      authorId:   editorMai.userId,
      locationId: hue.locationId,
      title:      'Lăng Tự Đức – Nơi an nghỉ của vị vua thi sĩ',
      content:    'Lăng Tự Đức là lăng mộ và cũng là khu nghỉ ngơi của vua Tự Đức – vị vua thứ 4 của triều Nguyễn, nổi tiếng là nhà thơ tài hoa. Được xây dựng từ 1864–1867, toàn bộ khu lăng rộng 12 ha với hồ Lưu Khiêm thơ mộng, các đình tạ và vườn cây xanh mát.\n\nĐây là nơi hoàn hảo để bạn ngồi xuống, nhâm nhi tách trà và đọc thơ – đúng theo phong cách của vị vua đã thiết kế nơi này như một chốn ẩn dật giữa thiên nhiên.',
      imageUrl:   'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80',
      status:     'Pending',
    }}),
  ]);

  console.log(`\n📝 Created ${posts.length} posts (${posts.filter(p => p.status === 'Publish').length} Published, ${posts.filter(p => p.status === 'Pending').length} Pending)`);

  // ── 5. Comments ───────────────────────────────────────────────────────────
  const publishedPosts = posts.filter(p => p.status === 'Publish');

  await Promise.all([
    // Hạ Long post 1
    prisma.comment.create({ data: { postId: publishedPosts[0].postId, userId: userHung.userId,  content: 'Du thuyền qua đêm thật sự tuyệt vời! Mình đã trải nghiệm tour 2 ngày 1 đêm và không hề hối tiếc. Cảnh bình minh trên vịnh đẹp không tưởng.' } }),
    prisma.comment.create({ data: { postId: publishedPosts[0].postId, userId: userLinh.userId,  content: 'Mình đi tháng 4 năm ngoái, thời tiết rất đẹp. Hang Sửng Sốt rộng lớn hơn mình tưởng nhiều. Bài viết này giúp mình chuẩn bị kế hoạch rất tốt!' } }),

    // Hội An post
    prisma.comment.create({ data: { postId: publishedPosts[2].postId, userId: userLinh.userId,  content: 'Đêm 14 âm lịch ở Hội An là trải nghiệm không thể quên! Cả phố cổ chỉ thắp đèn lồng, không có điện – cảm giác như du hành về quá khứ.' } }),
    prisma.comment.create({ data: { postId: publishedPosts[2].postId, userId: userHung.userId,  content: 'Cao lầu ngon nhất mình từng ăn! Nhớ ăn đúng tiệm gốc ở chợ Hội An nhé, khác hẳn ngoài kia.' } }),

    // Huế post
    prisma.comment.create({ data: { postId: publishedPosts[4].postId, userId: userHung.userId,  content: 'Thuê áo dài chụp ảnh trong Hoàng Thành đẹp lắm! 50k/bộ thuê ngoài cổng, rất xứng đáng.' } }),

    // Sa Pa
    prisma.comment.create({ data: { postId: publishedPosts[6].postId, userId: userLinh.userId,  content: 'Mùa lúa chín tháng 9 đẹp đến nghẹt thở! Mình đứng ở đỉnh đồi Mù Cang Chải mà không muốn về.' } }),
    prisma.comment.create({ data: { postId: publishedPosts[7].postId, userId: userHung.userId,  content: 'Leo bộ 2 ngày lên Fansipan là quyết định tốt nhất cuộc đời mình! Mệt nhưng đáng từng bước chân.' } }),

    // Đà Lạt
    prisma.comment.create({ data: { postId: publishedPosts[9].postId, userId: userLinh.userId,  content: 'Đà Lạt mưa rơi ngồi trong quán cà phê có lò sưởi – đó là hạnh phúc. Bài viết hay quá!' } }),
    prisma.comment.create({ data: { postId: publishedPosts[9].postId, userId: userHung.userId,  content: 'Dâu tây hái tươi tại vườn ngon gấp đôi mua ngoài chợ! Ai chưa thử thì nhất định phải thử.' } }),
  ]);

  console.log('💬 Created comments');

  // ── 6. Ratings ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.rating.create({ data: { postId: publishedPosts[0].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[0].postId, userId: userLinh.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[1].postId, userId: userHung.userId,  score: 4 } }),
    prisma.rating.create({ data: { postId: publishedPosts[2].postId, userId: userLinh.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[2].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[3].postId, userId: userLinh.userId,  score: 4 } }),
    prisma.rating.create({ data: { postId: publishedPosts[4].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[5].postId, userId: userLinh.userId,  score: 4 } }),
    prisma.rating.create({ data: { postId: publishedPosts[6].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[6].postId, userId: userLinh.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[7].postId, userId: userLinh.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[8].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[9].postId, userId: userHung.userId,  score: 5 } }),
    prisma.rating.create({ data: { postId: publishedPosts[9].postId, userId: userLinh.userId,  score: 4 } }),
    prisma.rating.create({ data: { postId: publishedPosts[10].postId, userId: userHung.userId, score: 4 } }),
  ]);

  console.log('⭐ Created ratings');

  // ── 7. Saved posts (bookmarks) ────────────────────────────────────────────
  await Promise.all([
    prisma.savedPost.create({ data: { userId: userHung.userId, postId: publishedPosts[2].postId } }),
    prisma.savedPost.create({ data: { userId: userHung.userId, postId: publishedPosts[6].postId } }),
    prisma.savedPost.create({ data: { userId: userLinh.userId, postId: publishedPosts[0].postId } }),
    prisma.savedPost.create({ data: { userId: userLinh.userId, postId: publishedPosts[9].postId } }),
  ]);

  console.log('🔖 Created saved posts');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Seed completed!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('  TÀI KHOẢN SEED                               ');
  console.log('═══════════════════════════════════════════════');
  console.log('  Role           | userName       | password    ');
  console.log('───────────────────────────────────────────────');
  console.log('  Admin          | admin          | admin123    ');
  console.log('  Editor         | editor_viet    | editor123   ');
  console.log('  Editor         | editor_mai     | editor123   ');
  console.log('  RegisteredUser | traveler_hung  | user123     ');
  console.log('  RegisteredUser | traveler_linh  | user123     ');
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
