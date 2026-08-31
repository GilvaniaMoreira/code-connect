import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, type Comment, type Post, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from './posts.service';

type PrismaMock = {
  post: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  like: {
    create: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
  };
  comment: {
    create: jest.Mock;
  };
  $queryRaw: jest.Mock;
};

const author: User = {
  id: 'author-1',
  nome: 'Ana Dev',
  email: 'ana@x.com',
  passwordHash: 'hashed',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    slug: 'como-usar-useeffect',
    title: 'Como usar useEffect',
    description: 'Um guia rápido sobre efeitos colaterais no React',
    code: 'const x = 1;',
    tags: ['React', 'Hooks'],
    thumbnail: null,
    authorId: author.id,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = {
      post: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      like: {
        create: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      comment: {
        create: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PostsService);
  });

  describe('create', () => {
    it('generates a slug from the title, trims fields, and returns the detail DTO', async () => {
      prisma.post.findUnique.mockResolvedValue(null);
      prisma.post.create.mockImplementation((args: Prisma.PostCreateArgs) => {
        const data = args.data as Prisma.PostUncheckedCreateInput;
        return {
          ...makePost({
            slug: data.slug,
            title: data.title,
            description: data.description,
            code: data.code,
            tags: data.tags as string[],
            thumbnail: data.thumbnail ?? null,
          }),
          author,
          comments: [] as (Comment & { user: User })[],
          _count: { likes: 0, comments: 0 },
        };
      });

      const result = await service.create('author-1', {
        title: '  Como usar useEffect  ',
        description: '  Um guia rápido sobre efeitos colaterais no React  ',
        code: 'const x = 1;',
        tags: ['React'],
      });

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'como-usar-useeffect',
            title: 'Como usar useEffect',
            description: 'Um guia rápido sobre efeitos colaterais no React',
            authorId: 'author-1',
            tags: ['React'],
            thumbnail: null,
          }) as unknown,
        }),
      );
      expect(result.slug).toBe('como-usar-useeffect');
      expect(result.likedByMe).toBe(false);
      expect(result.author).toEqual({
        id: author.id,
        nome: author.nome,
        handle: '@ana',
      });
    });

    it('appends a numeric suffix when the base slug is taken', async () => {
      prisma.post.findUnique
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);
      prisma.post.create.mockImplementation((args: Prisma.PostCreateArgs) => {
        const data = args.data as Prisma.PostUncheckedCreateInput;
        return {
          ...makePost({ slug: data.slug, title: data.title }),
          author,
          comments: [] as (Comment & { user: User })[],
          _count: { likes: 0, comments: 0 },
        };
      });

      const result = await service.create('author-1', {
        title: 'Como usar useEffect',
        description: 'Um guia rápido sobre efeitos colaterais',
        code: 'const x = 1;',
      });

      expect(result.slug).toBe('como-usar-useeffect-2');
      expect(prisma.post.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('list', () => {
    it('paginates newest-first when no search query is provided', async () => {
      prisma.post.findMany.mockResolvedValue([
        {
          ...makePost({ id: 'p1', slug: 's1' }),
          author,
          _count: { likes: 3, comments: 2 },
        },
      ]);
      prisma.post.count.mockResolvedValue(1);

      const result = await service.list({ page: 1, pageSize: 12 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 12,
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
      expect(result).toEqual({
        items: [
          expect.objectContaining({
            id: 'p1',
            likesCount: 3,
            commentsCount: 2,
          }),
        ],
        page: 1,
        pageSize: 12,
        total: 1,
      });
    });

    it('falls back to defaults (page 1, pageSize 12) when omitted', async () => {
      prisma.post.findMany.mockResolvedValue([]);
      prisma.post.count.mockResolvedValue(0);

      const result = await service.list({});

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 12 }),
      );
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(12);
    });

    it('uses full-text search when a query is provided', async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([{ id: 'p1', rank: 0.9 }])
        .mockResolvedValueOnce([{ count: 1n }]);
      prisma.post.findMany.mockResolvedValue([
        {
          ...makePost({ id: 'p1' }),
          author,
          _count: { likes: 0, comments: 0 },
        },
      ]);

      const result = await service.list({
        q: 'react hooks',
        page: 1,
        pageSize: 12,
      });

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['p1'] } } }),
      );
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('short-circuits when full-text search returns no matches', async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: 0n }]);

      const result = await service.list({ q: 'nada', page: 1, pageSize: 12 });

      expect(prisma.post.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({ items: [], page: 1, pageSize: 12, total: 0 });
    });
  });

  describe('findBySlug', () => {
    it('returns the detail with likedByMe=false when no viewer is provided', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...makePost(),
        author,
        comments: [],
        _count: { likes: 5, comments: 0 },
      });

      const result = await service.findBySlug('como-usar-useeffect');

      expect(result.likedByMe).toBe(false);
      expect(result.likesCount).toBe(5);
      expect(prisma.like.findUnique).not.toHaveBeenCalled();
    });

    it('marks likedByMe=true when the viewer has a like on the post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...makePost(),
        author,
        comments: [],
        _count: { likes: 1, comments: 0 },
      });
      prisma.like.findUnique.mockResolvedValue({ id: 'like-1' });

      const result = await service.findBySlug(
        'como-usar-useeffect',
        'viewer-1',
      );

      expect(prisma.like.findUnique).toHaveBeenCalledWith({
        where: { postId_userId: { postId: 'post-1', userId: 'viewer-1' } },
        select: { id: true },
      });
      expect(result.likedByMe).toBe(true);
    });

    it('throws NotFoundException when the slug does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('marks isAuthor=true when the viewer authored the post', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...makePost(),
        author,
        comments: [],
        _count: { likes: 0, comments: 0 },
      });

      const result = await service.findBySlug('como-usar-useeffect', author.id);

      expect(result.isAuthor).toBe(true);
    });

    it('marks isAuthor=false when the viewer is not the author', async () => {
      prisma.post.findUnique.mockResolvedValue({
        ...makePost(),
        author,
        comments: [],
        _count: { likes: 0, comments: 0 },
      });

      const result = await service.findBySlug(
        'como-usar-useeffect',
        'viewer-1',
      );

      expect(result.isAuthor).toBe(false);
    });
  });

  describe('update', () => {
    it('trims fields and persists only the ones present in the DTO', async () => {
      prisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-1',
        authorId: author.id,
      });
      prisma.post.update.mockResolvedValue({
        ...makePost({ title: 'Novo título' }),
        author,
        comments: [],
        _count: { likes: 0, comments: 0 },
      });
      prisma.like.findUnique.mockResolvedValue(null);

      const result = await service.update('como-usar-useeffect', author.id, {
        title: '  Novo título  ',
        description: '  Descrição maior que dez caracteres  ',
      });

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: expect.objectContaining({
          title: 'Novo título',
          description: 'Descrição maior que dez caracteres',
        }) as unknown,
        include: expect.any(Object) as unknown,
      });
      const firstCall = prisma.post.update.mock.calls[0] as [
        { data: Record<string, unknown> },
      ];
      const dataArg = firstCall[0].data;
      expect(dataArg).not.toHaveProperty('code');
      expect(dataArg).not.toHaveProperty('tags');
      expect(dataArg).not.toHaveProperty('thumbnail');
      expect(result.isAuthor).toBe(true);
    });

    it('throws NotFoundException when the slug does not exist', async () => {
      prisma.post.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.update('missing', author.id, { title: 'Novo título' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.post.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the viewer is not the author', async () => {
      prisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-1',
        authorId: author.id,
      });

      await expect(
        service.update('como-usar-useeffect', 'other-user', {
          title: 'Novo título',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.post.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the post when the viewer is the author', async () => {
      prisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-1',
        authorId: author.id,
      });
      prisma.post.delete.mockResolvedValue({});

      await service.remove('como-usar-useeffect', author.id);

      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: 'post-1' },
      });
    });

    it('throws NotFoundException when the slug does not exist', async () => {
      prisma.post.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove('missing', author.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the viewer is not the author', async () => {
      prisma.post.findUnique.mockResolvedValueOnce({
        id: 'post-1',
        authorId: author.id,
      });

      await expect(
        service.remove('como-usar-useeffect', 'other-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });
  });

  describe('like', () => {
    it('creates the like and returns the updated count', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      prisma.like.create.mockResolvedValue({});
      prisma.like.count.mockResolvedValue(7);

      const result = await service.like('como-usar-useeffect', 'viewer-1');

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { postId: 'post-1', userId: 'viewer-1' },
      });
      expect(result).toEqual({ likesCount: 7, likedByMe: true });
    });

    it('throws NotFoundException when the post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.like('missing', 'viewer-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.like.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException on duplicate like (P2002)', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      prisma.like.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.like('como-usar-useeffect', 'viewer-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('unlike', () => {
    it('deletes the like and returns the updated count', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      prisma.like.delete.mockResolvedValue({});
      prisma.like.count.mockResolvedValue(2);

      const result = await service.unlike('como-usar-useeffect', 'viewer-1');

      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { postId_userId: { postId: 'post-1', userId: 'viewer-1' } },
      });
      expect(result).toEqual({ likesCount: 2, likedByMe: false });
    });

    it('is idempotent when the like was not there (P2025 swallowed)', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      prisma.like.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        }),
      );
      prisma.like.count.mockResolvedValue(0);

      const result = await service.unlike('como-usar-useeffect', 'viewer-1');

      expect(result).toEqual({ likesCount: 0, likedByMe: false });
    });

    it('throws NotFoundException when the post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.unlike('missing', 'viewer-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('comment', () => {
    it('trims content, persists the comment, and returns the DTO', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: 'post-1' });
      const created: Comment & { user: User } = {
        id: 'comment-1',
        postId: 'post-1',
        userId: author.id,
        content: 'Muito bom!',
        createdAt: new Date('2026-02-01T00:00:00Z'),
        user: author,
      };
      prisma.comment.create.mockResolvedValue(created);

      const result = await service.comment('como-usar-useeffect', author.id, {
        content: '   Muito bom!   ',
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: { postId: 'post-1', userId: author.id, content: 'Muito bom!' },
        include: { user: true },
      });
      expect(result).toEqual({
        id: 'comment-1',
        content: 'Muito bom!',
        createdAt: '2026-02-01T00:00:00.000Z',
        author: { id: author.id, nome: author.nome, handle: '@ana' },
      });
    });

    it('throws NotFoundException when the post does not exist', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.comment('missing', 'viewer-1', { content: 'oi' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });
  });
});
