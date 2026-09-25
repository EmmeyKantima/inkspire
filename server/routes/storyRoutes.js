var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getStoryCollection } = require("../models/Story");

var router = express.Router();

// GET ALL STORIES
router.get("/", authMiddleware, async function (req, res) {
    try {
        var collection = getStoryCollection();

        var stories = await collection
            .find({
                userId: new ObjectId(req.user.userId)
            })
            .sort({
                updatedAt: -1
            })
            .toArray();

        res.json(stories);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get stories."
        });
    }
});

// CREATE STORY
router.post("/", authMiddleware, async function (req, res) {
    try {
        var { title, genre, synopsis, plot } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Story title is required."
            });
        }

        var collection = getStoryCollection();

        var now = new Date();

        var story = {
            userId: new ObjectId(req.user.userId),
            title: title.trim(),
            genre: genre ? genre.trim() : "",
            synopsis: synopsis ? synopsis.trim() : "",
            plot: plot ? plot.trim() : "",
            createdAt: now,
            updatedAt: now
        };

        var result = await collection.insertOne(story);

        var createdStory = await collection.findOne({
            _id: result.insertedId
        });

        res.status(201).json(createdStory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create story."
        });
    }
});

// GET ONE STORY
router.get("/:id", authMiddleware, async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid story ID."
            });
        }

        var collection = getStoryCollection();

        var story = await collection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (!story) {
            return res.status(404).json({
                message: "Story not found."
            });
        }

        res.json(story);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get story."
        });
    }
});

// UPDATE STORY
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid story ID."
            });
        }

        var { title, genre, synopsis, plot } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Story title is required."
            });
        }

        var collection = getStoryCollection();

        var result = await collection.updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: {
                    title: title.trim(),
                    genre: genre ? genre.trim() : "",
                    synopsis: synopsis ? synopsis.trim() : "",
                    plot: plot ? plot.trim() : "",
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Story not found."
            });
        }

        var updatedStory = await collection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedStory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update story."
        });
    }
});

// DELETE STORY
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid story ID."
            });
        }

        var collection = getStoryCollection();

        var result = await collection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Story not found."
            });
        }

        res.json({
            message: "Story deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete story."
        });
    }
});

module.exports = router;