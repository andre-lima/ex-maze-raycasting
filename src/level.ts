import { Engine, Scene, vec } from 'excalibur';
import { Player } from './player';
import { Tilemaps } from './resources';
import { RaycastRendererSystem } from './systems/raycast-renderer.system';

export class MyLevel extends Scene {
  override onInitialize(engine: Engine): void {
    const maze = Tilemaps.maze;
    maze.addToScene(this);

    const { x, y } = maze.getObjectsByName('player_start')[0];

    const player = new Player();
    this.add(player); // Actors need to be added to a scene to be drawn
    player.pos = vec(x, y);

    this.world.add(
      new RaycastRendererSystem(
        this.world,
        maze,
        null,
        { x: 0, y: 0 },
        { width: 1000, height: 600, tileWidth: 16 }
      )
    );
  }
}
