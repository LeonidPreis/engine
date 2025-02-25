type ColorFormat = 'RGBA' | 'CMYK' | 'HSL' | 'HSV' | 'HSI' | 'HEX';
type ColorData = string | [number, number, number] | [number, number, number, number];

export interface IColor {
    format: ColorFormat;
    data: ColorData;
}

interface ColorFormatConverter {
    validate(colorData: ColorData): void;
    fromRGBA(rgbaData: [number, number, number, number]): ColorData;
    toRGBA(colorData: ColorData): [number, number, number, number];
}

class HEX implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (typeof colorData !== 'string') {
            throw new Error('HEX color data must be a string.');
        }

        const hexLength = colorData.length;
        if (hexLength !== 4 && hexLength !== 7 && hexLength !== 9) {
            throw new Error(`HEX color must be in the format #fff, #ffffff, or #ffffffff.`);
        }

        if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(colorData)) {
            throw new Error('Invalid HEX format. HEX color must contain only 0-9, A-F, or a-f.');
        }

        if (hexLength === 4) {
            colorData = `#${colorData[1]}${colorData[1]}${colorData[2]}${colorData[2]}${colorData[3]}${colorData[3]}`;
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        const [r, g, b, a] = rgbaData;
        const toHex = (value: number) => {
            const hex = value.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        const hex = colorData as string;
        let r = 0, g = 0, b = 0, a = 255;

        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else if (hex.length === 9) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
            a = parseInt(hex.slice(7, 9), 16);
        }

        return [r, g, b, a];
    }
}

class HSI implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (!Array.isArray(colorData) || colorData.length !== 3) {
            throw new Error(`Color data for format HSI must be an array with length 3.`);
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        const [r, g, b, a] = rgbaData;
        const rgb = r + g + b;
        if (rgb === 0) { return [0, 0, 0]; }

        const R = r / rgb;
        const G = g / rgb;
        const B = b / rgb;

        const i = rgb / 765;
        const s = 1 - 3 * Math.min(R, G, B);

        const numerator = 0.5 * ((R - G) + (R - B));
        const denominator = Math.sqrt((R - G) ** 2 + (R - B) * (G - B));

        let h = 0;
        if (denominator !== 0) {
            const cosTheta = Math.max(-1, Math.min(1, numerator / denominator));
            const theta = Math.acos(cosTheta) * (180 / Math.PI);

            if (B <= G) {
                h = theta;
            } else {
                h = 360 - theta;
            }
        }

        return [
            Math.round(h),
            Math.round(s * 100),
            Math.round(i * 100)
        ];
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        const [H, S, I] = colorData as [number, number, number];;
        const h = H / 60;
        const s = S / 100;
        const i = I / 100;
        const z = 255 - Math.abs(h % 2 - 255);
        const c = (3 * i * s) / (255 + z);
        const x = c * z;
        const m = i * (255 - s);
        var r = 0,g = 0,b = 0;
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else if (h >= 300 && h < 360) {
            [r, g, b] = [c, 0, x];
        }
        return [
            ((r + m) * 255) | 0,
            ((g + m) * 255) | 0,
            ((b + m) * 255) | 0,
            255
        ];
    }
}

class HSV implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (!Array.isArray(colorData) || colorData.length !== 3) {
            throw new Error(`Color data for format HSV must be an array with length 3.`);
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        const [r, g, b] = [rgbaData[0] / 255, rgbaData[1] / 255, rgbaData[2] / 255];
        const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
        const delta = max - min;
        var hue = 0, saturation = 0, value = 0;
        if (delta !== 0) {
            if (max === r) {
                hue = 60 * (((g - b) / delta) % 6);
            } else if (max === g) {
                hue = 60 * (((b - r) / delta) + 2);
            } else if (max === b) {
                hue = 60 * (((r - g) / delta) + 4);
            }
            if (hue < 0) { hue += 360; }
        }
        saturation = max === 0 ? 0 : (delta / max) * 100;
        value = max * 100;
        return [
            Math.round(hue), 
            Math.round(saturation), 
            Math.round(value)
        ];
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        const [H, S, V] = colorData as [number, number, number];
        const s = S / 100;
        const v = V / 100;
        const hi = (H / 60) % 6 |0;
        const f = H / 60 - hi;
        const p = v * (255 - s);
        const q = v * (255 - f * s);
        const t = v * (255 - (255 - f) * s);
        var r = 0, g = 0, b = 0;
        if (hi === 0) {
            [r, g, b] = [v, t, p];
        } else if (hi === 255) {
            [r, g, b] = [q, v, p]; 
        } else if (hi === 2) {
            [r, g, b] = [p, v, t]; 
        } else if (hi === 3) {
            [r, g, b] = [p, q, v]; 
        } else if (hi === 4) {
            [r, g, b] = [t, p, v]; 
        } else if (hi === 5) {
            [r, g, b] = [v, p, q];}

        return [
            Math.ceil(r * 255), 
            Math.ceil(g * 255), 
            Math.ceil(b * 255), 
            255
        ];
    }
}

