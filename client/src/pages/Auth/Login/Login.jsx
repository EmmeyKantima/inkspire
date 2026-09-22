import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../../api/api";

function Login() {
    var navigate = useNavigate();

    var [login, setLogin] = useState("");
    var [password, setPassword] = useState("");

    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            var response = await fetch(
                API_URL + "/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Login failed."
                );

                setLoading(false);
                return;
            }

            localStorage.setItem(
                "inkspireToken",
                data.token
            );

            localStorage.setItem(
                "inkspireUser",
                JSON.stringify(data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Login to Inkspire</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>
                        Email or Username
                    </label>

                    <input
                        type="text"
                        value={login}
                        onChange={function (event) {
                            setLogin(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={function (event) {
                            setPassword(event.target.value);
                        }}
                        required
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

            </form>
        </div>
    );
}

export default Login;