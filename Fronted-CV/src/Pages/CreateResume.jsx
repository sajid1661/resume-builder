import { useState, useCallback, useContext, useEffect } from "react";
import axios from 'axios';
import { ShopContext } from "../Context/ShopContext.jsx";
import { toast } from "react-toastify";

// ─── Validation helpers ───────────────────────────────────────────────────────
const validators = {
  email: (v) => {
    const s = v.trim();
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(s)
      ? ""
      : "Email must be a Gmail address (example@gmail.com).";
  },

  phone: (v) =>
    /^\d{11}$/.test(v.trim())
      ? ""
      : "Phone must be exactly 11 digits (e.g. 03001122333).",

  // accept empty, or a GitHub profile URL, or a LinkedIn profile URL (common profile paths)
  linkedin: (v) => {
    const s = v.trim();
    if (!s) return "";
    const re = /^(https?:\/\/)?(www\.)?(github\.com\/[A-Za-z0-9_.-]+\/?|linkedin\.com\/(in|pub|profile)\/[A-Za-z0-9_-]+\/?)$/i;
    return re.test(s)
      ? ""
      : "Enter a valid GitHub or LinkedIn profile URL (e.g. https://github.com/yourname or https://linkedin.com/in/yourname).";
  },

  skills: (arr) =>
    arr.length > 0 ? "" : "Add at least one skill.",

  languages: (arr) =>
    arr.length > 0 ? "" : "Add at least one language.",

  education: (arr) =>
    arr.length > 0 &&
    arr.some(
      (e) =>
        e.degree.trim() &&
        e.institution.trim() &&
        e.startDate.trim() &&
        e.endDate.trim()
    )
      ? ""
      : "Add at least one complete education entry.",
};

// ─── Initial empty state ──────────────────────────────────────────────────────
const emptyData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  certificates: "",
  languages: [],
};

// ─── Shared style constants ───────────────────────────────────────────────────
const sectionHeading = (label) => (
  <div className="mb-3">
    <h3 className="text-left text-xs font-bold uppercase tracking-widest text-black">
      {label}
    </h3>
    <div className="mt-1 border-t border-slate-200" />
  </div>
);

const inputClass =
  "w-full border border-black/10 rounded-md px-3 py-2 text-sm text-black bg-white placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition";

const labelClass =
  "text-left block text-xs font-semibold text-black/60 mb-1 uppercase tracking-wide";

// ─── Error UI helpers ─────────────────────────────────────────────────────────
const errorClass = "mt-1 text-xs text-red-500 text-left";
const invalidBorder = "!border-red-400 focus:!ring-red-300";

