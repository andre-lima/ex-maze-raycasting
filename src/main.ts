import { DisplayMode, Engine } from 'excalibur';
import { loader } from './resources';
import { MyLevel } from './level';

export const Config = {
  PlayerSpeed: 16 * 2, // pixels/sec
  PlayerFrameSpeed: 200, // ms
};

const game = new Engine({
  width: 1000,
  height: 600,
  displayMode: DisplayMode.Fixed,
  pixelArt: true,
  scenes: {
    start: MyLevel,
  },
});

game
  .start('start', {
    loader,
  })
  .then(() => {
    // Do something after the game starts
  });

game.showDebug(true);
