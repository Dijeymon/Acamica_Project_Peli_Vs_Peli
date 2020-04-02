require("dotenv").config();
const app = require("./server");
require("./lib/database");

//  Starting the server

app.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});
