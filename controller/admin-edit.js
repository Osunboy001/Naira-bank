



   
   const myUser = require('../model/user')



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

    if (name) user.name = name;
    if (email) user.email = email;

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