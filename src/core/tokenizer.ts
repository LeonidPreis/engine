export enum TokenType {
    literal = 'literal',
    variable = 'variable',
    operator = 'operator',
    leftParenthesis = 'left parenthesis',
    rightParenthesis = 'right parenthasis',
    argumentSeparator = 'argument separator'
}

export class Token {
    constructor(public type: TokenType, public value: any) {}

    public static removeSpaces(string: string): string {
        let result: string = string.replace(/\s+/g, '');
        return result;
    }

    public static toArray(string: string): Array<string> {
        let result: Array<string> = string.split('');
        return result;
    }

    public static isNumber(character: string): boolean {
        let result: boolean = /\d/.test(character);
        return result;
    }

    public static isLetter(character: string): boolean {
        let result: boolean = /[a-z]/i.test(character);
        return result;
    }

    public static isOperator(character: string): boolean {
        let result: boolean = /\+|-|\*|\/|\^/.test(character);
        return result;
    }

    public static isLeftParenthesis(character: string): boolean {
        let result: boolean = character === '(';
        return result;
    }

    public static isRightParenthesis(character: string): boolean {
        let result: boolean = character === ')';
        return result;
    }

    public static isComa(character: string): boolean {
        let result: boolean = /,/.test(character);
        return result;
    }
} 

export class Tokenizer {
    private tokenChecks = new Map<(character: string) => boolean, TokenType> (
        [
            [Token.isNumber, TokenType.literal],
            [Token.isLetter, TokenType.variable],
            [Token.isOperator, TokenType.operator],
            [Token.isLeftParenthesis, TokenType.leftParenthesis],
            [Token.isRightParenthesis, TokenType.rightParenthesis],
            [Token.isComa, TokenType.argumentSeparator],
        ]
    );
    public tokenize(string: string): Array<Token> {
        string = Token.removeSpaces(string);
        let array = Token.toArray(string);
        let result: Array<Token> = [];

        array.forEach((character): void => {
            for (const [check, type] of this.tokenChecks) {
                if (check(character)) {
                    result.push(new Token(type, character));
                    break;
                }
            }
        });

        return result;
    }
}