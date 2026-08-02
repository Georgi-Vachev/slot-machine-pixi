import { Container, Sprite, Texture } from "pixi.js";

export class SpinButton extends Container {
    private _button: Sprite;
    private _enabled = true;

    private _normal = Texture.from('spin_btn_normal');
    private _hover = Texture.from('spin_btn_hover');
    private _down = Texture.from('spin_btn_down');
    private _disabled = Texture.from('spin_btn_disabled');

    private _onKeyDown = (e: KeyboardEvent) => {
        if (e.code !== 'Space' || !this._enabled) return;

        e.preventDefault();
        this._button.texture = this._down;
    };

    private _onKeyUp = (e: KeyboardEvent) => {
        if (e.code !== 'Space' || !this._enabled) return;

        e.preventDefault();
        this._button.emit('pointertap');
    };

    constructor() {
        super();

        this._button = new Sprite(this._normal);
        this._button.anchor.set(0.5);
        this._button.eventMode = 'static';
        this._button.cursor = 'pointer';

        this._button.on('pointerover', () => {
            if (this._enabled) this._button.texture = this._hover;
        });

        this._button.on('pointerout', () => {
            if (this._enabled) this._button.texture = this._normal;
        });

        this._button.on('pointerdown', () => {
            if (this._enabled) this._button.texture = this._down;
        });

        this._button.on('pointerup', () => {
            if (this._enabled) this._button.texture = this._hover;
        });

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        this.addChild(this._button);
    }

    update(dt: number): void { }

    setEnabled(enabled: boolean) {
        this._enabled = enabled;
        this._button.eventMode = enabled ? 'static' : 'none';
        this._button.cursor = enabled ? 'pointer' : 'default';
        this._button.texture = enabled ? this._normal : this._disabled;
    }

    waitForClick(): Promise<void> {
        this.setEnabled(true);

        return new Promise(resolve => {
            this._button.once('pointertap', () => {
                this.setEnabled(false);
                resolve();
            });
        });
    }
}