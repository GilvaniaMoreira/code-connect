import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();
  private readonly byEmail = new Map<string, string>();

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();

    if (this.byEmail.has(email)) {
      throw new ConflictException('Email já cadastrado');
    }

    const user: User = {
      id: randomUUID(),
      nome: dto.nome,
      email,
      passwordHash: await bcrypt.hash(dto.senha, 10),
      createdAt: new Date(),
    };

    this.users.set(user.id, user);
    this.byEmail.set(email, user.id);
    return user;
  }

  findByEmail(email: string): User | undefined {
    const id = this.byEmail.get(email.toLowerCase().trim());
    return id ? this.users.get(id) : undefined;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}
