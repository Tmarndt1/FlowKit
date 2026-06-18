import { IOffset } from "../interfaces/IOffset";

export function getOffset(
  containerOffset: IOffset | null | undefined,
  sourceOffset: IOffset | null | undefined,
  scale: number,
  buffer = 0
): IOffset | null {
  if (!containerOffset || !sourceOffset || scale === 0) return null;

  return {
    x: (sourceOffset.x - containerOffset.x) / scale + buffer / 2,
    y: (sourceOffset.y - containerOffset.y) / scale + buffer / 2,
  };
}

export function getBezier(
  containerOffset: IOffset,
  sourceOffset: IOffset,
  targetOffset: IOffset,
  scale: number,
  sourceBuffer = 0,
  targetBuffer = 0
): string | null {
  const source = getOffset(containerOffset, sourceOffset, scale, sourceBuffer);
  const target = getOffset(containerOffset, targetOffset, scale, targetBuffer);

  if (!source || !target) return null;

  const dx = target.x - source.x;
  const direction = dx >= 0 ? 1 : -1;

  const curve = Math.max(Math.abs(dx) * 0.5, 80);

  const sourceControlX = source.x + curve * direction;
  const targetControlX = target.x - curve * direction;

  return `
    M ${source.x},${source.y}
    C ${sourceControlX},${source.y}
      ${targetControlX},${target.y}
      ${target.x},${target.y}
  `;
}