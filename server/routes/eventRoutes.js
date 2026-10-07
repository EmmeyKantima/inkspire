var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getEventCollection } = require("../models/Event");

var router = express.Router();

// GET all events for a chapter
router.get("/chapter/:chapterId", authMiddleware, async function (req, res) {
    try {
        var eventCollection = getEventCollection();

        var events = await eventCollection
            .find({
                chapterId: req.params.chapterId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: 1, createdAt: 1 })
            .toArray();

        res.json(events);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load events."
        });
    }
});

// CREATE event
router.post("/", authMiddleware, async function (req, res) {
    try {
        var eventCollection = getEventCollection();

        var {
            storyId,
            chapterId,
            title,
            description
        } = req.body;

        if (!storyId || !chapterId || !title || !title.trim()) {
            return res.status(400).json({
                message: "Story, chapter, and title are required."
            });
        }

        var lastEvent = await eventCollection
            .find({
                chapterId: chapterId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: -1 })
            .limit(1)
            .toArray();

        var order = lastEvent.length > 0
            ? lastEvent[0].order + 1
            : 1;

        var newEvent = {
            storyId: storyId,
            chapterId: chapterId,
            userId: new ObjectId(req.user.userId),
            title: title.trim(),
            description: description || "",
            order: order,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await eventCollection.insertOne(newEvent);

        res.status(201).json({
            _id: result.insertedId,
            ...newEvent
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create event."
        });
    }
});

// UPDATE event
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var eventCollection = getEventCollection();

        var {
            title,
            description,
            chapterId
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

        var result = await eventCollection.updateOne(
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
                message: "Event not found."
            });
        }

        var updatedEvent = await eventCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedEvent);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update event."
        });
    }
});

// DELETE event
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var eventCollection = getEventCollection();

        var result = await eventCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Event not found."
            });
        }

        res.json({
            message: "Event deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete event."
        });
    }
});

module.exports = router;