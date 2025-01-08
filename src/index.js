import express from "express";
import { connectDB } from "./db/DatabaseConnection.js";
import { userRoute } from "./routes/user.route.js";
import { todoRoute } from "./routes/todos.route.js";
import cors from 'cors'
const app = express();
app.use(express.json())
app.use(cors())
connectDB()
.then(() => {
  app.listen(8081, () => {
    console.log("Server listening on port 8081");
  });
})
.catch((error)=>{
    console.log(error);
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.use('/api/v1/users',userRoute)
app.use('/api/v1/todos',todoRoute)
