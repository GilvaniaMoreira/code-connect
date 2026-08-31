import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type PublicUserBody = { id: string; nome: string; email: string };
type LoginBody = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type UserFixture = { nome: string; email: string; senha: string };

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let counter = 0;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function makeUser(): UserFixture {
    counter += 1;
    const suffix = `${Date.now()}-${counter}`;
    return {
      nome: `User ${suffix}`,
      email: `auth-${suffix}@x.com`,
      senha: 'password123',
    };
  }

  describe('POST /users', () => {
    it('creates a user and returns 201 without password', async () => {
      const user = makeUser();
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);

      const body = res.body as PublicUserBody;
      expect(body).toEqual({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        nome: user.nome,
        email: user.email,
      });
      expect(body).not.toHaveProperty('senha');
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('rejects duplicate email regardless of case with 409', async () => {
      const user = makeUser();
      await request(app.getHttpServer()).post('/users').send(user).expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send({ ...user, email: user.email.toUpperCase() })
        .expect(409);
    });

    it('rejects short password with 400', async () => {
      const user = makeUser();
      await request(app.getHttpServer())
        .post('/users')
        .send({ ...user, senha: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let user: UserFixture;

    beforeEach(async () => {
      user = makeUser();
      await request(app.getHttpServer()).post('/users').send(user).expect(201);
    });

    it('issues a token on valid credentials (200)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, senha: user.senha })
        .expect(200);

      const body = res.body as LoginBody;
      expect(body).toEqual({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        access_token: expect.any(String),
        token_type: 'Bearer',
        expires_in: 3600,
      });
    });

    it('rejects wrong password with 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, senha: 'wrong-password' })
        .expect(401);
    });

    it('rejects unknown email with 401 (no enumeration)', async () => {
      counter += 1;
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `unknown-${Date.now()}-${counter}@x.com`,
          senha: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /users/me', () => {
    let user: UserFixture;
    let token: string;
    let createdUser: PublicUserBody;

    beforeEach(async () => {
      user = makeUser();
      const created = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);
      createdUser = created.body as PublicUserBody;

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, senha: user.senha })
        .expect(200);
      token = (login.body as LoginBody).access_token;
    });

    it('returns the authenticated user (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body as PublicUserBody).toEqual(createdUser);
    });

    it('rejects missing token with 401', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('rejects malformed token with 401', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });
});
