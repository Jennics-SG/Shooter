/** Name:   Shooter.MainWorld.ts
 *  Desc:   Intialises main world & house ticker for game loop
 *  Author: Jimy Houlbrook
 *  Date:   29/12/24
 */

import Noise from "noisejs";

import { Container, Ticker, Assets, TilingSprite, Point } from "pixi.js";
import { Collisions } from "../collision";
import { Player } from "../entities/player";
import { Enemy } from "../entities/enemy";

import { StateManager } from "../StateManager";

interface Noise_Map_Cell{
    x: number,      // Global X Pos of cell
    y: number,      // Global Y Pos of cell
    value: number   // Perlin value of cell
}

export class MainWorld extends Container{
    private static GRID_SIZE: number = 16   // Pixels in a noise cell
    
    private _parent: StateManager
    private _environment: Container
    private _player!: Player
    private _enemies: Array<Enemy>
    private _projectiles: Container
    private _noiseMap: Array<Array<Noise_Map_Cell>>

    private _framesSinceEnemySpawn: number = 0;

    public ticker: Ticker
    public gameWidth: number;
    public gameHeight: number;

    constructor(x: number, y: number, w: number, h: number, parent: StateManager){
        super({
            x: 0, y: 0, width: w, height: h
        });

        this.gameWidth = w;
        this.gameHeight = h;

        this._parent = parent;

        this.ticker = new Ticker()
        this.ticker.autoStart = false;
        this.ticker.stop();

        this._projectiles = new Container();

        this._environment = new Container();
        this._environment.width = this.gameWidth * 2;
        this._environment.height = this.gameHeight * 2;

        this._enemies = new Array();

        this._noiseMap = this._generateNoiseMap(Math.random())

        this._load.bind(this)();
    }
 
    private _load(): void{
        // Background
        const background = new TilingSprite({
            texture: Assets.get("background"),
            width: this.gameWidth * 2,
            height: this.gameHeight * 2
        });
        background.x = this.gameWidth / 2;
        background.y = this.gameHeight / 2;
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

        const enemy = new Enemy(0, 0, 100, 50, {
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

    private _generateNoiseMap(seed: number): Array<Array<Noise_Map_Cell>>{
        const n = new Noise.Noise(seed);
        let g = new Array();

        for(let x = 0; x < this.gameWidth * 2; x += MainWorld.GRID_SIZE){
            let r = new Array();
            for(let y = 0; y < this.gameHeight * 2; y+= MainWorld.GRID_SIZE){
                let cell: Noise_Map_Cell = {
                    x, y,
                    value: (n.perlin2(x / 100, y / 100) * 100)
                }
                r.push(cell);
            }
            g.push(r);
        }
        return g
    }

    // Get perlin value of x/y co-ordinate
    private _getPerlinAtPoint(pos: Point): number{
        // Get point local to environment
        const p = this._environment.toLocal(pos);
        const x = Math.abs( 
            Math.floor((p.x / MainWorld.GRID_SIZE) % this._noiseMap[0].length)
        );

        const y = Math.abs(
            Math.floor((p.y / MainWorld.GRID_SIZE) % this._noiseMap.length)
        );

        return this._noiseMap[x][y].value
    }

    private _spawnEnemy(): void{
        // get random x,y
        // Check perlin value
        // If perlin value < 0, pick new point
        const getPoint = function(noiseMap: Array<Array<Noise_Map_Cell>>): Point{
            const i = Math.floor(Math.random() * noiseMap[0].length);
            const j = Math.floor(Math.random() * noiseMap.length)
   
            const mapCell = noiseMap[j][i]

            console.log(mapCell);

            return mapCell.value > 0 ? new Point(mapCell.x, mapCell.y) : getPoint(noiseMap);
        }
        const pos = getPoint(this._noiseMap);

        console.log(pos);

        const enemy = new Enemy(pos.x, pos.y, 100, 50, {
            stopRange: 300,
            speed: 5,
            health: 100
        });

        this._environment.addChild(enemy)

        this._enemies.push(enemy);
        this._framesSinceEnemySpawn = 0;
    }

    public onTick(deltaTime: number): void{
        // Run ticker for all enemies
        for(let enemy of this._enemies){
            enemy.onTick(this._player, deltaTime);
            
            // Is bullet hitting enemy?
            for(const bullet of this._player.gun.bullets){
                if(bullet.destroyed) continue;
                
                if(!Collisions.isColliding(bullet.hitbox, enemy.hitbox)) continue;
                bullet.delete(bullet.timer);
                enemy.takeDamage(10);
            }

            // Is player hitting enemy>
            if(Collisions.isColliding(enemy.hitbox, this._player.hitbox))   this._player.takeDamage(10);
        }

        // Enemy spawning logic
        this._framesSinceEnemySpawn++;
        // if(this._framesSinceEnemySpawn >= 100) this._spawnEnemy();
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