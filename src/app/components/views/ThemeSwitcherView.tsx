import React, { FC, memo } from "react";
import {
  FIGMA_MSG_THEME_UPDATE_DARK_TO_LIGHT,
  FIGMA_MSG_THEME_UPDATE_LIGHT_TO_DARK,
  FIGMA_MSG_THEME_UPDATE_TYPE
} from "../../../common/constants";

import { Button } from "../elements/Button";

type Props = {
  selectedLayersLength: number;
};

export const ThemeSwitcherView: FC<Props> = memo(
  ({ selectedLayersLength }: Props) => {
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

    return (
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
    );
  }
);

ThemeSwitcherView.displayName = "ThemeSwitcherView";
