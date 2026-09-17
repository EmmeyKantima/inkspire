import { Link } from "react-router-dom";

function Navbar() {
    return (
        <header>
            <nav>
                <Link to="/dashboard">Inkspire</Link>

                <div>
                    <Link to="/ideas">Idea Vault</Link>
                    <Link to="/stories">My Stories</Link>
                    <Link to="/login">Log In</Link>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;