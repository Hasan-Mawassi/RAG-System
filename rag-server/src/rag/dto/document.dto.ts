// document.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DocumentDto {
  @ApiProperty({ example: 'doc_123', description: 'Unique document ID' })
  id: string;

  @ApiProperty({ example: 'report.pdf', description: 'Document name' })
  name: string;

  @ApiProperty({
    example: 'application/pdf',
    description: 'MIME type of the file',
  })
  mimetype: string;

  @ApiProperty({
    example: 102400,
    description: 'File size in bytes',
  })
  size: number;

  @ApiProperty({
    example: '2025-01-10T10:00:00Z',
    description: 'When the document was uploaded',
  })
  createdAt: string;
}
