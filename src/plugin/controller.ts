// Plugin window dimensions
import {
  FIGMA_MSG_LAYERS_SKIPPED_TYPE,
  FIGMA_MSG_RUN_APP_TYPE,
  FIGMA_MSG_SELECT_LAYER_TYPE,
  FIGMA_MSG_SELECTION_UPDATED_TYPE,
  FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT,
  FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK,
  FIGMA_MSG_THEME_UPDATE_TYPE
} from "../common/constants";
import { flattenNodes, serializeNodesToJSON } from "../common/nodes";
import { RGBToHex, normalizeColor } from "../common/colors";
import { Theme } from "../common/types";

import { darkTheme } from "./dark-to-light-theme";
import { lightTheme } from "./light-to-dark-theme";

export const PLUGIN_WINDOW_WIDTH = 320;
export const PLUGIN_WINDOW_HEIGHT = 358;

const onFigmaMessage: MessageEventHandler = msg => {
  const skippedLayers = [];

  if (msg.type === FIGMA_MSG_RUN_APP_TYPE) {
    // If nothing's selected, we tell the UI to keep the empty state.
    if (figma.currentPage.selection.length === 0) {
      figma.ui.postMessage({
        type: FIGMA_MSG_SELECTION_UPDATED_TYPE,
        message: 0
      });
    } else {
      const selectedNodes = flattenNodes(figma.currentPage.selection);

      // Update the UI with the number of selected nodes.
      // This will display our theming controls.
      figma.ui.postMessage({
        type: FIGMA_MSG_SELECTION_UPDATED_TYPE,
        message: serializeNodesToJSON(selectedNodes)
      });
    }
  }

  if (msg.type === FIGMA_MSG_THEME_UPDATE_TYPE) {
    const nodesToTheme = figma.currentPage.selection;

    if (msg.message === FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT) {
      // Update the layers with this theme, by passing in the
      // selected nodes and the theme object.
      nodesToTheme.map(selected => updateTheme(selected, darkTheme));
    }

    if (msg.message === FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK) {
      // Update the layers with this theme, by passing in the
      // selected nodes and the theme object.
      nodesToTheme.map(selected => updateTheme(selected, lightTheme));
    }

    // Need to wait for some promises to resolve before
    // sending the skipped layers back to the UI.
    setTimeout(function() {
      figma.ui.postMessage({
        type: FIGMA_MSG_LAYERS_SKIPPED_TYPE,
        message: serializeNodesToJSON(skippedLayers)
      });
    }, 500);

    figma.notify("Theming complete", { timeout: 750 });
  }

  // When a layer is selected from the skipped layers.
  if (msg.type === FIGMA_MSG_SELECT_LAYER_TYPE) {
    const layer = figma.getNodeById(msg.id);
    const layerArray = [];

    // Using selection and viewport requires an array.
    layerArray.push(layer);

    // Moves the layer into focus and selects so the user can update it.
    figma.notify(`Layer ${layer.name} selected`, { timeout: 750 });
    figma.currentPage.selection = layerArray;
    figma.viewport.scrollAndZoomIntoView(layerArray);
  }

  // Swap styles with the corresponding/mapped styles
  async function replaceStyles(
    node,
    style: BaseStyle,
    mappings,
    applyStyle: (node, styleId) => void
  ) {
    // Find the style the ID corresponds to in the team library
    const importedStyle = await figma.importStyleByKeyAsync(style.key);

    // Once the promise is resolved, then see if the
    // key matches anything in the mappings object.
    if (mappings[importedStyle.key] !== undefined) {
      const mappingStyle = mappings[importedStyle.key];

      // Use the mapping value to fetch the official style.
      const newStyle = await figma.importStyleByKeyAsync(
        mappingStyle.mapsToKey
      );

      // Update the node with the new color.
      applyStyle(node, newStyle.id);
    } else {
      skippedLayers.push(node);
    }
  }

  // Fix layers with no style attached to them, just hex colors
  async function fixStyles(
    node,
    nodeType,
    style,
    mappings,
    applyStyle: (node, styleId) => void
  ) {
    const styleName = nodeType.toLowerCase() + " " + style;
    console.log(styleName);
    // See if the key matches anything in the mappings object.
    if (mappings[styleName] !== undefined) {
      const mappingStyle = mappings[styleName];

      // Use the mapping value to fetch the official style.
      const newStyle = await figma.importStyleByKeyAsync(
        mappingStyle.mapsToKey
      );

      // Update the node with the new color.
      applyStyle(node, newStyle.id);
    } else {
      skippedLayers.push(node);
    }
  }

  async function replaceComponent(
    node,
    key,
    mappings,
    applyComponent: (node, masterComponent) => void
  ) {
    const componentToSwitchWith = mappings[key];
    const importedComponent = await figma.importComponentByKeyAsync(
      componentToSwitchWith.mapsToKey
    );
    // Switch the existing component to a new component.
    applyComponent(node, importedComponent);
  }

  async function swapComponent(node, key, mappings) {
    await replaceComponent(
      node,
      key,
      mappings,
      (node, masterComponent) => (node.masterComponent = masterComponent)
    );
  }

  function replaceFills(node, style, mappings) {
    return replaceStyles(
      node,
      style,
      mappings,
      (node, styleId) => (node.fillStyleId = styleId)
    );
  }

  function replaceNoStyleFill(node, nodeType, style, mappings) {
    return fixStyles(
      node,
      nodeType,
      style,
      mappings,
      (node, styleId) => (node.fillStyleId = styleId)
    );
  }

  function replaceStrokes(node, style: BaseStyle, mappings) {
    return replaceStyles(
      node,
      style,
      mappings,
      (node, styleId) => (node.strokeStyleId = styleId)
    );
  }

  function replaceEffects(node, style: BaseStyle, mappings) {
    return replaceStyles(
      node,
      style,
      mappings,
      (node, styleId) => (node.effectStyleId = styleId)
    );
  }

  // Updates the node with the new theme depending on
  // the type of the node.
  function updateTheme(node, theme: Theme) {
    switch (node.type) {
      case "COMPONENT":
      case "COMPONENT_SET":
      case "RECTANGLE":
      case "GROUP":
      case "ELLIPSE":
      case "POLYGON":
      case "STAR":
      case "BOOLEAN_OPERATION":
      case "FRAME":
      case "LINE":
      case "VECTOR": {
        if (node.children) {
          node.children.forEach(child => {
            updateTheme(child, theme);
          });
        }
        if (node.fills) {
          if (node.fillStyleId && typeof node.fillStyleId !== "symbol") {
            const style = figma.getStyleById(node.fillStyleId);
            // Pass in the layer we want to change, the style ID the node is using.
            // and the set of mappings we want to check against.
            replaceFills(node, style, theme);
          } else if (node.fillStyleId === "") {
            // No style on the layer? Let's fix it for them.
            // First we need the fill type determined above ex:is it #ffffff?), then
            // we pass that hex into a new function.
            const style = determineFill(node.fills);
            const nodeType = node.type;
            replaceNoStyleFill(node, nodeType, style, theme);
          } else {
            skippedLayers.push(node);
          }
        }

        if (node.strokeStyleId) {
          replaceStrokes(node, figma.getStyleById(node.strokeStyleId), theme);
        }

        if (node.effectStyleId) {
          replaceEffects(node, figma.getStyleById(node.effectStyleId), theme);
        }

        break;
      }
      case "INSTANCE": {
        const componentKey = node.masterComponent.key;
        // If this instance is in mapping, then call it and skip it's children
        // otherwise check for the normal differences.
        if (theme[componentKey] !== undefined) {
          swapComponent(node, componentKey, theme);
        } else {
          if (node.fills) {
            if (node.fillStyleId && typeof node.fillStyleId !== "symbol") {
              const style = figma.getStyleById(node.fillStyleId);
              // Pass in the layer we want to change, the style ID the node is using.
              // and the set of mappings we want to check against.
              replaceFills(node, style, theme);
            } else if (node.fillStyleId === "") {
              // No style on the layer? Let's fix it for them.
              // First we need the fill type determined above ex:is it #ffffff?), then
              // we pass that hex into a new function.
              const style = determineFill(node.fills);
              const nodeType = node.type;
              replaceNoStyleFill(node, nodeType, style, theme);
            } else {
              skippedLayers.push(node);
            }
          }

          if (node.strokeStyleId) {
            replaceStrokes(node, figma.getStyleById(node.strokeStyleId), theme);
          }

          if (node.effectStyleId) {
            replaceEffects(node, figma.getStyleById(node.effectStyleId), theme);
          }

          if (node.children) {
            node.children.forEach(child => {
              updateTheme(child, theme);
            });
          }
        }
        break;
      }
      case "TEXT": {
        if (node.fillStyleId && typeof node.fillStyleId !== "symbol") {
          replaceFills(node, figma.getStyleById(node.fillStyleId), theme);
        } else if (node.fillStyleId === "") {
          const style = determineFill(node.fills);
          const nodeType = node.type;
          replaceNoStyleFill(node, nodeType, style, theme);
        } else {
          skippedLayers.push(node);
        }
      }
      // eslint-disable-next-line no-fallthrough
      default: {
        // do nothing
      }
    }
  }

  // Determine a nodes fills
  function determineFill(fills) {
    const fillValues = [];
    let rgbObj;

    fills.forEach(fill => {
      if (fill.type === "SOLID" && fill.visible === true) {
        rgbObj = normalizeColor(fill.color);
        fillValues.push(RGBToHex(rgbObj["r"], rgbObj["g"], rgbObj["b"]));
      }
    });

    return fillValues[0];
  }
};

figma.showUI(__html__, {
  width: PLUGIN_WINDOW_WIDTH,
  height: PLUGIN_WINDOW_HEIGHT
});

figma.ui.onmessage = onFigmaMessage;
