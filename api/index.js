// Vercel Serverless Function entry point for BookFlix API
const requestHandler = require('../server.js');

module.exports = async (req, res) => {
  return requestHandler(req, res);
};
