// const { ApolloServer, gql } = require("apollo-server");
const File = require("../../models/File");

const checkAdminAuth = require("../../util/checkAdminAuth");
const {
  handleLynxFileUpload,
  handleLynxFileDelete,
} = require("../../util/handleFileUpload");

const AmazonS3URI = require("amazon-s3-uri");

module.exports = {
  Query: {
    async getFiles() {
      try {
        const files = await File.find().sort({
          filename: "asc",
        });
        return files;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async uploadLynxFile(_, { file }, context) {
      //   // async args.file.then((file) => {
      const admin = checkAdminAuth(context);
      // const { stream, filename, mimetype, encoding } = await file;
      //   // const { stream, filename, mimetype, encoding } = await file;
      //   const filePath = path.join(__dirname, "../../images", filename);
      //   await new Promise((res) =>
      //     createReadStream().pipe(createWriteStream(filePath)).on("close", res)
      //   );
      //   // files.push(filename);

      const response = await handleLynxFileUpload(file);

      // const newFile = new File({
      //   filename,
      //   // path: filePath,
      //   mimetype,
      //   encoding,
      //   url: "",
      //   createdAt: new Date(),
      // });
      // const dbFile = await newFile.save();
      //   //Contents of Upload scalar: https://github.com/jaydenseric/graphql-upload#class-graphqlupload
      //   //file.createReadStream() is a readable node stream that contains the contents of the uploaded file
      //   //node stream api: https://nodejs.org/api/stream.html
      //   // return file;
      return response;
      //   // });
      //   // return val
    },

    async deleteLynxFile(_, { fileKey }, context) {
      const admin = checkAdminAuth(context);

      const response = await handleLynxFileDelete(fileKey);

      return "File deleted successfully";
    },
  },
};
