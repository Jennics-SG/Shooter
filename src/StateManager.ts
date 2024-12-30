/** Name:   Shooter.StateManager.ts
 *  Desc:   Handle game state (menu, game, etc...)
 *  Author: Jimy Houlbrook
 *  Date:   29/12/24
 */

import { Application, Container } from "pixi.js";

import { MainWorld } from "./levels/MainWorld";

export class StateManager{

    public parent: Application

    private _currentWord!: Container;

    constructor(parent: Application){
        this.parent = parent;
    }

    private unLoad(){
        if(!this._currentWord) return

        this.parent.stage.removeChild(this._currentWord);
        this._currentWord.destroy({children: true});
    }

    public loadState(state: string){
        switch(state){
            case "game":
            case "Game":
                this._currentWord = new MainWorld(
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    window.innerWidth,
                    window.innerHeight,
                    this
                )
                break;
        }
        this.parent.stage.addChild(this._currentWord);
    }
}