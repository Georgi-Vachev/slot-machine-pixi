import { Container, Sprite, Texture, Graphics, ColorMatrixFilter } from "pixi.js";
import gsap from "gsap";
import { WinWay } from "./Outcome";
import { delay } from "./utils";

class Tile extends Sprite {
    private _grayscaleFilter = new ColorMatrixFilter();

    constructor(texture: Texture) {
        super(texture);
    }

    setSymbol(texture: Texture) {
        this.texture = texture;
    }

    setGrayed(grayed: boolean) {
        if (grayed) {
            this._grayscaleFilter.desaturate();
            this.filters = [this._grayscaleFilter];
        } else {
            this.filters = [];
        }
    }
}

type ReelState = "idle" | "starting" | "spinning" | "stopping" | "landing";

class Reel extends Container {
    private _textures: Map<string, Texture>;
    private _speed = 0;
    private _tileHeight: number;
    private _state: ReelState = "idle";
    private _skipped = false;
    private _incomingSymbols: string[] = [];
    private _config: any;
    private _resolveStop: (() => void) | null = null;

    constructor({ size, textures, config }: { size: { width: number, height: number }, textures: Map<string, Texture>, config: any }) {
        super();

        this._config = config;
        this._textures = textures;
        this._speed = config.speed;
        this._tileHeight = size.height / config.visibleTiles;

        this.addTiles(size);
    }


    addTiles(size: { width: number, height: number }) {
        for (let i = -1; i < this._config.visibleTiles + 1; i++) {
            const tile = new Tile(this.randomTexture());

            tile.anchor.set(0.5);
            tile.position.set(size.width / 2, i * this._tileHeight + this._tileHeight / 2);

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

        this._incomingSymbols = [...result, ...padding];
        this._state = "stopping";

        return new Promise(resolve => {
            this._resolveStop = resolve;
        });
    }

    skip() {
        if (this._skipped) return;

        this._speed *= this._config.skipFactor;
        this._skipped = true;
    }

    reset() {
        this._state = "idle";
        this._skipped = false;
        this._speed = this._config.speed;
        this._resolveStop = null;
    }

    update(dt: number): void {
        if (this._state !== "spinning" && this._state !== "stopping") return;

        for (const child of this.children) {
            if (this._state !== "spinning" && this._state !== "stopping") break;

            const tile = child as Tile;
            tile.y += this._speed * dt;

            if (tile.y >= (this._config.visibleTiles + 1) * this._tileHeight + this._tileHeight / 2) {
                tile.y -= this._config.rows * this._tileHeight;
                this.recycle(tile);
            }
        }
    }

    private recycle(tile: Tile) {
        if (this._state === "stopping" && this._incomingSymbols.length > 0) {
            const symbol = this._incomingSymbols.pop()!;
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
            tile.y = (i - 1) * this._tileHeight + this._tileHeight / 2;
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
                    }
                });
            }
        });
    }

    private getVisibleTiles(): Tile[] {
        const sorted = [...this.children].sort((a, b) => a.y - b.y) as Tile[];
        return sorted.slice(1, 1 + this._config.visibleTiles);
    }

    highlightRows(winningRows: number[]): Promise<void> {
        const visibleTiles = this.getVisibleTiles();
        const winPromises: Promise<void>[] = [];

        visibleTiles.forEach((tile, row) => {
            const isWinning = winningRows.includes(row);

            if (isWinning) {
                tile.setGrayed(false);
                winPromises.push(this.popTile(tile));
            } else {
                gsap.killTweensOf(tile);
                gsap.killTweensOf(tile.scale);
                tile.scale.set(1);
                tile.rotation = 0;
                tile.setGrayed(true);
            }
        });

        return winPromises.length > 0 ? Promise.all(winPromises).then(() => { }) : Promise.resolve();
    }

    clearHighlight() {
        for (const tile of this.getVisibleTiles()) {
            gsap.killTweensOf(tile);
            gsap.killTweensOf(tile.scale);
            tile.setGrayed(false);
            tile.scale.set(1);
            tile.rotation = 0;
        }
    }

    private popTile(tile: Tile): Promise<void> {
        return new Promise(resolve => {
            gsap.killTweensOf(tile);
            gsap.killTweensOf(tile.scale);

            const tl = gsap.timeline({ onComplete: resolve });

            tl.to(tile.scale, { x: 1.15, y: 1.15, duration: 0.25, ease: "power2.out" }, 0);
            tl.to(tile, { rotation: 0.12, duration: 0.25, ease: "power2.out" }, 0);

            tl.to(tile.scale, { x: 1, y: 1, duration: 0.25, ease: "power2.in" });
            tl.to(tile, { rotation: 0, duration: 0.25, ease: "power2.in" }, "<");
        });
    }
}

export class Machine extends Container {
    private _reels: Reel[] = [];
    private _waysLoopActive = false;

    constructor({ reelsGuide, config }: { reelsGuide: Sprite; config: any }) {
        super();

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

    get reels() {
        return this._reels;
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

        this.reset();
    }

    skip() {
        for (const reel of this._reels) {
            reel.skip();
        }
    }

    async showWays(wins: WinWay[]) {
        if (wins.length === 0) return;

        this._waysLoopActive = true;

        const combined: WinWay = {
            symbol: '',
            positions: wins.flatMap(way => way.positions),
        };

        await this.showWay(combined);

        while (this._waysLoopActive) {
            for (const way of wins) {
                if (!this._waysLoopActive) break;

                await this.showWay(way);
            }
        }
    }

    async showWay(way: WinWay): Promise<void> {
        await Promise.all(
            this._reels.map((reel, reelIndex) => {
                const rows = way.positions
                    .filter(([index]) => index === reelIndex)
                    .map(([, row]) => row);

                return reel.highlightRows(rows);
            })
        );

        await delay(0.4);
    }

    stopLoopWays() {
        this._waysLoopActive = false;

        for (const reel of this._reels) {
            reel.clearHighlight();
        }
    }

    reset() {
        for (const reel of this._reels) {
            reel.reset();
        }
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