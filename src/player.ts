/** Name:   Shooter.player.ts
 *  Desc:   Logic for player character
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24 
 */

import { Container, Graphics, Rectangle } from "pixi.js";
import { Point } from "@pixi/math";
import '@pixi/math-extras'

export class Player extends Container{
    private static AXIS_FLIP: number = -1;


    private _cursor: Graphics;
    private _controls: {[key: string]: boolean} = {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
    }
    
    public centerOffset: Point
    public speed: number = 5;

    constructor(x: number, y: number, w: number, h: number){
        super({x, y,});

        this.centerOffset = new Point(w/2, h/2);

        // Create cursor
        this._cursor = new Graphics();

        // Draw player
        this._cursor.rect(
            0 - this.centerOffset.x,
            0 - this.centerOffset.y,
            w, h
        );
        this._cursor.fill("#94e366");

        // Add graphics to container
        this.addChild(this._cursor);

        // Event listeners for controls
        document.addEventListener('keydown', this._onKeyDown.bind(this))
        document.addEventListener('keyup', this._onKeyUp.bind(this))
    }

    private _onKeyDown(e: KeyboardEvent): void{
        this._controls[e.code] = true;
    }

    private _onKeyUp(e: KeyboardEvent): void{
        this._controls[e.code] = false;
    }

    // MOVING NEAR A BOUNDARY ------------------------------------------------------
    // We flip the movement axis to move player instead of the world

    private _boundMoveLeft(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move left
        if(change.x > 0 && this.x - this.centerOffset.x <= 0) return
        
        // Is player moving left OR is player moving back to center?
        if(change.x > 0 && this.x > 0 || change.x < 0 && this.x  < world.width / 4)
            this.x += (change.x * Player.AXIS_FLIP) * delta;
        else world.x += change.x * delta;
    }

    private _boundMoveRight(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move right
        if(change.x < 0 && this.x + this.centerOffset.x >= world.width / 2) return

        // Is player moving right OR is player moving back to center?
        if(change.x < 0 || change.x > 0 && this.x > world.width / 4)
            this.x += (change.x * Player.AXIS_FLIP) * delta;
        else world.x += change.x * delta;
    }

    private _boundMoveUp(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move up
        if(change.y > 0 && this.y - this.centerOffset.y <= 0) return

        // Is player moving up OR is player moving back to center?
        if(change.y > 0 || change.y < 0 && this.y < world.height / 4)
            this.y += (change.y * Player.AXIS_FLIP) * delta;
        else world.y += change.y * delta;
    }

    private _boundMoveDown(world: Container, change: Point, delta: number){
        // Player is at edge of world, cannot move down
        if(change.y < 0 && this.y + this.centerOffset.y >= world.height / 2) return;

        // Is player moving down OR is player moving back to center?
        if(change.y < 0 || change.y > 0 && this.y > world.height / 4)
            this.y += (change.y * Player.AXIS_FLIP) * delta
        else world.y += change.y * delta; 
    }

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

    }

}