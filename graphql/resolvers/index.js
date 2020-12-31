const adminResolvers = require("./admins");
const mentorResolvers = require("./mentors");
const studentResolvers = require("./students");
const categoryResolvers = require("./categories");
const moduleResolvers = require("./modules");
const questionResolvers = require("./questions");
const questionTemplateResolvers = require("./questionTemplates");
const challengeResolvers = require("./challenges");
const badgeResolvers = require("./badges");

const { GraphQLDateTime } = require("graphql-iso-date");

module.exports = {
  DateTime: GraphQLDateTime,
  Query: {
    ...adminResolvers.Query,
    ...studentResolvers.Query,
    ...mentorResolvers.Query,
    ...categoryResolvers.Query,
    ...moduleResolvers.Query,
    ...questionResolvers.Query,
    ...questionTemplateResolvers.Query,
    ...challengeResolvers.Query,
    ...badgeResolvers.Query,
  },
  Mutation: {
    ...adminResolvers.Mutation,
    ...studentResolvers.Mutation,
    ...mentorResolvers.Mutation,
    ...badgeResolvers.Mutation,
    ...moduleResolvers.Mutation,
    ...questionResolvers.Mutation,
  },
};
