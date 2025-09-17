import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSideBar";

function MainLayout() {
  return (
    <div>
      <LeftSidebar />
      <Outlet />
    </div>
  );
}

export default MainLayout;
