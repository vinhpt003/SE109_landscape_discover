import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'Điểm đánh giá phải là số nguyên' })
  @Min(1, { message: 'Điểm đánh giá thấp nhất là 1 sao' })
  @Max(5, { message: 'Điểm đánh giá cao nhất là 5 sao' })
  rating!: number;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  content!: string;
}
