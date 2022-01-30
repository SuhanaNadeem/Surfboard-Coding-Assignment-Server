
const topicResolvers = require("./topics");
const messageResolvers = require("./messages");

const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  DateTime: GraphQLDateTime,
  Query: {
    ...topicResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...topicResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
