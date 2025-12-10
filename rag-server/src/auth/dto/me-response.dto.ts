import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from 'src/users/dto/user.response.dto';

export class MeResponseDto {
  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;
}
