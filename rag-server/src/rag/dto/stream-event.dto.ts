// stream-event.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StreamEventDto {
  @ApiProperty({
    example: 'Hello',
    description: 'Token content streamed from the LLM',
  })
  token: string;

  @ApiProperty({
    example: false,
    description: 'Whether the stream has ended',
  })
  done: boolean;
}
