/** Name:   Bullet.shooter.ts
 *  Desc:   Logic for bullets
 *  Author: Jimy Houlbrook
 *  Date:   28/12/24
 */

import { Container, Graphics } from "pixi.js";

import { Point } from "@pixi/math";
import '@pixi/math-extras'

export class Bullet extends Container{
    public static LIFE_TIMER = 1000;
    private static SPEED = 10;

    private _cursor: Graphics;

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
}