export interface IColor {
    format: 'RGBA' | 'CMYK' | 'HSL' | 'HSV' | 'HSI' | 'HEX';
    data: string | [number, number, number] | [number, number, number, number];
}

export class Color implements IColor {
    format: 'RGBA' | 'CMYK' | 'HSL' | 'HSV' | 'HSI' | 'HEX' = 'RGBA';
    data: string | [number, number, number] | [number, number, number, number];

    constructor(
        format: 'RGBA' | 'CMYK' | 'HSL' | 'HSV' | 'HSI' | 'HEX' = 'RGBA',
        data: string | [number, number, number] | [number, number, number, number] = [0,0,0,0]
        ) {
        this.format = format;
        this.data = data;
    }

    get r(): number | undefined {
        return this.format === 'RGBA' && typeof this.data[0] === 'number' ? this.data[0] : undefined;
    }

    get g(): number | undefined {
        return this.format === 'RGBA' && typeof this.data[1] === 'number' ? this.data[1] : undefined;
    }

    get b(): number | undefined {
        return this.format === 'RGBA' && typeof this.data[2] === 'number' ? this.data[2] : undefined;
    }

    get a(): number | undefined {
        return this.format === 'RGBA' && typeof this.data[3] === 'number' ? this.data[3] : undefined;
    }

    get c(): number | undefined {
        return this.format === 'CMYK' && typeof this.data[0] === 'number' ? this.data[0] : undefined;
    }

    get m(): number | undefined {
        return this.format === 'CMYK' && typeof this.data[1] === 'number' ? this.data[1] : undefined;
    }

    get y(): number | undefined {
        return this.format === 'CMYK' && typeof this.data[2] === 'number' ? this.data[2] : undefined;
    }

    get k(): number | undefined {
        return this.format === 'CMYK' && typeof this.data[3] === 'number' ? this.data[3] : undefined;
    }

    get h(): number | undefined {
        return (this.format === 'HSV' || this.format === 'HSL' || this.format === 'HSI') && typeof this.data[0] === 'number' ? this.data[0] : undefined;
    }

    get s(): number | undefined {
        return (this.format === 'HSV' || this.format === 'HSL' || this.format === 'HSI') && typeof this.data[1] === 'number' ? this.data[1] : undefined;
    }

    get v(): number | undefined {
        return this.format === 'HSV' && typeof this.data[2] === 'number' ? this.data[2] : undefined;
    }

    get l(): number | undefined {
        return this.format === 'HSL' && typeof this.data[2] === 'number' ? this.data[2] : undefined;
    }

    get i(): number | undefined {
        return this.format === 'HSI' && typeof this.data[2] === 'number' ? this.data[2] : undefined;
    }

    get cmyk(): Color {
        switch (this.format) {
            case 'HEX':
                return this.hexToRgba().rgbaToCmyk();
            case 'HSV':
                return this.hsvToRgba().rgbaToCmyk();
            case 'HSL':
                return this.hslToRgba().rgbaToCmyk();
            case 'HSI':
                return this.hsiToRgba().rgbaToCmyk();
            case 'RGBA':
                return this.rgbaToCmyk();
            case 'CMYK':
                return this;
        }
    }

