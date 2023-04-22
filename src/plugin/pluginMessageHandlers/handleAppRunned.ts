import { FIGMA_MSG_SELECTION_UPDATED_TYPE } from "../../common/constants";
import { flattenNodes, serializeNodesToJSON } from "../../common/nodes";

export function handleAppRunned() {
  // If selected Update the user interface with the number of selected nodes.
  // This will display our controls.
  // Otherwise we tell the user interface to keep an empty state.

  const message = figma.currentPage.selection.length
    ? serializeNodesToJSON(flattenNodes(figma.currentPage.selection))
    : 0;

  figma.ui.postMessage({
    type: FIGMA_MSG_SELECTION_UPDATED_TYPE,
    message
  });
}
