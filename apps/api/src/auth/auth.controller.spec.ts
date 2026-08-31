import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { User } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

type ServiceMock = {
  validateUser: jest.Mock;
  login: jest.Mock;
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: ServiceMock;

  beforeEach(async () => {
    service = { validateUser: jest.fn(), login: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('POST /auth/login validates credentials and returns the token', async () => {
    const user: User = {
      id: 'u1',
      nome: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
    };
    service.validateUser.mockResolvedValue(user);
    service.login.mockReturnValue({
      access_token: 't',
      token_type: 'Bearer',
      expires_in: 3600,
    });

    const result = await controller.login({
      email: 'ana@x.com',
      senha: 'password123',
    });

    expect(service.validateUser).toHaveBeenCalledWith(
      'ana@x.com',
      'password123',
    );
    expect(service.login).toHaveBeenCalledWith(user);
    expect(result.access_token).toBe('t');
  });

  it('propagates UnauthorizedException from the service', async () => {
    service.validateUser.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.login({ email: 'x@y.com', senha: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.login).not.toHaveBeenCalled();
  });
});
