import { useParams } from "react-router-dom";
import "./StoryTimeline.css";

function StoryTimeline() {
    var { storyId } = useParams();

    return (
        <div className="story-timeline-page">
            <h1>Timeline</h1>
            <p>Timeline for Story {storyId}</p>
        </div>
    );
}

export default StoryTimeline;