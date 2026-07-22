import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();
    service = module.get(UsersService);
  });

  it('hashes password on create and returns user with id', async () => {
    const user = await service.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe('ana@x.com');
    expect(user.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', user.passwordHash)).toBe(true);
  });

  it('rejects duplicate email regardless of case', async () => {
    await service.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    await expect(
      service.create({
        nome: 'Ana 2',
        email: 'ANA@x.com',
        senha: 'password456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('finds user by email case-insensitively', async () => {
    const created = await service.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    expect(service.findByEmail('ANA@X.com')?.id).toBe(created.id);
    expect(service.findByEmail('unknown@x.com')).toBeUndefined();
  });
});
