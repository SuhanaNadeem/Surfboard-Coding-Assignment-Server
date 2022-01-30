const { UserInputError } = require("apollo-server");
const Message = require("../../models/Message");

module.exports = {
  Query: {

    async getMessages(_, {}, context) {
      const messages = await Message.find();
      
      if (!messages) {
        throw new UserInputError("No messages", {
          errors: {
            messages: "There are no messages",
          },
        });
      } else {
        return messages;
      }
    },

  },

  Mutation: {
    async addMessage(_, { sender, text }, context) {
      const newMessage = new Message({
        sender,
        text,
        createdAt: new Date(),
      });
      await newMessage.save();
      return newMessage.sender;

    },

    async editMessage(
      _,
      { messageId, newText, newSender },
      context
    ) {

      const targetMessage = await Message.findById(messageId);

      if (newSender !== undefined && newSender !== "") {
        targetMessage.sender = newSender;
      }
      if (newText !== undefined && newText !== "") {
        targetMessage.text = newText;
      }
      targetMessage.save();

      return "Successful";
    },
    async deleteMessage(
      _,
      { messageId },
      context
    ) {

      const targetMessage = await Message.findById(messageId);
      if (targetMessage) {
        await targetMessage.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("No such topic", {
          errors: {
            messageId: "There is no topic with this ID",
          },
        });
      }

    },

    async clearChat(
      _,
      {  },
      context
    ) {
      const targetMessages = await Message.find();
      for (var targetMessage of targetMessages) {
        await targetMessage.delete();
      }

    },

  },
};
