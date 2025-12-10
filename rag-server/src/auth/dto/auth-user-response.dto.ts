import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from 'src/users/dto/user.response.dto';

export class AuthUserResponseDto {
  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;
}
