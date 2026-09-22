import { useEffect, useState } from "react";

import API_URL from "../../api/api";

import "./Ideas.css";

function Ideas() {
    var [ideas, setIdeas] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    useEffect(function () {
        loadIdeas();
    }, []);

    async function loadIdeas() {
        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL + "/ideas",
                {
                    method: "GET",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Unable to load ideas."
                );

                setLoading(false);
                return;
            }

            setIdeas(data.ideas);

        } catch (error) {
            console.error("Load ideas error:", error);

            setError(
                "Unable to connect to the server."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ideas-page">

            <div className="ideas-header">

                <div>
                    <h1>Idea Vault</h1>

                    <p>
                        Save and manage story ideas.
                    </p>
                </div>

                <button className="primary-button">
                    + New Idea
                </button>

            </div>


            {loading && (
                <p>Loading ideas...</p>
            )}


            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}


            {!loading &&
                !error &&
                ideas.length === 0 && (

                    <div className="empty-state">

                        <h2>No ideas yet</h2>

                        <p>
                            Start by creating your first
                            story idea.
                        </p>

                    </div>
                )}


            {!loading &&
                !error &&
                ideas.length > 0 && (

                    <div className="ideas-list">

                        {ideas.map(function (idea) {

                            return (
                                <div
                                    className="idea-row"
                                    key={idea._id}
                                >

                                    <div className="idea-main">

                                        <h3>
                                            {idea.title}
                                        </h3>

                                        <p>
                                            {idea.description}
                                        </p>

                                    </div>

                                    <div className="idea-date">

                                        {new Date(
                                            idea.updatedAt
                                        ).toLocaleDateString()}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

        </div>
    );
}

export default Ideas;