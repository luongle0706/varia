/**
 * Meme Generator Engine
 * Handles high-DPI text rendering, word wrapping, classic outline meme text,
 * and modern solid banner headers with full alignment support (left/center/right).
 */

import type { MemeTextConfig, TextAlignment } from './types.js';

export interface WrappedLine {
  text: string;
  width: number;
}

/**
 * Breaks long text into lines that fit within a maximum width on the canvas.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  if (!text || text.trim() === '') return [];

  const rawLines = text.split('\n');
  const finalLines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i]!;
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        finalLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      finalLines.push(currentLine);
    }
  }

  return finalLines;
}

/**
 * Calculates the X position of a line of text given an alignment and bounding width.
 */
export function getTextXPosition(
  align: TextAlignment,
  padding: number,
  contentWidth: number,
  lineTextWidth: number,
): number {
  switch (align) {
    case 'left':
      return padding;
    case 'right':
      return padding + contentWidth - lineTextWidth;
    case 'center':
    default:
      return padding + (contentWidth - lineTextWidth) / 2;
  }
}

/**
 * Measures the required banner height for modern caption style.
 */
export function calculateBannerHeight(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: MemeTextConfig,
  canvasWidth: number,
): number {
  if (!config.bannerText || config.bannerText.trim() === '') {
    return 0;
  }

  const padding = Math.max(16, Math.round(canvasWidth * 0.04));
  const maxTextWidth = canvasWidth - padding * 2;
  const fontSize = config.fontSize || Math.max(18, Math.round(canvasWidth * 0.05));
  const lineHeight = Math.round(fontSize * 1.35);

  ctx.font = `700 ${fontSize}px ${config.fontFamily || 'Inter, sans-serif'}`;
  const lines = wrapText(ctx, config.bannerText, maxTextWidth);

  return padding * 2 + lines.length * lineHeight;
}

/**
 * Renders Classic Meme Text (Top and Bottom outline text).
 */
export function renderClassicMemeText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: MemeTextConfig,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const topText = config.uppercase ? config.topText.toUpperCase() : config.topText;
  const bottomText = config.uppercase ? config.bottomText.toUpperCase() : config.bottomText;

  if (!topText && !bottomText) return;

  const fontSize = config.fontSize || Math.max(24, Math.round(canvasWidth * 0.08));
  const fontFamily = config.fontFamily || 'Impact, "Arial Black", sans-serif';
  const lineHeight = Math.round(fontSize * 1.15);
  const padding = Math.max(16, Math.round(canvasWidth * 0.04));
  const maxTextWidth = canvasWidth - padding * 2;
  const outlineWidth = config.outlineWidth ?? Math.max(3, Math.round(fontSize * 0.08));

  ctx.save();
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = config.textColor || '#ffffff';
  ctx.strokeStyle = config.outlineColor || '#000000';
  ctx.lineWidth = outlineWidth;
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Render Top Text
  if (topText) {
    const topLines = wrapText(ctx, topText, maxTextWidth);
    let startY = padding;

    for (const line of topLines) {
      const lineMetrics = ctx.measureText(line);
      const startX = getTextXPosition(config.align, padding, maxTextWidth, lineMetrics.width);

      ctx.strokeText(line, startX, startY);
      ctx.fillText(line, startX, startY);
      startY += lineHeight;
    }
  }

  // Render Bottom Text
  if (bottomText) {
    const bottomLines = wrapText(ctx, bottomText, maxTextWidth);
    const totalBottomHeight = bottomLines.length * lineHeight;
    let startY = canvasHeight - padding - totalBottomHeight;

    for (const line of bottomLines) {
      const lineMetrics = ctx.measureText(line);
      const startX = getTextXPosition(config.align, padding, maxTextWidth, lineMetrics.width);

      ctx.strokeText(line, startX, startY);
      ctx.fillText(line, startX, startY);
      startY += lineHeight;
    }
  }

  ctx.restore();
}

/**
 * Renders Modern Caption Banner (Top white/dark rectangular header box).
 */
export function renderCaptionBanner(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  config: MemeTextConfig,
  bannerHeight: number,
  canvasWidth: number,
): void {
  if (bannerHeight <= 0 || !config.bannerText) return;

  const padding = Math.max(16, Math.round(canvasWidth * 0.04));
  const maxTextWidth = canvasWidth - padding * 2;
  const fontSize = config.fontSize || Math.max(18, Math.round(canvasWidth * 0.05));
  const lineHeight = Math.round(fontSize * 1.35);
  const fontFamily = config.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

  ctx.save();

  // Draw Banner Background
  ctx.fillStyle = config.bannerBgColor || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, bannerHeight);

  // Draw Banner Text
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = config.bannerTextColor || '#000000';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const textToDraw = config.uppercase ? config.bannerText.toUpperCase() : config.bannerText;
  const lines = wrapText(ctx, textToDraw, maxTextWidth);

  let startY = padding;
  for (const line of lines) {
    const lineMetrics = ctx.measureText(line);
    const startX = getTextXPosition(config.align, padding, maxTextWidth, lineMetrics.width);

    ctx.fillText(line, startX, startY);
    startY += lineHeight;
  }

  ctx.restore();
}
