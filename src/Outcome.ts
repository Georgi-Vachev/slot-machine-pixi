import { DebugWinLevel } from "./Debug";

export interface WinWay {
    symbol: string;
    positions: [reelIndex: number, rowIndex: number][];
}

export interface Round {
    screen: string[][];
    ways: WinWay[];
}

export class Outcome {
    debugLevel?: DebugWinLevel;

    static spin({
        columns,
        rows,
        visibleTiles,
        symbols,
        minWaysLength = 3,
        targetWays = 0,
    }: {
        columns: number;
        rows: number;
        visibleTiles: number;
        symbols: string[];
        minWaysLength?: number;
        targetWays?: number;
    }): Round {
        const screen: string[][] = [];

        for (let c = 0; c < columns; c++) {
            screen.push(Array(rows).fill(''));
        }

        const debugSymbols: string[] = [];


        for (let i = 0; i < targetWays; i++) {
            const availableSymbols = symbols.filter(
                s => !debugSymbols.includes(s)
            );

            const symbol = availableSymbols[
                Math.floor(Math.random() * availableSymbols.length)
            ];

            debugSymbols.push(symbol);


            const length =
                Math.floor(
                    Math.random() * (columns - minWaysLength + 1)
                ) + minWaysLength;

            for (let c = 0; c < length; c++) {
                const row = (i % visibleTiles) + 1;

                screen[c][row] = symbol;
            }
        }

        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                if (screen[c][r] === '') {
                    screen[c][r] =
                        symbols[Math.floor(Math.random() * symbols.length)];
                }
            }
        }

        const ways = Outcome.computeWays({
            screen,
            columns,
            visibleTiles,
            symbols,
            minWaysLength
        });

        return { screen, ways };
    }

    private static computeWays({ screen, columns, visibleTiles, symbols, minWaysLength }: {
        screen: string[][];
        columns: number;
        visibleTiles: number;
        symbols: string[];
        minWaysLength: number;
    }): WinWay[] {
        const ways: WinWay[] = [];

        for (const symbol of symbols) {
            const positions: [number, number][] = [];
            let reelsMatched = 0;

            for (let c = 0; c < columns; c++) {
                const visibleRows = screen[c].slice(1, 1 + visibleTiles);
                const matchingRows = visibleRows
                    .map((s, r) => (s === symbol ? r : -1))
                    .filter(r => r !== -1);

                if (matchingRows.length === 0) break;

                matchingRows.forEach(r => positions.push([c, r]));
                reelsMatched++;
            }

            if (reelsMatched >= minWaysLength) {
                ways.push({ symbol, positions });
            }
        }

        return ways;
    }
}