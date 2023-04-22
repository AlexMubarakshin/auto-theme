import React, { FC, useEffect, useState } from "react";

import {
  FIGMA_MSG_LAYERS_SKIPPED_TYPE,
  FIGMA_MSG_SELECT_LAYER_TYPE,
  FIGMA_MSG_SELECTION_UPDATED_TYPE,
  FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT,
  FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK,
  FIGMA_MSG_THEME_UPDATE_TYPE
} from "../../common/constants";
import { deserializeNodesFromJSON } from "../../common/nodes";

import { ListItem } from "./ListItem";
import { PlaceholderEmpty } from "./PlaceholderEmpty";
import { Button } from "./Button";

import classNames from "classnames";

import "../styles/figma-plugin-ds.css";
import "../styles/ui.css";
import "../styles/nav.css";
import "../styles/controls.css";
import "../styles/empty-state.css";

const TAB_THEMES = "themes";
const TAB_LAYERS = "layers";

const App: FC = () => {
  const [selectedLayersLength, setSelectLayersLength] = useState(0);
  const [activeTab, setActiveTab] = useState(TAB_THEMES);
  const [skippedLayers, setSkippedLayers] = useState<ReadonlyArray<SceneNode>>(
    []
  );
  const [activeLayer, setActiveLayer] = useState<SceneNode["id"]>(undefined);

  useEffect(() => {
    parent.postMessage(
      { pluginMessage: { type: "run-app", message: "" } },
      "*"
    );

    window.onmessage = event => {
      const { type, message } = event.data.pluginMessage;

      if (type === FIGMA_MSG_SELECTION_UPDATED_TYPE) {
        const nodeArray = deserializeNodesFromJSON(message);
        setSelectLayersLength(nodeArray.length);
      }

      if (type === FIGMA_MSG_LAYERS_SKIPPED_TYPE) {
        const unthemedLayers = deserializeNodesFromJSON(message);

        setSkippedLayers(skippedLayers => [
          ...skippedLayers,
          ...unthemedLayers
        ]);
      }
    };
  }, []);

  const themeToLight = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: FIGMA_MSG_THEME_UPDATE_TYPE,
          message: FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT
        }
      },
      "*"
    );
  };

  const themeToDark = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: FIGMA_MSG_THEME_UPDATE_TYPE,
          message: FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK
        }
      },
      "*"
    );
  };

  const handleThemesTabClick = () => {
    setActiveTab(TAB_THEMES);
  };

  const handleLayersTabClick = () => {
    setActiveTab(TAB_LAYERS);
  };

  // When the user selects a layer in the skipped layer list.
  const handleLayerSelect = (id: SceneNode["id"]) => {
    setActiveLayer(id);
    parent.postMessage(
      { pluginMessage: { type: FIGMA_MSG_SELECT_LAYER_TYPE, id: id } },
      "*"
    );
  };

  return (
    <div className="wrapper">
      {selectedLayersLength === 0 ? (
        <PlaceholderEmpty />
      ) : (
        <>
          <nav className="nav">
            <div
              onClick={handleThemesTabClick}
              className={classNames("section-title", {
                active: activeTab === TAB_THEMES,
                disabled: activeTab !== TAB_THEMES
              })}
            >
              Themes
            </div>

            <div
              onClick={handleLayersTabClick}
              className={classNames("section-title", {
                active: activeTab === TAB_LAYERS,
                disabled: activeTab !== TAB_LAYERS
              })}
            >
              Skipped Layers{" "}
              {!!skippedLayers.length && (
                <span className="layer-count"> ({skippedLayers.length})</span>
              )}
            </div>
          </nav>

          {activeTab === TAB_THEMES ? (
            <div className="active-state">
              <h3 className="active-state-title type type--pos-large-medium">
                {selectedLayersLength} layers selected for theming
              </h3>
              <Button className="button-margin-bottom" onClick={themeToLight}>
                Light Theme
              </Button>
              <Button variant="secondary" onClick={themeToDark}>
                Dark Theme
              </Button>
            </div>
          ) : (
            <div className="layer-list-wrapper">
              {skippedLayers.length === 0 ? (
                <div className="active-state">
                  <h3 className="active-state-title layer-empty-title type type--pos-large-medium">
                    No layers have been skipped yet.
                  </h3>
                </div>
              ) : (
                <ul className="list">
                  {skippedLayers.map((node, index) => (
                    <ListItem
                      active={activeLayer === node.id}
                      onClick={handleLayerSelect}
                      key={index}
                      node={node}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
