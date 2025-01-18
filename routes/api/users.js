const router = require("express").Router();
const { check, validationResult } = require("express-validator");

// @route  POST  api/users
// @desc   Test route
// @access Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ erros: errors.array() });
    }
    console.log(req.body);

    res.send("User route");
  }
);

module.exports = router;
