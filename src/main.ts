import { DisplayMode, Engine } from 'excalibur';
import { loader } from './resources';
import { MyLevel } from './level';

export const Config = {
  PlayerSpeed: 16 * 2, // pixels/sec
  PlayerFrameSpeed: 200, // ms
};

const game = new Engine({
  width: 800, // Logical width and height in game pixels
  height: 600,
  displayMode: DisplayMode.FitScreenAndFill,
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