    get hex(): Color {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba().rgbaToHex();
            case 'HSV':
                return this.hsvToRgba().rgbaToHex();
            case 'HSL':
                return this.hslToRgba().rgbaToHex();
            case 'HSI':
                return this.hsiToRgba().rgbaToHex();
            case 'RGBA':
                return this.rgbaToHex();
            case 'HEX':
                return this;
        }
    }

    get hsv(): Color {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba().rgbaToHsv();
            case 'HEX':
                return this.hexToRgba().rgbaToHsv();
            case 'HSL':
                return this.hslToRgba().rgbaToHsv();
            case 'HSI':
                return this.hsiToRgba().rgbaToHsv();
            case 'RGBA':
                return this.rgbaToHsv();
            case 'HSV':
                return this;
        }
    }

    get hsl(): Color {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba().rgbaToHsl();
            case 'HEX':
                return this.hexToRgba().rgbaToHsl();
            case 'HSV':
                return this.hsvToRgba().rgbaToHsl();
            case 'HSI':
                return this.hsiToRgba().rgbaToHsl();
            case 'RGBA':
                return this.rgbaToHsl();
            case 'HSL':
                return this;
        }
    }

    get hsi(): Color {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba().rgbaToHsi();
            case 'HEX':
                return this.hexToRgba().rgbaToHsi();
            case 'HSV':
                return this.hsvToRgba().rgbaToHsi();
            case 'HSL':
                return this.hslToRgba().rgbaToHsi();
            case 'RGBA':
                return this.rgbaToHsi();
            case 'HSI':
                return this;
        }
    }

    get rgba(): Color {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba();
            case 'HEX':
                return this.hexToRgba();
            case 'HSV':
                return this.hsvToRgba();
            case 'HSL':
                return this.hslToRgba();
            case 'HSI':
                return this.hsiToRgba();
            case 'RGBA':
                return this;
        }
    }

    get rgbaArray(): [number, number, number, number] {
        switch (this.format) {
            case 'CMYK':
                return this.cmykToRgba().data as [number, number, number, number];
            case 'HEX':
                return this.hexToRgba().data as [number, number, number, number];
            case 'HSV':
                return this.hsvToRgba().data as [number, number, number, number];
            case 'HSL':
                return this.hslToRgba().data as [number, number, number, number];
            case 'HSI':
                return this.hsiToRgba().data as [number, number, number, number];
            case 'RGBA':
                return this.data as [number, number, number, number];
        }
    }

    private cmykToRgba(): Color {
        if (this.format !== 'CMYK') {
            throw new Error(`Color format must be cmyk. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            return new Color('RGBA', [
                Math.round(255 * (1 - this.c / 100) * (1 - this.k / 100)),
                Math.round(255 * (1 - this.m / 100) * (1 - this.k / 100)),
                Math.round(255 * (1 - this.y / 100) * (1 - this.k / 100)),
                255
            ]);
        } else {
            throw Error('The CMYK color format shall have a data parameter of 4 numeric values in the range 0-100.');
        }
    }

    private rgbaToCmyk(): Color {
        if (this.format !== 'RGBA') {
            throw new Error(`Color format must be rgba. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            const w = Math.max(this.r / 255, this.g / 255, this.b / 255);
            return new Color('CMYK', [
                Math.round(100 * ((w - this.r / 255) / w)),
                Math.round(100 * ((w - this.g / 255) / w)),
                Math.round(100 * ((w - this.b / 255) / w)),
                Math.round(100 * (1 - w))
            ]);
        } else {
            throw Error('The RGBA color format shall have a data parameter of 4 numeric values in the range 0-255.');
        }
    }

    private hexToRgba(): Color {
        if (this.format !== 'HEX') {
            throw new Error(`Color format must be hex. This format is ${this.format}.`);
        }
        if (typeof this.data === 'string') {
            const hexString = this.data.slice(1);
            if (hexString.length === 6) {
                const rgbArray = hexString.match(/.{1,2}/g);
                return new Color('RGBA', [
                    parseInt(rgbArray[0], 16), 
                    parseInt(rgbArray[1], 16), 
                    parseInt(rgbArray[2], 16), 
                    255]);
            } else if (hexString.length === 8) {
                const rgbaArray = hexString.match(/.{1,2}/g);
                return new Color('RGBA', [
                    parseInt(rgbaArray[0], 16), 
                    parseInt(rgbaArray[1], 16), 
                    parseInt(rgbaArray[2], 16), 
                    parseInt(rgbaArray[3], 16)]);
            } else {
                throw new Error('Incorrect hexadecimal format. The hexadecimal color must be 6 or 8 characters long.');
            }
        }
    }

    private rgbaToHex(): Color {
        if (this.format !== 'RGBA') {
            throw new Error(`Color format must be rgba. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            const toHex = (value: number) => {
                const hex = value.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            return new Color('HEX', `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}${toHex(this.a)}`);
        } else {
            throw Error('The RGBA color format shall have a data parameter of 4 numeric values in the range 0-255.');
        }
    }

    private hsvToRgba(): Color {
        if (this.format !== 'HSV') {
            throw new Error(`Color format must be hsv. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 3) {
            const s = this.s / 100;
            const v = this.v / 100;
            const hi = (this.h / 60) % 6 |0;
            const f = this.h / 60 - hi;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            var r, g, b;
            if (hi === 0) {
                [r, g, b] = [v, t, p];
            } else if (hi === 1) {
                [r, g, b] = [q, v, p]; 
            } else if (hi === 2) {
                [r, g, b] = [p, v, t]; 
            } else if (hi === 3) {
                [r, g, b] = [p, q, v]; 
            } else if (hi === 4) {
                [r, g, b] = [t, p, v]; 
            } else if (hi === 5) {
                [r, g, b] = [v, p, q];}

            return new Color('RGBA', [
                Math.ceil(r*255), 
                Math.ceil(g*255), 
                Math.ceil(b*255), 
                255
            ]);
        } else {
            throw Error('The HSV color format shall have a data parameter of 3 numeric values. Hue in the range 0-360 degrees, saturation and value in range 0-100 %.');
        }
    }

    private rgbaToHsv(): Color {
        if (this.format !== 'RGBA') {
            throw new Error(`Color format must be rgba. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            const [r, g, b] = [this.r / 255, this.g / 255, this.b / 255];
            const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
            const delta = max - min;
            var hue, saturation, value;
            if (max === r) {
                hue = 60 * ((g - b) / delta % 6);
            } else if (max === g) {
                hue = 60 * ((b - r) / delta + 2);
            } else if (max === b) {
                hue = 60 * ((r - g) / delta + 4);}
            if (max !== 0) {
                saturation = 100 * delta / max;
            } else { saturation = 0;}
            value = max * 100;
            return new Color('HSV', [
                Math.round(hue), 
                Math.round(saturation), 
                Math.round(value)
            ]);
        } else {
            throw Error('The RGBA color format shall have a data parameter of 4 numeric values in the range 0-255.');
        }
    }

    private hslToRgba(): Color {
        if (this.format !== 'HSL') {
            throw new Error(`Color format must be hsl. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 3) {
            const s = this.s / 100;
            const l = this.l / 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const m = l - c / 2;
            const x = c * (1 - Math.abs((this.h / 60) % 2 - 1));
            var r, g, b;
            if (this.h >= 0 && this.h < 60) {
                [r, g, b] = [c, x, 0];
            }
            else if (this.h >= 60 && this.h < 120) {
                [r, g, b] = [x, c, 0];
            }
            else if (this.h >= 120 && this.h < 180) {
                [r, g, b] = [0, c, x];
            }
            else if (this.h >= 180 && this.h < 240) {
                [r, g, b] = [0, x, c];
            }
            else if (this.h >= 240 && this.h < 300) {
                [r, g, b] = [x, 0, c];
            }
            else if (this.h >= 300 && this.h < 360) {
                [r, g, b] = [c, 0, x];
            }
            return new Color('RGBA', [
                ((r + m) * 255)|0, 
                ((g + m) * 255)|0, 
                ((b + m) * 255)|0, 
                255
            ]);
        } else {
            throw Error('The HSL color format shall have a data parameter of 3 numeric values. Hue in the range 0-360 degrees, saturation and lightness in range 0-100 %.');
        }
    }

    private rgbaToHsl(): Color {
        if (this.format !== 'RGBA') {
            throw new Error(`Color format must be rgba. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            const [r, g, b] = [this.r / 255, this.g / 255, this.b / 255];
            const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
            const c = max - min;
            var h, s, l;        
            if (r === max && c != 0) {
                h = (((g - b) / c) % 6) * 60;
            } else if (g === max && c != 0) {
                h = (((b - r) / c) + 2) * 60;
            } else if (b === max && c != 0) {
                h = (((r - g) / c) + 4) * 60;
            } else if (c === 0) {
                h = 0;
            }
            l = (max + min) / 2;
            s = c / (1 - Math.abs(2 * l - 1));
            return new Color('HSL', [
                Math.round(h),
                Math.round(s * 100),
                Math.round(l * 100)
            ]);
        } else {
            throw Error('The RGBA color format shall have a data parameter of 4 numeric values in the range 0-255.');
        }
    }

    private hsiToRgba(): Color {
        if (this.format !== 'HSI') {
            throw new Error(`Color format must be hsi. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 3) {
            const h = this.h / 60;
            const s = this.s / 100;
            const i = this.i / 100;
            const z = 1 - Math.abs(h % 2 - 1);
            const c = (3 * i * s) / (1 + z);
            const x = c * z;
            const m = i * (1 - s);
            var r,g,b;
            if (this.h >= 0 && this.h < 60) {
                [r, g, b] = [c, x, 0];
            } else if (this.h >= 60 && this.h < 120) {
                [r, g, b] = [x, c, 0];
            } else if (this.h >= 120 && this.h < 180) {
                [r, g, b] = [0, c, x];
            } else if (this.h >= 180 && this.h < 240) {
                [r, g, b] = [0, x, c];
            } else if (this.h >= 240 && this.h < 300) {
                [r, g, b] = [x, 0, c];
            } else if (this.h >= 300 && this.h < 360) {
                [r, g, b] = [c, 0, x];
            }
            return new Color('RGBA', [
                ((r + m) * 255)|0,
                ((g + m) * 255)|0,
                ((b + m) * 255)|0,
                255
            ]);
        } else {
            throw Error('The HSI color format shall have a data parameter of 3 numeric values. Hue in the range 0-360 degrees, saturation and intensity in range 0-100 %.');
        }
    }

    private rgbaToHsi(): Color {
        if (this.format !== 'RGBA') {
            throw new Error(`Color format must be rgba. This format is ${this.format}.`);
        }
        if (Array.isArray(this.data) && this.data.length === 4) {
            const rgb = this.r + this.g + this.b;
            if (rgb === 0) {
                return new Color('HSI', [0, 0, 0]);
            }
            const [r, g, b] = [this.r / rgb, this.g / rgb, this.b / rgb];
            const i = rgb / 765;
            const s = 1 - 3 * Math.min(r, g, b);
            const numerator = 0.5 * ((r - g) + (r - b));
            const denominator = ((r - g)**2 + (r - b) * (g - b))**0.5;
            var theta = Math.acos(Math.max(-1, Math.min(1, numerator / denominator))) * (180 / Math.PI);  
            if (b <= g) {
                var h = theta;
            } else {
                var h = 360 - theta;
            }
            return new Color('HSI', [
                Math.round(h),
                Math.round(s*100),
                Math.round(i*100)
            ]);
        } else {
            throw Error('The RGBA color format shall have a data parameter of 4 numeric values in the range 0-255.');
        }
    }
}