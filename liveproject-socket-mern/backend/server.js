const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
const Post = require("./models/Post");
const postroutes = require("./routes/postRoutes");

require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());





mongoose.connect(process.env.MONGO_URL);
console.log("mongodb connected");

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
});
io.on("connection", (socket)=>{
    console.log("user connected", socket.id);

    //like
    socket.on("likePost", async (postid) => {
        const post = await Post.findByIdAndUpdate(
            postid,
            { $inc: { likes: 1 } },
            { new: true }
        );
        io.emit("postUpdated", post);
    });

    //comment
    socket.on("commentPost", async (data) => {
        const post = await Post.findByIdAndUpdate(
            data.postid,
            {
                $push: {
                    comments: {
                    text:data.text
            } } },
            { new: true }
        );
        io.emit("postUpdated", post);
    });

    //share
     socket.on("sharePost", async (postid) => {
        const post = await Post.findByIdAndUpdate(
            postid,
            { $inc: { shares: 1 } },
            { new: true }
        );
        io.emit("postUpdated", post);
     });
    
    socket.on("disconnect", () => {
        console.log("user disconnected: ", socket.id);
    });

});

app.use("/api/posts", postroutes);

app.get("/",(req,res)=>{
    res.send("api is working");
});

server.listen(process.env.PORT, ()=>{
    console.log("server is running port 5500");
});
