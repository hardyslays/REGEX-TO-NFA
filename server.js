const express = require('express');

const app = express();
app.use(express.static("src"));

const PORT = 5050;

app.get("/", (req, res) => {
    res.redirect("/html.html");
})

var server = app.listen(PORT, () => {
    console.log("Listening on port", PORT);
})
