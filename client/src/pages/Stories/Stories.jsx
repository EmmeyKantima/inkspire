import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, MoreVertical } from "lucide-react";

import "./Stories.css";

function Stories() {
    var [stories, setStories] = useState([
        {
            id: 1,
            title: "The Forgotten Garden",
            genre: "Fantasy",
            synopsis:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore quod est consequuntur provident odit quas fugiat. Praesentium porro sit dolorum",
            updated: "Updated today"
        },
        {
            id: 2,
            title: "Echoes of Yesterday",
            genre: "Mystery",
            synopsis:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae ex officia neque animi in, modi amet architecto vero minus magni?",
            updated: "Updated yesterday"
        }
    ]);

    function handleDelete(storyId) {
        var confirmed = window.confirm(
            "Are you sure you want to delete this story?"
        );

        if (!confirmed) {
            return;
        }

        setStories(
            stories.filter(function (story) {
                return story.id !== storyId;
            })
        );
    }

    return (
        <div className="stories-page">

            <div className="stories-header">
                <div>
                    <p className="page-eyebrow">
                        YOUR WRITING SPACE
                    </p>

                    <h1>My Stories</h1>

                    <p className="page-description">
                        Organize your stories and develop each project
                        from idea to finished draft.
                    </p>
                </div>

                <button className="primary-button">
                    <Plus size={18} />
                    <span>New Story</span>
                </button>
            </div>

            <div className="stories-list">
                

                <div className="stories-list-header">
                    <span>Story</span>
                    <span>Genre</span>
                    <span>Last Updated</span>
                    <span>Action</span>
                </div>


                {stories.map(function (story) {
                    return (
                        <div
                            className="story-row"
                            key={story.id}
                        >

                            <div className="story-main">

                                <div className="story-icon">
                                    <BookOpen size={19} />
                                </div>

                                <div className="story-info">
                                    <h2>{story.title}</h2>

                                    <p>
                                        {story.synopsis}
                                    </p>
                                </div>

                            </div>

                            <div className="story-genre">
                                {story.genre}
                            </div>

                            <div className="story-updated">
                                {story.updated}
                            </div>

                            <div className="story-actions">

                                <Link
                                    to={`/stories/${story.id}/characters`}
                                    className="open-story-button"
                                >
                                    Open Story
                                </Link>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default Stories;