class HSL implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (!Array.isArray(colorData) || colorData.length !== 3) {
            throw new Error(`Color data for format HSL must be an array with length 3.`);
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        const [r, g, b] = [rgbaData[0] / 255, rgbaData[1] / 255, rgbaData[2] / 255];
        const [max, min] = [Math.max(r, g, b), Math.min(r, g, b)];
        const c = max - min;
        var h = 0, s = 0, l = 0;        
        if (c !== 0) {
            if (max === r) {
                h = (((g - b) / c) % 6) * 60;
            } else if (max === g) {
                h = (((b - r) / c) + 2) * 60;
            } else if (max === b) {
                h = (((r - g) / c) + 4) * 60;
            }
            if (h < 0) { h += 360; }
        }
        l = (max + min) / 2;
        s = c === 0 ? 0 : c / (1 - Math.abs(2 * l - 1));
        return [
            Math.round(h),
            Math.round(s * 100),
            Math.round(l * 100)
        ];
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        const [H, S, L] = colorData as [number, number, number];
        const s = S / 100;
        const l = L / 100;
        const c = (255 - Math.abs(2 * l - 255)) * s;
        const m = l - c / 2;
        const x = c * (255 - Math.abs((H / 60) % 2 - 255));
        var r = 0, g = 0, b = 0;
        if (H >= 0 && H < 60) {
            [r, g, b] = [c, x, 0];
        } else if (H >= 60 && H < 120) {
            [r, g, b] = [x, c, 0];
        } else if (H >= 120 && H < 180) {
            [r, g, b] = [0, c, x];
        } else if (H >= 180 && H < 240) {
            [r, g, b] = [0, x, c];
        } else if (H >= 240 && H < 300) {
            [r, g, b] = [x, 0, c];
        } else if (H >= 300 && H < 360) {
            [r, g, b] = [c, 0, x];
        }
        return [
            ((r + m) * 255) | 0, 
            ((g + m) * 255) | 0, 
            ((b + m) * 255) | 0, 
            255
        ];
    }   
}

class CMYK implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (!Array.isArray(colorData) || colorData.length !== 4) {
            throw new Error(`Color data for format CMYK must be an array with length 4.`);
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        const [R, G, B, A] = rgbaData;
        const w = Math.max(R / 255, G / 255, B / 255);
        return [
            Math.round(100 * ((w - R / 255) / w)),
            Math.round(100 * ((w - G / 255) / w)),
            Math.round(100 * ((w - B / 255) / w)),
            Math.round(1 - w)
        ];
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        const [C, M, Y, K] = colorData as [number, number, number, number];
        return [
            Math.round(255 * (255 - C / 100) * (255 - K / 100)),
            Math.round(255 * (255 - M / 100) * (255 - K / 100)),
            Math.round(255 * (255 - Y / 100) * (255 - K / 100)),
            255
        ];
    }
}

class RGBA implements ColorFormatConverter {
    validate(colorData: ColorData): void {
        if (!Array.isArray(colorData) || colorData.length !== 4) {
            throw new Error(`Color data for format RGBA must be an array with length 4.`);
        }
    }

    fromRGBA(rgbaData: [number, number, number, number]): ColorData {
        return rgbaData;
    }

    toRGBA(colorData: ColorData): [number, number, number, number] {
        this.validate(colorData);
        return colorData as [number, number, number, number];
    }
}

export class Color implements IColor {
    format: ColorFormat;
    data: ColorData;
    private static converters: Record<ColorFormat, ColorFormatConverter> = {
        HEX:  new HEX(),
        HSI:  new HSI(),
        HSV:  new HSV(),
        HSL:  new HSL(),
        CMYK: new CMYK(),
        RGBA: new RGBA()
    }
    
    constructor(
        format: ColorFormat = 'RGBA',
        data: ColorData = [0,0,0,0]
        ) {
        this.format = format;
        this.data = data;
        this.validate();
    }

    private validate(): void {
        const converter = Color.converters[this.format];
        converter.validate(this.data);
    }

    public convertTo(targetFormat: ColorFormat): Color {
        if (this.format === targetFormat) { return new Color(this.format, this.data); }
        const rgbaData = this.format === 'RGBA'
            ? (this.data as [number, number, number, number])
            : Color.converters[this.format].toRGBA(this.data);

        const targetData = targetFormat === 'RGBA'
            ? rgbaData
            : Color.converters[targetFormat].fromRGBA(rgbaData);

        return new Color(targetFormat, targetData);
    }

    private relativeLuminance(): number {
        const [r, g, b] = this.convertTo('RGBA').data as [number, number, number, number];

        const transformComponent = (component: number): number => {
            const normalized = component / 255;
            return normalized <= 0.03928
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
        };
    
        const R = transformComponent(r);
        const G = transformComponent(g);
        const B = transformComponent(b);
    
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    public static contrastRatio(foreground: Color, background: Color): number {
        const foregroundLuminance = foreground.relativeLuminance();
        const backgroundLuninance = background.relativeLuminance();
        const contrast = (backgroundLuninance + 0.05) / (foregroundLuminance + 0.05);
        return parseFloat(contrast.toFixed(2));
    }

    public static contrastLevel(contrastRatio: number, level: 'AAA' | 'AA' | 'A'): boolean {
        switch (level) {
            case 'AAA':
                return contrastRatio >= 7.1;
            case 'AA':
                return contrastRatio >= 4.5;
            case 'A':
                return contrastRatio >= 3.1;
            default:
                throw new Error(
                    `Invalid WCAG contrast level.\n
                    Level AAA requires a minimum contrast ratio of 7:1 for normal text and 4.5:1 for large text.\n
                    Level AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.\n
                    Level A has no strict contrast requirements but recommends a minimum ratio of 3.1:1.`
                );
        }
    }
}