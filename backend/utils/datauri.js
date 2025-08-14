import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  // Get the file extension using path.extname
  const extName = path.extname(file.originalname).toString;
  // Use parser to format the file to data URI
  return parser.format(extName, file.buffer).content;
};

export default getDataUri;
