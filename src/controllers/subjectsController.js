const Subjects = require("../Models/Subjects");
const Categories = require("../Models/Category");
// function convertToVietnamTimeZone(date) {
//   const offset = 7 * 60; // Độ chênh múi giờ từ UTC đến GMT+7 (Việt Nam)
//   const localTime =
//     date.getTime() + (date.getTimezoneOffset() + offset) * 60 * 1000;
//   return new Date(localTime);
// }
const subjectController = {
  show: async (req, res) => {
    try {
      const subjects = await Subjects.find({});
      const lisstsubject = subjects.map((subject) => {
        return {
          id: subject._id,
          name: subject.name,
          category_id: subject.category_id,
        };
      });
      res.status(200).json(lisstsubject);
    } catch (error) {
      res.status(404).json(error);
    }
  },
  create: async (req, res) => {
    try {
      const newSubject = new Subjects({
        category_id: req.body.category_id,
        name: req.body.name,
      });
      const subject = await newSubject.save();
      res.status(200).json(subject);
    } catch (error) {
      res.status(404).json(error);
    }
  },

};
module.exports = subjectController;
