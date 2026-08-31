import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { PublicUser } from './dto/public-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiCreatedResponse({ type: PublicUser })
  @ApiConflictResponse({ description: 'Email já cadastrado' })
  async create(@Body() dto: CreateUserDto): Promise<PublicUser> {
    const user = await this.usersService.create(dto);
    return PublicUser.from(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: PublicUser })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  me(@Req() req: Request): PublicUser {
    const user = req.user as PublicUser | undefined;
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
