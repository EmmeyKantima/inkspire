import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, MoreVertical, X } from "lucide-react";

import API_URL from "../../api/api";

import "./Stories.css";

function Stories() {
    var [stories, setStories] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [showForm, setShowForm] = useState(false);
    var [editingStory, setEditingStory] = useState(null);

    var [title, setTitle] = useState("");
    var [genre, setGenre] = useState("");
    var [synopsis, setSynopsis] = useState("");
    var [plot, setPlot] = useState("");

    var [saving, setSaving] = useState(false);

    var [openMenuId, setOpenMenuId] = useState(null);
    var [menuPosition, setMenuPosition] = useState(null);

    var [deleteStory, setDeleteStory] = useState(null);
    var [deleting, setDeleting] = useState(false);

    useEffect(function () {
        loadStories();
    }, []);

    useEffect(function () {
        function handleClickOutside() {
            setOpenMenuId(null);
            setMenuPosition(null);
        }

        if (openMenuId) {
            document.addEventListener(
                "click",
                handleClickOutside
            );
        }

        return function () {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };
    }, [openMenuId]);

    async function loadStories() {
        try {
            setLoading(true);
            setError("");

            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL + "/stories",
                {
                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Failed to load stories."
                );
                return;
            }

            setStories(data);
        } catch (error) {
            console.error(
                "Load stories error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    }

    function openCreateForm() {
        setEditingStory(null);
        setTitle("");
        setGenre("");
        setSynopsis("");
        setPlot("");
        setShowForm(true);
        setError("");
    }

    function openEditForm(story) {
        setEditingStory(story);
        setTitle(story.title || "");
        setGenre(story.genre || "");
        setSynopsis(story.synopsis || "");
        setPlot(story.plot || "");
        setShowForm(true);
        setOpenMenuId(null);
        setMenuPosition(null);
        setError("");
    }

    function closeForm() {
        setShowForm(false);
        setEditingStory(null);
        setTitle("");
        setGenre("");
        setSynopsis("");
        setPlot("");
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!title.trim()) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var url = editingStory
                ? API_URL +
                  "/stories/" +
                  editingStory._id
                : API_URL + "/stories";

            var method = editingStory
                ? "PUT"
                : "POST";

            var response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + token
                },
                body: JSON.stringify({
                    title: title,
                    genre: genre,
                    synopsis: synopsis,
                    plot: plot
                })
            });

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Failed to save story."
                );
                return;
            }

            if (editingStory) {
                setStories(
                    stories.map(function (story) {
                        if (
                            story._id ===
                            editingStory._id
                        ) {
                            return data;
                        }

                        return story;
                    })
                );
            } else {
                setStories(
                    [data].concat(stories)
                );
            }

            closeForm();
        } catch (error) {
            console.error(
                "Save story error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setSaving(false);
        }
    }

    function toggleMenu(event, storyId) {
        event.stopPropagation();

        if (openMenuId === storyId) {
            setOpenMenuId(null);
            setMenuPosition(null);
            return;
        }

        var button = event.currentTarget;
        var rect = button.getBoundingClientRect();

        setOpenMenuId(storyId);

        setMenuPosition({
            top: rect.bottom + 6,
            right:
                window.innerWidth -
                rect.right
        });
    }

    function openDeleteModal(story) {
        setDeleteStory(story);
        setOpenMenuId(null);
        setMenuPosition(null);
    }

    function closeDeleteModal() {
        setDeleteStory(null);
    }

    async function confirmDelete() {
        if (!deleteStory) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            var token = localStorage.getItem(
                "inkspireToken"
            );

            var response = await fetch(
                API_URL +
                    "/stories/" +
                    deleteStory._id,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Failed to delete story."
                );
                return;
            }

            setStories(
                stories.filter(function (story) {
                    return (
                        story._id !==
                        deleteStory._id
                    );
                })
            );

            closeDeleteModal();
        } catch (error) {
            console.error(
                "Delete story error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setDeleting(false);
        }
    }

    function formatUpdatedDate(date) {
        if (!date) {
            return "No date";
        }

        var updatedDate = new Date(date);

        return updatedDate.toLocaleDateString(
            "en-CA",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
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

                
                </div>

                <button
                    className="primary-button"
                    type="button"
                    onClick={openCreateForm}
                >
                    <Plus size={18} />
                    <span>New Story</span>
                </button>
            </div>

            {error && (
                <div className="stories-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="stories-status">
                    Loading stories...
                </div>
            ) : (
                <div className="stories-list">

                    {stories.length > 0 && (
                        <div className="stories-list-header">
                            <span>Story</span>
                            <span>Genre</span>
                            <span>Last Updated</span>
                        </div>
                    )}

                    {stories.length === 0 ? (
                        <div className="stories-empty">
                            <div className="stories-empty-icon">
                                <BookOpen size={22} />
                            </div>

                            <div>
                                <strong>
                                    No stories yet
                                </strong>

                                <p>
                                    Create your first story to
                                    start writing.
                                </p>
                            </div>
                        </div>
                    ) : (
                        stories.map(function (story) {
                            return (
                                <div
                                    className="story-row"
                                    key={story._id}
                                >
                                    <div className="story-main">

                                        <div className="story-icon">
                                            <BookOpen size={19} />
                                        </div>

                                        <div className="story-info">
                                            <h2>
                                                {story.title}
                                            </h2>

                                            <p>
                                                {story.synopsis ||
                                                    "No synopsis yet."}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="story-genre">
                                        {story.genre || "—"}
                                    </div>

                                    <div className="story-updated">
                                        {formatUpdatedDate(
                                            story.updatedAt
                                        )}
                                    </div>

                                    <div className="story-actions">

                                        <Link
                                            to={`/stories/${story._id}`}
                                            className="open-story-button"
                                        >
                                            Open Story
                                        </Link>

                                        <button
                                            className="story-menu-button"
                                            type="button"
                                            title="More options"
                                            onClick={function (
                                                event
                                            ) {
                                                toggleMenu(
                                                    event,
                                                    story._id
                                                );
                                            }}
                                        >
                                            <MoreVertical
                                                size={18}
                                            />
                                        </button>

                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>
            )}

            {openMenuId &&
                menuPosition && (
                    <div
                        className="story-menu"
                        style={{
                            top: menuPosition.top,
                            right: menuPosition.right
                        }}
                        onClick={function (
                            event
                        ) {
                            event.stopPropagation();
                        }}
                    >
                        {stories.map(
                            function (story) {
                                if (
                                    story._id !==
                                    openMenuId
                                ) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={story._id}
                                    >
                                        <button
                                            type="button"
                                            onClick={function () {
                                                openEditForm(
                                                    story
                                                );
                                            }}
                                        >
                                            Edit Story
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-menu-item"
                                            onClick={function () {
                                                openDeleteModal(
                                                    story
                                                );
                                            }}
                                        >
                                            Delete Story
                                        </button>
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

            {showForm && (
                <div className="story-modal-overlay">
                    <div className="story-modal">

                        <div className="story-modal-header">
                            <div>
                                <p className="modal-eyebrow">
                                    {editingStory
                                        ? "EDIT STORY"
                                        : "NEW STORY"}
                                </p>

                                <h2>
                                    {editingStory
                                        ? "Edit Story"
                                        : "Create a Story"}
                                </h2>
                            </div>

                            <button
                                className="modal-close-button"
                                type="button"
                                onClick={closeForm}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="story-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">
                                <label>
                                    Story Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={function (
                                        event
                                    ) {
                                        setTitle(
                                            event.target.value
                                        );
                                    }}
                                    placeholder="Enter your story title"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Genre
                                </label>

                                <input
                                    type="text"
                                    value={genre}
                                    onChange={function (
                                        event
                                    ) {
                                        setGenre(
                                            event.target.value
                                        );
                                    }}
                                    placeholder="e.g. Fantasy, Mystery, Romance"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Synopsis
                                </label>

                                <textarea
                                    value={synopsis}
                                    onChange={function (
                                        event
                                    ) {
                                        setSynopsis(
                                            event.target.value
                                        );
                                    }}
                                    placeholder="What is your story about?"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>
                                    Overall Plot
                                </label>

                                <textarea
                                    value={plot}
                                    onChange={function (
                                        event
                                    ) {
                                        setPlot(
                                            event.target.value
                                        );
                                    }}
                                    placeholder="Describe the main plot or story direction."
                                    rows="5"
                                ></textarea>
                            </div>

                            {error && (
                                <p className="form-error">
                                    {error}
                                </p>
                            )}

                            <div className="story-form-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingStory
                                        ? "Save Changes"
                                        : "Create Story"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {deleteStory && (
                <div className="story-modal-overlay">
                    <div className="delete-modal">

                        <h2>
                            Delete Story?
                        </h2>

                        <p>
                            Are you sure you want to
                            delete{" "}
                            <strong>
                                {deleteStory.title}
                            </strong>
                            ? This action cannot be
                            undone.
                        </p>

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    closeDeleteModal
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-button"
                                onClick={
                                    confirmDelete
                                }
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Story"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Stories;