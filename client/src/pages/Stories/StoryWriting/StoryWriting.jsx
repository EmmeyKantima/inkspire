import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BookOpen,
    ChevronDown,
    Save,
    PanelRightOpen,
    X,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Check
} from "lucide-react";

import API_URL from "../../../api/api";
import "./StoryWriting.css";

function StoryWriting() {
    var { storyId } = useParams();

    var [acts, setActs] = useState([]);
    var [chapters, setChapters] = useState([]);
    var [selectedChapter, setSelectedChapter] = useState(null);

    var [content, setContent] = useState("");
    var [chapterTitle, setChapterTitle] = useState("");

    var [loading, setLoading] = useState(true);
    var [saving, setSaving] = useState(false);
    var [saveMessage, setSaveMessage] = useState("");

    var [showChapterMenu, setShowChapterMenu] = useState(false);
    var [showGuide, setShowGuide] = useState(false);

    var [guideEvents, setGuideEvents] = useState([]);
    var [guideScenes, setGuideScenes] = useState([]);

    var editorRef = useRef(null);
    var statusUpdatingRef = useRef(false);

    var token = localStorage.getItem("inkspireToken");

    useEffect(function () {
        loadChapters();
    }, [storyId]);

    async function loadChapters() {
        try {
            setLoading(true);

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
                    actData.message || "Failed to load Acts."
                );
            }

            setActs(actData);

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
                    if (Array.isArray(items)) {
                        allChapters = allChapters.concat(items);
                    }
                });
            }

            allChapters = allChapters.map(function (chapter) {
                return {
                    ...chapter,
                    status: chapter.status || "not_started"
                };
            });

            setChapters(allChapters);
        } catch (error) {
            console.error("Load chapters error:", error);
        } finally {
            setLoading(false);
        }
    }

    async function selectChapter(chapter) {
        setSelectedChapter(chapter);
        setChapterTitle(chapter.title || "");
        setShowChapterMenu(false);
        setSaveMessage("");

        if (editorRef.current) {
            editorRef.current.innerHTML = "";
        }

        try {
            var response = await fetch(
                API_URL + "/drafts/chapter/" + chapter._id,
                {
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load draft."
                );
            }

            var draftContent = data.content || "";

            setContent(draftContent);

            if (editorRef.current) {
                editorRef.current.innerHTML = draftContent;
            }
        } catch (error) {
            console.error("Load draft error:", error);
            setContent("");

            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
        }

        loadGuide(chapter._id);
    }

    async function loadGuide(chapterId) {
        try {
            var headers = {
                Authorization: "Bearer " + token
            };

            var eventResponse = await fetch(
                API_URL + "/events/chapter/" + chapterId,
                {
                    headers: headers
                }
            );

            if (!eventResponse.ok) {
                setGuideEvents([]);
                setGuideScenes([]);
                return;
            }

            var eventData = await eventResponse.json();

            var events = Array.isArray(eventData)
                ? eventData
                : eventData.events || [];

            setGuideEvents(events);

            var allScenes = [];

            if (events.length > 0) {
                var sceneRequests = events.map(function (event) {
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
                    if (Array.isArray(items)) {
                        allScenes = allScenes.concat(items);
                    }
                });
            }

            setGuideScenes(allScenes);
        } catch (error) {
            console.error("Load guide error:", error);
            setGuideEvents([]);
            setGuideScenes([]);
        }
    }

    function getActForChapter(chapter) {
        if (!chapter) {
            return null;
        }

        return acts.find(function (act) {
            return act._id === chapter.actId;
        });
    }

    function getStatus(chapter) {
        return chapter.status || "not_started";
    }

    function getStatusClass(chapter) {
        var status = getStatus(chapter);

        if (status === "completed") {
            return "status-dot completed";
        }

        if (status === "in_progress") {
            return "status-dot in-progress";
        }

        return "status-dot not-started";
    }

    function handleEditorInput(event) {
        var newContent = event.currentTarget.innerHTML;

        setContent(newContent);

        if (
            selectedChapter &&
            getStatus(selectedChapter) === "not_started" &&
            newContent.replace(/<[^>]*>/g, "").trim()
        ) {
            if (!statusUpdatingRef.current) {
                statusUpdatingRef.current = true;

                updateChapterStatus(
                    selectedChapter._id,
                    "in_progress"
                ).finally(function () {
                    statusUpdatingRef.current = false;
                });
            }
        }
    }

    function format(command, value) {
        if (!editorRef.current) {
            return;
        }

        editorRef.current.focus();

        document.execCommand(
            command,
            false,
            value || null
        );

        setContent(editorRef.current.innerHTML);
    }

    function handleHeadingChange(event) {
        var value = event.target.value;

        if (!value) {
            return;
        }

        format("formatBlock", value);
        event.target.value = "";
    }

    function handleEditorKeyDown(event) {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {
            event.preventDefault();
            saveDraft();
        }
    }

    async function saveDraft() {
        if (!selectedChapter) {
            return;
        }

        setSaving(true);
        setSaveMessage("");

        try {
            var currentContent = editorRef.current
                ? editorRef.current.innerHTML
                : content;

            var response = await fetch(
                API_URL + "/drafts/chapter/" + selectedChapter._id,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({
                        storyId: storyId,
                        title: chapterTitle,
                        content: currentContent
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save draft."
                );
            }

            setContent(currentContent);
            setSaveMessage("Saved");
        } catch (error) {
            console.error("Save draft error:", error);
            setSaveMessage("Save failed");
        } finally {
            setSaving(false);

            setTimeout(function () {
                setSaveMessage("");
            }, 2500);
        }
    }

    async function updateChapterStatus(chapterId, status) {
        var previousChapter = chapters.find(function (chapter) {
            return chapter._id === chapterId;
        });

        var previousStatus = previousChapter
            ? getStatus(previousChapter)
            : "not_started";

        setChapters(function (currentChapters) {
            return currentChapters.map(function (chapter) {
                if (chapter._id === chapterId) {
                    return {
                        ...chapter,
                        status: status
                    };
                }

                return chapter;
            });
        });

        setSelectedChapter(function (currentChapter) {
            if (
                currentChapter &&
                currentChapter._id === chapterId
            ) {
                return {
                    ...currentChapter,
                    status: status
                };
            }

            return currentChapter;
        });

        try {
            var response = await fetch(
                API_URL + "/chapters/" + chapterId,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({
                        status: status
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update chapter status."
                );
            }
        } catch (error) {
            console.error("Update chapter status error:", error);

            setChapters(function (currentChapters) {
                return currentChapters.map(function (chapter) {
                    if (chapter._id === chapterId) {
                        return {
                            ...chapter,
                            status: previousStatus
                        };
                    }

                    return chapter;
                });
            });

            setSelectedChapter(function (currentChapter) {
                if (
                    currentChapter &&
                    currentChapter._id === chapterId
                ) {
                    return {
                        ...currentChapter,
                        status: previousStatus
                    };
                }

                return currentChapter;
            });
        }
    }

    function handleCompleteToggle() {
        if (!selectedChapter) {
            return;
        }

        var currentStatus = getStatus(selectedChapter);

        if (currentStatus === "completed") {
            updateChapterStatus(
                selectedChapter._id,
                "in_progress"
            );
        } else {
            updateChapterStatus(
                selectedChapter._id,
                "completed"
            );
        }
    }

    function getScenesForEvent(eventId) {
        return guideScenes.filter(function (scene) {
            return scene.eventId === eventId;
        });
    }

    if (loading) {
        return (
            <div className="writing-page">
                <p className="writing-loading">
                    Loading Writing...
                </p>
            </div>
        );
    }

    if (!selectedChapter) {
        return (
            <div className="writing-page">
                <div className="writing-header">
                    <div className="writing-header-left">
                        <p className="writing-eyebrow">
                            WRITING
                        </p>

                        <h1>
                            Your Chapters
                        </h1>

                        <p className="writing-description">
                            Choose a chapter to continue writing your story.
                        </p>
                    </div>
                </div>

                {chapters.length === 0 ? (
                    <div className="writing-empty">
                        <BookOpen size={28} />

                        <h2>
                            No chapters yet
                        </h2>

                        <p>
                            Create a chapter in Story Builder
                            before starting to write.
                        </p>
                    </div>
                ) : (
                    <div className="chapter-list">
                        <div className="chapter-list-header">
                            <span>
                                CHAPTER
                            </span>

                            <span>
                                ACT
                            </span>
                        </div>

                        {chapters.map(function (chapter) {
                            var act = getActForChapter(chapter);

                            return (
                                <button
                                    key={chapter._id}
                                    type="button"
                                    className="chapter-list-row"
                                    onClick={function () {
                                        selectChapter(chapter);
                                    }}
                                >
                                    <div className="chapter-list-title">
                                        <span
                                            className={getStatusClass(
                                                chapter
                                            )}
                                        ></span>

                                        <strong>
                                            {chapter.title}
                                        </strong>
                                    </div>

                                    <span className="chapter-list-act">
                                        {act
                                            ? act.title
                                            : "—"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    var currentAct = getActForChapter(selectedChapter);

    return (
        <div className="writing-page">
            <div className="writing-header">
                <div className="writing-header-left">
                    <p className="writing-eyebrow">
                        WRITING
                    </p>

                    <h1>
                        {selectedChapter.title}
                    </h1>

                    <p className="writing-description">
                        Write your story continuously while
                        keeping your story plan nearby.
                    </p>
                </div>

                <div className="writing-header-actions">
                    {saveMessage && (
                        <span
                            className={
                                saveMessage === "Saved"
                                    ? "save-message saved"
                                    : "save-message error"
                            }
                        >
                            {saveMessage}
                        </span>
                    )}

                    <button
                        className="story-guide-button"
                        type="button"
                        onClick={function () {
                            setShowGuide(true);
                        }}
                    >
                        <PanelRightOpen size={17} />
                        Story Guide
                    </button>

                    <button
                        className="save-draft-button"
                        type="button"
                        onClick={saveDraft}
                        disabled={
                            saving || !selectedChapter
                        }
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            <div className="chapter-selector">
                <button
                    className="chapter-selector-button"
                    type="button"
                    onClick={function () {
                        setShowChapterMenu(
                            !showChapterMenu
                        );
                    }}
                >
                    <div className="chapter-selector-info">
                        <span>
                            CURRENT CHAPTER
                        </span>

                        <strong>
                            <span
                                className={getStatusClass(
                                    selectedChapter
                                )}
                            ></span>

                            {selectedChapter.title}
                        </strong>
                    </div>

                    <ChevronDown size={18} />
                </button>

                {showChapterMenu && (
                    <div className="chapter-menu">
                        {chapters.map(function (chapter) {
                            var act =
                                getActForChapter(
                                    chapter
                                );

                            return (
                                <button
                                    key={chapter._id}
                                    type="button"
                                    className={
                                        selectedChapter &&
                                        selectedChapter._id ===
                                            chapter._id
                                            ? "chapter-menu-item active"
                                            : "chapter-menu-item"
                                    }
                                    onClick={function () {
                                        selectChapter(
                                            chapter
                                        );
                                    }}
                                >
                                    <span
                                        className={getStatusClass(
                                            chapter
                                        )}
                                    ></span>

                                    <span className="chapter-menu-text">
                                        {act
                                            ? act.title +
                                              " — "
                                            : ""}
                                        {chapter.title}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="writing-status-row">
                <div className="writing-current-status">
                    <span
                        className={getStatusClass(
                            selectedChapter
                        )}
                    ></span>

                    <span>
                        {getStatus(selectedChapter) ===
                        "completed"
                            ? "Completed"
                            : getStatus(selectedChapter) ===
                              "in_progress"
                            ? "In Progress"
                            : "Not Started"}
                    </span>
                </div>

                <button
                    type="button"
                    className={
                        getStatus(selectedChapter) ===
                        "completed"
                            ? "chapter-complete-button completed"
                            : "chapter-complete-button"
                    }
                    onClick={handleCompleteToggle}
                >
                    <Check size={16} />

                    {getStatus(selectedChapter) ===
                    "completed"
                        ? "Mark as In Progress"
                        : "Mark as Complete"}
                </button>
            </div>

            <div className="writing-editor-container">
                <div className="writing-toolbar">
                    <select
                        className="heading-select"
                        defaultValue=""
                        onChange={handleHeadingChange}
                        title="Heading"
                    >
                        <option value="" disabled>
                            Heading
                        </option>

                        <option value="h1">
                            Heading 1
                        </option>

                        <option value="h2">
                            Heading 2
                        </option>

                        <option value="h3">
                            Heading 3
                        </option>

                        <option value="p">
                            Normal
                        </option>
                    </select>

                    <span className="toolbar-divider"></span>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("bold");
                        }}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </button>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("italic");
                        }}
                        title="Italic"
                    >
                        <em>I</em>
                    </button>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("underline");
                        }}
                        title="Underline"
                    >
                        <u>U</u>
                    </button>

                    <span className="toolbar-divider"></span>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("insertUnorderedList");
                        }}
                        title="Bullet List"
                    >
                        <List size={17} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("insertOrderedList");
                        }}
                        title="Numbered List"
                    >
                        <ListOrdered size={17} />
                    </button>

                    <span className="toolbar-divider"></span>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("justifyLeft");
                        }}
                        title="Align Left"
                    >
                        <AlignLeft size={17} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("justifyCenter");
                        }}
                        title="Align Center"
                    >
                        <AlignCenter size={17} />
                    </button>

                    <button
                        type="button"
                        onMouseDown={function (event) {
                            event.preventDefault();
                            format("justifyRight");
                        }}
                        title="Align Right"
                    >
                        <AlignRight size={17} />
                    </button>
                </div>

                <div
                    ref={editorRef}
                    className="writing-editor"
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={handleEditorInput}
                    onKeyDown={handleEditorKeyDown}
                    data-placeholder="Start writing your story..."
                />
            </div>

            {showGuide && (
                <div
                    className="guide-overlay"
                    onClick={function () {
                        setShowGuide(false);
                    }}
                >
                    <aside
                        className="story-guide-panel"
                        onClick={function (event) {
                            event.stopPropagation();
                        }}
                    >
                        <div className="guide-header">
                            <div>
                                <p>
                                    STORY GUIDE
                                </p>

                                <h2>
                                    Story Plan
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="guide-close-button"
                                onClick={function () {
                                    setShowGuide(false);
                                }}
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="guide-content">
                            <div className="guide-act">
                                <p className="guide-act-label">
                                    ACT
                                </p>

                                <h3>
                                    {currentAct
                                        ? currentAct.title
                                        : "Current Act"}
                                </h3>

                                <div className="guide-chapter">
                                    <div className="guide-chapter-title">
                                        <BookOpen size={16} />

                                        <span>
                                            {selectedChapter.title}
                                        </span>
                                    </div>

                                    {guideEvents.length === 0 ? (
                                        <div className="guide-empty">
                                            <p>
                                                No events have been
                                                planned for this chapter
                                                yet.
                                            </p>
                                        </div>
                                    ) : (
                                        guideEvents.map(function (
                                            event,
                                            eventIndex
                                        ) {
                                            var eventScenes =
                                                getScenesForEvent(
                                                    event._id
                                                );

                                            return (
                                                <div
                                                    className="guide-event"
                                                    key={event._id}
                                                >
                                                    <div className="guide-event-label">
                                                        EVENT {eventIndex + 1}
                                                    </div>

                                                    <h4>
                                                        {event.title}
                                                    </h4>

                                                    {event.description && (
                                                        <p className="guide-event-description">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    {eventScenes.length > 0 && (
                                                        <div className="guide-scenes">
                                                            {eventScenes.map(
                                                                function (
                                                                    scene,
                                                                    sceneIndex
                                                                ) {
                                                                    return (
                                                                        <div
                                                                            className="guide-scene"
                                                                            key={
                                                                                scene._id
                                                                            }
                                                                        >
                                                                            <div className="guide-scene-label">
                                                                                SCENE{" "}
                                                                                {sceneIndex +
                                                                                    1}
                                                                            </div>

                                                                            <h5>
                                                                                {
                                                                                    scene.title
                                                                                }
                                                                            </h5>

                                                                            {scene.description && (
                                                                                <p className="guide-scene-description">
                                                                                    {
                                                                                        scene.description
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}

export default StoryWriting;
