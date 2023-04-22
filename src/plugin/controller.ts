import {
  FIGMA_MSG_PLUGIN_INITIALIZED,
  FIGMA_MSG_SELECT_LAYER_TYPE,
  FIGMA_MSG_THEME_UPDATE_TYPE
} from "../common/constants";

import { handleAppRunned } from "./pluginMessageHandlers/handleAppRunned";
import { handleSelectSkipperLayer } from "./pluginMessageHandlers/handleSelectSkipperLayer";
import { handleThemeUpdate } from "./pluginMessageHandlers/handleThemeUpdate";

export const PLUGIN_WINDOW_WIDTH = 320;
export const PLUGIN_WINDOW_HEIGHT = 358;

const onFigmaMessage: MessageEventHandler = pluginMessage => {
  console.log("Message", pluginMessage);
  switch (pluginMessage.type) {
    case FIGMA_MSG_PLUGIN_INITIALIZED:
      return handleAppRunned();
    case FIGMA_MSG_SELECT_LAYER_TYPE:
      return handleSelectSkipperLayer(pluginMessage.id);
    case FIGMA_MSG_THEME_UPDATE_TYPE:
      return handleThemeUpdate(pluginMessage);
    default:
      return;
  }
};

figma.showUI(__html__, {
  width: PLUGIN_WINDOW_WIDTH,
  height: PLUGIN_WINDOW_HEIGHT
});

figma.ui.onmessage = onFigmaMessage;
