const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

}, {
    timestamps: {
        currentTime: () => new Date(Date.now() + 7 * 60 * 60 * 1000) // Đặt múi giờ +7
    }
});

module.exports = mongoose.model('Subjects', SubjectSchema);