const adminResolvers = require("./admins");
const mentorResolvers = require("./mentors");
const studentResolvers = require("./students");

const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
} = require("graphql-iso-date");

module.exports = {
  DateTime: GraphQLDateTime,
  Query: {
    ...adminResolvers.Query,
    ...studentResolvers.Query,
    ...mentorResolvers.Query,
  },
  Mutation: {
    ...adminResolvers.Mutation,
    ...studentResolvers.Mutation,
    ...mentorResolvers.Mutation,
  },
};
