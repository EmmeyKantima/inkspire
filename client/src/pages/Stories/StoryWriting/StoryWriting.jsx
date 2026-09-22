import { useParams } from "react-router-dom";
import "./StoryWriting.css";

function StoryWriting() {
    var { storyId } = useParams();

    return (
        <div className="story-writing-page">
            <h1>Writing</h1>
            <p>Writing workspace for Story {storyId}</p>
        </div>
    );
}

export default StoryWriting;