var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getWorldCollection } = require("../models/World");

var router = express.Router();

// GET all world items for a story
router.get("/story/:storyId", authMiddleware, async function (req, res) {
    try {
        var worldCollection = getWorldCollection();

        var items = await worldCollection
            .find({
                storyId: req.params.storyId,
                userId: new ObjectId(req.user.userId)
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(items);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load world information."
        });
    }
});

// CREATE world item
router.post("/", authMiddleware, async function (req, res) {
    try {
        var worldCollection = getWorldCollection();

        var {
            storyId,
            name,
            type,
            description,
            details
        } = req.body;

        if (!storyId || !name) {
            return res.status(400).json({
                message: "Story and name are required."
            });
        }

        var newItem = {
            storyId: storyId,
            userId: new ObjectId(req.user.userId),
            name: name.trim(),
            type: type || "Other",
            description: description || "",
            details: details || "",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        var result = await worldCollection.insertOne(newItem);

        res.status(201).json({
            _id: result.insertedId,
            ...newItem
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to create world information."
        });
    }
});

// GET one world item
router.get("/:id", authMiddleware, async function (req, res) {
    try {
        var worldCollection = getWorldCollection();

        var item = await worldCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (!item) {
            return res.status(404).json({
                message: "World information not found."
            });
        }

        res.json(item);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to load world information."
        });
    }
});

// UPDATE world item
router.put("/:id", authMiddleware, async function (req, res) {
    try {
        var worldCollection = getWorldCollection();

        var {
            name,
            type,
            description,
            details
        } = req.body;

        var result = await worldCollection.updateOne(
            {
                _id: new ObjectId(req.params.id),
                userId: new ObjectId(req.user.userId)
            },
            {
                $set: {
                    name: name.trim(),
                    type: type || "Other",
                    description: description || "",
                    details: details || "",
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "World information not found."
            });
        }

        var updatedItem = await worldCollection.findOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        res.json(updatedItem);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to update world information."
        });
    }
});

// DELETE world item
router.delete("/:id", authMiddleware, async function (req, res) {
    try {
        var worldCollection = getWorldCollection();

        var result = await worldCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: new ObjectId(req.user.userId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "World information not found."
            });
        }

        res.json({
            message: "World information deleted successfully."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Unable to delete world information."
        });
    }
});

module.exports = router;