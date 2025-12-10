import { ApiProperty } from '@nestjs/swagger';

export class UserDeleteResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}
