const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
// const fileResolvers = require("./files");
const Topic = require("../../models/Topic");

module.exports = {
  Query: {

    async getTopics(_, {}, context) {
      const topics = await Topic.find();
      
      if (!topics) {
        throw new UserInputError("No topics", {
          errors: {
            topics: "There are no topics",
          },
        });
      } else {
        return topics;
      }
    },

  },

  Mutation: {
    async addTopic(_, { title, description, timeEstimate, imageLink }, context) {
      const newTopic = new Topic({
        title,
        description,
        timeEstimate,
        imageLink,
        createdAt: new Date(),
      });
      await newTopic.save();
      return newTopic.title;

    },

    async editTopic(
      _,
      { topicId, newTitle, newDescription, newTimeEstimate, newImageLink },
      context
    ) {

      const targetTopic = await Topic.findById(topicId);

      if (newTitle !== undefined && newTitle !== "") {
        targetTopic.title = newTitle;
      }
      if (newTimeEstimate !== undefined && newTimeEstimate !== "") {
        targetTopic.timeEstimate = newTimeEstimate;
      }
      if (newDescription !== undefined && newDescription !== "") {
        targetTopic.description = newDescription;
      }
      if (newImageLink !== undefined && newImageLink !== "") {
        targetTopic.imageLink = newImageLink;
      }
      targetTopic.save();

      return "Successful";
    },
    async deleteTopic(
      _,
      { topicId },
      context
    ) {

      const targetTopic = await Topic.findById(topicId);
      if (targetTopic) {
        await targetTopic.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("No such topic", {
          errors: {
            topicId: "There is no topic with this ID",
          },
        });
      }

    },

  },
};
