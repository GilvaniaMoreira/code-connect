import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

type ServiceMock = {
  list: jest.Mock;
  findBySlug: jest.Mock;
  create: jest.Mock;
  like: jest.Mock;
  unlike: jest.Mock;
  comment: jest.Mock;
};

function requestWithUser(id: string | null): Request {
  return {
    user: id ? { id, nome: 'A', email: 'a@x.com' } : undefined,
  } as unknown as Request;
}

describe('PostsController', () => {
  let controller: PostsController;
  let service: ServiceMock;

  beforeEach(async () => {
    service = {
      list: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn(),
      comment: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: service }],
    }).compile();
    controller = module.get(PostsController);
  });

  it('GET /posts delegates the query to the service', async () => {
    service.list.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 12,
      total: 0,
    });

    const query = { page: 1, pageSize: 12, q: 'react' };
    await controller.list(query);

    expect(service.list).toHaveBeenCalledWith(query);
  });

  it('GET /posts/:slug forwards the viewer id when authenticated', async () => {
    service.findBySlug.mockResolvedValue({});

    await controller.findOne('my-slug', requestWithUser('viewer-1'));

    expect(service.findBySlug).toHaveBeenCalledWith('my-slug', 'viewer-1');
  });

  it('GET /posts/:slug forwards undefined when anonymous', async () => {
    service.findBySlug.mockResolvedValue({});

    await controller.findOne('my-slug', requestWithUser(null));

    expect(service.findBySlug).toHaveBeenCalledWith('my-slug', undefined);
  });

  it('POST /posts calls create with the authenticated user id', async () => {
    service.create.mockResolvedValue({});
    const dto = {
      title: 'T',
      description: 'D'.repeat(15),
      code: 'c',
      tags: ['x'],
    };

    await controller.create(requestWithUser('author-1'), dto);

    expect(service.create).toHaveBeenCalledWith('author-1', dto);
  });

  it('POST /posts/:slug/likes calls service.like with slug and user id', async () => {
    service.like.mockResolvedValue({ likesCount: 1, likedByMe: true });

    await controller.like('s', requestWithUser('viewer-1'));

    expect(service.like).toHaveBeenCalledWith('s', 'viewer-1');
  });

  it('DELETE /posts/:slug/likes calls service.unlike with slug and user id', async () => {
    service.unlike.mockResolvedValue({ likesCount: 0, likedByMe: false });

    await controller.unlike('s', requestWithUser('viewer-1'));

    expect(service.unlike).toHaveBeenCalledWith('s', 'viewer-1');
  });

  it('POST /posts/:slug/comments forwards the DTO and user id', async () => {
    service.comment.mockResolvedValue({});
    const dto = { content: 'oi' };

    await controller.comment('s', requestWithUser('viewer-1'), dto);

    expect(service.comment).toHaveBeenCalledWith('s', 'viewer-1', dto);
  });
});
