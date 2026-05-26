import { PartialType } from '@nestjs/mapped-types';
import { CreateLandmarkDto } from './create-landmark.dto';

// PartialType sẽ tự động copy toàn bộ các trường của CreateLandmarkDto,
// nhưng biến tất cả chúng thành tuỳ chọn (Optional).
// Nghĩa là Admin muốn sửa trường nào thì gửi trường đó lên, không bắt buộc gửi hết.
export class UpdateLandmarkDto extends PartialType(CreateLandmarkDto) {}
