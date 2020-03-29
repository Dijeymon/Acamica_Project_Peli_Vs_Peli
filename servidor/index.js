require("dotenv").config();
const app = require("./server");
require("./lib/database");

//  Starting the server

app.listen(app.get("port"), () => {
  console.log("Server running at:", app.get("port"));
});
