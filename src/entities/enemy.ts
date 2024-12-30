/** Name:   Shooter.enemy.ts
 *  Desc:   Logic for the enemy
 *  Author: Jimy Houlbrook
 *  Date:   28/12/24
 */

import { Container, Graphics } from "pixi.js";
import { Point } from "@pixi/math";
import '@pixi/math-extras'

import { Player } from "./player";
import { HitBox } from "../collision";

interface EnemyOptions{
    stopRange?: number,
    health?: number,
    speed?: number,
}

export class Enemy extends Container{

    private _speed: number = 5;

    private _cursor: Graphics
    private _stopRange: number = 0;
    
    public health: number = 50;
    public hitbox: HitBox

    constructor(x: number, y: number, w: number, h: number, ops?: EnemyOptions){
        super({x, y});

        this.hitbox = {
            parent: this,
            width: w,
            height: h
        };

        // Overide defaults
        if(ops){
            this._speed = ops.speed ? ops.speed : this._speed;
            this._stopRange = ops.stopRange ? ops.stopRange : this._stopRange;
            this.health = ops.health ? ops.health : this.health;
        }

        this._cursor = new Graphics();
        this._cursor.rect(
            0 - w/2, 0 - h/2, w, h
        );
        this._cursor.fill("#ff5454")

        this.addChild(this._cursor)
    }

    // Calculate rotation towards point and set as entity rotation
    // Must take pos as global co-ords
    public lookAt(pos: Point): void{
        const distance = this.distanceVecFromPoint(pos);
        this.rotation = Math.atan2(distance.y, distance.x);
    }

    public moveToPoint(deltaTime: number): void{
         // Go in direction being faced
         const change = new Point(
            this._speed * Math.cos(this.rotation),
            this._speed * Math.sin(this.rotation)
        );

        change.normalize();
        this.x += change.x * deltaTime;
        this.y += change.y * deltaTime
    }

    public distanceNumFromPoint(pos: Point): number{
        const myPos = this.getGlobalPosition();

        // Pythag init
        const a = pos.x - myPos.x;
        const b = pos.y - myPos.y;
        return Math.sqrt(a**2 + b**2)
    }

    public distanceVecFromPoint(pos: Point): Point{
        const myPos = this.getGlobalPosition();
        return new Point(
            pos.x - myPos.x,
            pos.y - myPos.y
        );
    }

    public takeDamage(amount: number): void{
        this.health -= amount;
        this.alpha = 0.5
        setTimeout(()=> this.alpha = 1, 100);
    }

    public delete(){
        this.parent.removeChild(this)
        this.destroy({children: true});
    }

    public onTick(target: Player, deltaTime: number): void{
        if(this.destroyed) return;        
        this.lookAt(target.getGlobalPosition());

        // If player within stop range return
        if(this.distanceNumFromPoint(target.getGlobalPosition()) <= this._stopRange) return;
        this.moveToPoint(deltaTime);
    }
}