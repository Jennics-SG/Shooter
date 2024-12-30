/** Name:   Shooter.player.ts
 *  Desc:   Logic for player character
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24 
 */

import { Container, Graphics } from "pixi.js";
import { Point } from "@pixi/math";
import '@pixi/math-extras'

import { HitBox } from "../collision";
import { Gun } from "./gun";
import { MainWorld } from "../levels/MainWorld";

export class Player extends Container{
    private static AXIS_FLIP: number = -1;

    private _cursor: Graphics;
    private _controls: {[key: string]: boolean} = {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
    }
    private _centerOffset: Point
    
    public speed: number = 5;
    public gun: Gun
    public hitbox: HitBox
    public health: number;
    public invulnerable: boolean = false;

    constructor(x: number, y: number, w: number, h: number, world: MainWorld){
        super({x, y,});

        this.health = 100;

        this._centerOffset = new Point(w/2, h/2);

        this.hitbox = {
            parent: this,
            width: w,
            height: h
        }

        // Create cursor
        this._cursor = new Graphics();

        // Draw player
        this._cursor.rect(
            0 - this._centerOffset.x,
            0 - this._centerOffset.y,
            w, h
        );
        this._cursor.fill("#94e366");

        // Add graphics to container
        this.addChild(this._cursor);

        // Add gun to player
        this.gun = new Gun(
            0 + 100, 0, 50, 20
        )
        this.addChild(this.gun);
        world.addToProjectiles(this.gun.bulletContainer)

        // Event listeners for controls
        document.addEventListener('keydown', this._onKeyDown.bind(this))
        document.addEventListener('keyup', this._onKeyUp.bind(this))

        // Firing gun event listener
        document.addEventListener('mousedown', (e)=> 
            this.gun.spawnBullet.bind(this.gun)(this.getGlobalPosition())
        );
    }

    private _onKeyDown(e: KeyboardEvent): void{
        this._controls[e.code] = true;
    }

    private _onKeyUp(e: KeyboardEvent): void{
        this._controls[e.code] = false;
    }

    public takeDamage(amount: number): void{
        if(this.invulnerable) return;
        this.health -= amount;
        this.alpha = 0.5
        this.invulnerable = true;
        setTimeout(()=> this.alpha = 1, 100);
        setTimeout(()=> this.invulnerable = false, 1000);
    }

    // MOVING NEAR A BOUNDARY ------------------------------------------------------
    // We flip the movement axis to move player instead of the world
    private _boundMoveLeft(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move left
        if(change.x > 0 && this.x - this._centerOffset.x <= 0) return
        
        // Is player moving left OR is player moving back to center?
        if(change.x > 0 || change.x < 0 && this.x  <= world.width / 4)
            this.x += (change.x * Player.AXIS_FLIP) * delta;
        else world.x += change.x * delta;
    }

    private _boundMoveRight(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move right
        if(change.x < 0 && this.x + this._centerOffset.x >= world.width / 2) return

        // Is player moving right OR is player moving back to center?
        if(change.x < 0 || change.x > 0 && this.x > world.width / 4)
            this.x += (change.x * Player.AXIS_FLIP) * delta;
        else world.x += change.x * delta;
    }

    private _boundMoveUp(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move up
        if(change.y > 0 && this.y - this._centerOffset.y <= 0) return

        // Is player moving up OR is player moving back to center?
        if(change.y > 0 || change.y < 0 && this.y < world.height / 4)
            this.y += (change.y * Player.AXIS_FLIP) * delta;
        else world.y += change.y * delta;
    }

    private _boundMoveDown(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move down
        if(change.y < 0 && this.y + this._centerOffset.y >= world.height / 2) return;

        // Is player moving down OR is player moving back to center?
        if(change.y < 0 || change.y > 0 && this.y > world.height / 4)
            this.y += (change.y * Player.AXIS_FLIP) * delta
        else world.y += change.y * delta;
    }

    // TICKER FUNCTION --------------------------------------------------------------
    public onTick(world: Container, deltaTime: number): void{
        const change: Point = new Point(0, 0)

        // Controls are inverted so the world moves around player
        if(this._controls['KeyW'])
            change.y += this.speed
        if(this._controls['KeyA'])
            change.x += this.speed
        if(this._controls['KeyS'])
            change.y -= this.speed
        if(this._controls['KeyD'])
            change.x -= this.speed

        change.normalize();
        
        // Is camera hitting boundary?
        let camWithinBounds: {[key: string]: boolean} = {
            left: world.x - world.width / 4 < 0,
            right: world.x + world.width / 4 > 0,
            up: world.y - world.height / 4 < 0,
            down: world.y + world.height / 4 > 0 
        }

        // Horizontal Movement
        if(!camWithinBounds.left) this._boundMoveLeft(world, change, deltaTime);
        else if(!camWithinBounds.right) this._boundMoveRight(world, change, deltaTime)
        else world.x += change.x * deltaTime;

        // Vertical Movement
        if(!camWithinBounds.up) this._boundMoveUp(world, change, deltaTime);
        else if(!camWithinBounds.down) this._boundMoveDown(world, change, deltaTime);
        else world.y += change.y * deltaTime;

        // Execute onTick for bullets
        for(let bullet of this.gun.bullets){
            if(bullet.destroyed) continue;

            // Get global bullet position 
            const globalPos = bullet.getGlobalPosition()

            // Delete bullet if outside of world
            if(
                globalPos.x <= 10 || globalPos.x >= world.width  ||
                globalPos.y <= 10|| globalPos.y >= world.height
            ) bullet.delete(bullet.timer)
            
            bullet.onTick.bind(bullet)(deltaTime);
        }
    }

}