const multer = require("multer");
const path = require("path");
const fs = require('fs').promises; // Đảm bảo import fs.promises

const Questions = require("../Models/Questions");
const Subjects = require("../Models/Subjects");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });
function convertToVietnamTimeZone(date) {
  const offset = 7 * 60; // Độ chênh múi giờ từ UTC đến GMT+7 (Việt Nam)
  const localTime =
    date.getTime() + (date.getTimezoneOffset() + offset) * 60 * 1000;
  return new Date(localTime);
}
const questionController = {
  show: async (req, res) => {
    try {
      const questions = await Questions.find({});
      const questionsWithImageURL = questions.map((question) => {
        return {
          ...question._doc,
          image_url: question.image_filename
            ? `${req.protocol}://${req.get("host")}/uploads/${question.image_filename
            }`
            : null,
        };
      });
      res.status(200).json(questionsWithImageURL);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  create: async (req, res) => {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: "Upload failed", error: err });
      }
      const {
        subject_id,
        question_text,
        option1,
        option2,
        option3,
        option4,
        correct_option,
      } = req.body;
      const image_filename = req.file ? req.file.filename : null;

      const question = new Questions({
        subject_id,
        question_text,
        option1,
        option2,
        option3,
        option4,
        correct_option,
        image_filename,
      });
      try {
        const newQuestion = await question.save();
        res.status(201).json(newQuestion);
      } catch (error) {
        res.status(404).json(error);
      }
    });
  },

  showById: async (req, res) => {
    try {
      const questions = await Questions.find({ subject_id: req.params.id });
      const questionsWithImageURL = questions.map((question) => {
        return {
          ...question._doc,
          image_url: question.image_filename
            ? `${req.protocol}://${req.get("host")}/uploads/${question.image_filename
            }`
            : null,
        };
      });
      res.status(200).json(questionsWithImageURL);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  delete: async (req, res) => {
    try {
      const question = await Questions.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      // Delete the image file if it exists
      if (question.image_filename) {
        const filePath = path.join(__dirname, '../uploads', question.image_filename);
        try {
          await fs.unlink(filePath);
          console.log(`Deleted image file: ${filePath}`);
        } catch (err) {
          console.error(`Failed to delete image file: ${filePath}`, err);
          return res.status(500).json({ message: 'Failed to delete image file' });
        }
      }

      // Delete the question from the database
      await Questions.findByIdAndDelete(req.params.id);

      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      res.status(500).json(error);
    }
  },

};
module.exports = questionController;
