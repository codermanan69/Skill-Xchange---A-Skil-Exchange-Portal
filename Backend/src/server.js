const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Skill Xchange server running on port ${PORT}`);
});