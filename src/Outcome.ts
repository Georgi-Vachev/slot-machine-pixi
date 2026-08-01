export class Outcome {
    constructor() { }

    static resolve({ columns, rows, symbols }: { columns: number; rows: number; symbols: string[] }): string[][] {
        const outcome: string[][] = [];
        for (let i = 0; i < columns; i++) {
            const column = [];
            for (let j = 0; j < rows; j++) {
                column.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            outcome.push(column);
        }
        return outcome;
    }
}