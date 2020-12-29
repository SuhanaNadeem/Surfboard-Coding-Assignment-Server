const adminResolvers = require("./admins");
const mentorResolvers = require("./mentors");
const studentResolvers = require("./students");
const categoryResolvers = require("./categories");
const moduleResolvers = require("./modules");
const questionResolvers = require("./questions");

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
    ...categoryResolvers.Query,
    ...moduleResolvers.Query,
    ...questionResolvers.Query,
  },
  Mutation: {
    ...adminResolvers.Mutation,
    ...studentResolvers.Mutation,
    ...mentorResolvers.Mutation,
    // ...categoryResolvers.Mutation,
    ...moduleResolvers.Mutation,
    ...questionResolvers.Mutation,
  },
};
