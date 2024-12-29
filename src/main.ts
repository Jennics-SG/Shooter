/** Name:   Shooter.main.ts
 *  Desc:   Pixi Shooter main file
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24
 */

import { Application, Assets, Sprite, Container, TilingSprite } from 'pixi.js';
import { StateManager } from './StateManager';

// Container to hold application
class Shooter{
    private app: Application;

    private _stateManager: StateManager

    constructor(){
        this.app = new Application();
        this._stateManager = new StateManager(this.app);
        this.init();
    }

    async init(): Promise<void>{
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            canvas: <HTMLCanvasElement>document.getElementById("app"),
            background: 0x00000,
            antialias: true,
            resizeTo: window,
        });
        await this.loadAssets();
        this._stateManager.loadState("game");
    }

    async loadAssets(): Promise<void>{
        // Load Assets
        Assets.add({alias: "background", src: "./resources/background.png"});
        await Assets.load('background');
    }
}

document.addEventListener("DOMContentLoaded", _=> new Shooter);