import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { PublicUser } from '../users/dto/public-user.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostCommentDto, PostDetailDto, PostSummaryDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPosts, PostsService } from './posts.service';

class PaginatedPostsDto implements PaginatedPosts {
  items: PostSummaryDto[];
  page: number;
  pageSize: number;
  total: number;
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOkResponse({ type: PaginatedPostsDto })
  list(@Query() query: ListPostsQueryDto): Promise<PaginatedPosts> {
    return this.postsService.list(query);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOkResponse({ type: PostDetailDto })
  findOne(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<PostDetailDto> {
    const viewer = req.user as PublicUser | undefined;
    return this.postsService.findBySlug(slug, viewer?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: PostDetailDto })
  create(
    @Req() req: Request,
    @Body() dto: CreatePostDto,
  ): Promise<PostDetailDto> {
    const user = req.user as PublicUser;
    return this.postsService.create(user.id, dto);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: PostDetailDto })
  @ApiForbiddenResponse({ description: 'Somente o autor pode editar' })
  update(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Body() dto: UpdatePostDto,
  ): Promise<PostDetailDto> {
    const user = req.user as PublicUser;
    return this.postsService.update(slug, user.id, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'Somente o autor pode excluir' })
  remove(@Param('slug') slug: string, @Req() req: Request): Promise<void> {
    const user = req.user as PublicUser;
    return this.postsService.remove(slug, user.id);
  }

  @Post(':slug/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  like(@Param('slug') slug: string, @Req() req: Request) {
    const user = req.user as PublicUser;
    return this.postsService.like(slug, user.id);
  }

  @Delete(':slug/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  unlike(@Param('slug') slug: string, @Req() req: Request) {
    const user = req.user as PublicUser;
    return this.postsService.unlike(slug, user.id);
  }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: PostCommentDto })
  comment(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Body() dto: CreateCommentDto,
  ): Promise<PostCommentDto> {
    const user = req.user as PublicUser;
    return this.postsService.comment(slug, user.id, dto);
  }
}
