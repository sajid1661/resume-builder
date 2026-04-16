
import resumeModel from "../models/resumeModel.js";
const createResume = async (req, res) => {
  try{
    const resume = await resumeModel.create({...req.body, userId: req.userId});
    res.status(201).json({
      success: true,
      message: "Resume created successfully"
    });
  } catch (error) {
    console.error("Error creating resume:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getResumes = async (req, res) => {
  try {
    const resumes = await resumeModel.find({userId: req.userId});
    if (resumes.length === 0) {
      return res.status(200).json({
        success: true,
        resumes: [] // 👈 important
      });
    }
    res.status(200).json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resumes." });
  }
};

// delete resume by id
const deleteResume = async (req, res) => {
  const resumeId = req.params.id;
  try {
    const result = await resumeModel.findOneAndDelete({ _id: resumeId, userId: req.userId });
    if (result) {
      res.status(200).json({ success: true, message: "Resume deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "Resume not found." });
    }
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ success: false, message: "Failed to delete resume." });
  }
};

const editResume = async (req, res) => {
  const resumeId = req.params.id;
  const updatedData = req.body;

  try {
    const result = await resumeModel.findOneAndUpdate({ _id: resumeId}, updatedData, { returnDocument: "after" });
    if (result) {
      res.status(200).json({ success: true, message: "Resume updated successfully.", resume: result });
    } else {
      res.status(404).json({ success: false, message: "Resume not found." });
    }
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ success: false, message: "Failed to update resume." });
  }
};

export { createResume, getResumes, deleteResume, editResume };
