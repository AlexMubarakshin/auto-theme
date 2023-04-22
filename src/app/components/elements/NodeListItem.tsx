import React, { FC, memo } from "react";
import classNames from "classnames";

import "./NodeListItem.css";

type Props = {
  active?: boolean;
  onClick: (nodeId: SceneNode["id"]) => void;
} & Pick<SceneNode, "id" | "type" | "name">;

export const NodeListItem: FC<Props> = memo(
  ({ active, id, type, name, onClick }: Props) => {
    const handleClick = () => {
      onClick(id);
    };

    return (
      <li
        id={id}
        className={classNames("list-item", {
          "list-item--active": active,
          "list-item--selected": active
        })}
        onClick={handleClick}
      >
        <div className="list-flex-row">
          <span className="list-arrow" />

          <span className="list-icon">
            <img
              src={require("../../../../assets/" + type.toLowerCase() + ".svg")}
            />
          </span>

          <span className="list-name type type--pos-small-normal">{name}</span>
        </div>
      </li>
    );
  }
);

NodeListItem.displayName = "ListItem";
