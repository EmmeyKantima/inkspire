import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Move,
    Trash2,
    ChevronDown,
    ChevronRight,
    Layers3,
    BookOpen,
    MapPin,
    FileText,
    X
} from "lucide-react";
import API_URL from "../../../api/api";
import "./StoryBuilder.css";

function StoryBuilder() {
    var { storyId } = useParams();

    var [acts, setActs] = useState([]);
    var [chapters, setChapters] = useState([]);
    var [events, setEvents] = useState([]);
    var [scenes, setScenes] = useState([]);

    var [loading, setLoading] = useState(true);
    var [error, setError] = useState("");

    var [expandedActs, setExpandedActs] = useState({});
    var [expandedChapters, setExpandedChapters] = useState({});
    var [expandedEvents, setExpandedEvents] = useState({});

    var [modalType, setModalType] = useState("");
    var [editingItem, setEditingItem] = useState(null);
    var [parentItem, setParentItem] = useState(null);

    var [formTitle, setFormTitle] = useState("");
    var [formDescription, setFormDescription] = useState("");
    var [formError, setFormError] = useState("");

    var [deleteItem, setDeleteItem] = useState(null);
    var [deleteType, setDeleteType] = useState("");
    var [moveItem, setMoveItem] = useState(null);
    var [moveType, setMoveType] = useState("");
    var [moveActId, setMoveActId] = useState("");
    var [moveChapterId, setMoveChapterId] = useState("");
    var [moveEventId, setMoveEventId] = useState("");
    var [moveError, setMoveError] = useState("");
    var [moving, setMoving] = useState(false);

    var token = localStorage.getItem("inkspireToken");

    useEffect(function () {
        loadStoryBuilder();
    }, [storyId]);

    async function loadStoryBuilder() {
        try {
            setLoading(true);
            setError("");

            var headers = {
                Authorization: "Bearer " + token
            };

            var actResponse = await fetch(
                API_URL + "/acts/story/" + storyId,
                {
                    headers: headers
                }
            );

            var actData = await actResponse.json();

            if (!actResponse.ok) {
                 throw new Error(
                    actData.message || "Unable to load acts."
                );
            }

            setActs(actData);

            setExpandedActs(
                actData.reduce(function (expanded, act) {
                    expanded[act._id] = true;
                    return expanded;
                }, {})
            );

            var allChapters = [];

            if (actData.length > 0) {
                var chapterRequests = actData.map(function (act) {
                    return fetch(
                        API_URL + "/chapters/act/" + act._id,
                        {
                            headers: headers
                        }
                    ).then(function (response) {
                        return response.json();
                    });
                });

                var chapterResults = await Promise.all(
                    chapterRequests
                );

                chapterResults.forEach(function (items) {
                    allChapters = allChapters.concat(items);
                });
            }

            setChapters(allChapters);

            setExpandedChapters(
                allChapters.reduce(function (expanded, chapter) {
                    expanded[chapter._id] = true;
                    return expanded;
                }, {})
            );

            var allEvents = [];
            var allScenes = [];

            if (allChapters.length > 0) {
                var eventRequests = allChapters.map(function (chapter) {
                    return fetch(
                        API_URL + "/events/chapter/" + chapter._id,
                        {
                            headers: headers
                        }
                    ).then(function (response) {
                        return response.json();
                    });
                });

                var eventResults = await Promise.all(
                    eventRequests
                );

                eventResults.forEach(function (items) {
                    allEvents = allEvents.concat(items);
                });
            }

            setEvents(allEvents);

            setExpandedEvents(
                allEvents.reduce(function (expanded, event) {
                    expanded[event._id] = true;
                    return expanded;
                }, {})
            );

            if (allEvents.length > 0) {
                var sceneRequests = allEvents.map(function (event) {
                    return fetch(
                        API_URL + "/scenes/event/" + event._id,
                        {
                            headers: headers
                        }
                    ).then(function (response) {
                        return response.json();
                    });
                });

                var sceneResults = await Promise.all(
                    sceneRequests
                );

                sceneResults.forEach(function (items) {
                    allScenes = allScenes.concat(items);
                });
            }

            setScenes(allScenes);
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function toggleAct(actId) {
        setExpandedActs(function (current) {
            return {
                ...current,
                [actId]: !current[actId]
            };
        });
    }

    function toggleChapter(chapterId) {
        setExpandedChapters(function (current) {
            return {
                ...current,
                [chapterId]: !current[chapterId]
            };
        });
    }

    function toggleEvent(eventId) {
        setExpandedEvents(function (current) {
            return {
                ...current,
                [eventId]: !current[eventId]
            };
        });
    }

    function openCreateModal(type, parent) {
        setModalType(type);
        setEditingItem(null);
        setParentItem(parent || null);
        setFormTitle("");
        setFormDescription("");
        setFormError("");
    }

    function openEditModal(type, item) {
        setModalType(type);
        setEditingItem(item);
        setParentItem(null);
        setFormTitle(item.title || "");
        setFormDescription(item.description || "");
        setFormError("");
    }

    function closeModal() {
        setModalType("");
        setEditingItem(null);
        setParentItem(null);
        setFormTitle("");
        setFormDescription("");
        setFormError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formTitle.trim()) {
            setFormError("Please enter a title.");
            return;
        }

        try {
            var url = "";
            var method = editingItem ? "PUT" : "POST";
            var body = {};

            // EDIT
            if (editingItem) {
                if (modalType === "act") {
                    url = API_URL + "/acts/" + editingItem._id;
                    body = {
                        title: formTitle.trim()
                    };
                }

                if (modalType === "chapter") {
                    url = API_URL + "/chapters/" + editingItem._id;
                    body = {
                        title: formTitle.trim()
                    };
                }

                if (modalType === "event") {
                    url = API_URL + "/events/" + editingItem._id;
                    body = {
                        title: formTitle.trim(),
                        description: formDescription.trim()
                    };
                }

                if (modalType === "scene") {
                    url = API_URL + "/scenes/" + editingItem._id;
                    body = {
                        title: formTitle.trim(),
                        description: formDescription.trim()
                    };
                }
            }

            // CREATE
            else {
                if (modalType === "act") {
                    url = API_URL + "/acts";
                    body = {
                        storyId: storyId,
                        title: formTitle.trim()
                    };
                }

                if (modalType === "chapter") {
                    url = API_URL + "/chapters";
                    body = {
                        storyId: storyId,
                        actId: parentItem._id,
                        title: formTitle.trim()
                    };
                }

                if (modalType === "event") {
                    url = API_URL + "/events";
                    body = {
                        storyId: storyId,
                        chapterId: parentItem._id,
                        title: formTitle.trim(),
                        description: formDescription.trim()
                    };
                }

                if (modalType === "scene") {
                    url = API_URL + "/scenes";
                    body = {
                        storyId: storyId,
                        chapterId: parentItem.chapterId,
                        eventId: parentItem._id,
                        title: formTitle.trim(),
                        description: formDescription.trim()
                    };
                }
            }

            var response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            var data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save item.");
            }

            closeModal();
            await loadStoryBuilder();
        } catch (error) {
            setFormError(error.message);
        }
    }

    function openDeleteModal(type, item) {
        setDeleteType(type);
        setDeleteItem(item);
    }

    function closeDeleteModal() {
        setDeleteType("");
        setDeleteItem(null);
    }

    function openMoveModal(type, item) {
        setMoveType(type);
        setMoveItem(item);
        setMoveError("");

        if (type === "chapter") {
            setMoveActId(item.actId || "");
        }

        if (type === "event") {
            setMoveChapterId(item.chapterId || "");
        }

        if (type === "scene") {
            setMoveChapterId(item.chapterId || "");
            setMoveEventId(item.eventId || "");
        }
    }

    async function handleMove() {
        if (!moveItem) {
            return;
        }

        try {
            setMoving(true);
            setMoveError("");

            var url = "";
            var body = {};

            if (moveType === "chapter") {
                if (!moveActId) {
                    setMoveError("Please select an Act.");
                    setMoving(false);
                    return;
                }

                url = API_URL + "/chapters/" + moveItem._id;

                body = {
                    title: moveItem.title,
                    actId: moveActId
                };
            }

            if (moveType === "event") {
                if (!moveChapterId) {
                    setMoveError("Please select a Chapter.");
                    setMoving(false);
                    return;
                }

                url = API_URL + "/events/" + moveItem._id;

                body = {
                    title: moveItem.title,
                    description: moveItem.description || "",
                    chapterId: moveChapterId
                };
            }

            if (moveType === "scene") {
                if (!moveChapterId || !moveEventId) {
                    setMoveError("Please select a Chapter and Event.");
                    setMoving(false);
                    return;
                }

                url = API_URL + "/scenes/" + moveItem._id;

                body = {
                    title: moveItem.title,
                    description: moveItem.description || "",
                    chapterId: moveChapterId,
                    eventId: moveEventId
                };
            }

            var response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)
            });

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to move item."
                );
            }

            closeMoveModal();
            await loadStoryBuilder();
        } catch (error) {
            setMoveError(error.message);
            setMoving(false);
        }
    }

    function closeMoveModal() {
        setMoveType("");
        setMoveItem(null);
        setMoveActId("");
        setMoveChapterId("");
        setMoveEventId("");
        setMoveError("");
        setMoving(false);
    }

    async function handleDelete() {
        if (!deleteItem) {
            return;
        }

        try {
            var endpoint = "";

            if (deleteType === "act") {
                endpoint = "/acts/";
            }

            if (deleteType === "chapter") {
                endpoint = "/chapters/";
            }

            if (deleteType === "event") {
                endpoint = "/events/";
            }

            if (deleteType === "scene") {
                endpoint = "/scenes/";
            }

            var response = await fetch(
                API_URL + endpoint + deleteItem._id,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete item.");
            }

            closeDeleteModal();
            await loadStoryBuilder();
        } catch (error) {
            setError(error.message);
        }
    }

    function getModalTitle() {
        if (modalType === "act") {
            return editingItem ? "Edit Act" : "New Act";
        }

        if (modalType === "chapter") {
            return editingItem ? "Edit Chapter" : "New Chapter";
        }

        if (modalType === "event") {
            return editingItem ? "Edit Event" : "New Event";
        }

        return editingItem ? "Edit Scene" : "New Scene";
    }

    function getDeleteTitle() {
        if (deleteType === "act") {
            return "Delete Act?";
        }

        if (deleteType === "chapter") {
            return "Delete Chapter?";
        }

        if (deleteType === "event") {
            return "Delete Event?";
        }

        return "Delete Scene?";
    }

    function getDeleteMessage() {
        if (deleteType === "act") {
            return "Deleting this Act may also affect the Chapters inside it.";
        }

        if (deleteType === "chapter") {
            return "Deleting this Chapter may also affect the Events and Scenes inside it.";
        }

        if (deleteType === "event") {
            return "Deleting this Event may also affect the Scenes inside it.";
        }

        return "This Scene will be permanently removed from your Story Builder.";
    }

    function getItemIcon(type) {
        if (type === "act") {
            return <Layers3 size={18} />;
        }

        if (type === "chapter") {
            return <BookOpen size={18} />;
        }

        if (type === "event") {
            return <MapPin size={17} />;
        }

        return <FileText size={17} />;
    }

    function renderScenes(event) {
        var eventScenes = scenes.filter(function (scene) {
            return scene.eventId === event._id;
        });

        return (
            <div className="builder-scenes">
                {eventScenes.map(function (scene, index) {
                    return (
                        <div className="builder-scene" key={scene._id}>
                            <div className="builder-tree-line"></div>

                            <div className="builder-item-icon scene-icon">
                                {getItemIcon("scene")}
                            </div>

                            <div className="builder-item-content">
                                <span className="builder-number">
                                    Scene {index + 1}
                                </span>
                                <span className="builder-item-title">
                                    {scene.title}
                                </span>
                            </div>

                            <div className="builder-actions">

                                <button
                                    onClick={function () {
                                        openMoveModal("scene", scene);
                                    }}
                                    title="Move Scene"
                                >
                                    <Move size={15} />
                                </button>

                                <button
                                    onClick={function () {
                                        openEditModal("scene", scene);
                                    }}
                                    title="Edit Scene"
                                >
                                    <Pencil size={15} />
                                </button>

                                <button
                                    onClick={function () {
                                        openDeleteModal("scene", scene);
                                    }}
                                    title="Delete Scene"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                <button
                    className="add-child-button scene-add-button"
                    onClick={function () {
                        openCreateModal("scene", event);
                    }}
                >
                    <Plus size={15} />
                    Add Scene
                </button>
            </div>
        );
    }

    function renderEvents(chapter) {
        var chapterEvents = events.filter(function (item) {
            return item.chapterId === chapter._id;
        });

        return (
            <div className="builder-events">
                {chapterEvents.map(function (event) {
                    var isExpanded = expandedEvents[event._id];

                    return (
                        <div className="builder-event-group" key={event._id}>
                            <div className="builder-event-row">
                                <button
                                    className="tree-toggle"
                                    onClick={function () {
                                        toggleEvent(event._id);
                                    }}
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>

                                <div className="builder-item-icon event-icon">
                                    {getItemIcon("event")}
                                </div>

                                <div className="builder-item-content">
                                    <span className="builder-label">
                                        Event
                                    </span>
                                    <span className="builder-item-title">
                                        {event.title}
                                    </span>
                                </div>

                                <div className="builder-actions">
                                    
                                    <button
                                        onClick={function () {
                                            openMoveModal("event", event);
                                        }}
                                        title="Move Event"
                                    >
                                        <Move size={15} />
                                    </button>
                                    
                                    <button
                                        onClick={function () {
                                            openEditModal("event", event);
                                        }}
                                        title="Edit Event"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        onClick={function () {
                                            openDeleteModal("event", event);
                                        }}
                                        title="Delete Event"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && renderScenes(event)}
                        </div>
                    );
                })}

                <button
                    className="add-child-button"
                    onClick={function () {
                        openCreateModal("event", chapter);
                    }}
                >
                    <Plus size={15} />
                    Add Event
                </button>
            </div>
        );
    }

    function renderChapters(act) {
        var actChapters = chapters.filter(function (chapter) {
            return chapter.actId === act._id;
        });

        return (
            <div className="builder-chapters">
                {actChapters.map(function (chapter) {
                    var isExpanded = expandedChapters[chapter._id];

                    return (
                        <div className="builder-chapter-group" key={chapter._id}>
                            <div className="builder-chapter-row">
                                <button
                                    className="tree-toggle"
                                    onClick={function () {
                                        toggleChapter(chapter._id);
                                    }}
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>

                                <div className="builder-item-icon chapter-icon">
                                    {getItemIcon("chapter")}
                                </div>

                                <div className="builder-item-content">
                                    <span className="builder-label">
                                        Chapter
                                    </span>
                                    <span className="builder-item-title">
                                        {chapter.title}
                                    </span>
                                </div>

                                <div className="builder-actions">
                                    
                                    <button
                                        onClick={function () {
                                            openMoveModal("chapter", chapter);
                                        }}
                                        title="Move Chapter"
                                    >
                                        <Move size={15} />
                                    </button>

                                    <button
                                        onClick={function () {
                                            openEditModal("chapter", chapter);
                                        }}
                                        title="Edit Chapter"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        onClick={function () {
                                            openDeleteModal("chapter", chapter);
                                        }}
                                        title="Delete Chapter"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && renderEvents(chapter)}
                        </div>
                    );
                })}

                <button
                    className="add-child-button"
                    onClick={function () {
                        openCreateModal("chapter", act);
                    }}
                >
                    <Plus size={15} />
                    Add Chapter
                </button>
            </div>
        );
    }

    function renderActs() {
        return (
            <div className="builder-list">
                {acts.map(function (act) {
                    var isExpanded = expandedActs[act._id];

                    return (
                        <div className="builder-act-group" key={act._id}>
                            <div className="builder-act-row">
                                <button
                                    className="tree-toggle"
                                    onClick={function () {
                                        toggleAct(act._id);
                                    }}
                                >
                                    {isExpanded ? (
                                        <ChevronDown size={17} />
                                    ) : (
                                        <ChevronRight size={17} />
                                    )}
                                </button>

                                <div className="builder-item-icon act-icon">
                                    {getItemIcon("act")}
                                </div>

                                <div className="builder-item-content">
                                    <span className="builder-label">
                                        Act
                                    </span>
                                    <span className="builder-item-title">
                                        {act.title}
                                    </span>
                                </div>

                                <div className="builder-actions">
                                    <button
                                        onClick={function () {
                                            openEditModal("act", act);
                                        }}
                                        title="Edit Act"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        onClick={function () {
                                            openDeleteModal("act", act);
                                        }}
                                        title="Delete Act"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && renderChapters(act)}
                        </div>
                    );
                })}

            </div>
        );
    }

    if (loading) {
        return (
            <div className="builder-page">
                <p className="builder-status">Loading Story Builder...</p>
            </div>
        );
    }

    return (
        <div className="builder-page">
            <div className="builder-header">
                <div>
                    <p className="page-eyebrow">STORY PLANNING</p>
                    <h1>Story Builder</h1>
                    <p className="builder-description">
                        Organize your story into Acts, Chapters, Events, and Scenes.
                    </p>
                </div>

                <button
                    className="new-act-button"
                    onClick={function () {
                        openCreateModal("act");
                    }}
                >
                    <Plus size={18} />
                    New Act
                </button>
            </div>

            {error && (
                <div className="builder-error">
                    {error}
                </div>
            )}

            {acts.length === 0 ? (
                <div className="builder-empty">
                    <div className="builder-empty-icon">
                        <Layers3 size={25} />
                    </div>

                    <h2>Start building your story</h2>

                    <p>
                        Create your first Act, then add Chapters, Events, and Scenes.
                    </p>

                    <button
                        className="new-act-button"
                        onClick={function () {
                            openCreateModal("act");
                        }}
                    >
                        <Plus size={18} />
                        Create First Act
                    </button>
                </div>
            ) : (
                renderActs()
            )}

            {modalType && (
                <div className="builder-modal-overlay">
                    <div className="builder-modal">
                        <div className="builder-modal-header">
                            <div>
                                <p className="modal-eyebrow">
                                    STORY BUILDER
                                </p>
                                <h2>{getModalTitle()}</h2>
                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="builder-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-group">
                                <label>
                                    {modalType === "event" || modalType === "scene"
                                        ? "Title"
                                        : modalType === "act"
                                            ? "Act Title"
                                            : "Chapter Title"}
                                </label>

                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={function (event) {
                                        setFormTitle(event.target.value);
                                    }}
                                    placeholder={
                                        modalType === "act"
                                            ? "e.g. Act I"
                                            : modalType === "chapter"
                                                ? "e.g. Chapter 1"
                                                : modalType === "event"
                                                    ? "e.g. At Home"
                                                    : "e.g. Emma finds the letter"
                                    }
                                    autoFocus
                                />
                            </div>

                            {(modalType === "event" || modalType === "scene") && (
                                <div className="form-group">
                                    <label>Description</label>

                                    <textarea
                                        value={formDescription}
                                        onChange={function (event) {
                                            setFormDescription(event.target.value);
                                        }}
                                        placeholder="Add a short description..."
                                        rows="4"
                                    ></textarea>
                                </div>
                            )}

                            {formError && (
                                <p className="form-error">
                                    {formError}
                                </p>
                            )}

                            <div className="builder-form-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                >
                                    {editingItem ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteItem && (
                <div className="builder-modal-overlay">
                    <div className="delete-modal">
                        <div className="delete-modal-icon">
                            <Trash2 size={22} />
                        </div>

                        <h2>{getDeleteTitle()}</h2>

                        <p>
                            {getDeleteMessage()}
                        </p>

                        <strong>
                            {deleteItem.title}
                        </strong>

                        <div className="delete-modal-actions">
                            <button
                                className="secondary-button"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>

                            <button
                                className="delete-confirm-button"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {moveItem && (
                <div className="builder-modal-overlay">
                    <div className="builder-modal move-modal">
                        <div className="builder-modal-header">
                            <div>
                                <p className="modal-eyebrow">
                                    STORY BUILDER
                                </p>
                                <h2>
                                    Move {moveType.charAt(0).toUpperCase() + moveType.slice(1)}
                                </h2>
                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeMoveModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="move-form">
                            <div className="move-item-name">
                                <span>Moving</span>
                                <strong>{moveItem.title}</strong>
                            </div>

                            {moveType === "chapter" && (
                                <div className="form-group">
                                    <label>Move to Act</label>

                                    <select
                                        value={moveActId}
                                        onChange={function (event) {
                                            setMoveActId(event.target.value);
                                        }}
                                    >
                                        <option value="">
                                            Select an Act
                                        </option>

                                        {acts.map(function (act) {
                                            return (
                                                <option
                                                    key={act._id}
                                                    value={act._id}
                                                >
                                                    {act.title}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}

                            {moveType === "event" && (
                                <div className="form-group">
                                    <label>Move to Chapter</label>

                                    <select
                                        value={moveChapterId}
                                        onChange={function (event) {
                                            setMoveChapterId(event.target.value);
                                        }}
                                    >
                                        <option value="">
                                            Select a Chapter
                                        </option>

                                        {chapters.map(function (chapter) {
                                            var act = acts.find(function (item) {
                                                return item._id === chapter.actId;
                                            });

                                            return (
                                                <option
                                                    key={chapter._id}
                                                    value={chapter._id}
                                                >
                                                    {act ? act.title + " — " : ""}
                                                    {chapter.title}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}

                            {moveType === "scene" && (
                                <>
                                    <div className="form-group">
                                        <label>Move to Chapter</label>

                                        <select
                                            value={moveChapterId}
                                            onChange={function (event) {
                                                setMoveChapterId(event.target.value);
                                                setMoveEventId("");
                                            }}
                                        >
                                            <option value="">
                                                Select a Chapter
                                            </option>

                                            {chapters.map(function (chapter) {
                                                var act = acts.find(function (item) {
                                                    return item._id === chapter.actId;
                                                });

                                                return (
                                                    <option
                                                        key={chapter._id}
                                                        value={chapter._id}
                                                    >
                                                        {act ? act.title + " — " : ""}
                                                        {chapter.title}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Move to Event</label>

                                        <select
                                            value={moveEventId}
                                            onChange={function (event) {
                                                setMoveEventId(event.target.value);
                                            }}
                                            disabled={!moveChapterId}
                                        >
                                            <option value="">
                                                Select an Event
                                            </option>

                                            {events
                                                .filter(function (item) {
                                                    return item.chapterId === moveChapterId;
                                                })
                                                .map(function (event) {
                                                    return (
                                                        <option
                                                            key={event._id}
                                                            value={event._id}
                                                        >
                                                            {event.title}
                                                        </option>
                                                    );
                                                })}
                                        </select>
                                    </div>
                                </>
                            )}

                            {moveError && (
                                <p className="form-error">
                                    {moveError}
                                </p>
                            )}

                            <div className="builder-form-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeMoveModal}
                                    disabled={moving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={handleMove}
                                    disabled={moving}
                                >
                                    {moving ? "Moving..." : "Move"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default StoryBuilder;