const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

const auth = require("@middleware/auth");

const Post = require("@models/Post");
const User = require("@models/User");
const Profile = require("@models/Profile");

// @route  POST api/posts
// @desc   Create a post
// @access Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  GET api/posts
// @desc   All all post
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route  GET api/posts/:id
// @desc   Get post by id
// @access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route  DELETE api/posts
// @desc   Delete a post
// @access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // check if req.params.id is valid object
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const post = await Post.findById(req.params.id);

    // Check that user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);

    res.status(500).send("Server Error");
  }
});

module.exports = router;
