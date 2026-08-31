import { ApiProperty } from '@nestjs/swagger';
import type { Comment, Post, User } from '@prisma/client';

export class PostAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() nome: string;
  @ApiProperty() handle: string;
}

export class PostSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiProperty({ nullable: true, required: false }) thumbnail: string | null;
  @ApiProperty({ type: PostAuthorDto }) author: PostAuthorDto;
  @ApiProperty() likesCount: number;
  @ApiProperty() commentsCount: number;
  @ApiProperty() createdAt: string;

  static fromPrisma(input: {
    post: Post & { author: User };
    likesCount: number;
    commentsCount: number;
  }): PostSummaryDto {
    const { post, likesCount, commentsCount } = input;
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      tags: post.tags,
      thumbnail: post.thumbnail,
      author: authorFor(post.author),
      likesCount,
      commentsCount,
      createdAt: post.createdAt.toISOString(),
    };
  }
}

export class PostCommentDto {
  @ApiProperty() id: string;
  @ApiProperty() content: string;
  @ApiProperty() createdAt: string;
  @ApiProperty({ type: PostAuthorDto }) author: PostAuthorDto;

  static fromPrisma(comment: Comment & { user: User }): PostCommentDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: authorFor(comment.user),
    };
  }
}

export class PostDetailDto extends PostSummaryDto {
  @ApiProperty() code: string;
  @ApiProperty({ type: [PostCommentDto] }) comments: PostCommentDto[];
  @ApiProperty() likedByMe: boolean;
  @ApiProperty() isAuthor: boolean;

  static fromDetail(input: {
    post: Post & {
      author: User;
      comments: (Comment & { user: User })[];
      _count: { likes: number; comments: number };
    };
    likedByMe: boolean;
    viewerId?: string;
  }): PostDetailDto {
    const { post, likedByMe, viewerId } = input;
    return {
      ...PostSummaryDto.fromPrisma({
        post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      }),
      code: post.code,
      likedByMe,
      isAuthor: viewerId !== undefined && post.authorId === viewerId,
      comments: post.comments.map((c) => PostCommentDto.fromPrisma(c)),
    };
  }
}

function authorFor(user: User): PostAuthorDto {
  return {
    id: user.id,
    nome: user.nome,
    handle: handleFromEmail(user.email),
  };
}

function handleFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  return `@${local.toLowerCase()}`;
}
