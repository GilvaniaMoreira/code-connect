import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  access_token: string;

  @ApiProperty({ example: 'Bearer', enum: ['Bearer'] })
  token_type: 'Bearer';

  @ApiProperty({
    example: 3600,
    description: 'Tempo de vida do token em segundos',
  })
  expires_in: number;
}
