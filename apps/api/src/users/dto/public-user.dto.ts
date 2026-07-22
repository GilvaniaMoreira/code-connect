import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class PublicUser {
  @ApiProperty({ example: 'c3a1e3a0-5b1a-4b6f-8b3a-2c7d9f0a1b2c' })
  id: string;

  @ApiProperty({ example: 'Ana Silva' })
  nome: string;

  @ApiProperty({ example: 'ana@codeconnect.dev', format: 'email' })
  email: string;

  static from(user: User): PublicUser {
    const publicUser = new PublicUser();
    publicUser.id = user.id;
    publicUser.nome = user.nome;
    publicUser.email = user.email;
    return publicUser;
  }
}
