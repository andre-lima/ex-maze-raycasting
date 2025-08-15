import { TiledResource } from '@excaliburjs/plugin-tiled';
import { ImageSource, Loader } from 'excalibur';

// It is convenient to put your resources in one place
export const Resources = {
  man: new ImageSource('/images/man.png'), // Vite public/ directory serves the root images
  wallTile: new ImageSource('/images/wall_tile.png'),
  wallTileRed: new ImageSource('/images/wall_tile_red.png'),
  debug: new ImageSource('/images/debug.png'),
} as const;

export const Tilemaps: Record<string, TiledResource> = {
  maze: new TiledResource('/maze/maze.tmx', {
    entityClassNameFactories: {},
    layerConfig: {
      maze: {
        useTileColliders: true,
      },
    },
  }),
} as const;

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values({ ...Resources, ...Tilemaps })) {
  loader.addResource(res);
}
