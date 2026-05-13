import { useEffect, useRef } from "react";
import { Application, Assets, Sprite, type Texture } from "pixi.js";
import styles from "./PixiPetStage.module.css";

interface PixiPetStageProps {
  imageSrc: string;
  alt: string;
  isPixelArt: boolean;
  className?: string;
  transparentBackground?: boolean;
}

const STAGE_SIZE = 180;
const SPRITE_MAX_SIZE = 144;

export function PixiPetStage({
  imageSrc,
  alt,
  isPixelArt,
  className,
  transparentBackground = false,
}: PixiPetStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let isDisposed = false;
    let app: Application | null = null;

    async function mountPixiStage() {
      const host = containerRef.current;

      if (!host) {
        return;
      }

      host.innerHTML = "";

      const nextApp = new Application();

      await nextApp.init({
        width: STAGE_SIZE,
        height: STAGE_SIZE,
        backgroundAlpha: 0,
        antialias: !isPixelArt,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (isDisposed) {
        nextApp.destroy(true);
        return;
      }

      app = nextApp;

      const canvas = nextApp.canvas;
      canvas.className = styles.canvas;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.setAttribute("aria-label", alt);
      canvas.setAttribute("role", "img");

      if (isPixelArt) {
        canvas.style.imageRendering = "pixelated";
      }

      host.appendChild(canvas);

      const texture = (await Assets.load(imageSrc)) as Texture;

      if (isDisposed || !app) {
        return;
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(STAGE_SIZE / 2, STAGE_SIZE / 2);

      const scale = Math.min(
        SPRITE_MAX_SIZE / texture.width,
        SPRITE_MAX_SIZE / texture.height,
      );

      sprite.scale.set(scale);

      app.stage.removeChildren();
      app.stage.addChild(sprite);
    }

    void mountPixiStage();

    return () => {
      isDisposed = true;

      if (app) {
        app.destroy(true);
      }
    };
  }, [alt, imageSrc, isPixelArt]);

  return (
    <div
      ref={containerRef}
      className={className ? `${styles.stage} ${className}` : styles.stage}
      style={transparentBackground ? { background: "transparent" } : undefined}
    />
  );
}
