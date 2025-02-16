const expressAsyncHandler = require("express-async-handler");

const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const Chat = require("../models/chatmodel"); // Assuming ChatModel exists

// Handler to send a new message
const sendMessages = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    // Validate request data
    if (!content || !chatId) {
        console.error("Invalid data: content or chatId is missing");
        return res.status(400).json({ message: "Content and chatId are required" });
    }

    const newMessage = {
        sender: req.user._id,
        content,
        chat: chatId,
    };

    try {
        // Create the message
        let message = await Message.create(newMessage);

        // Populate sender and chat details
        message = await Message.findById(message._id)
            .populate("sender", "name pic")
            .populate({
                path: "chat",
                populate: { path: "users", select: "name pic email" },
            });

        // Update the latestMessage field in the chat
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: "Failed to send message" });
    }
});

// Handler to fetch all messages for a chat
const allMessages = expressAsyncHandler(async (req, res) => {
    const { chatId } = req.params;

    try {
        // Fetch and populate messages
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "name pic email")
            .populate("chat");

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
});

module.exports = { sendMessages, allMessages };
