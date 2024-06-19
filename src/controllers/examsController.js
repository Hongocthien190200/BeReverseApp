const { Document, Packer, Paragraph, TextRun, Header, AlignmentType, ImageRun } = require('docx');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp'); // Thêm thư viện tmp để xử lý tệp tạm thời
const os = require('os');

const Questions = require("../Models/Questions");
const Exam = require('../Models/Exams');
const { format, addHours } = require('date-fns');

const currentDateTime = addHours(new Date(), 7);
const formattedDate = format(currentDateTime, 'dd-MM-yyyy');

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const examsController = {
    create: async (req, res) => {
        try {
            const { selectedSubjects, numExams, title } = req.body;

            let allQuestions = [];

            for (const subject of selectedSubjects) {
                const questions = await Questions.find({ subject_id: subject.subjectId }).limit(subject.numQuestions).lean();
                allQuestions.push(...questions);
            }

            const exams = [];
            for (let i = 0; i < numExams; i++) {
                const shuffledQuestions = shuffleArray([...allQuestions]);
                const examQuestions = shuffledQuestions.map(question => {
                    const options = shuffleArray([
                        question.option1,
                        question.option2,
                        question.option3,
                        question.option4,
                    ]).filter(Boolean);
                    return {
                        question_id: question._id,
                        question_text: question.question_text,
                        options,
                        correct_option: options.indexOf(question[`option${question.correct_option}`]) + 1,
                        image_filename: question.image_filename,
                    };
                });
                exams.push(examQuestions);
            }
            const savedExams = [];
            for (let i = 0; i < numExams; i++) {
                const newExam = new Exam({
                    title: `${title} - Đề số: ${i + 1}`,
                    questions: exams[i],
                });
                savedExams.push(newExam);
            }

            const doc = new Document({
                sections: savedExams.map((exam, index) => {
                    const answerKey = exam.questions.map((question, qIndex) => {
                        return `${qIndex + 1}.${String.fromCharCode(65 + question.correct_option - 1)}`;
                    }).join(', ');
                    return {
                        headers: {
                            default: new Header({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: 'TRUNG TÂM ỨNG PHÓ SỰ CỐ MÔI TRƯỜNG VIỆT NAM',
                                                size: 20,
                                            }),
                                            new TextRun({
                                                text: '10E Đường Bùi Văn Ba, Phường Tân Thuận Đông, Quận 7, Thành Phố Hồ Chí Minh',
                                                size: 20,
                                                break: 1,
                                            }),
                                            new TextRun({
                                                text: 'Hotline: 1800 6558 / Web: sosmoitruong.com / Di động: 0945440022 / Email: phucle@sosmoitruong.com',
                                                size: 20,
                                                break: 1,
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: 'BÀI KIỂM TRA',
                                        bold: true,
                                        size: 26,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: 'NHÂN SỰ THỬ VIỆC LÊN TẬP SỰ',
                                        bold: true,
                                        size: 26,
                                        break: 1,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'Họ và tên:______________________________________Nam/Nữ:____________',
                                        size: 26,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: 'Ngày sinh:_________________________________________________________',
                                        size: 26,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: 'Phòng ban:_________________________________________________________',
                                        size: 26,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: 'Chức vụ:___________________________________________________________',
                                        size: 26,
                                        break: 1,
                                    }),
                                    new TextRun({
                                        text: 'ĐTDĐ:______________________________________________________________',
                                        break: 1,
                                        size: 26,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Mã đề: ${index + 1}`,
                                        bold: true,
                                        size: 26,
                                        break: 1,
                                    }),
                                ],
                            }),
                            ...exam.questions.flatMap((question, qIndex) => {
                                const questionParagraphs = [
                                    new Paragraph({
                                        spacing: { line: 276 },
                                        children: [
                                            new TextRun({
                                                text: `${qIndex + 1}. ${question.question_text}`,
                                                bold: true,
                                                size: 26,
                                            }),
                                        ],
                                    }),
                                ];

                                if (question.image_filename) {
                                    const imagePath = path.resolve(__dirname, '../uploads', question.image_filename);
                                    if (fs.existsSync(imagePath)) {
                                        questionParagraphs.push(new Paragraph({
                                            children: [
                                                new ImageRun({
                                                    data: fs.readFileSync(imagePath),
                                                    transformation: {
                                                        width: "256",
                                                        height: "144",
                                                    },
                                                }),
                                            ],
                                        }));
                                    }
                                }

                                const optionParagraphs = question.options.map((option, oIndex) => (
                                    new Paragraph({
                                        spacing: { line: 276 },
                                        children: [
                                            new TextRun({
                                                text: `${String.fromCharCode(65 + oIndex)}. ${option}`,
                                                size: 26,
                                            }),
                                        ],
                                    })
                                ));

                                return questionParagraphs.concat(optionParagraphs);
                            }),
                            new Paragraph({
                                spacing: { line: 276 },
                                children: [
                                    new TextRun({
                                        text: `Đáp án: ${answerKey}`,
                                        bold: true,
                                        size: 26,
                                        break: 1,
                                    }),
                                ],
                            }),
                        ],
                    }
                }),
            });

            const buffer = await Packer.toBuffer(doc);
            const tmpFile = tmp.fileSync({ postfix: '.docx' }); // Tạo tệp tạm thời với đuôi .docx
            fs.writeFileSync(tmpFile.name, buffer);

            res.download(tmpFile.name, `De-thi-chuyen-vien-${formattedDate}.docx`, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send({ message: 'Error downloading file', error: err });
                }

                tmpFile.removeCallback(); // Xóa tệp tạm thời sau khi gửi xong
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Error creating exam', error: err });
        }
    },
};

module.exports = examsController;
