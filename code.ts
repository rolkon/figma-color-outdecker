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

// Function to convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const bigint = parseInt(hex.replace("#", ""), 16);
  if (isNaN(bigint)) return null;
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
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

  // Append the input color as the last element
  const inputColorHex = rgbToHex(r, g, b);
  // palette.push(inputColorHex);

  return palette;
}

async function ensureVariableCollectionExists(name: string): Promise<VariableCollection> {
  if (!figma.variables) {
    throw new Error("Variables API not supported in this file.");
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find(c => c.name === name);
  if (!collection) {
    collection = figma.variables.createVariableCollection(name);
  }

  return collection;
}

async function createOrUpdateColorVariable(
  collection: VariableCollection,
  name: string,
  color: { r: number; g: number; b: number }
) {
  const variables = await figma.variables.getLocalVariablesAsync();

  let variable = variables.find(v => v.name === name && v.variableCollectionId === collection.id);

  if (!variable) {
    console.log(name, collection.id);
    variable = figma.variables.createVariable(name, collection, "COLOR");
  }

  const mode_id = Object.keys(variable.valuesByMode)[0];

  variable.setValueForMode(mode_id, color);
} 

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Set initial window size
figma.ui.resize(640, 600); // Width: 320px, Height: 400px

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: {type: string, colors?: {r: number, g: number, b: number, a: number}[] }) => {
  if (msg.type === 'apply-colors' && msg.colors) {
    const palettes = msg.colors.map(generateColorPalette);

    console.log(palettes);

    try {
      const collection = await ensureVariableCollectionExists("Outdecker Primitives");

      const colorTypes = ["Primary", "Secondary"];

      const tailwindLabels = ["50", "100", "200", "300",
                              "400", "500", "600", "700",
                              "800", "900", "950"];

      
      colorTypes.forEach((type, index) => {
        
      });

      for (const [typeIdx, type] of colorTypes.entries()) {
        for (const [colorIdx, colorHex] of palettes[typeIdx].entries()) {
          const colorRgb = hexToRgb(colorHex); // Convert hex to RGB
          if (colorRgb) {
            const label = [type, "/", tailwindLabels[colorIdx]].join("");
            console.log(label);
            await createOrUpdateColorVariable(collection, label, colorRgb); // Use await in an async context
          }
        }
      }

      figma.notify("Color palette applied to variables.");
    } catch (error: unknown) {
      if(error instanceof Error) {
        figma.notify("Error managing color variables: " + error.message);
      } else {
        figma.notify("An unknown error occured.");
      }
    }

    figma.ui.postMessage({type: 'update-palettes', palettes});
  } else {
    figma.closePlugin();
  }
};
