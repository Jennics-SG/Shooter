/** Name:   Shooter.main.ts
 *  Desc:   Pixi Shooter main file
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24
 */

import { Application, Assets, Sprite, Container, TilingSprite } from 'pixi.js';
import { Player } from './player';

// Container to hold application
class Shooter{
    private app: Application;

    private world!: Container;

    constructor(){
        this.app = new Application();
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
        this.world = await this.setupWorld();

        this.app.stage.addChild(this.world);
        this.startGame();
    }

    async loadAssets(): Promise<void>{
        // Load Assets
        Assets.add({alias: "background", src: "./resources/background.png"});
        await Assets.load('background');
    }

    async setupWorld(): Promise<Container>{
        const cont = new Container()

        // Background
        const background = new TilingSprite(
            Assets.get("background"),
            this.app.screen.width * 2,
            this.app.screen.height * 2
        );
        cont.addChild(background); 

        return cont
    }

    async startGame(): Promise<void>{
        const player = new Player(
            this.app.screen.width / 2, this.app.screen.height / 2,
            100, 100
        );

        this.app.stage.addChild(player);
    }
}

document.addEventListener("DOMContentLoaded", _=> new Shooter);