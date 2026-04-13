import express from 'express';
import { createResume,getResumes,deleteResume,editResume } from '../controllers/resumeController.js';
import authUser from '../middleware/auth.js';

const resumeRoute= express.Router();


resumeRoute.post('/create-resume',authUser, createResume);
resumeRoute.get('/get-resumes', authUser, getResumes);
resumeRoute.delete('/resumes/:id', authUser,deleteResume);
resumeRoute.put('/edit-resume/:id', authUser, editResume);

export default resumeRoute;
