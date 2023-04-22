import React, { FC, useCallback, useState } from "react";
import { FIGMA_MSG_SELECT_LAYER_TYPE } from "../../../common/constants";
import { NodeListItem } from "../elements/NodeListItem";

import "./SkippedLayersView.css";

type Props = {
  skippedLayers: ReadonlyArray<SceneNode>;
};

export const SkippedLayersView: FC<Props> = ({ skippedLayers }) => {
  const [activeLayerId, setActiveLayerId] = useState<SceneNode["id"]>(
    undefined
  );

  const handleLayerSelect = useCallback((id: SceneNode["id"]) => {
    setActiveLayerId(id);

    parent.postMessage(
      { pluginMessage: { type: FIGMA_MSG_SELECT_LAYER_TYPE, id: id } },
      "*"
    );
  }, []);

  return (
    <div className="layer-list-wrapper">
      {!skippedLayers.length && (
        <div className="active-state">
          <h3 className="active-state-title layer-empty-title type type--pos-large-medium">
            No layers have been skipped yet.
          </h3>
        </div>
      )}

      {!!skippedLayers.length && (
        <ul className="list">
          {skippedLayers.map((node, index) => (
            <NodeListItem
              key={index}
              active={activeLayerId === node.id}
              id={node.id}
              name={node.name}
              type={node.type}
              onClick={handleLayerSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