// FieldError component: only shows after the field has been touched
const FieldError = ({ field, errors, touched }) =>
  errors[field] && touched[field] ? (
    <p className={errorClass}>{errors[field]}</p>
  ) : null;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [data, setData] = useState(emptyData);
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [languages, setLanguages] = useState(data.languages || []);
  const [loading, setLoading] = useState(false);

  // ── Validation state ──
  const [errors, setErrors] = useState({});
  // tracks which fields the user has interacted with (prevents pre-touch errors)
  const [touched, setTouched] = useState({});

  const { backendUrl, navigate, token, fetchResumes } = useContext(ShopContext);

  useEffect(() => {}, [token]);

  // ── Validate a single field and update errors state ──
  const validateField = useCallback((field, value) => {
    if (!validators[field]) return;
    const msg = validators[field](value);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  }, []);

  // ── Validate every field at once (called on submit) ──
  const validateAll = useCallback(() => {
    const next = {
      email: validators.email(data.email),
      phone: validators.phone(data.phone),
      linkedin: validators.linkedin(data.linkedin),
      skills: validators.skills(data.skills),
      languages: validators.languages(data.languages),
      education: validators.education(data.education),
    };
    setErrors(next);
    setTouched({
      email: true,
      phone: true,
      linkedin: true,
      skills: true,
      languages: true,
      education: true,
    });
    return Object.values(next).every((e) => e === "");
  }, [data]);

  // ── Stable field setter — also runs live validation on text fields ──
  const set = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setData((prev) => ({ ...prev, [field]: value }));
      if (validators[field]) validateField(field, value);
    },
    [validateField]
  );

  // ── Mark field touched + validate on blur ──
  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, data[field]);
    },
    [data, validateField]
  );

  // ── Skills ──
  const addSkillClick = useCallback(() => {
    const v = (skillInput || "").trim();
    if (!v) return;
    setData((prev) => {
      const updated = [...prev.skills, v];
      validateField("skills", updated);
      return { ...prev, skills: updated };
    });
    setSkillInput("");
  }, [skillInput, validateField]);

  const addSkill = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = skillInput.trim();
        if (!v) return;
        setData((prev) => {
          const updated = [...prev.skills, v];
          validateField("skills", updated);
          return { ...prev, skills: updated };
        });
        setSkillInput("");
      }
    },
    [skillInput, validateField]
  );

  const removeSkill = useCallback(
    (idx) => {
      setData((prev) => {
        const updated = prev.skills.filter((_, i) => i !== idx);
        validateField("skills", updated);
        return { ...prev, skills: updated };
      });
    },
    [validateField]
  );

  // ── Experience ──
  const setExp = useCallback((idx, field) => (e) => {
    const value = e.target.value;
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((ex, i) =>
        i === idx ? { ...ex, [field]: value } : ex
      ),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  }, []);

  const removeExperience = useCallback((idx) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }));
  }, []);

  // ── Education ──
  const setEdu = useCallback(
    (idx, field) => (e) => {
      const value = e.target.value;
      setData((prev) => {
        const updated = prev.education.map((ed, i) =>
          i === idx ? { ...ed, [field]: value } : ed
        );
        validateField("education", updated);
        return { ...prev, education: updated };
      });
    },
    [validateField]
  );

  const addEducation = useCallback(() => {
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", startDate: "", endDate: "", description: "" },
      ],
    }));
  }, []);

  const removeEducation = useCallback((idx) => {
    setData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));
  }, []);

  // ── Languages ──
  const addLanguageFromInput = useCallback(() => {
    const v = (languageInput || "").trim();
    if (!v) return;
    setLanguages((prev) => {
      const next = [...prev, v];
      setData((d) => {
        validateField("languages", next);
        return { ...d, languages: next };
      });
      return next;
    });
    setLanguageInput("");
  }, [languageInput, validateField]);

  const addLanguageKey = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addLanguageFromInput();
      }
    },
    [addLanguageFromInput]
  );

  const addLanguageClick = useCallback(
    () => addLanguageFromInput(),
    [addLanguageFromInput]
  );

  const removeLanguage = useCallback(
    (idx) => {
      setLanguages((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        setData((d) => {
          validateField("languages", next);
          return { ...d, languages: next };
        });
        return next;
      });
    },
    [validateField]
  );

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix all errors before submitting.");
      return;
    }

    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/resume/create-resume`,
        data,
        { headers: { token } }
      );
      if (response.data.success) {
        fetchResumes();
        toast.success(response.data.message);
        navigate("/");
      } else {
        toast.error(response.data.message);
        setLoading(false);
        navigate("/create-resume");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized access - please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }
      setLoading(false);
      toast.error("Failed to save resume.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 font-sans">
      {/* Header */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl font-extrabold text-black tracking-tight">
          Build Your <span className="text-black">CV</span>
        </h1>
        <p className="mt-2 text-black/60 text-sm max-w-md mx-auto">
          Fill in the sections below to create your professional resume.
        </p>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-6 items-start">
        {/* ─── LEFT: FORM ─── */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          className="w-full lg:w-1/2 flex flex-col gap-5"
        >
          {/* ── Personal Information ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm text-left font-bold text-black uppercase tracking-widest mb-4">
              Personal Information
            </h2>
            <div className="flex flex-col gap-3">

              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  required
                  value={data.fullName}
                  onChange={set("fullName")}
                  placeholder="Jane Doe"  
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input
                  className={`${inputClass} ${
                    touched.email && errors.email ? invalidBorder : ""
                  }`}
                  required
                  value={data.email}
                  onChange={set("email")}
                  onBlur={handleBlur("email")}
                  placeholder="jane@example.com"
                />
                <FieldError field="email" errors={errors} touched={touched} />
              </div>

              {/* Phone + Location */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Phone</label>
                  <input
                    className={`${inputClass} ${
                      touched.phone && errors.phone ? invalidBorder : ""
                    }`}
                    required
                    value={data.phone}
                    onChange={set("phone")}
                    onBlur={handleBlur("phone")}
                    placeholder="03001122333"
                  />
                  <FieldError field="phone" errors={errors} touched={touched} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    required
                    value={data.location}
                    onChange={set("location")}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* LinkedIn / GitHub */}
              <div>
                <label className={labelClass}>Github | LinkedIn Profile</label>
                <input
                  className={`${inputClass} ${
                    touched.linkedin && errors.linkedin ? invalidBorder : ""
                  }`}
                  value={data.linkedin}
                  onChange={set("linkedin")}
                  onBlur={handleBlur("linkedin")}
                  placeholder="https://github.com/yourname"
                />
                <FieldError field="linkedin" errors={errors} touched={touched} />
              </div>
            </div>
          </div>

          {/* ── Summary ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Summary
            </h2>
            <textarea
              className={`${inputClass} resize-none`}
              required
              rows={4}
              value={data.summary}
              onChange={set("summary")}
              placeholder="Write a short professional summary..."
            />
          </div>

          {/* ── Skills ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Skills
            </h2>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter…"
              />
              <button
                type="button"
                onClick={addSkillClick}
                className="px-3 py-2 bg-black text-white rounded-md cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-black/5 text-black text-xs font-semibold px-3 py-1 rounded-full border border-black/10"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="ml-1 text-black/50 hover:text-black text-xs leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {/* Skills error — shown after first add attempt or submit */}
            {touched.skills && errors.skills && (
              <p className={errorClass}>{errors.skills}</p>
            )}
          </div>

          {/* ── Work Experience ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Work Experience
            </h2>
            <div className="flex flex-col gap-5">
              {data.experience.map((exp, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Job Title</label>
                      <input
                        className={inputClass}
                        value={exp.title}
                        onChange={setExp(i, "title")}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Company</label>
                      <input
                        className={inputClass}
                        value={exp.company}
                        onChange={setExp(i, "company")}
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Start Date</label>
                      <input
                        className={inputClass}
                        value={exp.startDate}
                        onChange={setExp(i, "startDate")}
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>End Date</label>
                      <input
                        className={inputClass}
                        value={exp.endDate}
                        onChange={setExp(i, "endDate")}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      value={exp.description}
                      onChange={setExp(i, "description")}
                      placeholder="Describe your responsibilities…"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600 cursor-pointer border px-3  rounded-lg hover:bg-red-600 hover:text-white">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addExperience}
              className="mt-4 w-full text-sm font-semibold text-black border border-dashed border-black/10 rounded-md py-2 hover:bg-black/5 transition"
            >
              + Add Experience
            </button>
          </div>

          {/* ── Education ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Education
            </h2>
            <div className="flex flex-col gap-5">
              {data.education.map((edu, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Degree</label>
                      <input
                        className={inputClass}
                        value={edu.degree}
                        required
                        onChange={setEdu(i, "degree")}
                        placeholder="B.Sc. Computer Science"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Institution</label>
                      <input
                        className={inputClass}
                        value={edu.institution}
                        required
                        onChange={setEdu(i, "institution")}
                        placeholder="MIT"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Start Date</label>
                      <input
                        className={inputClass}
                        value={edu.startDate}
                        required
                        onChange={setEdu(i, "startDate")}
                        placeholder="Sep 2016"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>End Date</label>
                      <input
                        className={inputClass}
                        value={edu.endDate}
                        required
                        onChange={setEdu(i, "endDate")}
                        placeholder="May 2020"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>CGPA | GPA</label>
                    <input
                      className={inputClass}
                      value={edu.description}
                      onChange={setEdu(i, "description")}
                      required
                      placeholder="e.g. 3.8 / 4.0"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600 cursor-pointer border px-3  rounded-lg hover:bg-red-600 hover:text-white">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEducation}
              className="mt-4 w-full text-sm font-semibold text-black border border-dashed border-black/10 rounded-md py-2 hover:bg-black/5 transition"
            >
              + Add Education
            </button>
            {/* Education error */}
            {touched.education && errors.education && (
              <p className={errorClass}>{errors.education}</p>
            )}
          </div>

          {/* ── Certificates ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Certificates
            </h2>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={data.certificates}
              onChange={set("certificates")}
              placeholder="e.g. AWS Certified Developer – 2024"
            />
          </div>

          {/* ── Languages ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">
              Languages
            </h2>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={addLanguageKey}
                placeholder="Type a language and press Enter or click Add…"
              />
              <button
                type="button"
                onClick={addLanguageClick}
                className="px-3 py-2 bg-black text-white rounded-md cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {languages.map((lang, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-black/5 text-black text-xs font-semibold px-3 py-1 rounded-full border border-black/10"
                >
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(i)}
                    className="ml-1 text-black/50 hover:text-black text-xs leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {/* Languages error */}
            {touched.languages && errors.languages && (
              <p className={errorClass}>{errors.languages}</p>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="mt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md font-semibold hover:bg-gray-700 transition"
            >
              Save Resume
            </button>
          </div>
        </form>

        {/* ─── RIGHT: PREVIEW ─── */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
            {/* Preview Label Bar */}
            <div className="bg-white border-b border-black/10 px-5 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="ml-3 text-xs font-semibold text-black/60 uppercase tracking-widest">
                Live Preview
              </span>
            </div>

            {/* Resume Content */}
            <div className="p-8 text-black">
              {/* Name */}
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-black tracking-tight leading-tight">
                  {data.fullName || "Your Name"}
                </h1>
                {/* Contact row */}
                <p className="mt-2 text-xs text-black/60 flex flex-wrap justify-center gap-x-3 gap-y-1">
                  {data.email && <span>{data.email}</span>}
                  {data.email && data.phone && (
                    <span className="text-slate-300">|</span>
                  )}
                  {data.phone && <span>{data.phone}</span>}
                  {data.phone && data.location && (
                    <span className="text-slate-300">|</span>
                  )}
                  {data.location && <span>{data.location}</span>}
                  {data.location && data.linkedin && (
                    <span className="text-slate-300">|</span>
                  )}
                  {data.linkedin && (
                    <a href={data.linkedin} className="text-blue-500 hover:underline">{data.linkedin}</a>
                  )}
                </p>
              </div>

              {/* Summary */}
              {data.summary && (
                <div className="mb-7 text-left">
                  {sectionHeading("Summary")}
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {data.skills.length > 0 && (
                <div className="mb-7">
                  {sectionHeading("Skills")}
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {data.experience.some((e) => e.title || e.company) && (
                <div className="mb-7">
                  {sectionHeading("Work Experience")}
                  <div className="flex flex-col gap-4">
                    {data.experience.map((exp, i) =>
                      exp.title || exp.company ? (
                        <div key={i}>
                          <div className="flex justify-between items-baseline flex-wrap gap-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {exp.title || "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {[exp.startDate, exp.endDate]
                                .filter(Boolean)
                                .join(" – ")}
                            </span>
                          </div>
                          {exp.company && (
                            <p className="text-lg text-left text-blue-600 font-semibold mt-0.5">
                              {exp.company}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-xs text-left text-slate-600 mt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {data.education.some((e) => e.degree || e.institution) && (
                <div className="mb-7">
                  {sectionHeading("Education")}
                  <div className="flex flex-col gap-4">
                    {data.education.map((edu, i) =>
                      edu.degree || edu.institution ? (
                        <div key={i}>
                          <div className="flex justify-between items-baseline flex-wrap gap-1 mb-0.5">
                            {edu.institution && (
                              <p className="text-left text-blue-600 font-semibold mt-0.5">
                                {edu.institution}
                              </p>
                            )}
                            {edu.description && (
                              <p className="text-xs text-left text-slate-600 mt-1 leading-relaxed">
                                GPA: {edu.description}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-baseline flex-wrap gap-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {edu.degree || "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {[edu.startDate, edu.endDate]
                                .filter(Boolean)
                                .join(" – ")}
                            </span>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {data.certificates && (
                <div className="mb-7">
                  {sectionHeading("Certificates")}
                  <p className="text-sm text-left text-slate-700 leading-relaxed">
                    {data.certificates}
                  </p>
                </div>
              )}

              {/* Languages */}
              {data.languages && data.languages.length > 0 && (
                <div className="mb-4">
                  {sectionHeading("Languages")}
                  <div className="flex flex-wrap gap-2">
                    {data.languages.map((l, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
