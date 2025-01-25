// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

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
    
    // Apply color to selected nodes
    const nodes = figma.currentPage.selection;
    for (const node of nodes) {
      if ('fills' in node) {
        node.fills = [{
          type: 'SOLID',
          color: { r: h, g: s, b: l }
        }];
      }
    }
  } else {
    figma.closePlugin();
  }
};
