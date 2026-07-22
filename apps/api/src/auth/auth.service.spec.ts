import { UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { jwtConstants } from './jwt.constants';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
      ],
      providers: [AuthService, UsersService],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('issues a token on valid credentials', async () => {
    await usersService.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    const user = await authService.validateUser('ana@x.com', 'password123');
    const response = authService.login(user);

    expect(response.access_token).toEqual(expect.any(String));
    expect(response.token_type).toBe('Bearer');
    expect(response.expires_in).toBe(3600);
  });

  it('rejects wrong password', async () => {
    await usersService.create({
      nome: 'Ana',
      email: 'ana@x.com',
      senha: 'password123',
    });

    await expect(
      authService.validateUser('ana@x.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects unknown email with the same exception (no enumeration)', async () => {
    await expect(
      authService.validateUser('unknown@x.com', 'password123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
