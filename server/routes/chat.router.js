const OpenAI = require("openai");
const express = require("express");
const router = express.Router();

const openai = new OpenAI({});

router.get("/", async (req, res) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);

  res.send(completion);
});

module.exports = router;
