// Function to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = 0, g = 0, b = 0;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

// Function to convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Function to generate Tailwind CSS color palette
function generateColorPalette(baseColor: { r: number; g: number; b: number; a: number }): string[] {
  const { r, g, b } = baseColor;
  const hsl = rgbToHsl(r, g, b);
  const lightnessValues = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
  const palette = lightnessValues.map(l => {
    const rgb = hslToRgb(hsl.h, hsl.s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  });
  return palette;
}


// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Set initial window size
figma.ui.resize(320, 400); // Width: 320px, Height: 400px

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: {type: string, color?: {r: number, g: number, b: number, a: number}}) => {
  if (msg.type === 'apply-color' && msg.color) {

    const palette = generateColorPalette(msg.color);

    console.log(palette);

    // Convert HSL to RGB (Figma uses RGB)
    // const r = msg.color.r / 255;
    // const g = msg.color.g / 255;
    // const b = msg.color.b / 255;
    // const a = msg.color.a;

    // const rgbcolor = {r: r, g: g, b: b};
    
    // Apply color to selected nodes
    // const nodes = figma.currentPage.selection;
    // for (const node of nodes) {
    //   if ('fills' in node) {
    //     node.fills = [{
    //       type: 'SOLID',
    //       color: rgbcolor,
    //     }];
    //   }
    // }
  } else {
    figma.closePlugin();
  }
};
