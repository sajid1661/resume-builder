import mongoose from 'mongoose';
const { Schema } = mongoose;

// Sub-schemas matching frontend shape (start/end as strings to match free-form input)
const ExperienceSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 200 },
    startDate: { type: String, trim: true, maxlength: 100 },
    endDate: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    degree: { type: String, trim: true, maxlength: 200 },
    institution: { type: String, trim: true, maxlength: 200 },
    startDate: { type: String, trim: true, maxlength: 100 },
    endDate: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

// Optional languages sub-schema if you later add it on the frontend
const LanguageSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false }
);

// Main Resume schema matching `data` object sent from frontend CreateResume.jsx
const ResumeSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    location: { type: String, trim: true, maxlength: 100 },
    linkedin: {
      type: String,
      trim: true,
      maxlength: 2083
    },

    summary: { type: String, trim: true, maxlength: 4000 },

    skills: { type: [String], default: [] },

    experience: { type: [ExperienceSchema], default: [] },

    education: { type: [EducationSchema], default: [] },

    certificates: { type: String, trim: true, default: '' },

    languages: { type: [String], default: [] },
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for quick lookup
ResumeSchema.index({ fullName: 1 });
ResumeSchema.index({ email: 1 });

const resumeModel = mongoose.models.resume || mongoose.model('resume', ResumeSchema);

export default resumeModel;
