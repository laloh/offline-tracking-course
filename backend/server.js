import express from "express";
import bodyParser from "body-parser";
import { default as cors } from "cors";
import courseRouter from "./courseRouter.js"


// App Config
const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8001;

app.use(courseRouter);




// Listener
app.listen(port, () => console.log(`listening on localhost: ${port}`));
