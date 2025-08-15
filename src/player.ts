import { Actor, CollisionType, Engine, Keys, vec, Vector } from 'excalibur';
import { Resources } from './resources';
import { Config } from './main';
import { RaycastCameraComponent } from './components/raycast-camera.component';

export class Player extends Actor {
  constructor() {
    super({
      name: 'Player',
      pos: vec(150, 150),
      width: 8,
      height: 8,
      collisionType: CollisionType.Active,
    });
  }

  override onInitialize() {
    this.graphics.add(Resources.man.toSprite());
    this.addComponent(
      new RaycastCameraComponent({
        raysCount: 300,
        FOV: 60,
        angleOffset: -Math.PI / 2,
      })
    );
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    this.vel = Vector.Zero;
    this.angularVelocity = 0;
    const direction = Vector.fromAngle(this.rotation - Math.PI / 2);

    if (engine.input.keyboard.isHeld(Keys.ArrowRight)) {
      this.angularVelocity = Config.PlayerSpeed / 30;
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowLeft)) {
      this.angularVelocity = -Config.PlayerSpeed / 30;
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowUp)) {
      this.vel = direction.scale(Config.PlayerSpeed);
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowDown)) {
      this.vel = direction.scale(-Config.PlayerSpeed);
    }
  }
}
