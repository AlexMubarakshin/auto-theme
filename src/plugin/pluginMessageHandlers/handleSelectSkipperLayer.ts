export function handleSelectSkipperLayer(nodeId: SceneNode["id"]) {
  const layer = figma.getNodeById(nodeId);

  // Moves the layer into focus and selects so the user can update it.
  figma.notify(`Layer ${layer.name} selected`, { timeout: 750 });
  figma.currentPage.selection = [layer] as ReadonlyArray<SceneNode>;
  figma.viewport.scrollAndZoomIntoView([layer] as ReadonlyArray<SceneNode>);
}
