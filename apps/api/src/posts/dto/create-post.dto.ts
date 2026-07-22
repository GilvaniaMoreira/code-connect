import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Como usar useEffect', minLength: 3, maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'Um guia rápido sobre efeitos colaterais no React',
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 'const x = 1;\n', maxLength: 20000 })
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  code: string;

  @ApiProperty({ type: [String], example: ['React', 'Hooks'], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Type(() => String)
  tags?: string[];

  @ApiProperty({
    example: 'https://cdn.example.com/thumb.png',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;
}
