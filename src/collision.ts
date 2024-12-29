/** Name:   Collisions.Shooter.ts
 *  Desc:   Collision Logic
 *  Date:   29/12/24
 *  Author: Jimy Houlbrook
 */

import { Container, Point } from "pixi.js";

/** Interface used to represent a hitbox, done so
 *  we can run getGlobalPosition on the parent for colissions
 *  also means we can give h/w different from container for
 *  any entity with sub-entities
 * 
 */
export interface HitBox{
    parent: Container
    width: number,
    height: number
}

export class Collisions{
    public static isColliding(aCont: HitBox, bCont:HitBox){
        if(aCont.parent.destroyed || bCont.parent.destroyed) return false;    // Doesnt exist

        const aPos = aCont.parent.getGlobalPosition();
        const bPos = bCont.parent.getGlobalPosition();

        const a = {
            ...aPos,
            w: aCont.width,
            h: aCont.height
        }

        const b = {
            ...bPos,
            w: bCont.width,
            h: bCont.height
        }

        if(Collisions.distanceBetweenPoints(aPos, bPos) >= b.w * 1.5) return false;

        return a.x < b.x + b.w
            && a.x + a.w > b.x
            && a.y < b.y + b.h
            && a.y + a.h > b.h
    }

    public static distanceBetweenPoints(a: Point, b: Point){
        const d = {x: a.x - b.x, y: a.y - b.y};
        return Math.sqrt(d.x**2 + d.y**2);
    }
}