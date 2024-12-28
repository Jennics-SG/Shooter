/** Name:   Shooter.gun.ts
 *  Desc:   Logic for gun
 *  Author: Jimy Houlbrook
 *  Date:   28/12/24
 */

import { Graphics, Container, Point } from "pixi.js";

export class Gun extends Container{
    private _centerOffset: Point
    private _cursor: Graphics

    constructor(x: number, y: number, w: number, h: number){
        super({x:0, y:0});

        this.pivot = 0.5;

        this._centerOffset = new Point(w/2, h/2);

        // Create cursor
        this._cursor = new Graphics();

        // Draw gun
        this._cursor.rect(
            x,
            y,
            w, h
        );
        this._cursor.fill("#4d401e");

        this.addChild(this._cursor);

        // Mouse Move listener
        document.addEventListener("pointermove", this._updateRotation.bind(this));
    }

    // Update rotation of the gun
    private _updateRotation(e: MouseEvent): void{
        // We use global position because its less jittery
        const player: Point = this.toGlobal(this.position)
        const distance: Point = new Point(e.x - player.x, e.y - player.y);

        this.rotation = Math.atan2(distance.y, distance.x);
    }
}