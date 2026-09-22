import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Lightbulb,
    BookOpen,
    Users,
    GitBranch,
    Clock3,
    ListTree,
    Globe,
    FileText,
    PenLine,
    ClipboardCheck,
    LogOut,
    ArrowLeft
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
    var location = useLocation();
    var { storyId } = useParams();
    var navigate = useNavigate();

    var isStoryPage = location.pathname.startsWith("/stories/") && storyId;

    function handleLogout() {
    var confirmed = window.confirm(
        "Are you sure you want to log out?"
    );

    if (confirmed) {
        localStorage.removeItem("inkspireToken");
        localStorage.removeItem("inkspireUser");

        navigate("/login");
    }
}

    /*
     * STORY MENU
     * This menu appears when the user is inside a specific story.
     */
    if (isStoryPage) {
        return (
            <aside className="sidebar">

                <div className="sidebar-brand">
                    <h1>Inkspire</h1>
                    <span>Writing Assistant</span>
                </div>

                <nav className="sidebar-navigation">

                    <p className="menu-label">
                        Story
                    </p>

                    <NavLink
                        to="/stories"
                        className="sidebar-back-link"
                    >
                        <ArrowLeft size={17} />
                        <span>Back to My Stories</span>
                    </NavLink>

                    <p className="menu-label story-label">
                        Current Story
                    </p>

                    <NavLink
                        to={`/stories/${storyId}`}
                        end
                        className="sidebar-link"
                    >
                        <BookOpen size={18} />
                        <span>Overview</span>
                    </NavLink>

                    <NavLink
                        to={`/stories/${storyId}/characters`}
                        className="sidebar-link"
                    >
                        <Users size={18} />
                        <span>Characters</span>
                    </NavLink>

                    {/* <NavLink
                        to={`/stories/${storyId}/relationships`}
                        className="sidebar-link"
                    >
                        <GitBranch size={18} />
                        <span>Relationships</span>
                    </NavLink> */}

                    {/* <NavLink
                        to={`/stories/${storyId}/timeline`}
                        className="sidebar-link"
                    >
                        <Clock3 size={18} />
                        <span>Timeline</span>
                    </NavLink> */}

                    <NavLink
                        to={`/stories/${storyId}/builder`}
                        className="sidebar-link"
                    >
                        <ListTree size={18} />
                        <span>Story Builder</span>
                    </NavLink>

                    <NavLink
                        to={`/stories/${storyId}/world`}
                        className="sidebar-link"
                    >
                        <Globe size={18} />
                        <span>World Builder</span>
                    </NavLink>

                    {/* <NavLink
                        to={`/stories/${storyId}/research`}
                        className="sidebar-link"
                    >
                        <FileText size={18} />
                        <span>Research & Notes</span>
                    </NavLink> */}

                    <NavLink
                        to={`/stories/${storyId}/writing`}
                        className="sidebar-link"
                    >
                        <PenLine size={18} />
                        <span>Writing</span>
                    </NavLink>

                    <NavLink
                        to={`/stories/${storyId}/check`}
                        className="sidebar-link"
                    >
                        <ClipboardCheck size={18} />
                        <span>Story Check</span>
                    </NavLink>

                </nav>

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-link logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>

                </div>

            </aside>
        );
    }

    /*
    MAIN WORKSPACE MENU
    This menu is used for Dashboard, Idea Vault, and My Stories. 
    Dashboard stays visible on every main workspace page.
     */
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <h1>Inkspire</h1>
                <span>Writing Assistant</span>
            </div>

            <nav className="sidebar-navigation">

                <p className="menu-label">
                    Workspace
                </p>

                <NavLink
                    to="/dashboard"
                    end
                    className="sidebar-link"
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/ideas"
                    className="sidebar-link"
                >
                    <Lightbulb size={18} />
                    <span>Idea Vault</span>
                </NavLink>

                <NavLink
                    to="/stories"
                    className="sidebar-link"
                >
                    <BookOpen size={18} />
                    <span>My Stories</span>
                </NavLink>

            </nav>

            <div className="sidebar-bottom">

                <button
                    className="sidebar-link logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Log out</span>
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;