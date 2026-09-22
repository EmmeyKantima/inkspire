import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import TopBar from "../Topbar/Topbar";

import "./MainLayout.css";

function MainLayout() {
    return (
        <div className="main-layout">

            <Sidebar />

            <div className="main-area">

                <TopBar />

                <main className="main-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default MainLayout;