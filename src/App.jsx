import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import IdeaVault from "./pages/IdeaVault/IdeaVault";
import MyStories from "./pages/MyStories/MyStories";
import StoryWorkspace from "./pages/StoryWorkspace/StoryWorkspace";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <main>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ideas" element={<IdeaVault />} />
                    <Route path="/stories" element={<MyStories />} />
                    <Route path="/stories/1" element={<StoryWorkspace />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;