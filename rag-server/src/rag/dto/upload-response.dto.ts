// upload-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    example: 'doc_123',
    description: 'The ID of the processed PDF document',
  })
  documentId: string;

  @ApiProperty({
    example: 'chat_456',
    description: 'Chat ID to which this PDF belongs',
  })
  chatId: string;

  @ApiProperty({
    example: true,
    description: 'Whether document processing succeeded',
  })
  processed: boolean;
}
