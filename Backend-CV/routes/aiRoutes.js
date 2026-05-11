import express from 'express';
import { summaryGenerate,workDescriptionGenerate,ATSScore } from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/generator', summaryGenerate);
aiRouter.post('/work-description-generator', workDescriptionGenerate);
aiRouter.post('/ATS-score-checker',ATSScore)

export default aiRouter;