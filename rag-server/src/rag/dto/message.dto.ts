// message.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    example: 'user',
    description: 'Role of the speaker (user or assistant)',
  })
  role: 'user' | 'assistant';

  @ApiProperty({
    example: 'What is the topic of the document?',
    description: 'Content of the message',
  })
  content: string;

  @ApiProperty({
    example: '2025-01-10T12:00:00Z',
    description: 'Timestamp of the message',
  })
  createdAt: string;
}
