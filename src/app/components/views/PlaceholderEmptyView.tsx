import React, { FC } from "react";

import "./PlaceholderEmptyView.css";

import LayersImage from "../../assets/layers.svg";

export const PlaceholderEmptyView: FC = () => (
  <div className="empty-state">
    <div className="empty-state__image">
      <img className="layer-icon" src={LayersImage} />
    </div>
    <h3 className="type type--pos-large-medium">
      Select a layer to get started.
    </h3>
  </div>
);
