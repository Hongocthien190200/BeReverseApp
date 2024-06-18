
const Subjects = require("../Models/Subjects");
const Categories = require("../Models/Category");

const categoryController = {
  show: async (req, res) => {
    try {
      const categories = await Categories.find({});
      const lisstcategory = categories.map((category) => {
        return {
          id: category._id,
          name: category.name,
        };
      });
      res.status(200).json(lisstcategory);
    } catch (error) {
      res.status(404).json(error);
    }
  },
  showSubjectByCategory: async (req, res) => {
    try {
      const subjects = await Subjects.find({ category_id: req.params.id });
      const lisstsubject = subjects.map((subject) => {
        return {
          id: subject._id,
          name: subject.name,
        };
      });
      res.status(200).json(lisstsubject);
    } catch (error) {
      res.status(404).json(error);
    }
  },
  showAllSubjectByAllCategory: async (req, res) => {
    try {
      const categories = await Categories.find({});
      const subjects = await Subjects.find({});
      const listCategoryWithSubjects = categories.map((category) => {
        const subjectsByCategory = subjects.filter(function (subject) {
          return subject.category_id.toString() === category._id.toString();

        });
        return {
          category_id: category._id,
          categoryName: category.name,
          subjects: subjectsByCategory.map((subject) => ({
            subject_id: subject._id,
            subjectName: subject.name,
          })),
        };
      });
      res.status(200).json(listCategoryWithSubjects);
    } catch (error) {
      res.status(404).json({ message: "Error fetching categories and subjects", error });
    }
  },
  create: async (req, res) => {
    try {
      const newCategory = new Categories({
        name: req.body.name,
      });
      const category = await newCategory.save();
      res.status(200).json(category);
    } catch (error) {
      res.status(404).json(error);
    }
  },

};
module.exports = categoryController;
