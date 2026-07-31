import {Container, Sprite} from "pixi.js";

export class SpinButton extends Container {
    constructor() {
        super();

        const button = Sprite.from('spin_btn_normal');
        button.anchor.set(0.5);
        this.addChild(button);
    }

    update(dt: number): void {}
}