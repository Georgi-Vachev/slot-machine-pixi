import { Container, Graphics, Text } from "pixi.js";

export enum DebugWinLevel {
    NONE = 0,
    SMALL = 1,
    BIG = 2,
    LAST_ROUND = 3,
}

class DebugButton extends Container {
    private _background: Graphics;
    private _label: Text;

    constructor(
        label: string,
        level: DebugWinLevel,
        onClick: (level: DebugWinLevel) => void
    ) {
        super();

        this._background = new Graphics();
        this.addChild(this._background);

        this._label = new Text({
            text: label,
            style: {
                fontSize: 32,
                fill: 0xffffff,
            }
        });

        this._label.anchor.set(0.5);
        this.addChild(this._label);

        this.draw(false);

        this.eventMode = "static";
        this.cursor = "pointer";

        this.on("pointertap", () => onClick(level));
    }

    setSelected(selected: boolean) {
        this.draw(selected);
    }

    private draw(selected: boolean) {
        const paddingX = 30;
        const paddingY = 15;

        const width = this._label.width + paddingX * 2;
        const height = this._label.height + paddingY * 2;

        this._background.clear();

        this._background.roundRect(
            -width * 0.5,
            -height * 0.5,
            width,
            height,
            10
        );

        this._background.fill({
            color: selected ? 0x00aa00 : 0x333333,
        });
    }
}

export class DebugPanel extends Container {
    private _selected = DebugWinLevel.NONE;
    private _buttons: Map<DebugWinLevel, DebugButton> = new Map();

    get selected() {
        return this._selected;
    }

    constructor() {
        super();

        const levels = [
            [DebugWinLevel.SMALL, "1+ Ways"],
            [DebugWinLevel.BIG, "2+ Ways"],
            [DebugWinLevel.LAST_ROUND, "Last Round"],
        ] as const;

        let y = 0;
        const spacing = 20;

        levels.forEach(([level, text]) => {
            const button = new DebugButton(
                text,
                level,
                l => this.select(l)
            );

            button.y = y;

            y += button.height + spacing;

            this._buttons.set(level, button);
            this.addChild(button);
        });
    }

    private select(level: DebugWinLevel) {
        this._selected =
            this._selected === level
                ? DebugWinLevel.NONE
                : level;

        this._buttons.forEach((button, buttonLevel) => {
            button.setSelected(buttonLevel === this._selected);
        });
    }
}