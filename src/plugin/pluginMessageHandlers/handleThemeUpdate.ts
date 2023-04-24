import { Theme } from "../../common/types";
import { normalizeColor, RGBToHex } from "../../common/colors";
import {
  FIGMA_MSG_LAYERS_SKIPPED_TYPE,
  FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT,
  FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK
} from "../../common/constants";
import { darkTheme } from "../dark-to-light-theme";
import { lightTheme } from "../light-to-dark-theme";
import { serializeNodesToJSON } from "../../common/nodes";

function createImportStyleByAsyncWithCache() {
  const cache: Record<string, BaseStyle> = {};

  return async (key: string) => {
    if (cache[key]) {
      return cache[key];
    }

    const style = await figma.importStyleByKeyAsync(key);
    cache[key] = style;

    return style;
  };
}

export function handleThemeUpdate(pluginMessage) {
  const importCachedStyleByKeyAsync = createImportStyleByAsyncWithCache();

  // Swap styles with the corresponding/mapped styles
  async function replaceStyles(
    node,
    style: BaseStyle,
    theme: Theme,
    applyStyle: (node, styleId) => void
  ) {
    // Find the style the ID corresponds to in the team library
    const importedStyle = await importCachedStyleByKeyAsync(style.key);

    // Once the promise is resolved, then see if the
    // key matches anything in the theme object.
    if (theme[importedStyle.key] !== undefined) {
      const mappingStyle = theme[importedStyle.key];

      // Use the mapping value to fetch the official style.
      const newStyle = await importCachedStyleByKeyAsync(
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
    theme: Theme,
    applyStyle: (node, styleId) => void
  ) {
    const styleName = nodeType.toLowerCase() + " " + style;
    console.log(styleName);
    // See if the key matches anything in the theme object.
    if (theme[styleName] !== undefined) {
      const mappingStyle = theme[styleName];

      // Use the mapping value to fetch the official style.
      const newStyle = await importCachedStyleByKeyAsync(
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
            replaceNoStyleFill(node, node.type, style, theme);
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
              replaceNoStyleFill(node, node.type, style, theme);
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
    const fill = fills.find(fill => fill.type === "SOLID" && fill.visible);
    if (!fill) {
      return undefined;
    }

    const normalizedColor = normalizeColor(fill.color);

    return RGBToHex(normalizedColor.r, normalizedColor.g, normalizedColor.b);
  }

  figma.notify("Changing theme...", { timeout: 750 });

  const skippedLayers = [];

  const nodesToTheme = figma.currentPage.selection;

  if (pluginMessage.message === FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT) {
    // Update the layers with this theme, by passing in the
    // selected nodes and the theme object.
    nodesToTheme.map(selected => updateTheme(selected, darkTheme));
  }

  if (pluginMessage.message === FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK) {
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
