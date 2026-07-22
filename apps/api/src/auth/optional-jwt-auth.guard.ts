import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Autentica se o token JWT vier no Authorization; caso contrário deixa passar
 * sem `req.user`. Usado em endpoints públicos que enriquecem a resposta quando
 * o viewer está logado (ex.: likedByMe no detalhe do post).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser | false): TUser | null {
    if (err || !user) return null;
    return user;
  }
}
