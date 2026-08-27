import { ThumbnailsController } from './thumbnails.controller';

describe('ThumbnailsController', () => {
  const controller = new ThumbnailsController();

  it('renders an SVG string with the seed initials', () => {
    const svg = controller.placeholder('como-usar-useeffect');

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 800 500"');
    expect(svg).toContain('>CU<');
  });

  it('falls back to </> when the seed has no alphanumerics', () => {
    const svg = controller.placeholder('---');

    expect(svg).toContain('&lt;/&gt;');
  });

  it('picks a deterministic palette per seed', () => {
    const first = controller.placeholder('react-hooks');
    const second = controller.placeholder('react-hooks');
    expect(first).toBe(second);
  });
});
