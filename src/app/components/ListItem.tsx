import React, { FC } from "react";
import classNames from "classnames";

type Props = {
  active?: boolean;
  node: SceneNode;
  onClick: (nodeId: SceneNode["id"]) => void;
};

export const ListItem: FC<Props> = ({ active, node, onClick }) => {
  const handleClick = () => {
    onClick(node.id);
  };

  return (
    <li
      id={node.id}
      className={classNames("list-item", {
        "list-item--active": active,
        "list-item--selected": active
      })}
      onClick={handleClick}
    >
      <div className="list-flex-row">
        <span className="list-arrow" />

        <span className="list-icon">
          <img src={require("../assets/" + node.type.toLowerCase() + ".svg")} />
        </span>

        <span className="list-name type type--pos-small-normal">
          {node.name}
        </span>
      </div>
    </li>
  );
};
