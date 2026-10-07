var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getSceneCollection } = require("../models/Scene");

var router = express.Router();

// GET all scenes for an event
router.get("/event/:eventId", authMiddleware, async function (req, res) {
    try {
        var sceneCollection = getSceneCollection();

        var scenes = await sceneCollection
            .find({
                eventId: req.params.eventId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: 1, createdAt: 1 })
            .toArray();

        res.json(scenes);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load scenes."
        });
    }
});

// CREATE scene
router.post("/", authMiddleware, async function (req, res) {
    try {
        var sceneCollection = getSceneCollection();

        var {
            storyId,
            chapterId,
            eventId,
            title,
            description
        } = req.body;

        if (
            !storyId ||
            !chapterId ||
            !eventId ||
            !title ||
            !title.trim()
        ) {
            return res.status(400).json({
                message:
                    "Story, chapter, event, and title are required."
            });
        }

        var lastScene = await sceneCollection
            .find({
                eventId: eventId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: -1 })
            .limit(1)
            .toArray();

        var order = lastScene.length > 0
            ? lastScene[0].order + 1
            : 1;

        var newScene = {
            storyId: storyId,
            chapterId: chapterId,
            eventId: eventId,
            userId: new ObjectId(req.user.userId),
            title: title.trim(),
            description: description || "",
            order: order,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await sceneCollection.insertOne(newScene);

        res.status(201).json({
            _id: result.insertedId,
            ...newScene
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create scene."
        });
    }
});

// UPDATE scene
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var sceneCollection = getSceneCollection();

        var {
            title,
            description,
            chapterId,
            eventId
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is required."
            });
        }

        var updateData = {
            title: title.trim(),
            description: description || "",
            updatedAt: new Date()
        };

        if (chapterId) {
            updateData.chapterId = chapterId;
        }

        if (eventId) {
            updateData.eventId = eventId;
        }

        var result = await sceneCollection.updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: updateData
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Scene not found."
            });
        }

        var updatedScene = await sceneCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedScene);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update scene."
        });
    }
});

// DELETE scene
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var sceneCollection = getSceneCollection();

        var result = await sceneCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Scene not found."
            });
        }

        res.json({
            message: "Scene deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Scene deleted successfully."
        });
    }
});

module.exports = router;