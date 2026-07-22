import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedAuthor = {
  nome: string;
  email: string;
  senha: string;
};

const authors: SeedAuthor[] = [
  { nome: 'Julio Xavier', email: 'julio@codeconnect.dev', senha: 'password123' },
  { nome: 'Marcia Lima', email: 'marcia@codeconnect.dev', senha: 'password123' },
  { nome: 'Gabriel Luz', email: 'gabriel_luz@codeconnect.dev', senha: 'password123' },
  { nome: 'Marcela Lins', email: 'marcela.lins@codeconnect.dev', senha: 'password123' },
];

type SeedPost = {
  title: string;
  slug: string;
  description: string;
  code: string;
  tags: string[];
  thumbnail: string | null;
  authorEmail: string;
  comments: Array<{ authorEmail: string; content: string }>;
  likedBy: string[];
};

const posts: SeedPost[] = [
  {
    title: 'Como estruturar componentes React reutilizáveis',
    slug: 'como-estruturar-componentes-react',
    description:
      'Um resumo prático das convenções que uso para escrever componentes React que escalam bem, com foco em separação de responsabilidades e composição.',
    code: `function Button({ variant = 'primary', children, ...rest }) {
  return (
    <button data-variant={variant} {...rest}>
      {children}
    </button>
  );
}`,
    tags: ['React', 'Frontend', 'Componentes'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    authorEmail: 'julio@codeconnect.dev',
    comments: [
      { authorEmail: 'marcia@codeconnect.dev', content: 'Achei muito bom seu código, @julio, parabéns!' },
      { authorEmail: 'gabriel_luz@codeconnect.dev', content: 'Quanto tempo você levou para finalizar esse projeto?' },
      { authorEmail: 'marcela.lins@codeconnect.dev', content: 'Espero chegar um dia nesse nível! Muito bom!' },
    ],
    likedBy: ['marcia@codeconnect.dev', 'gabriel_luz@codeconnect.dev', 'marcela.lins@codeconnect.dev'],
  },
  {
    title: 'Debounce e throttle em TypeScript',
    slug: 'debounce-e-throttle-typescript',
    description:
      'Diferença prática entre debounce e throttle, com implementações tipadas em TypeScript que aceitam qualquer assinatura de função.',
    code: `export function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let handle: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => fn(...args), delay);
  };
}`,
    tags: ['TypeScript', 'Performance'],
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
    authorEmail: 'marcia@codeconnect.dev',
    comments: [
      { authorEmail: 'julio@codeconnect.dev', content: 'Boa, agora consigo aplicar no search do meu app.' },
    ],
    likedBy: ['julio@codeconnect.dev', 'marcela.lins@codeconnect.dev'],
  },
  {
    title: 'Padronizando erros em uma API NestJS',
    slug: 'padronizando-erros-nestjs',
    description:
      'Como uso filters e HttpException do Nest para retornar payloads de erro consistentes ao consumidor.',
    code: `@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    res.status(status).json({ status, message: (exception as Error).message });
  }
}`,
    tags: ['NestJS', 'Backend', 'API'],
    thumbnail: null,
    authorEmail: 'gabriel_luz@codeconnect.dev',
    comments: [
      { authorEmail: 'julio@codeconnect.dev', content: 'Ótimo padrão, vou adotar aqui.' },
      { authorEmail: 'marcia@codeconnect.dev', content: 'Sem thumbnail? Adorei o placeholder!' },
    ],
    likedBy: ['julio@codeconnect.dev'],
  },
  {
    title: 'Full-text search em Postgres com tsvector',
    slug: 'full-text-search-postgres',
    description:
      'Como criar índices GIN sobre colunas tsvector geradas e escrever consultas rankeadas de busca em português.',
    code: `ALTER TABLE posts
  ADD COLUMN search_document tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX posts_search_document_idx ON posts USING GIN (search_document);`,
    tags: ['Postgres', 'SQL', 'Search'],
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    authorEmail: 'marcela.lins@codeconnect.dev',
    comments: [
      { authorEmail: 'julio@codeconnect.dev', content: 'Vou aplicar isso no meu blog.' },
      { authorEmail: 'gabriel_luz@codeconnect.dev', content: 'A parte de rank ficou perfeita.' },
    ],
    likedBy: ['julio@codeconnect.dev', 'gabriel_luz@codeconnect.dev', 'marcia@codeconnect.dev'],
  },
  {
    title: 'Melhorando a acessibilidade de forms',
    slug: 'acessibilidade-de-forms',
    description:
      'Checklist rápido de acessibilidade para formulários web: labels associadas, ordem de foco, mensagens de erro e feedback com aria-live.',
    code: `<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-err" />
<p id="email-err" role="alert" aria-live="polite" />`,
    tags: ['Acessibilidade', 'Frontend', 'A11y'],
    thumbnail: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=800',
    authorEmail: 'julio@codeconnect.dev',
    comments: [
      { authorEmail: 'marcela.lins@codeconnect.dev', content: 'aria-live é subestimado!' },
    ],
    likedBy: ['marcia@codeconnect.dev'],
  },
  {
    title: 'Dockerizando um monorepo pnpm',
    slug: 'dockerizando-monorepo-pnpm',
    description:
      'Estratégia de multi-stage Dockerfile para builds pequenos em monorepos com pnpm workspaces.',
    code: `FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN corepack enable && pnpm fetch

FROM deps AS build
COPY . .
RUN pnpm install --offline && pnpm --filter api build`,
    tags: ['Docker', 'DevOps', 'pnpm'],
    thumbnail: null,
    authorEmail: 'gabriel_luz@codeconnect.dev',
    comments: [],
    likedBy: ['marcela.lins@codeconnect.dev', 'julio@codeconnect.dev'],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHashes = await Promise.all(
    authors.map((a) => bcrypt.hash(a.senha, 10)),
  );

  const users = await Promise.all(
    authors.map((author, index) =>
      prisma.user.upsert({
        where: { email: author.email },
        update: {},
        create: {
          nome: author.nome,
          email: author.email,
          passwordHash: passwordHashes[index],
        },
      }),
    ),
  );
  const usersByEmail = new Map(users.map((u) => [u.email, u]));

  for (const seed of posts) {
    const author = usersByEmail.get(seed.authorEmail);
    if (!author) continue;

    await prisma.post.upsert({
      where: { slug: seed.slug },
      update: {
        title: seed.title,
        description: seed.description,
        code: seed.code,
        tags: seed.tags,
        thumbnail: seed.thumbnail,
      },
      create: {
        slug: seed.slug,
        title: seed.title,
        description: seed.description,
        code: seed.code,
        tags: seed.tags,
        thumbnail: seed.thumbnail,
        authorId: author.id,
      },
    });

    const post = await prisma.post.findUniqueOrThrow({ where: { slug: seed.slug } });

    // Recria os likes e comentários deste post idempotentemente
    await prisma.like.deleteMany({ where: { postId: post.id } });
    await prisma.comment.deleteMany({ where: { postId: post.id } });

    for (const email of seed.likedBy) {
      const user = usersByEmail.get(email);
      if (user) {
        await prisma.like.create({ data: { postId: post.id, userId: user.id } });
      }
    }

    for (const comment of seed.comments) {
      const user = usersByEmail.get(comment.authorEmail);
      if (user) {
        await prisma.comment.create({
          data: { postId: post.id, userId: user.id, content: comment.content },
        });
      }
    }
  }

  console.log(`✅ Seed concluído: ${users.length} usuários, ${posts.length} posts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
