import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

type PrismaMock = {
  user: {
    create: jest.Mock;
    findUnique: jest.Mock;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  it('hashes password on create and returns user with id', async () => {
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: '11111111-1111-1111-1111-111111111111',
      nome: data.nome,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    }));

    const user = await service.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.email).toBe('ana@x.com');
    expect(user.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', user.passwordHash)).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        nome: 'Ana',
        email: 'ana@x.com',
        passwordHash: user.passwordHash,
      },
    });
  });

  it('rejects duplicate email regardless of case', async () => {
    prisma.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        nome: 'Ana 2',
        email: 'ANA@x.com',
        senha: 'password456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'ana@x.com' }),
      }),
    );
  });

  it('finds user by email case-insensitively (lowercased query)', async () => {
    const storedUser: User = {
      id: '22222222-2222-2222-2222-222222222222',
      nome: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
    };
    prisma.user.findUnique.mockImplementation(async ({ where }) =>
      where.email === 'ana@x.com' ? storedUser : null,
    );

    await expect(service.findByEmail('ANA@X.com')).resolves.toEqual(storedUser);
    await expect(service.findByEmail('unknown@x.com')).resolves.toBeNull();
  });
});
