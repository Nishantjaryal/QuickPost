const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatmodel");
const User = require("../models/UserModel");


const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserID not sent with request")
        return res.sendStatus(400);

    }


    // lets find and populate logged user's Chats
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password")      // except password return me everything
        .populate("latestMessage")       // populate accordingly latest message



    // it has all the chat data 
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })






    // now if the chat exists 
    if (isChat.length > 0) {
        res.send(isChat[0]);
    }

    // else create the new one
    else {
        var chatData = {
            chatData: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };


        try {
            const createChat = await Chat.create(chatData);
            const fullchat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password")
            res.status(200).send(fullchat)
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

})

const fetchChat = expressAsyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (result) => {
                result = await User.populate(result, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                });
                res.status(200).send(result);
            });

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})


const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({
            message: "Please Fill all the feilds"
        })
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res.status(400).send({
            message: "More than 2 users are required in order to make group"
        })
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate("users", "-password")
            .populate("groupAdmin", "-password");


        res.status(200).json(fullGroupChat);
    } catch (error) {

    }
})


const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
        chatName  // since key and variable name is same
    }, {
        new: true, // since key and variable name is same
    }).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found")

    } else {
        res.json(updatedChat);
    }
})


const addToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId},
        },
        { new: true }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found")

    } else {
        res.json(added);
    }
    
})
const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        { new: true }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found")

    } else {
        res.json(removed);
    }
})



module.exports = { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup }