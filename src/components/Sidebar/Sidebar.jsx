import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside>
            <h2>My Story</h2>

            <nav>
                <Link to="/stories/1">Overview</Link>
                <Link to="/stories/1/characters">Characters</Link>
                <Link to="/stories/1/timeline">Timeline</Link>
                <Link to="/stories/1/builder">Story Builder</Link>
                <Link to="/stories/1/world">World Builder</Link>
                <Link to="/stories/1/research">Research & Notes</Link>
                <Link to="/stories/1/writing">Writing</Link>
                <Link to="/stories/1/check">Story Check</Link>
            </nav>
        </aside>
    );
}

export default Sidebar;