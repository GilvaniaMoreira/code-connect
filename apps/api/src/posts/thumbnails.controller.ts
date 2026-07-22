import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

// Paleta segura em relação ao design system (verde destaque + tons de grafite).
const PALETTE: Array<[string, string]> = [
  ['#132e35', '#81fe88'],
  ['#00090e', '#81fe88'],
  ['#171d1f', '#e1e1e1'],
  ['#132e35', '#e1e1e1'],
  ['#00090e', '#bcbcbc'],
];

@ApiTags('thumbnails')
@Controller('thumbnails')
export class ThumbnailsController {
  @Get(':seed')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'image/svg+xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400, immutable')
  @ApiOkResponse({
    description: 'Placeholder SVG determinístico baseado no seed.',
  })
  placeholder(@Param('seed') seed: string): string {
    const [bg, fg] = pickPalette(seed);
    const label = initials(seed);
    return renderSvg({ bg, fg, label });
  }
}

function pickPalette(seed: string): [string, string] {
  const hash = simpleHash(seed);
  return PALETTE[hash % PALETTE.length];
}

function initials(seed: string): string {
  const cleaned = seed.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim();
  if (!cleaned) return '</>';
  const words = cleaned.split(/[\s-]+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? words[0]?.[1] ?? '';
  return (first + second).toUpperCase() || '</>';
}

function simpleHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function renderSvg({
  bg,
  fg,
  label,
}: {
  bg: string;
  fg: string;
  label: string;
}): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Placeholder">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${fg}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <g fill="${fg}" font-family="ui-sans-serif, system-ui, Segoe UI, Roboto, sans-serif">
    <text x="60" y="120" font-size="28" opacity="0.6">&lt;/&gt; code connect</text>
    <text x="60" y="300" font-size="180" font-weight="700">${label}</text>
  </g>
</svg>`;
}
