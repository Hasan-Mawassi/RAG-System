// chat.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ example: 'chat_123', description: 'Unique chat ID' })
  id: string;

  @ApiProperty({
    example: '2025-01-10T11:30:00Z',
    description: 'When the chat was created',
  })
  createdAt: string;

  @ApiProperty({
    example: 'My Study Session',
    required: false,
    nullable: true,
    description: 'Optional chat title',
  })
  title?: string | null;
}
