export interface Round {
    screen: string[][];
}

export class Outcome {
    static spin({ columns, rows, symbols }: {
        columns: number;
        rows: number;
        visibleTiles: number;
        symbols: string[];
        minWaysLength?: number;
    }): Round {
        const screen: string[][] = [];

        for (let c = 0; c < columns; c++) {
            const column: string[] = [];
            for (let r = 0; r < rows; r++) {
                column.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            screen.push(column);
        }

        return { screen };
    }
}