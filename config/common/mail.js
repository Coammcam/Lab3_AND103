var nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hungnvph40917@fpt.edu.vn",
    pass: "dasw hauc eeez ocux",
  },
});

module.exports = transporter;
