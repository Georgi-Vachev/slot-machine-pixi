import { Application, Assets, Sprite, Container, Rectangle } from 'pixi.js';
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { delay } from './src/utils'
import { Outcome, Round, WinWay } from './src/Outcome';
import { DebugPanel, DebugWinLevel } from './src/Debug';

const config = {
    screen: {
        width: 1920,
        height: 1080,
    },
    reels: {
        columns: 5,
        rows: 5,
        visibleTiles: 3,
        speed: 28,
        staggerDelay: 0.1,
        skipFactor: 2.2,
        winWaysLoopDelay: 0.4,
    },
    minWaysLength: 3,
    symbols: ['high1', 'high2', 'high3', 'low1', 'low2', 'low3', 'low4']
};

const STATES = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    WIN: 'win',
} as const;

class MainScene extends Container {
    private _machine: Machine;
    private _spinButton: SpinButton;
    private _isSpinning = false;
    private _debugPanel: DebugPanel;

    constructor() {
        super();

        const { screen, reels, symbols } = config;

        const background = Sprite.from('background');
        background.anchor.set(0.5);
        background.position.set(screen.width * 0.5, screen.height * 0.5);
        this.addChild(background);

        const reelsBg = Sprite.from('reels_base');
        reelsBg.anchor.set(0.5);
        reelsBg.position.set(screen.width * 0.5, screen.height * 0.5);
        this.addChild(reelsBg);

        const machine = new Machine({ reelsGuide: reelsBg, config: { ...reels, symbols } });
        machine.position.set(screen.width * 0.5 - reelsBg.width * 0.5, screen.height * 0.5 - reelsBg.height * 0.5);
        this.addChild(machine);

        const spinButton = new SpinButton();
        spinButton.position.set(screen.width * 0.85, screen.height * 0.85);
        this.addChild(spinButton);

        const debug = new DebugPanel();
        debug.position.set(screen.width * 0.85, screen.height * 0.54);
        this.addChild(debug);

        this._machine = machine;
        this._spinButton = spinButton;
        this._debugPanel = debug;

        this.setupGlobalInput();
    }

    get debugLevel() {
        return this._debugPanel.selected;
    }

    private setupGlobalInput() {
        this.eventMode = 'static';
        this.hitArea = new Rectangle(0, 0, config.screen.width, config.screen.height);

        this.on('pointertap', () => {
            if (this._isSpinning) {
                this._machine.skip();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code !== 'Space') return;

            if (this._isSpinning) {
                this._machine.skip();
            } else {
                this._spinButton.click();
            }
        });
    }

    update(dt: number) {
        this._machine.update(dt);
    }

    waitForSpin() {
        return this._spinButton.waitForClick();
    }

    spin() {
        this._isSpinning = true;
        this._machine.spin();
    }

    async stop(result: string[][]) {
        await this._machine.stop(result);
        this._isSpinning = false;
    }

    showWays(ways: WinWay[]) {
        this._machine.showWays(ways);
    }

    stopLoopWays() {
        this._machine.stopLoopWays();
    }
}

class Game {
    public app: Application;
    private _state!: typeof STATES[keyof typeof STATES];
    private _mainScene!: MainScene;
    private _currentRound!: Round;

    get state() {
        return this._state;
    }

    constructor() {
    }

    async initialize(app: Application, urls: any) {
        this.app = app;
        await Assets.load(urls);
    }

    setScene(scene: MainScene) {
        this.app.stage.removeChildren();
        this.app.stage.addChild(scene);

        this._mainScene = scene;
    }

    async setState(state: typeof STATES[keyof typeof STATES]): Promise<void> {
        if (this._state === state) return;

        const { reels: { columns, rows, visibleTiles }, symbols, minWaysLength } = config;

        this._state = state;

        switch (state) {
            case STATES.IDLE:
                await this._mainScene.waitForSpin();

                this._mainScene.stopLoopWays();

                return await this.setState(STATES.SPINNING);

            case STATES.SPINNING: {
                this._mainScene.spin();

                await delay(1);

                if (this._mainScene.debugLevel !== DebugWinLevel.LAST_ROUND || !this._currentRound) {
                    this._currentRound = Outcome.spin({
                        columns,
                        rows,
                        visibleTiles,
                        symbols,
                        minWaysLength,
                        targetWays: this._mainScene.debugLevel ?? undefined,
                    });
                }

                await this._mainScene.stop(this._currentRound.screen);

                return await this.setState(STATES.WIN);
            }

            case STATES.WIN:
                this._mainScene.showWays(this._currentRound.ways);

                return await this.setState(STATES.IDLE);
        }
    }
}

(async () => {
    const app = new Application();

    globalThis.__PIXI_APP__ = app; // TEMP

    await app.init(config.screen);
    document.body.appendChild(app.canvas);

    const game = new Game();
    await game.initialize(app, urls);

    const main = new MainScene();
    game.setScene(main);

    app.ticker.add(({ deltaTime }) => {
        main.update(deltaTime);
    });

    window.addEventListener('resize', () => resize(main));

    resize(main);

    await game.setState(STATES.IDLE);
})();

function resize(container: Container) {
    const { screen } = config;

    const scale = Math.min(
        window.innerWidth / screen.width,
        window.innerHeight / screen.height
    );

    container.scale.set(scale);

    container.x =
        (window.innerWidth - screen.width * scale) / 2;

    container.y =
        (window.innerHeight - screen.height * scale) / 2;
}