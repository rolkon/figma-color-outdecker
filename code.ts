// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

function HSLToRGB(hsl: {
  h: number;
  s: number;
  l: number;
}): { r: number; g: number; b: number } {
  const { h, s, l } = hsl;

  const hDecimal = h / 360; //HTML UI slider
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  let r, g, b;

  if (s === 0) {
    return { r: lDecimal, g: lDecimal, b: lDecimal };
  }

  const HueToRGB = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let q =
    lDecimal < 0.5
      ? lDecimal * (1 + sDecimal)
      : lDecimal + sDecimal - lDecimal * sDecimal;
  let p = 2 * lDecimal - q;

  r = HueToRGB(p, q, hDecimal + 1 / 3);
  g = HueToRGB(p, q, hDecimal);
  b = HueToRGB(p, q, hDecimal - 1 / 3);

  return { r: r, g: g, b: b };
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Set initial window size
figma.ui.resize(320, 400); // Width: 320px, Height: 400px

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg: {type: string, color?: {h: number, s: number, l: number}}) => {
  if (msg.type === 'apply-color' && msg.color) {
    // Convert HSL to RGB (Figma uses RGB)
    const h = msg.color.h / 360;
    const s = msg.color.s / 100;
    const l = msg.color.l / 100;

    const rgbcolor = HSLToRGB({
      h: msg.color.h,
      s: msg.color.s,
      l: msg.color.l
    });

    console.log("Checkpoint 1");
    console.log(msg.color);
    console.log(rgbcolor);
    
    // Apply color to selected nodes
    const nodes = figma.currentPage.selection;
    for (const node of nodes) {
      if ('fills' in node) {
        node.fills = [{
          type: 'SOLID',
          color: rgbcolor, //{ r: h, g: s, b: l }
        }];
      }
    }
  } else {
    figma.closePlugin();
  }
};
