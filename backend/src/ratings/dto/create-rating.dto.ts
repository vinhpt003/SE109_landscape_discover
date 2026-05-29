import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  @IsNotEmpty()
  postId!: string;

  @IsInt()
  @Min(1, { message: 'Điểm tối thiểu là 1' })
  @Max(5, { message: 'Điểm tối đa là 5' })
  score!: number;
}
