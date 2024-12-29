/** Name:   Shooter.StateManager.ts
 *  Desc:   Handle game state (menu, game, etc...)
 *  Author: Jimy Houlbrook
 *  Date:   29/12/24
 */

import { Application, Container } from "pixi.js";

import { MainWorld } from "./levels/MainWorld";

export class StateManager{

    private _parent: Application

    private _currentWord!: Container;

    constructor(parent: Application){
        this._parent = parent;
    }

    private unLoad(){
        if(!this._currentWord) return

        this._parent.stage.removeChild(this._currentWord);
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
        this._parent.stage.addChild(this._currentWord);
    }
}