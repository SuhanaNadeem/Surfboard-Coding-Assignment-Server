const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime

  type Message {
    id: String!
    text: String!
    sender: String!
  }

  type Topic {
    id: String!
    title: String!
    description: String!
    timeEstimate: Int!
    imageLink: String
  }
  # retrieve information
  type Query {
    
    getTopics: [Topic]!
    getMessages: [Message]!
  }

  # actions
  type Mutation {
    addTopic(title: String!, description: String!, timeEstimate: Int!, imageLink: String): String
    editTopic(topicId: String!, newTitle: String, newDescription: String, newTimeEstimate: Int, newImageLink: String): String
    deleteTopic(topicId: String!): String
    addMessage(sender: String!, text: String!): String
    editMessage(messageId: String!, newText: String, newSender: String): String
    deleteMessage(messageId: String!): String
    clearChat: String
  }

`;
