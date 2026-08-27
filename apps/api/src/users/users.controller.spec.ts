import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { PublicUser } from './dto/public-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

type ServiceMock = {
  create: jest.Mock;
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: ServiceMock;

  beforeEach(async () => {
    service = { create: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('POST /users creates the user and returns a PublicUser projection', async () => {
    service.create.mockResolvedValue({
      id: 'u1',
      nome: 'Ana',
      email: 'ana@x.com',
      passwordHash: 'secret',
      createdAt: new Date(),
    });
    const dto = { nome: 'Ana', email: 'ana@x.com', senha: 'password123' };

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBeInstanceOf(PublicUser);
    expect(result).toEqual({ id: 'u1', nome: 'Ana', email: 'ana@x.com' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('GET /users/me returns the user attached by the JWT guard', () => {
    const publicUser: PublicUser = { id: 'u1', nome: 'Ana', email: 'ana@x.com' };
    const req = { user: publicUser } as unknown as Request;

    expect(controller.me(req)).toBe(publicUser);
  });

  it('GET /users/me throws NotFoundException when no user is on the request', () => {
    const req = {} as Request;

    expect(() => controller.me(req)).toThrow(NotFoundException);
  });
});
