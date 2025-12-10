import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponse {
  @ApiProperty({
    example: 'clu1pfx8v0000absx9lfn6laq',
    description: 'The user ID',
  })
  id: string;

  @ApiProperty({ example: 'hasan@gmail.com', description: 'The user Email' })
  email: string;

  @Exclude()
  passwordHash: string;

  @ApiProperty({ example: new Date(), description: 'The user Created At' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'The user Updated At' })
  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}
