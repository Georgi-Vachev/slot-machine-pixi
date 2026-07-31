import { Application, Assets, Sprite, Container } from 'pixi.js';
import { Machine } from "./src/Machine";
import { urls } from "./img";
import { SpinButton } from "./src/SpinButton";
import { delay } from './src/utils'

const screen = {
    width: 1920,
    height: 1080
};

const STATES = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    WIN: 'win',
} as const;

class MainScene extends Container {
    private _machine: Machine;
    private _spinButton: SpinButton;

    constructor() {
        super();

        const background = Sprite.from('background');
        background.anchor.set(0.5);
        background.position.set(screen.width * 0.5, screen.height * 0.5);
        this.addChild(background);

        const reels = Sprite.from('reels_base');
        reels.anchor.set(0.5);
        reels.position.set(screen.width * 0.5, screen.height * 0.5);
        this.addChild(reels);

        const machine = new Machine();
        machine.position.set(screen.width * 0.5 - reels.width * 0.5, screen.height * 0.5 - reels.height * 0.5);
        this.addChild(machine);

        const spinButton = new SpinButton();
        spinButton.position.set(screen.width * 0.85, screen.height * 0.85);
        this.addChild(spinButton);

        this._machine = machine;
        this._spinButton = spinButton;
    }

    update(dt: number) {
        this._machine.update(dt);
        this._spinButton.update(dt);
    }

    waitForSpin() {
        return this._spinButton.waitForClick();
    }
}

class Game {
    public app: Application;
    private _state!: typeof STATES[keyof typeof STATES];
    private _mainScene!: MainScene

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

        this._state = state;

        switch (state) {
            case STATES.IDLE:
                console.error('IDLE') // TEMP
                await this._mainScene.waitForSpin();

                return await this.setState(STATES.SPINNING);

            case STATES.SPINNING:
                console.error('SPINNING') // TEMP
                await delay(1);
                return await this.setState(STATES.WIN);

            case STATES.WIN:
                console.error('WIN'); // TEMP
                await delay(0.5);
                return await this.setState(STATES.IDLE);
        }
    }
}

(async () => {
    const app = new Application();

    globalThis.__PIXI_APP__ = app; // TEMP

    await app.init({ width: screen.width, height: screen.height });
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