/** Name:   Shooter.player.ts
 *  Desc:   Logic for player character
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24 
 */

import { Container, Graphics } from "pixi.js";

export class Player extends Container{
    private _cursor: Graphics;

    constructor(x: number, y: number, w: number, h: number){
        super({
            x, y
        });

        // Create cursor
        this._cursor = new Graphics();

        // Draw player
        this._cursor.rect(x, y, w, h);
        this._cursor.fill("0x94e366");

        // Add graphics to container
        this.addChild(this._cursor);
    }
}