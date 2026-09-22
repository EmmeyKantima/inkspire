import { useParams } from "react-router-dom";
import "./StoryBuilder.css";

function StoryBuilder() {
    var { storyId } = useParams();

    return (
        <div className="story-builder-page">
            <h1>Story Builder</h1>
            <p>Story structure for Story {storyId}</p>
        </div>
    );
}

export default StoryBuilder;