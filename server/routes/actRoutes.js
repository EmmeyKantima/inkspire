var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getActCollection } = require("../models/Act");

var router = express.Router();

// GET all acts for a story
router.get("/story/:storyId", authMiddleware, async function (req, res) {
    try {
        var actCollection = getActCollection();

        var acts = await actCollection
            .find({
                storyId: req.params.storyId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: 1, createdAt: 1 })
            .toArray();

        res.json(acts);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load acts."
        });
    }
});

// CREATE act
router.post("/", authMiddleware, async function (req, res) {
    try {
        var actCollection = getActCollection();

        var {
            storyId,
            title
        } = req.body;

        if (!storyId || !title || !title.trim()) {
            return res.status(400).json({
                message: "Story and title are required."
            });
        }

        var lastAct = await actCollection
            .find({
                storyId: storyId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ order: -1 })
            .limit(1)
            .toArray();

        var order = lastAct.length > 0
            ? lastAct[0].order + 1
            : 1;

        var newAct = {
            storyId: storyId,
            userId: new ObjectId(req.user.userId),
            title: title.trim(),
            order: order,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await actCollection.insertOne(newAct);

        res.status(201).json({
            _id: result.insertedId,
            ...newAct
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create act."
        });
    }
});

// UPDATE act
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var actCollection = getActCollection();

        var {
            title
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is required."
            });
        }

        var result = await actCollection.updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: {
                    title: title.trim(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Act not found."
            });
        }

        var updatedAct = await actCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedAct);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update act."
        });
    }
});

// DELETE act
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var actCollection = getActCollection();

        var result = await actCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Act not found."
            });
        }

        res.json({
            message: "Act deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete act."
        });
    }
});

module.exports = router;