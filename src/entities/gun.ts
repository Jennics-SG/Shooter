/** Name:   Shooter.gun.ts
 *  Desc:   Logic for gun
 *  Author: Jimy Houlbrook
 *  Date:   28/12/24
 */

import { Graphics, Container, Point } from "pixi.js";

import { Bullet } from "./bullet";

export class Gun extends Container{
    private _cursor: Graphics

    private _offset: number

    public timer!: number;
    public bulletContainer: Container;
    public bullets: Array<Bullet>

    constructor(x: number, y: number, w: number, h: number){
        super({x:0, y:0});

        this._offset = x;
        this.pivot = 0.5;

        this.bulletContainer = new Container();
        this.bullets = new Array();

        // Create cursor
        this._cursor = new Graphics();

        // Draw gun
        this._cursor.rect(
            x - w/2,
            y - h/2,
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
        const playerPos: Point = this.getGlobalPosition();
        const distance: Point = new Point(e.x - playerPos.x, e.y - playerPos.y);

        this.rotation = Math.atan2(distance.y, distance.x);
    }

    public spawnBullet(globalPos: Point): void{
        if(this.destroyed) return;
    
        // Get the current position of the gun by calculating the cosin
        const gunPos = new Point(
            globalPos.x + this._offset * Math.cos(this.rotation),
            globalPos.y + this._offset * Math.sin(this.rotation)
        );

        const bullet = new Bullet(
            gunPos.x,
            gunPos.y,
            20, 20, this.rotation
        );
        this.bulletContainer.addChild(bullet);
        this.bullets.push(bullet)

        // Destroy bullet in 1 second 
        const timer = setTimeout(()=> {
            this.bullets.shift()
            bullet.delete(bullet.timer);
        }, Bullet.LIFE_TIMER)
        bullet.setTimer(timer);

    }
}