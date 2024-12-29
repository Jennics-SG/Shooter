/** Name:   Bullet.shooter.ts
 *  Desc:   Logic for bullets
 *  Author: Jimy Houlbrook
 *  Date:   28/12/24
 */

import { Container, Graphics } from "pixi.js";

import { Point } from "@pixi/math";
import '@pixi/math-extras'

export class Bullet extends Container{
    public static LIFE_TIMER = 5000;
    private static SPEED = 10;

    private _cursor: Graphics;

    public timer!: number;

    constructor(x: number, y: number, w: number, h: number, rot: number){
        super({x, y, width: w, height: h});
        this.pivot = 0.5;

        // Draw graphic
        this._cursor = new Graphics();
        this._cursor.rect(
            0,
            0,
            w, h
        );
        this._cursor.fill("#ffd000");

        this.addChild(this._cursor);
        this.rotation = rot;
    }

    public setTimer(timer: number){
        this.timer = timer
    }

    public isColliding(obj: Container): boolean{
        if(this.destroyed || obj.destroyed) return false;

        const aPos = this.getGlobalPosition();
        const bPos = obj.getGlobalPosition();

        const a = {
            ...aPos,
            w: this.width,
            h: this.height
        }
        const b = {
            ...bPos,
            w: obj.width,
            h: obj.height
        }

        if(
            this.distanceNumFromPoint(bPos) >= b.w * 1.5
        ) return false;

        return a.x < b.x + b.w
            && a.x + a.w > b.x
            && a.y < b.y + b.h
            && a.y + a.h > b.h

    }

    public distanceNumFromPoint(pos: Point): number{
        const myPos = this.getGlobalPosition();

        // Pythag init
        const a = pos.x - myPos.x;
        const b = pos.y - myPos.y;
        return Math.sqrt(a**2 + b**2)
    }

    public onTick(deltaTime: number){
        if(this.destroyed) return;
        
        // Go in direction being faced
        const change = new Point(
            Bullet.SPEED * Math.cos(this.rotation),
            Bullet.SPEED * Math.sin(this.rotation)
        )

        change.normalize();
        this.x += change.x * deltaTime;
        this.y += change.y * deltaTime
    }

    public delete(timer: number){
        this.parent.removeChild(this);
        this.destroy();
        clearTimeout(timer)
    }
}