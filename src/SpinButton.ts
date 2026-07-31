import { Container, Sprite } from "pixi.js";

export class SpinButton extends Container {
    private _button: Sprite;

    constructor() {
        super();

        this._button = Sprite.from('spin_btn_normal');
        this._button.anchor.set(0.5);
        this._button.eventMode = 'static';
        this._button.cursor = 'pointer';

        this.addChild(this._button);
    }

    update(dt: number): void { }

    waitForClick(): Promise<void> {
        return new Promise(resolve => {
            this._button.once('pointertap', () => resolve());
        });
    }
}