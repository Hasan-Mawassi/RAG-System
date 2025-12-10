import { ApiProperty } from '@nestjs/swagger';

export class SourceItemDto {
  @ApiProperty({
    example: 'chapter1.pdf',
    description: 'Name of the PDF file where the chunk came from',
  })
  filename: string;

  @ApiProperty({
    example: 3,
    description: 'Index of the chunk inside the processed PDF',
  })
  chunkIndex: number;

  @ApiProperty({
    example: 'The main topic of the introduction is...',
    description: 'Extracted text content of the retrieved chunk',
  })
  content: string;
}
