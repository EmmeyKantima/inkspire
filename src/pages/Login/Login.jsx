function Login() {
    return (
        <div>
            <h1>Login</h1>
            <p>Welcome back to Inkspire.</p>

            <form>
                <div>
                    <label>Email</label>
                    <input type="email" />
                </div>

                <div>
                    <label>Password</label>
                    <input type="password" />
                </div>

                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export default Login;