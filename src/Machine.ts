import { Container, Sprite, Texture, Graphics } from "pixi.js";
import gsap from "gsap";

class Tile extends Sprite {
    constructor(texture: Texture) {
        super(texture);
    }

    setSymbol(texture: Texture) {
        this.texture = texture;
    }
}

type ReelState = "idle" | "starting" | "spinning" | "stopping" | "landing";

class Reel extends Container {
    private _textures: Map<string, Texture>;
    private _tilesCount: number;
    private _visibleTiles: number;
    private _speed = 0;
    private _tileHeight: number;
    private _state: ReelState = "idle";

    private _incomingSymbols: string[] = [];
    private _resolveStop: (() => void) | null = null;

    constructor({ size, textures, config }: { size: { width: number, height: number }, textures: Map<string, Texture>, config: any }) {
        super();

        this._textures = textures;
        this._tilesCount = config.rows;
        this._visibleTiles = config.visibleTiles;
        this._speed = config.speed;
        this._tileHeight = size.height / this._visibleTiles;

        this.addTiles(size);
    }

    addTiles(size: { width: number, height: number }) {
        for (let i = -1; i < this._visibleTiles + 1; i++) {
            const tile = new Tile(this.randomTexture());

            tile.position.set(0, i * this._tileHeight);
            tile.setSize(size.width, this._tileHeight);

            this.addChild(tile);
        }
    }

    private randomSymbolKey(): string {
        const keys = [...this._textures.keys()];
        return keys[Math.floor(Math.random() * keys.length)];
    }

    private randomTexture(): Texture {
        return this._textures.get(this.randomSymbolKey())!;
    }

    spin() {
        gsap.killTweensOf(this);
        this._state = "starting";

        this.y = 0;
        gsap.fromTo(this,
            { y: 0 },
            {
                y: -this._tileHeight * 0.6,
                duration: 0.25,
                ease: "power2.out",
                onComplete: () => {
                    this._state = "spinning";
                }
            }
        );
    }

    stop(result: string[], extraCycles = 0): Promise<void> {
        const padding = Array.from({ length: extraCycles }, () => this.randomSymbolKey());

        this._incomingSymbols = [...padding, ...[...result].reverse()];
        this._state = "stopping";

        return new Promise(resolve => {
            this._resolveStop = resolve;
        });
    }

    update(dt: number): void {
        if (this._state !== "spinning" && this._state !== "stopping") return;

        for (const child of this.children) {
            if (this._state !== "spinning" && this._state !== "stopping") break;

            const tile = child as Tile;
            tile.y += this._speed * dt;

            if (tile.y >= (this._visibleTiles + 1) * this._tileHeight) {
                tile.y -= this._tilesCount * this._tileHeight;
                this.recycle(tile);
            }
        }
    }

    private recycle(tile: Tile) {
        if (this._state === "stopping" && this._incomingSymbols.length > 0) {
            const symbol = this._incomingSymbols.shift()!;
            tile.setSymbol(this._textures.get(symbol)!);

            if (this._incomingSymbols.length === 0) {
                this.land();
            }
        } else {
            tile.setSymbol(this.randomTexture());
        }
    }

    private land() {
        this._state = "landing";

        const sorted = [...this.children].sort((a, b) => a.y - b.y) as Tile[];
        sorted.forEach((tile, i) => {
            tile.y = (i - 1) * this._tileHeight;
        });

        gsap.to(this, {
            y: this._tileHeight * 0.6,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(this, {
                    y: 0,
                    duration: 0.2,
                    ease: "power2.out",
                    onComplete: () => {
                        this._state = "idle";
                        this._resolveStop?.();
                        this._resolveStop = null;
                    }
                });
            }
        });
    }
}

export class Machine extends Container {
    private _reels: Reel[] = [];
    private _config: any;

    constructor({ reelsGuide, config }: { reelsGuide: Sprite; config: any }) {
        super();

        this._config = config;

        const reelWidth = reelsGuide.width / config.columns;
        const reelHeight = reelsGuide.height;
        const textures = this.createTextures(config.symbols);
        const mask = this.createMask(reelsGuide);
        const reelsContainer = new Container();

        for (let i = 0; i < config.columns; i++) {
            const reel = new Reel({ size: { width: reelWidth, height: reelHeight }, textures, config });
            reel.position.set(i * reelWidth, 0);
            reelsContainer.addChild(reel);

            this._reels.push(reel);
        };

        reelsContainer.mask = mask;
        this.addChild(reelsContainer);
    }

    spin() {
        for (const reel of this._reels) {
            reel.spin();
        }
    }

    async stop(result: string[][]) {
        await Promise.all(
            this._reels.map((reel, i) => reel.stop(result[i], i))
        );
    }

    update(dt: number): void {
        for (const reel of this._reels) {
            reel.update(dt);
        }
    }

    createTextures(symbols: string[]): Map<string, Texture> {
        const map = new Map<string, Texture>();

        for (const symbol of symbols) {
            map.set(symbol, Texture.from(symbol));
        }

        return map;
    }

    createMask(reelsGuide: Sprite) {
        const mask = new Graphics()
            .rect(
                0, 0,
                reelsGuide.width,
                reelsGuide.height
            )
            .fill(0xffffff);

        this.addChild(mask);

        return mask;
    }
}