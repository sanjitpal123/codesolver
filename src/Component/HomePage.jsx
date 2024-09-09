import React from "react";
import SideBar from "./SideBar";
import Chat from "./Chat";
import Navbar from "./Navbar";

function HomePage() {
  return (
    <div className="md:flex">
      <Navbar />
      <SideBar />
      <Chat />
    </div>
  );
}

export default HomePage;
