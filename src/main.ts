/** Name:   Shooter.main.ts
 *  Desc:   Pixi Shooter main file
 *  Author: Jimy Houlbrook
 *  Date:   27/12/24
 */

import { Application, Assets, Sprite, Container, TilingSprite } from 'pixi.js';
import { Player } from './player';
import { Enemy } from './enemy';

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
        const cont = new Container({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            width: window.innerWidth,
            height: window.innerHeight
        })

        // Background
        const background = new TilingSprite({
            texture: Assets.get("background"),
            width: this.app.screen.width * 2,
            height: this.app.screen.height * 2
        });
        background.anchor.set(0.5);
        background.x = this.app.screen.width / 2;
        background.y = this.app.screen.height / 2;
        cont.addChild(background); 

        return cont
    }

    async startGame(): Promise<void>{
        // Create player
        const player = new Player(
            this.app.screen.width / 2, this.app.screen.height / 2,
            50, 100, this.world
        );

        this.app.stage.addChild(player);

        // Player tick function
        this.app.ticker.add(()=>player.onTick(this.world, this.app.ticker.deltaTime), player)

        const enemy = new Enemy(
            -200, -200, 100, 100, 200, 100
        );
        this.world.addChild(enemy); 

        // Enemy tick function
        this.app.ticker.add(()=> {
            enemy.onTick(player, this.app.ticker.deltaTime)
        })

        // Start ticker
        this.app.ticker.start();
    }
}

document.addEventListener("DOMContentLoaded", _=> new Shooter);