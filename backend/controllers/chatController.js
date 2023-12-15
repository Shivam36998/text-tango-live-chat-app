import userModel from "../models/userModel.js";

class chatController {
  static getAllChats = async (req, res) => {
    const number = req.params.id;
    console.log(req.params.id);
    const user = await userModel.findById(req.params.id);
    // const chats = user.chats;
    user.password = "";
    res.status(202).json({ user });
  };

  static addNewChat = async (req, res) => {
    console.log("addnewchat");

    try {
      const { name, number, userId } = req.body;

      // Find the user creating the chat
      if (!userId) {
        return res.status(202).json({
          message: "Invalid user ID",
          code: "400",
        });
      }
      const user = await userModel.findById(userId);
      console.log(user, userId);
      // Find the user being invited to the chat
      const secondUser = await userModel.findOne({ number });

      // If the invited user is not found, return an error response
      if (!secondUser) {
        return res.status(404).json({
          message: "User not found, ask them to register on the app first",
          code: "404"
        });
      }

      // Extract the necessary information from the second user
      const secondUserId = await secondUser._id.toString();
      console.log("seconduserId ", secondUserId)
      const chatId = user.number + number;

      // Prepare the new chat for both users
      const newChat = {
        name,
        number,
        secondUserId,
        chatId,
        messages: [],
        lastMessage: "",
        lastTime: "",
      };

      const otherChat = {
        name: user.firstName,
        number: user.number,
        secondUserId: userId,
        chatId,
        messages: [],
        lastMessage: "",
        lastTime: "",
      };

      console.log(newChat, otherChat)

      // Check if the chat already exists
      const existingChat = user.chats.find(chat => chat.number === number);

      if (existingChat) {
        console.log("Chat already exists");
        return res.status(202).json({ message: "Chat already exists", existingChat });
      }

      // Add the new chat for both users
      user.chats.unshift(newChat);
      secondUser.chats.unshift(otherChat);

      // Save changes to both users
      await user.save();
      await secondUser.save();

      const allChats = user.chats;
      res.status(202).json({ message: "New chat created", code: "202", allChats });
    } catch (error) {
      // Handle any errors that occurred during the process
      console.error("Error creating chat:", error);
      res.status(500).json({
        message: "Internal server error",
        code: "500",
        error: error.message,
      });
    }
  };

  static updateChat = async (req, res) => {
    console.log("updatechat");
    const { newName, userId, chatId } = req.body;
    const user = await userModel.findById(userId);
    // const existingChat = user.chats.find(chat => chat.number === number);
    const chat = await user.chats.findById(chatId);
    const updatedChat = {
      newName,
      number,
      messages: chat.messages,
      lastMessage: chat.lastMessage,
      lastTime: chat.lastTime,
    };
    try {
      await user.chats.findByIdAndUpdate(chatId, updatedChat);
      res
        .status(202)
        .json({ message: "chat has been updated", code: "202", updatedChat });
    } catch (error) {
      res
        .status(404)
        .json({ message: "problem in updating this chat", code: "404", error });
    }
  };

  static deleteChat = async (req, res) => {
    console.log("deletechat");
    try {
      const { userId, chatId } = req.body;
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const chatIndex = user.chats.findIndex(
        chat => chat._id.toString() === chatId
      );

      if (chatIndex === -1) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Remove the chat from the array
      user.chats.splice(chatIndex, 1);

      // Save the updated user document
      await user.save();

      res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static newChatMessage = async (req, res) => {
    try {
      const { userId, chatId, secondUserId, send, message } = req.body;

      // Find the users involved in the chat
      const user = await userModel.findById(userId);
      const secondUser = await userModel.findById(secondUserId);
      console.log(user, secondUser, "user")
      // Check if either user is not found
      if (!user || !secondUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find the chat for the current user
      const chat = user.chats.find(chat => chat.chatId === chatId);

      // Find the chat for the second user
      const secondChat = secondUser.chats.find(chat => chat.chatId === chatId);
      console.log(chat, secondChat)

      // Check if either chat is not found
      if (!chat || !secondChat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Prepare new messages
      const newMessage = {
        send,
        message,
      };

      const secondNewMessage = {
        send: !send,
        message,
      };

      // Add new messages to both chats
      chat.messages.unshift(newMessage);
      secondChat.messages.unshift(secondNewMessage);

      // Save changes to both users
      await user.save();
      await secondUser.save();

      res.status(200).json({ message: "New message added successfully" });
    } catch (error) {
      console.error("Error adding new message:", error);

      // Check for specific error types
      if (error.name === "CastError" && error.kind === "ObjectId") {
        return res.status(400).json({ message: "Invalid user or chat ID format" });
      }

      res.status(500).json({ message: "Internal server error" });
    }
  };


  static deleteMessage = async (req, res) => {
    try {
      const { userId, chatId, messageId } = req.body;
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const chat = user.chats.find(chat => chat._id.toString() === chatId);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const messageToRemove = chat.messages.id(messageId);

      if (!messageToRemove) {
        return res.status(404).json({ message: "Message not found" });
      }

      messageToRemove.remove();
      await user.save();

      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}
export default chatController;
