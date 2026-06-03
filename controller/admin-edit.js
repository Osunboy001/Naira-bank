const myUser = require('../model/user')
const path = require('path')
const fs = require('fs')

const getSingleUser = async (req, res) => {
  try {
    const user = await myUser.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await myUser.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name and email for me
    if (name) user.name = name;
    if (email) user.email = email;

    // Handle image upload
    if (req.file) {
      // Delete old image for me if exists
      
      if (user.profilePicture) {
const oldImagePath = path.join(__dirname, '../public', user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

     
      const imagePath = `/uploads/${req.file.filename}`;
      user.profilePicture = imagePath;
    }

    await user.save();
    
    res.json({
      message: "User updated successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSingleUser,
  updateUser
}