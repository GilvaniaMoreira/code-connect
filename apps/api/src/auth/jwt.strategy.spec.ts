import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const config = { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;

  function build(findById: jest.Mock): JwtStrategy {
    const usersService = { findById } as unknown as UsersService;
    return new JwtStrategy(usersService, config);
  }

  it('validate returns a PublicUser projection when the user exists', async () => {
    const user: User = {
      id: 'u1',
      nome: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
    };
    const strategy = build(jest.fn().mockResolvedValue(user));

    const result = await strategy.validate({ sub: 'u1', email: 'ana@x.com' });

    expect(result).toEqual({ id: 'u1', nome: 'Ana', email: 'ana@x.com' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('validate throws UnauthorizedException when the user is missing', async () => {
    const strategy = build(jest.fn().mockResolvedValue(null));

    await expect(
      strategy.validate({ sub: 'missing', email: 'x@y.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('falls back to the dev secret when JWT_SECRET is unset', () => {
    const noopConfig = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    expect(
      () => new JwtStrategy({ findById: jest.fn() } as unknown as UsersService, noopConfig),
    ).not.toThrow();
  });
});
