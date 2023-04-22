import React, { FC, useEffect, useState } from "react";

import {
  FIGMA_MSG_PLUGIN_INITIALIZED,
  FIGMA_MSG_LAYERS_SKIPPED_TYPE,
  FIGMA_MSG_SELECTION_UPDATED_TYPE
} from "../../common/constants";
import { deserializeNodesFromJSON } from "../../common/nodes";

import { Nav } from "./elements/Nav";
import { NavItem } from "./elements/NavItem";

import { PlaceholderEmptyView } from "./views/PlaceholderEmptyView";
import { ThemeSwitcherView } from "./views/ThemeSwitcherView";
import { SkippedLayersView } from "./views/SkippedLayersView";

import "../styles/figma-plugin-ds.css";
import "../styles/ui.css";
import "../styles/controls.css";

import "./App.css";

const TAB_THEMES = "themes";
const TAB_SKIPPED_LAYERS = "skipped-layers";

const App: FC = () => {
  const [selectedLayersLength, setSelectLayersLength] = useState(0);
  const [activeTab, setActiveTab] = useState(TAB_THEMES);
  const [skippedLayers, setSkippedLayers] = useState<ReadonlyArray<SceneNode>>(
    []
  );

  useEffect(() => {
    parent.postMessage(
      { pluginMessage: { type: FIGMA_MSG_PLUGIN_INITIALIZED, message: "" } },
      "*"
    );

    window.onmessage = event => {
      console.log({ event });

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

  const handleThemesTabClick = () => {
    setActiveTab(TAB_THEMES);
  };

  const handleLayersTabClick = () => {
    setActiveTab(TAB_SKIPPED_LAYERS);
  };

  return (
    <div className="wrapper">
      {!selectedLayersLength && <PlaceholderEmptyView />}

      {!!selectedLayersLength && (
        <>
          <Nav>
            <NavItem
              onClick={handleThemesTabClick}
              active={activeTab === TAB_THEMES}
            >
              Themes
            </NavItem>

            <NavItem
              onClick={handleLayersTabClick}
              active={activeTab === TAB_SKIPPED_LAYERS}
            >
              Skipped Layers{" "}
              {!!skippedLayers.length && (
                <span className="layer-count">({skippedLayers.length})</span>
              )}
            </NavItem>
          </Nav>

          {activeTab === TAB_THEMES && (
            <ThemeSwitcherView selectedLayersLength={selectedLayersLength} />
          )}

          {activeTab === TAB_SKIPPED_LAYERS && (
            <SkippedLayersView skippedLayers={skippedLayers} />
          )}
        </>
      )}
    </div>
  );
};

export default App;
