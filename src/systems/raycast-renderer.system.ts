import {
  Actor,
  CollisionGroup,
  Color,
  Debug,
  ExcaliburGraphicsContext,
  ImageSource,
  PreDrawEvent,
  Query,
  RayCastHit,
  Scene,
  System,
  SystemType,
  vec,
  Vector,
  World,
} from 'excalibur';
import { Tile, TiledResource } from '@excaliburjs/plugin-tiled';
import { RaycastCameraComponent } from '../components/raycast-camera.component';

enum HitFace {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export class RaycastRendererSystem extends System {
  public readonly systemType = SystemType.Draw;
  public query: Query<typeof RaycastCameraComponent>;
  private texturesConfig: Record<string, ImageSource> = {};
  tileMap: TiledResource;
  wallsCollisionGroup: CollisionGroup | undefined | null;
  position = { x: 0, y: 0 };
  dimensions = { width: 800, height: 600, tileHeight: 16 };

  constructor(
    public world: World,
    tileMap: TiledResource,
    texturesConfig?: Record<string, ImageSource>,
    wallsCollisionGroup?: CollisionGroup | null,
    position?: { x: number; y: number },
    dimensions?: { width: number; height: number; tileHeight: number }
  ) {
    super();
    this.tileMap = tileMap;
    this.wallsCollisionGroup = wallsCollisionGroup;
    this.query = this.world.query([RaycastCameraComponent]);
    this.position = position || this.position;
    this.dimensions = dimensions || this.dimensions;
    this.texturesConfig = texturesConfig || this.texturesConfig;
  }

  public initialize(world: World, scene: Scene): void {
    scene.on('predraw', (event: PreDrawEvent) => {
      const entity = this.query.getEntities()[0];
      const camera = entity.get(RaycastCameraComponent);

      event.ctx.drawRectangle(
        vec(this.position.x, this.position.y),
        this.dimensions.width,
        this.dimensions.height / 2,
        Color.Brown
      );

      event.ctx.drawRectangle(
        vec(this.position.x, this.position.y + this.dimensions.height / 2),
        this.dimensions.width,
        this.dimensions.height / 2,
        Color.Gray
      );

      event.ctx.save();
      this.updateRaycasting(camera, event.ctx);
      event.ctx.restore();
    });
  }

  private updateRaycasting(
    camera: RaycastCameraComponent,
    ctx: ExcaliburGraphicsContext
  ) {
    const owner = camera?.owner as Actor;

    const halfFOV = camera.FOV / 2;
    const ownerDir = owner.rotation + camera.angleOffset;

    for (let col = 0; col < camera.raysCount; col++) {
      const rayAngle =
        ownerDir - halfFOV + (col / (camera.raysCount - 1)) * camera.FOV;

      camera.rays[col].dir = Vector.fromAngle(rayAngle);
      camera.rays[col].pos = owner.pos;

      const rayHits = owner.scene?.physics.rayCast(camera.rays[col], {
        searchAllColliders: false,
        filter(hit) {
          return hit.body !== owner.body;
        },
      });

      // Hit
      const hit = rayHits?.[0];

      // Distance from the camera to the hit point
      const distance = hit?.distance;
      const correctedDistance = (distance || 0) * Math.cos(rayAngle - ownerDir); // fix fisheye

      // Information on the tile hit
      const point = hit?.point;

      hit?.normal;

      if (point) {
        const tile = this.tileMap.getTileByPoint(
          'maze',
          point.add(hit.normal.scale(-1))
        );

        this.drawWall(
          ctx,
          camera,
          col,
          correctedDistance,
          hit,
          tile?.tiledTile
        );
      }

      // Draw ray
      Debug.drawRay(camera.rays[col], {
        distance: distance ?? 0,
        color: Color.Yellow,
      });
    }
  }

  private calculateTileHitPosition(hit: RayCastHit): number {
    const point = hit?.point;
    const normal = hit?.normal;
    let hitFace: HitFace = HitFace.Bottom;
    let tileHitPosition = 0;

    if (normal?.x && normal?.x > 0) {
      hitFace = HitFace.Right;
    } else if (normal?.x && normal?.x < 0) {
      hitFace = HitFace.Left;
    } else if (normal?.y && normal?.y > 0) {
      hitFace = HitFace.Bottom;
    } else if (normal?.y && normal?.y < 0) {
      hitFace = HitFace.Top;
    }

    if (point?.x && (hitFace === HitFace.Top || hitFace === HitFace.Bottom)) {
      tileHitPosition = point.x % this.dimensions.tileHeight;
    } else if (
      point?.y &&
      (hitFace === HitFace.Left || hitFace === HitFace.Right)
    ) {
      tileHitPosition = point.y % this.dimensions.tileHeight;
    }

    return tileHitPosition;
  }

  private drawWall(
    ctx: ExcaliburGraphicsContext,
    camera: RaycastCameraComponent,
    rayIndex: number,
    distance: number,
    hit: RayCastHit,
    tile: Tile | undefined
  ) {
    if (!tile) {
      return;
    }

    const tileHitPosition = this.calculateTileHitPosition(hit);

    const rayWidth = this.dimensions.width / camera.raysCount;

    const projectionPlaneDist =
      this.dimensions.width / 2 / Math.tan(camera.FOV / 2);
    const wallHeight =
      (this.dimensions.tileHeight * projectionPlaneDist) / distance;

    const colOffset = this.dimensions.height / 2 - wallHeight / 2;

    ctx.drawImage(
      this.texturesConfig[tile?.id ?? 0].image,
      Math.floor(tileHitPosition),
      0,
      1,
      16,
      this.position.x + rayIndex * rayWidth,
      this.position.y + colOffset,
      rayWidth,
      wallHeight
    );
    ctx.tint = Color.DarkGray.darken(hit.normal.x * 0.2 + distance / 300);
  }

  public update(elapsed: number): void {
    // Needed to make the System run
  }
}
