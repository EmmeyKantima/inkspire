import { useParams } from "react-router-dom";
import "./StoryCharacters.css";

function StoryCharacters() {
    var { storyId } = useParams();

    return (
        <div className="story-characters-page">
            <h1>Characters</h1>
            <p>Characters for Story {storyId}</p>
        </div>
    );
}

export default StoryCharacters;