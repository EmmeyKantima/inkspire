import { useParams } from "react-router-dom";
import "./StoryWorld.css";

function StoryWorld() {
    var { storyId } = useParams();

    return (
        <div className="story-world-page">
            <h1>World Builder</h1>
            <p>World information for Story {storyId}</p>
        </div>
    );
}

export default StoryWorld;