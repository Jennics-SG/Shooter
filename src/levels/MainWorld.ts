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

interface Difficulty{
    multiplier: number,
    maxEnemy: number,
    spawnAmount: number,
    enemiesKilled: number
}

interface EnemyStats{
    class: string,
    baseHealth: number,
    baseSpeed: number
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

    private _currentDifficulty: Difficulty = {
        multiplier: 2,
        maxEnemy: 3,
        spawnAmount: 0,
        enemiesKilled: 0
    }

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

        this._spawnEnemy();

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

            return mapCell.value > 0 ? new Point(mapCell.x, mapCell.y) : getPoint(noiseMap);
        }
        const pos = getPoint(this._noiseMap);

        const enemyStats: EnemyStats = {
            class: "test",
            baseHealth: 20,
            baseSpeed: 5,
        } 

        let healthMultiplier = Math.random() * this._currentDifficulty.multiplier;
        let speedMultiplier = Math.random() * this._currentDifficulty.multiplier / 10

        console.log(enemyStats.baseHealth *= healthMultiplier, enemyStats.baseSpeed += speedMultiplier);

        const enemy = new Enemy(pos.x, pos.y, 100, 50, {
            stopRange: 75,
            speed: enemyStats.baseSpeed,
            health: enemyStats.baseHealth
        });

        this._environment.addChild(enemy)

        this._enemies.push(enemy);
        this._framesSinceEnemySpawn = 0;
        this._currentDifficulty.spawnAmount++;

    }

    private _increaseDifficulty(){
        let m = this._currentDifficulty.multiplier;
        this._currentDifficulty.maxEnemy += m;
        this._currentDifficulty.multiplier += m;
        this._currentDifficulty.enemiesKilled = 0;
        this._currentDifficulty.spawnAmount = 0;
        this._player.speed += m / 10;

        console.log(this._currentDifficulty);
    }

    private destroyEnemy(e: Enemy){
        const i = this._enemies.indexOf(e);
        
        if(i == -1) return

        this._environment.removeChild(e);
        this._enemies.splice(i, 1);
        e.destroy({children: true});
    }

    public onTick(deltaTime: number): void{
        // Run ticker for all enemies
        for(let enemy of this._enemies){
            if(enemy.health <= 0){
                this.destroyEnemy(enemy);
                this._currentDifficulty.enemiesKilled++;

                console.log("ENEMIES SPAWNED: ", this._currentDifficulty.spawnAmount)
                console.log("MAX ENEMIES: ", this._currentDifficulty.maxEnemy)
                console.log("ENEMIES KILLED: ", this._currentDifficulty.enemiesKilled)
            }
            enemy.onTick(this._player, deltaTime);
            
            // Is bullet hitting enemy?
            for(const bullet of this._player.gun.bullets){
                if(bullet.destroyed) continue;
                
                if(!Collisions.isColliding(bullet.hitbox, enemy.hitbox)) continue;
                bullet.delete(bullet.timer);
                enemy.takeDamage(20 * this._currentDifficulty.multiplier);
            }

            // Is player hitting enemy>
            if(Collisions.isColliding(enemy.hitbox, this._player.hitbox))   this._player.takeDamage(10);
        }

        // If there are still enemies to spawn, spawn them
        console.log(this._currentDifficulty.maxEnemy >= this._currentDifficulty.spawnAmount)
        if(this._currentDifficulty.maxEnemy >= this._currentDifficulty.spawnAmount){
            this._framesSinceEnemySpawn++;
            if(this._framesSinceEnemySpawn >= 1000 / this._currentDifficulty.multiplier) this._spawnEnemy();
        } 

        // check to see if they're all dead to start next wave
        if(this._currentDifficulty.enemiesKilled >= this._currentDifficulty.maxEnemy){
            this._increaseDifficulty();
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