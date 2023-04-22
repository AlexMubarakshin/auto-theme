import React, { FC } from "react";

export const PlaceholderEmpty: FC = () => (
  <div className="empty-state">
    <div className="empty-state__image">
      <img className="layer-icon" src={require("../assets/layers.svg")} />
    </div>
    <h3 className="type type--pos-large-medium">
      Select a layer to get started.
    </h3>
  </div>
);
