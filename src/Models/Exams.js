const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    questions: [{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Questions",
            required: true,
        },
        question_text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct_option: { type: Number, required: true },
        image_filename: { type: String },
    }],
    created_at: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 60 * 60 * 1000), // Đặt múi giờ +7
    },
});

module.exports = mongoose.model('Exams', ExamSchema);
