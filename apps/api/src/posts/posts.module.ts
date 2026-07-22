import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ThumbnailsController } from './thumbnails.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PostsController, ThumbnailsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
