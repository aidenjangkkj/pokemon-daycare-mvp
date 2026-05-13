import { Rectangle, Texture } from "pixi.js";
import type { AtlasJson, NineSliceDefinition } from "./uiAtlas";

export function createSubTexture(
  baseTexture: Texture,
  atlas: AtlasJson,
  frameName: string,
): Texture {
  const frame = atlas.frames[frameName];
  if (!frame) {
    throw new Error(`Unknown atlas frame: ${frameName}`);
  }

  const { x, y, w, h } = frame.frame;
  return new Texture({
    source: baseTexture.source,
    frame: new Rectangle(x, y, w, h),
  });
}

export function getNineSliceDefinition(
  definitions: Record<string, NineSliceDefinition>,
  name: string,
): NineSliceDefinition {
  const definition = definitions[name];
  if (!definition) {
    throw new Error(`Unknown nine-slice definition: ${name}`);
  }

  return definition;
}
