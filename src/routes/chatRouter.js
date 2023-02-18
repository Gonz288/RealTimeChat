const express = require("express");
const chatRouter = express.Router();

chatRouter.get("/" , (req,res) =>{
    res.status(200).render("chat",{title: "Chat"});
});

module.exports = chatRouter;