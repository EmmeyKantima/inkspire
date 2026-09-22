import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    var token = localStorage.getItem("inkspireToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;