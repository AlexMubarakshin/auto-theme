// Flattens the selection of nodes in Figma into an array.
export function flattenNodes(
  nodes: ReadonlyArray<SceneNode> | SceneNode
): ReadonlyArray<SceneNode> {
  const array = Array.isArray(nodes) ? nodes : [nodes];
  const flattenedArray = [];

  for (const value of array) {
    flattenedArray.push(value);
    if (value.children) {
      flattenedArray.push(...flattenNodes(value.children));
      delete value.children;
    }
  }

  return flattenedArray;
}

// Serializes nodes to pass back to the UI.
export function serializeNodesToJSON(nodes: ReadonlyArray<SceneNode>): string {
  return JSON.stringify(nodes, ["name", "type", "children", "id"]);
}

export function deserializeNodesFromJSON(
  message: any
): ReadonlyArray<SceneNode> {
  return JSON.parse(message);
}
