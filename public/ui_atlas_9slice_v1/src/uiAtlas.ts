export interface AtlasFrameRect { x: number; y: number; w: number; h: number; }
export interface AtlasFrame { frame: AtlasFrameRect; rotated: boolean; trimmed: boolean; spriteSourceSize: AtlasFrameRect; sourceSize: { w: number; h: number }; }
export interface AtlasJson { frames: Record<string, AtlasFrame>; meta: { image: string; size: { w: number; h: number }; scale: string }; }
export interface NineSliceDefinition { frame: string; slice: { left: number; right: number; top: number; bottom: number }; }
export type NineSliceJson = Record<string, NineSliceDefinition>;

export function getFrame(atlas: AtlasJson, name: string): AtlasFrame {
  const frame = atlas.frames[name];
  if (!frame) {
    throw new Error(`Unknown atlas frame: ${name}`);
  }
  return frame;
}
