const bcrypt = require('bcrypt');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');

let refreshTokensArr = [];
const authController = {
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Create User
            const newUser = new User({
                username: req.body.username,
                fullname: req.body.fullname,
                email: req.body.email,
                password: hashed
            });

            //Save to database
            await newUser.save()
            res.status(200).json("Đăng ký thành công");
        } catch (error) {
            res.status(500).json("Tên tài khoản đã tồn tại");
        }
    },
    //UPdate PASSWORD
    changePassword: async (req, res) => {
        try {
            const newPassword = req.body.passWord;
            // Tìm người dùng trong database
            const user = await User.findById(req.body.id);

            // Tạo mật khẩu mới và lưu vào database
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            await user.save();

            res.status(200).json("Đổi mật khẩu thành công");
        } catch (error) {
            res.status(500).json(error);
        }
    },
    //DELETE User
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Kiểm tra xem người dùng có tồn tại và có phải là người dùng không phải admin không
            const userToDelete = await User.findById(userId);
            if (!userToDelete || userToDelete.admin) {
                return res.status(404).json("Người dùng không tồn tại hoặc không thể xóa.");
            }
            // Xóa người dùng
            await User.findByIdAndDelete(userId);

            res.status(200).json("Xóa người dùng thành công");
        } catch (error) {
            res.status(500).json(error);
        }
    },

    //ge,nerate access token
    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            admin: user.admin
        }, process.env.JWT_ACCESS_KEY,
            { expiresIn: "15s" }
        );
    },
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin
            }, process.env.JWT_REFRESHTOKEN_KEY,
            { expiresIn: "365d" }
        );
    },
    //Login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json("wrong username!");
            }
            const validPassword = await bcrypt.compare(
                req.body.password, user.password
            );

            if (!validPassword) {
                return res.status(404).json("Wrong password!");
            }
            if (user && validPassword) {

                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                refreshTokensArr.push(refreshToken);
                const { password, ...others } = user._doc;
                res.status(200).json({ ...others, accessToken, refreshToken });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },
    logoutUser: async (req, res) => {
        res.clearCookie("refreshToken");
        refreshTokensArr = refreshTokensArr.filter(token => token !== req.cookies.refreshToken);
        res.status(200).json("Logged out!!!");
    },
    requestRefreshToken: async (req, res) => {
        const refreshToken = req.body.token;
        if (!refreshToken) return res.status(401).json("you're not authenticated");
        if (!refreshToken.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_KEY, (err, user) => {
            if (err) {
                console.log(err);
            }
            refreshTokensArr = refreshTokensArr.filter((token) => token !== refreshToken);
            const newAccessToken = authController.generateAccessToken(user);
            const newRefreshToken = authController.generateRefreshToken(user);
            refreshTokensArr.push(newRefreshToken);
            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        })
    }
}
module.exports = authController;
