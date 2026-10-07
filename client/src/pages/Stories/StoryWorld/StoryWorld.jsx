import { useEffect, useState } from "react";
import {
    Plus,
    Globe2,
    Pencil,
    Trash2,
    X,
    ArrowLeft
} from "lucide-react";
import { useParams } from "react-router-dom";
import API_URL from "../../../api/api";
import "./StoryWorld.css";

function StoryWorld() {
    var { storyId } = useParams();

    var [items, setItems] = useState([]);
    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [selectedItem, setSelectedItem] = useState(null);

    var [showForm, setShowForm] = useState(false);
    var [editingItem, setEditingItem] = useState(null);

    var [showDeleteModal, setShowDeleteModal] = useState(false);
    var [deletingItem, setDeletingItem] = useState(null);

    var [name, setName] = useState("");
    var [type, setType] = useState("Location");
    var [description, setDescription] = useState("");
    var [details, setDetails] = useState("");
    var [formError, setFormError] = useState("");

    var token = localStorage.getItem("inkspireToken");

    useEffect(function () {
        loadWorld();
    }, [storyId]);

    async function loadWorld() {
        setLoading(true);
        setError("");

        try {
            var response = await fetch(
                API_URL + "/world/story/" + storyId,
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load world information."
                );
            }

            setItems(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function openCreateForm() {
        setEditingItem(null);
        setName("");
        setType("Location");
        setDescription("");
        setDetails("");
        setFormError("");
        setShowForm(true);
    }

    function openEditForm(item) {
        setEditingItem(item);
        setName(item.name || "");
        setType(item.type || "Other");
        setDescription(item.description || "");
        setDetails(item.details || "");
        setFormError("");
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingItem(null);
        setFormError("");
    }

    function openDetail(item) {
        setSelectedItem(item);
        setError("");
    }

    function closeDetail() {
        setSelectedItem(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");

        if (!name.trim()) {
            setFormError("Name is required.");
            return;
        }

        var url = editingItem
            ? API_URL + "/world/" + editingItem._id
            : API_URL + "/world";

        var method = editingItem ? "PUT" : "POST";

        try {
            var response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    storyId: storyId,
                    name: name.trim(),
                    type: type,
                    description: description,
                    details: details
                })
            });

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to save world information."
                );
            }

            if (editingItem) {
                setItems(function (currentItems) {
                    return currentItems.map(function (item) {
                        return item._id === data._id
                            ? data
                            : item;
                    });
                });

                setSelectedItem(data);
            } else {
                setItems(function (currentItems) {
                    return [data, ...currentItems];
                });

                setSelectedItem(data);
            }

            closeForm();
        } catch (error) {
            setFormError(error.message);
        }
    }

    function openDeleteModal(item) {
        setDeletingItem(item);
        setShowDeleteModal(true);
    }

    function closeDeleteModal() {
        setShowDeleteModal(false);
        setDeletingItem(null);
    }

    async function handleDelete() {
        if (!deletingItem) {
            return;
        }

        try {
            var response = await fetch(
                API_URL + "/world/" + deletingItem._id,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to delete world information."
                );
            }

            setItems(function (currentItems) {
                return currentItems.filter(function (item) {
                    return item._id !== deletingItem._id;
                });
            });

            if (
                selectedItem &&
                selectedItem._id === deletingItem._id
            ) {
                setSelectedItem(null);
            }

            closeDeleteModal();
        } catch (error) {
            setError(error.message);
            closeDeleteModal();
        }
    }

    if (loading) {
        return (
            <div className="world-page">
                <div className="world-status">
                    Loading world information...
                </div>
            </div>
        );
    }

    if (selectedItem) {
        return (
            <div className="world-page">
                <button
                    type="button"
                    className="world-back-button"
                    onClick={closeDetail}
                >
                    <ArrowLeft size={16} />
                    Back to World Builder
                </button>

                <div className="world-detail-header">
                    <div>
                        <p className="page-eyebrow">
                            {selectedItem.type}
                        </p>

                        <h1>
                            {selectedItem.name}
                        </h1>

                    </div>

                    <button
                        type="button"
                        className="edit-world-button"
                        onClick={function () {
                            openEditForm(selectedItem);
                        }}
                    >
                        <Pencil size={15} />
                        Edit World
                    </button>
                </div>

                {error && (
                    <div className="world-error">
                        {error}
                    </div>
                )}

                <div className="world-detail-section">
                    <div className="world-detail-heading">
                        <h2>
                            Description
                        </h2>
                    </div>

                    <div className="world-detail-content">
                        <p
                            className={
                                selectedItem.description
                                    ? ""
                                    : "empty-text"
                            }
                        >
                            {selectedItem.description ||
                                "No description has been added."}
                        </p>
                    </div>
                </div>

                <div className="world-detail-section">
                    <div className="world-detail-heading">
                        <h2>
                            Details
                        </h2>
                    </div>

                    <div className="world-detail-content">
                        <p
                            className={
                                selectedItem.details
                                    ? ""
                                    : "empty-text"
                            }
                        >
                            {selectedItem.details ||
                                "No additional details have been added."}
                        </p>
                    </div>
                </div>

                <div className="world-detail-footer">
                    <span>
                        World information
                    </span>

                    <button
                        type="button"
                        className="world-delete-button"
                        onClick={function () {
                            openDeleteModal(selectedItem);
                        }}
                    >
                        <Trash2 size={14} />
                        Delete World Item
                    </button>
                </div>

                {showForm && (
                    <WorldForm
                        editingItem={editingItem}
                        name={name}
                        setName={setName}
                        type={type}
                        setType={setType}
                        description={description}
                        setDescription={setDescription}
                        details={details}
                        setDetails={setDetails}
                        formError={formError}
                        handleSubmit={handleSubmit}
                        closeForm={closeForm}
                    />
                )}

                {showDeleteModal && deletingItem && (
                    <DeleteModal
                        deletingItem={deletingItem}
                        closeDeleteModal={closeDeleteModal}
                        handleDelete={handleDelete}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="world-page">
            <div className="world-header">
                <div>
                    <p className="page-eyebrow">
                        STORY WORLD
                    </p>

                    <h1>
                        World Builder
                    </h1>

                    <p className="world-description">
                        Build the places, regions, cultures, and
                        other details of your story world.
                    </p>
                </div>

                <button
                    className="new-world-button"
                    type="button"
                    onClick={openCreateForm}
                >
                    <Plus size={17} />
                    New World Item
                </button>
            </div>

            {error && (
                <div className="world-error">
                    {error}
                </div>
            )}

            {items.length === 0 ? (
                <div className="world-list">
                    <div className="world-empty">
                        <div className="world-empty-icon">
                            <Globe2 size={22} />
                        </div>

                        <div>
                            <strong>
                                No world information yet
                            </strong>

                            <p>
                                Start building the world of your
                                story.
                            </p>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="world-list">
                    <div className="world-list-header">
                        <span>
                            World Item
                        </span>

                        <span>
                            Type
                        </span>

                        <span>
                            Description
                        </span>
                    </div>

                    {items.map(function (item) {
                        return (
                            <button
                                className="world-row"
                                key={item._id}
                                type="button"
                                onClick={function () {
                                    openDetail(item);
                                }}
                            >
                                <span className="world-name-button">
                                    <span className="world-icon">
                                        <Globe2 size={17} />
                                    </span>

                                    <strong>
                                        {item.name}
                                    </strong>
                                </span>

                                <span className="world-type">
                                    {item.type}
                                </span>

                                <span className="world-preview">
                                    {item.description ||
                                        "No description"}
                                </span>
                            </button>
                        );
                    })}

                </div>
            )}

            {showForm && (
                <WorldForm
                    editingItem={editingItem}
                    name={name}
                    setName={setName}
                    type={type}
                    setType={setType}
                    description={description}
                    setDescription={setDescription}
                    details={details}
                    setDetails={setDetails}
                    formError={formError}
                    handleSubmit={handleSubmit}
                    closeForm={closeForm}
                />
            )}

            {showDeleteModal && deletingItem && (
                <DeleteModal
                    deletingItem={deletingItem}
                    closeDeleteModal={closeDeleteModal}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
}

function WorldForm({
    editingItem,
    name,
    setName,
    type,
    setType,
    description,
    setDescription,
    details,
    setDetails,
    formError,
    handleSubmit,
    closeForm
}) {
    return (
        <div className="world-modal-overlay">
            <div className="world-modal">
                <div className="world-modal-header">
                    <div>
                        <p className="modal-eyebrow">
                            {editingItem
                                ? "EDIT WORLD"
                                : "NEW WORLD ITEM"}
                        </p>

                        <h2>
                            {editingItem
                                ? "Edit World Item"
                                : "Create World Item"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={closeForm}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    className="world-form"
                    onSubmit={handleSubmit}
                >
                    {formError && (
                        <p className="form-error">
                            {formError}
                        </p>
                    )}

                    <div className="form-group">
                        <label>
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={function (event) {
                                setName(event.target.value);
                            }}
                            placeholder="e.g. Ravenwood"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Type
                        </label>

                        <select
                            value={type}
                            onChange={function (event) {
                                setType(event.target.value);
                            }}
                        >
                            <option value="Location">
                                Location
                            </option>

                            <option value="Region">
                                Region
                            </option>

                            <option value="Culture">
                                Culture
                            </option>

                            <option value="Environment">
                                Environment
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={function (event) {
                                setDescription(
                                    event.target.value
                                );
                            }}
                            placeholder="Short description"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>
                            Details
                        </label>

                        <textarea
                            value={details}
                            onChange={function (event) {
                                setDetails(
                                    event.target.value
                                );
                            }}
                            placeholder="Additional information"
                            rows="6"
                        ></textarea>
                    </div>

                    <div className="world-form-actions">
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
                        >
                            {editingItem
                                ? "Save Changes"
                                : "Create World Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteModal({
    deletingItem,
    closeDeleteModal,
    handleDelete
}) {
    return (
        <div className="world-modal-overlay">
            <div className="delete-modal">
                <div className="delete-modal-icon">
                    <Trash2 size={20} />
                </div>

                <h2>
                    Delete World Item?
                </h2>

                <p>
                    Are you sure you want to delete
                    <strong>
                        {" "}{deletingItem.name}
                    </strong>
                    ? This action cannot be undone.
                </p>

                <div className="delete-modal-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={closeDeleteModal}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="delete-confirm-button"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StoryWorld;
