import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API_URL from "../../../api/api";

function Register() {
    var navigate = useNavigate();

    var [name, setName] = useState("");
    var [username, setUsername] = useState("");
    var [email, setEmail] = useState("");
    var [password, setPassword] = useState("");
    var [confirmPassword, setConfirmPassword] = useState("");

    var [message, setMessage] = useState("");
    var [error, setError] = useState("");
    var [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            var response = await fetch(
                API_URL + "/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        username: username,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                setLoading(false);
                return;
            }

            setMessage("Account created successfully!");

            setTimeout(function () {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error("Register error:", error);

            setError(
                "Unable to connect to the server."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Create an Account</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={function (event) {
                            setName(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label>Username</label>

                    <input
                        type="text"
                        value={username}
                        onChange={function (event) {
                            setUsername(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={function (event) {
                            setEmail(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={function (event) {
                            setPassword(event.target.value);
                        }}
                        required
                    />
                </div>

                <div>
                    <label>Confirm Password</label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={function (event) {
                            setConfirmPassword(event.target.value);
                        }}
                        required
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                {message && (
                    <p>{message}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Register"}
                </button>

            </form>
        </div>
    );
}

export default Register;