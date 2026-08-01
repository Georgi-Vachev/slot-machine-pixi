import { Container, Sprite, Texture, Graphics } from "pixi.js";
import { delay } from './utils';

class Tile extends Sprite {
    constructor(texture: Texture) {
        super(texture);
    }

    setSymbol(texture: Texture) {
        this.texture = texture;
    }
}
class Reel extends Container {
    private _textures: Map<string, Texture>;
    private _tilesCount: number;
    private _visibleTiles: number;
    private _spinning = false;
    private _speed = 0;
    private _tileHeight: number;

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

    private randomTexture(): Texture {
        const values = [...this._textures.values()];
        return values[Math.floor(Math.random() * values.length)];
    }

    spin() {
        this._spinning = true;
    }

    async stop(result: string[]) {
        this._spinning = false;

        const sorted = [...this.children].sort((a, b) => a.y - b.y) as Tile[];

        sorted.forEach((tile, i) => {
            tile.y = (i - 1) * this._tileHeight;

            const symbol = result[i];
            if (symbol) {
                tile.setSymbol(this._textures.get(symbol)!);
            }
        });
    };

    update(dt: number): void {
        if (!this._spinning) return;

        for (const child of this.children) {
            const tile = child as Tile;
            tile.y += this._speed * dt;

            if (tile.y >= (this._visibleTiles + 1) * this._tileHeight) {
                tile.y -= this._tilesCount * this._tileHeight;
                tile.setSymbol(this.randomTexture());
            }
        }
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
            this._reels.map((reel, i) =>
                delay(i * this._config.staggerDelay).then(() => reel.stop(result[i]))
            )
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