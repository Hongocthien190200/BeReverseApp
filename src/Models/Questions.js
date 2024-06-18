const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    question_text: { type: String, required: true },
    option1: { type: String, required: true },
    option2: { type: String, required: true },
    option3: { type: String },
    option4: { type: String },
    correct_option: { type: Number, required: true },
    image_filename: { type: String }, // Tên tệp ảnh trong GridFS
  },
  {
    timestamps: {
      currentTime: () => new Date(Date.now() + 7 * 60 * 60 * 1000), // Đặt múi giờ +7
    },
  }
);

module.exports = mongoose.model("Questions", QuestionSchema);
