import {
  Actor,
  CollisionGroup,
  Color,
  Debug,
  ExcaliburGraphicsContext,
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

export class RaycastRendererSystem extends System {
  public readonly systemType = SystemType.Draw;
  public query: Query<typeof RaycastCameraComponent>;
  tileMap: TiledResource;
  wallsCollisionGroup: CollisionGroup | undefined | null;
  position = { x: 0, y: 0 };
  dimensions = { width: 600, height: 400 };

  constructor(
    public world: World,
    tileMap: TiledResource,
    wallsCollisionGroup?: CollisionGroup | null,
    position?: { x: number; y: number },
    dimensions?: { width: number; height: number }
  ) {
    super();
    this.tileMap = tileMap;
    this.wallsCollisionGroup = wallsCollisionGroup;
    this.query = this.world.query([RaycastCameraComponent]);
    this.position = position || this.position;
    this.dimensions = dimensions || this.dimensions;
  }

  public initialize(world: World, scene: Scene): void {
    scene.on('predraw', (event: PreDrawEvent) => {
      const entity = this.query.getEntities()[0];
      const camera = entity.get(RaycastCameraComponent);

      event.ctx.drawRectangle(
        vec(this.position.x, this.position.y),
        this.dimensions.width,
        this.dimensions.height,
        Color.Viridian
      );
      this.updateRaycasting(camera, event.ctx);
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

      // Distance from the camera to the hit point
      const distance = rayHits?.[0]?.distance;
      const correctedDistance = (distance || 0) * Math.cos(rayAngle - ownerDir); // fix fisheye

      // Information on the tile hit
      const point = rayHits?.[0]?.point;
      if (point) {
        const tile =
          this.tileMap.getTileByPoint(
            'maze',
            vec(point.x - 0.1, point.y - 0.1)
          ) ||
          this.tileMap.getTileByPoint(
            'maze',
            vec(point.x + 0.1, point.y + 0.1)
          );

        this.drawWall(
          ctx,
          camera,
          col,
          correctedDistance,
          rayHits?.[0],
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

  public update(elapsed: number): void {
    // needed to the system runs
  }

  private drawWall(
    ctx: ExcaliburGraphicsContext,
    camera: RaycastCameraComponent,
    rayIndex: number,
    distance: number,
    hit: RayCastHit,
    tile: Tile | undefined
  ) {
    const rayWidth = this.dimensions.width / camera.raysCount;
    const colHeight = Math.min(
      (20 * this.dimensions.height) / distance,
      this.dimensions.height
    );
    const colOffset = this.dimensions.height / 2 - colHeight / 2;

    ctx.drawRectangle(
      vec(this.position.x + rayIndex * rayWidth, this.position.y + colOffset),
      rayWidth,
      colHeight,
      Color.DarkGray.darken(hit.normal.x * 0.2 + distance / 400)
    );
  }
}
