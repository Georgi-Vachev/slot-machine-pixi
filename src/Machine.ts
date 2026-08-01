import { Container, Sprite, Texture, Graphics } from "pixi.js";

class Tile extends Sprite {
    constructor(texture: Texture) {
        super(texture);
    }

    setSymbol(texture: Texture) {
        this.texture = texture;
    }
}
class Reel extends Container {
    private _textures: Texture[];
    private _tilesCount: number;
    private _visibleTiles: number;

    constructor({ tilesCount, visibleTiles, size, textures }: { tilesCount: number, visibleTiles: number, size: { width: number, height: number }, textures: Texture[] }) {
        super();

        this._textures = textures;
        this._tilesCount = tilesCount;
        this._visibleTiles = visibleTiles;

        this.addTiles(size);
    }

    addTiles(size: { width: number, height: number }) {
        const tileHeight = size.height / this._visibleTiles;

        for (let i = -1; i < this._visibleTiles + 1; i++) {
            const tile = new Tile(this._textures[Math.floor(Math.random() * this._textures.length)]);

            tile.position.set(0, i * tileHeight);
            tile.setSize(size.width, tileHeight);

            this.addChild(tile);
        }
    }
}

export class Machine extends Container {
    constructor({ reelsGuide, config }: { reelsGuide: Sprite; config: any }) {
        super();

        const reelWidth = reelsGuide.width / config.columns;
        const reelHeight = reelsGuide.height;
        const textures = this.createTextures(config.symbols);
        const mask = this.createMask(reelsGuide);
        const reelsContainer = new Container();

        for (let i = 0; i < config.columns; i++) {
            const reel = new Reel({ tilesCount: config.rows, visibleTiles: config.visibleTiles, size: { width: reelWidth, height: reelHeight }, textures });
            reel.position.set(i * reelWidth, 0);
            reelsContainer.addChild(reel);
        };

        reelsContainer.mask = mask;
        this.addChild(reelsContainer);
    }

    update(dt: number): void { }

    createTextures(symbols: string[]) {
        return symbols.map(symbol => Texture.from(symbol));
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