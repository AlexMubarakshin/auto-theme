import React, { FC, PropsWithChildren } from "react";

import classNames from "classnames";

import "./NavItem.css";

type Props = {
  onClick: () => void;
  active: boolean;
};

export const NavItem: FC<PropsWithChildren<Props>> = ({
  children,
  active,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={classNames("nav-item", "section-title", {
        "nav-item--active": active
      })}
    >
      {children}
    </div>
  );
};
