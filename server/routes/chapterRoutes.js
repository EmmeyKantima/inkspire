var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getChapterCollection } = require("../models/Chapter");

var router = express.Router();

// GET all chapters for an act
router.get("/act/:actId", authMiddleware, async function (req, res) {
    try {
        var chapterCollection = getChapterCollection();

        var chapters = await chapterCollection
            .find({
                actId: req.params.actId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: 1, createdAt: 1 })
            .toArray();

        res.json(chapters);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load chapters."
        });
    }
});

// CREATE chapter
router.post("/", authMiddleware, async function (req, res) {
    try {
        var chapterCollection = getChapterCollection();

        var {
            storyId,
            actId,
            title
        } = req.body;

        if (!storyId || !actId || !title || !title.trim()) {
            return res.status(400).json({
                message: "Story, act, and title are required."
            });
        }

        var lastChapter = await chapterCollection
            .find({
                actId: actId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: -1 })
            .limit(1)
            .toArray();

        var order = lastChapter.length > 0
            ? lastChapter[0].order + 1
            : 1;

        var newChapter = {
            storyId: storyId,
            actId: actId,
            userId: new ObjectId(req.user.userId),
            title: title.trim(),
            status: "not_started",
            order: order,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await chapterCollection.insertOne(newChapter);

        res.status(201).json({
            _id: result.insertedId,
            ...newChapter
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create chapter."
        });
    }
});

// UPDATE chapter
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var chapterCollection = getChapterCollection();

        var {
            title,
            actId,
            status
        } = req.body;

        if (title !== undefined && (!title || !title.trim())) {
            return res.status(400).json({
                message: "Title is required."
            });
        }

        var updateData = {
            updatedAt: new Date()
        };

        if (title !== undefined) {
            updateData.title = title.trim();
        }

        if (actId) {
            updateData.actId = actId;
        }

        if (
            status === "not_started" ||
            status === "in_progress" ||
            status === "completed"
        ) {
            updateData.status = status;
        }

        var result = await chapterCollection.updateOne(
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
                message: "Chapter not found."
            });
        }

        var updatedChapter = await chapterCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedChapter);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update chapter."
        });
    }
});

// DELETE chapter
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var chapterCollection = getChapterCollection();

        var result = await chapterCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Chapter not found."
            });
        }

        res.json({
            message: "Chapter deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete chapter."
        });
    }
});

module.exports = router;