/** Name:   Shooter.MainWorld.ts
 *  Desc:   Intialises main world & house ticker for game loop
 *  Author: Jimy Houlbrook
 *  Date:   29/12/24
 */

import { Container, Ticker, Assets, TilingSprite } from "pixi.js";

import { Collisions } from "../collision";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";

import { StateManager } from "../StateManager";

export class MainWorld extends Container{

    private _parent: StateManager

    private _environment: Container

    private _player!: Player
    private _enemies: Array<Enemy>

    private _width: number;
    private _height: number;

    private _projectiles: Container

    public ticker: Ticker

    constructor(x: number, y: number, w: number, h: number, parent: StateManager){
        super({
            x: 0, y: 0, width: w, height: h
        });

        this._width = w;
        this._height = h;

        this._parent = parent;

        this.ticker = new Ticker()
        this.ticker.autoStart = false;
        this.ticker.stop();

        this._projectiles = new Container();

        this._environment = new Container();

        this._enemies = new Array();

        this._load.bind(this)();
    }

    private _load(): void{
        // Background
        const background = new TilingSprite({
            texture: Assets.get("background"),
            width: this._width * 2,
            height: this._height * 2
        });
        background.x = this._width / 2;
        background.y = this._height / 2;
        background.anchor.set(0.5);
        this._environment.addChild(background);

        this._initialiseWorld();
    }

    private _initialiseWorld(): void{
        this.addChild(this._environment)
        this.addChild(this._projectiles);

        this._player = new Player(
            this.width / 4, this.height / 4,
            50, 100, this
        )
        this.addChild(this._player);

        const enemy = new Enemy(0, 0, 100, 100, {
            stopRange: 300,
            speed: 5,
            health: 100
        });

        this._environment.addChild(enemy)

        this._enemies.push(enemy);

        this._initialiseTicker();
    }

    private _initialiseTicker(){
        // Adding player Tick function
        this.ticker.add( ()=> {
            this._player.onTick(this._environment, this.ticker.deltaTime)
        }, this._player);

        this.ticker.add( () =>{
            this.onTick(this.ticker.deltaTime);
        }, this);

        this.ticker.start();
    }

    public onTick(deltaTime: number){
        // Run ticker for all enemies
        for(let enemy of this._enemies){
            enemy.onTick(this._player, deltaTime);
            for(const bullet of this._player.gun.bullets){
                if(bullet.destroyed) continue;
                
                if(!Collisions.isColliding(bullet.hitbox, enemy.hitbox)) continue;
                bullet.delete(bullet.timer);
                enemy.takeDamage(10);
            }
            console.log(Collisions.isColliding(enemy.hitbox, this._player.hitbox));
            if(!Collisions.isColliding(enemy.hitbox, this._player.hitbox)) continue;

            this._player.takeDamage(10);
        }
    }

    public addToProjectiles(proj: Container){
        this._projectiles.addChild(proj);
    }

    public resetWorld(): void{
        this.removeChild(this._player)
        this._player.destroy({children: true})

        for(let enemy of this._enemies){
            this.removeChild(enemy)
            enemy.destroy({children: true})
        }

        this.removeChild(this._environment)
        this._environment.destroy({children: true});

        this._initialiseWorld();
    }

    public endGame(): void{
        console.log("End Game");
    }
}