import { Component, Ray, vec, Vector } from 'excalibur';

export type RaycastCameraComponentOptions = {
  FOV?: number;
  raysCount?: number;
  angleOffset?: number;
};
export class RaycastCameraComponent extends Component {
  FOV = 60;
  raysCount = 100;
  angleOffset = 0;
  rays: Ray[];

  constructor(options?: RaycastCameraComponentOptions) {
    super();

    const { FOV, raysCount, angleOffset } = options ?? {};

    this.FOV = ((FOV ?? this.FOV) * Math.PI) / 180;
    this.raysCount = raysCount ?? this.raysCount;
    this.angleOffset = angleOffset ?? this.angleOffset;

    this.rays = new Array(this.raysCount).fill(null).map(() => {
      return new Ray(vec(0, 0), Vector.Up);
    });
  }
}
