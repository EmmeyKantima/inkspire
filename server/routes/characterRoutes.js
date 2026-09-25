var express = require("express");
var { ObjectId } = require("mongodb");
var authMiddleware = require("../middleware/authMiddleware");
var { getCharacterCollection } = require("../models/Character");

var router = express.Router();

// CHECK STORY ID
function isValidStoryId(storyId) {
    return ObjectId.isValid(storyId);
}

// GET ALL CHARACTERS FOR ONE STORY
router.get(
    "/story/:storyId",
    authMiddleware,
    async function (req, res) {
        try {
            if (!isValidStoryId(req.params.storyId)) {
                return res.status(400).json({
                    message: "Invalid story ID."
                });
            }

            var collection =
                getCharacterCollection();

            var characters = await collection
                .find({
                    storyId: new ObjectId(
                        req.params.storyId
                    ),
                    userId: new ObjectId(
                        req.user.userId
                    )
                })
                .sort({
                    updatedAt: -1
                })
                .toArray();

            res.json(characters);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to get characters."
            });
        }
    }
);

// CREATE CHARACTER
router.post(
    "/",
    authMiddleware,
    async function (req, res) {
        try {
            var {
                storyId,
                name,
                personality,
                background,
                appearance,
                goals,
                details
            } = req.body;

            if (!storyId || !isValidStoryId(storyId)) {
                return res.status(400).json({
                    message: "Valid story ID is required."
                });
            }

            if (!name || !name.trim()) {
                return res.status(400).json({
                    message: "Character name is required."
                });
            }

            var collection =
                getCharacterCollection();

            var now = new Date();

            var character = {
                storyId: new ObjectId(storyId),
                userId: new ObjectId(
                    req.user.userId
                ),
                name: name.trim(),
                personality: personality
                    ? personality.trim()
                    : "",
                background: background
                    ? background.trim()
                    : "",
                appearance: appearance
                    ? appearance.trim()
                    : "",
                goals: goals
                    ? goals.trim()
                    : "",
                details: details
                    ? details.trim()
                    : "",
                createdAt: now,
                updatedAt: now
            };

            var result =
                await collection.insertOne(
                    character
                );

            var createdCharacter =
                await collection.findOne({
                    _id: result.insertedId
                });

            res.status(201).json(
                createdCharacter
            );
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to create character."
            });
        }
    }
);

// GET ONE CHARACTER
router.get(
    "/:id",
    authMiddleware,
    async function (req, res) {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: "Invalid character ID."
                });
            }

            var collection =
                getCharacterCollection();

            var character =
                await collection.findOne({
                    _id: new ObjectId(
                        req.params.id
                    ),
                    userId: new ObjectId(
                        req.user.userId
                    )
                });

            if (!character) {
                return res.status(404).json({
                    message: "Character not found."
                });
            }

            res.json(character);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to get character."
            });
        }
    }
);

// UPDATE CHARACTER
router.put(
    "/:id",
    authMiddleware,
    async function (req, res) {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: "Invalid character ID."
                });
            }

            var {
                name,
                personality,
                background,
                appearance,
                goals,
                details
            } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    message: "Character name is required."
                });
            }

            var collection =
                getCharacterCollection();

            var result =
                await collection.updateOne(
                    {
                        _id: new ObjectId(
                            req.params.id
                        ),
                        userId: new ObjectId(
                            req.user.userId
                        )
                    },
                    {
                        $set: {
                            name: name.trim(),
                            personality:
                                personality
                                    ? personality.trim()
                                    : "",
                            background:
                                background
                                    ? background.trim()
                                    : "",
                            appearance:
                                appearance
                                    ? appearance.trim()
                                    : "",
                            goals: goals
                                ? goals.trim()
                                : "",
                            details: details
                                ? details.trim()
                                : "",
                            updatedAt: new Date()
                        }
                    }
                );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: "Character not found."
                });
            }

            var updatedCharacter =
                await collection.findOne({
                    _id: new ObjectId(
                        req.params.id
                    ),
                    userId: new ObjectId(
                        req.user.userId
                    )
                });

            res.json(updatedCharacter);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to update character."
            });
        }
    }
);

// DELETE CHARACTER
router.delete(
    "/:id",
    authMiddleware,
    async function (req, res) {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: "Invalid character ID."
                });
            }

            var collection =
                getCharacterCollection();

            var result =
                await collection.deleteOne({
                    _id: new ObjectId(
                        req.params.id
                    ),
                    userId: new ObjectId(
                        req.user.userId
                    )
                });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: "Character not found."
                });
            }

            res.json({
                message:
                    "Character deleted successfully."
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Failed to delete character."
            });
        }
    }
);

module.exports = router;