import React, { FC, PropsWithChildren } from "react";

import "./Nav.css";

export const Nav: FC<PropsWithChildren<unknown>> = ({ children }) => (
  <nav className="nav">{children}</nav>
);
