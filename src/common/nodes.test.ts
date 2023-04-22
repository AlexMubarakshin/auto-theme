import { flattenNodes, serializeNodesToJSON } from "./nodes";

describe("flattenNodes", () => {
  it("should flatten a single node", () => {
    const input = ({
      id: 1,
      name: "Node 1",
      children: []
    } as unknown) as SceneNode;

    expect(flattenNodes(input)).toEqual([input]);
  });

  it("should flatten an array of nodes", () => {
    const input = ([
      { id: 1, name: "Node 1", children: [] },
      { id: 2, name: "Node 2", children: [] }
    ] as unknown) as ReadonlyArray<SceneNode>;

    expect(flattenNodes(input)).toEqual(input);
  });

  it("should flatten a nested array of nodes", () => {
    const input = ({
      id: 1,
      name: "Node 1",
      children: [
        {
          id: 2,
          name: "Node 2",
          children: [{ id: 3, name: "Node 3", children: [] }]
        }
      ]
    } as unknown) as SceneNode;

    expect(flattenNodes(input)).toEqual([
      { id: 1, name: "Node 1" },
      { id: 2, name: "Node 2" },
      { id: 3, name: "Node 3" }
    ]);
  });
});

describe("serializeNodesToJSON", () => {
  it("should serialize an array of nodes", () => {
    const input = ([
      { id: 1, name: "Node 1", children: [] },
      { id: 2, name: "Node 2", children: [] }
    ] as unknown) as ReadonlyArray<SceneNode>;

    const expected = JSON.stringify(input, ["name", "type", "children", "id"]);

    expect(serializeNodesToJSON(input)).toEqual(expected);
  });

  it("should serialize a nested array of nodes", () => {
    const input = ({
      id: 1,
      name: "Node 1",
      children: [
        {
          id: 2,
          name: "Node 2",
          children: [{ id: 3, name: "Node 3", children: [] }]
        }
      ]
    } as unknown) as SceneNode;

    const expected = JSON.stringify(
      [input],
      ["name", "type", "children", "id"]
    );

    expect(serializeNodesToJSON([input])).toEqual(expected);
  });
});
