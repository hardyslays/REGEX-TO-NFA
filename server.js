//Importing express module in server
const express = require('express');

//Creating an instance of express to route API calls
const app = express();
//Serving the static files present in "src" folder
app.use(express.static("src"));

//Defining Port number
const PORT = 5050;

//Redirecting the default GET api to landing html file
app.get("/", (req, res) => {
    res.redirect("/html.html");
})

//Open server to listen for API calls on PORT
var server = app.listen(PORT, () => {
    console.log("Listening on port", PORT);
})
