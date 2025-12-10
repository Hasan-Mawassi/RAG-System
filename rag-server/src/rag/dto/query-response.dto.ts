// query-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourceItemDto } from './source-item.dto';

export class QueryResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the query succeeded',
  })
  success: boolean;

  @ApiProperty({
    example: 'The document discusses the impact of climate change...',
    description: 'Final generated answer from the AI model',
  })
  answer: string;

  @ApiProperty({
    type: [SourceItemDto],
    description: 'Relevant text chunks retrieved from stored documents',
  })
  sources: SourceItemDto[];

  @ApiProperty({
    example: 'What is the document about?',
    description: 'The question asked by the user',
  })
  question: string;

  @ApiPropertyOptional({
    example: 'Climate Change Summary',
    description: 'Optional updated title inferred from context',
  })
  updatedTitle?: string;
}
