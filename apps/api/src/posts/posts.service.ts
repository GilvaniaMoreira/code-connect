import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostCommentDto, PostDetailDto, PostSummaryDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export type PaginatedPosts = {
  items: PostSummaryDto[];
  page: number;
  pageSize: number;
  total: number;
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreatePostDto): Promise<PostDetailDto> {
    const slug = await this.uniqueSlug(dto.title);
    const post = await this.prisma.post.create({
      data: {
        slug,
        title: dto.title.trim(),
        description: dto.description.trim(),
        code: dto.code,
        tags: dto.tags ?? [],
        thumbnail: dto.thumbnail ?? null,
        authorId,
      },
      include: {
        author: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    return PostDetailDto.fromDetail({
      post,
      likedByMe: false,
      viewerId: authorId,
    });
  }

  async list(query: ListPostsQueryDto): Promise<PaginatedPosts> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const skip = (page - 1) * pageSize;
    const tsQuery = buildTsQuery(query.q);

    if (tsQuery) {
      // Full-text search via query bruta para usar o índice GIN em search_document.
      const rows = await this.prisma.$queryRaw<
        Array<{ id: string; rank: number }>
      >(Prisma.sql`
        SELECT id, ts_rank(search_document, to_tsquery('portuguese', ${tsQuery})) AS rank
        FROM posts
        WHERE search_document @@ to_tsquery('portuguese', ${tsQuery})
        ORDER BY rank DESC, created_at DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `);
      const totalRow = await this.prisma.$queryRaw<
        Array<{ count: bigint }>
      >(Prisma.sql`
        SELECT count(*)::bigint AS count
        FROM posts
        WHERE search_document @@ to_tsquery('portuguese', ${tsQuery})
      `);
      const total = Number(totalRow[0]?.count ?? 0);

      if (rows.length === 0) {
        return { items: [], page, pageSize, total };
      }

      const ids = rows.map((r) => r.id);
      const posts = await this.prisma.post.findMany({
        where: { id: { in: ids } },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });
      const byId = new Map(posts.map((p) => [p.id, p]));
      const items = ids
        .map((id) => byId.get(id))
        .filter((p): p is (typeof posts)[number] => Boolean(p))
        .map((post) =>
          PostSummaryDto.fromPrisma({
            post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
          }),
        );
      return { items, page, pageSize, total };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.post.count(),
    ]);

    const items = posts.map((post) =>
      PostSummaryDto.fromPrisma({
        post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      }),
    );
    return { items, page, pageSize, total };
  }

  async findBySlug(slug: string, viewerId?: string): Promise<PostDetailDto> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) throw new NotFoundException('Post não encontrado');

    let likedByMe = false;
    if (viewerId) {
      const like = await this.prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId: viewerId } },
        select: { id: true },
      });
      likedByMe = Boolean(like);
    }
    return PostDetailDto.fromDetail({ post, likedByMe, viewerId });
  }

  async update(
    slug: string,
    viewerId: string,
    dto: UpdatePostDto,
  ): Promise<PostDetailDto> {
    const existing = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Post não encontrado');
    if (existing.authorId !== viewerId) {
      throw new ForbiddenException('Somente o autor pode editar este post');
    }

    const data: Prisma.PostUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;

    const updated = await this.prisma.post.update({
      where: { id: existing.id },
      data,
      include: {
        author: true,
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const like = await this.prisma.like.findUnique({
      where: { postId_userId: { postId: existing.id, userId: viewerId } },
      select: { id: true },
    });

    return PostDetailDto.fromDetail({
      post: updated,
      likedByMe: Boolean(like),
      viewerId,
    });
  }

  async remove(slug: string, viewerId: string): Promise<void> {
    const existing = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Post não encontrado');
    if (existing.authorId !== viewerId) {
      throw new ForbiddenException('Somente o autor pode excluir este post');
    }
    await this.prisma.post.delete({ where: { id: existing.id } });
  }

  async like(
    slug: string,
    userId: string,
  ): Promise<{ likesCount: number; likedByMe: true }> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    try {
      await this.prisma.like.create({ data: { postId: post.id, userId } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Você já curtiu este post');
      }
      throw err;
    }
    const likesCount = await this.prisma.like.count({
      where: { postId: post.id },
    });
    return { likesCount, likedByMe: true };
  }

  async unlike(
    slug: string,
    userId: string,
  ): Promise<{ likesCount: number; likedByMe: false }> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    await this.prisma.like
      .delete({ where: { postId_userId: { postId: post.id, userId } } })
      .catch((err: unknown) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          return null;
        }
        throw err;
      });
    const likesCount = await this.prisma.like.count({
      where: { postId: post.id },
    });
    return { likesCount, likedByMe: false };
  }

  async comment(
    slug: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<PostCommentDto> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    const comment = await this.prisma.comment.create({
      data: { postId: post.id, userId, content: dto.content.trim() },
      include: { user: true },
    });
    return PostCommentDto.fromPrisma(comment);
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'post';
    let candidate = base;
    let suffix = 1;
    // Tenta até encontrar um slug livre; conflito prático é raríssimo.
    while (
      await this.prisma.post.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
    return candidate;
  }
}

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

// Converte "react hooks" → "react:* & hooks:*" para busca por prefixo, ignorando
// tokens vazios e caracteres que quebrariam o parser do to_tsquery.
function buildTsQuery(input?: string): string | null {
  if (!input) return null;
  const tokens = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return null;
  return tokens.map((t) => `${t}:*`).join(' & ');
}
