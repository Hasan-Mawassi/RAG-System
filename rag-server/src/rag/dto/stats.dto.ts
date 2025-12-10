// stats.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StatsDto {
  @ApiProperty({
    example: 15,
    description: 'Total number of documents uploaded',
  })
  totalDocuments: number;

  @ApiProperty({
    example: 'operational',
    description: 'Status of the RAG system',
  })
  status: string;
  //   @ApiProperty({
  //     example: 7,
  //     description: 'Total number of chats created across all users',
  //   })
  //   totalChats: number;

  //   @ApiProperty({
  //     example: 45,
  //     description: 'Total number of messages stored in the system',
  //   })
  //   totalMessages: number;
}
