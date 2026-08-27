import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

type LoginBody = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type PostAuthor = { id: string; nome: string; handle: string };
type PostCommentBody = {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
};
type PostDetailBody = {
  id: string;
  slug: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
  thumbnail: string | null;
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  comments: PostCommentBody[];
  likedByMe: boolean;
};
type PostListBody = {
  items: Array<Omit<PostDetailBody, 'code' | 'comments' | 'likedByMe'>>;
  page: number;
  pageSize: number;
  total: number;
};
type LikeResponseBody = { likesCount: number; likedByMe: boolean };

describe('Posts (e2e)', () => {
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

  function unique(): string {
    counter += 1;
    return `${Date.now()}-${counter}`;
  }

  async function registerAndLogin(): Promise<{ userId: string; token: string }> {
    const suffix = unique();
    const dto = {
      nome: `User ${suffix}`,
      email: `user-${suffix}@x.com`,
      senha: 'password123',
    };
    const created = await request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: dto.email, senha: dto.senha })
      .expect(200);
    return {
      userId: (created.body as { id: string }).id,
      token: (login.body as LoginBody).access_token,
    };
  }

  async function createPost(
    token: string,
    overrides: Partial<{
      title: string;
      description: string;
      code: string;
      tags: string[];
    }> = {},
  ): Promise<PostDetailBody> {
    const suffix = unique();
    const dto = {
      title: `Post ${suffix}`,
      description: 'Descrição completa do post para testes end-to-end',
      code: 'const answer = 42;',
      ...overrides,
    };
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(dto)
      .expect(201);
    return res.body as PostDetailBody;
  }

  describe('POST /posts', () => {
    it('creates a post with 201 and derives a slug from the title', async () => {
      const { userId, token } = await registerAndLogin();
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `Como usar useEffect ${unique()}`,
          description: 'Um guia rápido sobre efeitos colaterais no React',
          code: 'useEffect(() => {}, []);',
          tags: ['React', 'Hooks'],
        })
        .expect(201);

      const body = res.body as PostDetailBody;
      expect(body.id).toEqual(expect.any(String));
      expect(body.slug).toMatch(/^como-usar-useeffect/);
      expect(body.author.id).toBe(userId);
      expect(body.likedByMe).toBe(false);
      expect(body.likesCount).toBe(0);
      expect(body.commentsCount).toBe(0);
      expect(body.tags).toEqual(['React', 'Hooks']);
    });

    it('rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Título válido',
          description: 'Descrição válida para o post',
          code: 'x',
        })
        .expect(401);
    });

    it('rejects payload violations with 400', async () => {
      const { token } = await registerAndLogin();
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'ab', description: 'short', code: '' })
        .expect(400);
    });
  });

  describe('GET /posts', () => {
    it('paginates results (returns items shaped as summaries)', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);

      const res = await request(app.getHttpServer())
        .get('/posts')
        .query({ page: 1, pageSize: 50 })
        .expect(200);

      const body = res.body as PostListBody;
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(50);
      expect(body.items).toEqual(expect.any(Array));
      const mine = body.items.find((item) => item.id === created.id);
      expect(mine).toBeDefined();
      expect(mine).not.toHaveProperty('code');
      expect(mine).not.toHaveProperty('comments');
    });

    it('supports full-text search via ?q=', async () => {
      const { token } = await registerAndLogin();
      const marker = `zxq${unique().replace(/[^a-z0-9]/gi, '')}`;
      const created = await createPost(token, {
        title: `Post sobre ${marker} e RxJS`,
        description: `Tópico ${marker} explorado em detalhes para testes`,
      });

      const res = await request(app.getHttpServer())
        .get('/posts')
        .query({ q: marker })
        .expect(200);

      const body = res.body as PostListBody;
      expect(body.total).toBeGreaterThanOrEqual(1);
      expect(body.items.some((item) => item.id === created.id)).toBe(true);
    });

    it('rejects invalid pagination with 400', async () => {
      await request(app.getHttpServer())
        .get('/posts')
        .query({ page: 0 })
        .expect(400);
    });
  });

  describe('GET /posts/:slug', () => {
    it('returns 200 with likedByMe=false for anonymous viewers', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);

      const res = await request(app.getHttpServer())
        .get(`/posts/${created.slug}`)
        .expect(200);

      const body = res.body as PostDetailBody;
      expect(body.id).toBe(created.id);
      expect(body.likedByMe).toBe(false);
      expect(body.comments).toEqual([]);
    });

    it('reflects likedByMe=true for the authenticated viewer who liked it', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/posts/${created.slug}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect((res.body as PostDetailBody).likedByMe).toBe(true);
    });

    it('returns 404 for a missing slug', async () => {
      await request(app.getHttpServer())
        .get(`/posts/nao-existe-${unique()}`)
        .expect(404);
    });
  });

  describe('POST /posts/:slug/likes', () => {
    it('creates a like (201) and increments the count', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);

      const res = await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const body = res.body as LikeResponseBody;
      expect(body.likedByMe).toBe(true);
      expect(body.likesCount).toBeGreaterThanOrEqual(1);
    });

    it('rejects a duplicate like from the same user with 409', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);
    });

    it('returns 404 when the post does not exist', async () => {
      const { token } = await registerAndLogin();
      await request(app.getHttpServer())
        .post(`/posts/nao-existe-${unique()}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('rejects unauthenticated likes with 401', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .expect(401);
    });
  });

  describe('DELETE /posts/:slug/likes', () => {
    it('removes an existing like and returns 200', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect((res.body as LikeResponseBody).likedByMe).toBe(false);
    });

    it('is idempotent when the like does not exist (still 200)', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);

      const res = await request(app.getHttpServer())
        .delete(`/posts/${created.slug}/likes`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect((res.body as LikeResponseBody).likedByMe).toBe(false);
    });
  });

  describe('POST /posts/:slug/comments', () => {
    it('creates a comment (201) and returns the DTO', async () => {
      const { userId, token } = await registerAndLogin();
      const created = await createPost(token);

      const res = await request(app.getHttpServer())
        .post(`/posts/${created.slug}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '   Muito bom!   ' })
        .expect(201);

      const body = res.body as PostCommentBody;
      expect(body.content).toBe('Muito bom!');
      expect(body.author.id).toBe(userId);
    });

    it('rejects unauthenticated comments with 401', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/comments`)
        .send({ content: 'oi' })
        .expect(401);
    });

    it('rejects empty content with 400', async () => {
      const { token } = await registerAndLogin();
      const created = await createPost(token);
      await request(app.getHttpServer())
        .post(`/posts/${created.slug}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' })
        .expect(400);
    });

    it('returns 404 when the post does not exist', async () => {
      const { token } = await registerAndLogin();
      await request(app.getHttpServer())
        .post(`/posts/nao-existe-${unique()}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'oi' })
        .expect(404);
    });
  });
});
