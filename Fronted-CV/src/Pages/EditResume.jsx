// design the edit resume page which is similar to create resume page but with pre-filled data and an update button instead of create button

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../Context/ShopContext.jsx';
import { toast } from 'react-toastify';

// validation helpers (copied from CreateResume)
const validators = {
  email: (v) => {
    const s = (v || '').trim();
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(s)
      ? ''
      : 'Email must be a Gmail address (example@gmail.com).';
  },

  phone: (v) => (/^\d{11}$/.test((v || '').trim()) ? '' : 'Phone must be exactly 11 digits (e.g. 03001122333).'),

  linkedin: (v) => {
    const s = (v || '').trim();
    if (!s) return '';
    const re = /^(https?:\/\/)?(www\.)?(github\.com\/[A-Za-z0-9_.-]+\/?|linkedin\.com\/(in|pub|profile)\/[A-Za-z0-9_-]+\/?)$/i;
    return re.test(s)
      ? ''
      : 'Enter a valid GitHub or LinkedIn profile URL (e.g. https://github.com/yourname or https://linkedin.com/in/yourname).';
  },

  skills: (arr) => (Array.isArray(arr) && arr.length > 0 ? '' : 'Add at least one skill.'),

  languages: (arr) => (Array.isArray(arr) && arr.length > 0 ? '' : 'Add at least one language.'),

  education: (arr) =>
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.some((e) => e.degree?.trim() && e.institution?.trim() && e.startDate?.trim() && e.endDate?.trim())
      ? ''
      : 'Add at least one complete education entry.',
};

const sectionHeading = (label) => (
  <div className="mb-3">
    <h3 className="text-left text-xs font-bold uppercase tracking-widest text-black">{label}</h3>
    <div className="mt-1 border-t border-slate-200" />
  </div>
);

const inputClass =
  'w-full border border-black/10 rounded-md px-3 py-2 text-sm text-black bg-white placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition';
const labelClass = 'text-left block text-xs font-semibold text-black/60 mb-1 uppercase tracking-wide';
const errorClass = 'mt-1 text-xs text-red-500 text-left';
const invalidBorder = '!border-red-400 focus:!ring-red-300';

const FieldError = ({ field, errors, touched }) => (errors[field] && touched[field] ? <p className={errorClass}>{errors[field]}</p> : null);

export default function EditResume() {
  const { id } = useParams();
  const { resumeData = [], backendUrl, token, fetchResumes, navigate } = useContext(ShopContext);

  const empty = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    skills: [],
    languages: [],
    experience: [],
    education: [],
    certificates: '',
  };

  const [formData, setFormData] = useState(empty);
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // load resume into form when resumeData or id changes
  useEffect(() => {
    const r = (resumeData || []).find((x) => String(x._id) === String(id));
    if (r) {
      setFormData({
        fullName: r.fullName || '',
        email: r.email || '',
        phone: r.phone || '',
        location: r.location || '',
        linkedin: r.linkedin || '',
        summary: r.summary || '',
        skills: Array.isArray(r.skills) ? r.skills.slice() : [],
        languages: Array.isArray(r.languages) ? r.languages.slice() : [],
        experience: Array.isArray(r.experience)
          ? r.experience.map((e) => ({
              title: e.title || '',
              company: e.company || '',
              startDate: e.startDate || '',
              endDate: e.endDate || '',
              description: e.description || '',
            }))
          : [],
        education: Array.isArray(r.education)
          ? r.education.map((ed) => ({
              degree: ed.degree || '',
              institution: ed.institution || '',
              startDate: ed.startDate || '',
              endDate: ed.endDate || '',
              description: ed.description || '',
            }))
          : [],
        certificates: r.certificates || '',
      });
    }
  }, [resumeData, id]);

  // validation helpers
  const validateField = useCallback((field, value) => {
    if (!validators[field]) return;
    const msg = validators[field](value);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  }, []);

  const validateAll = useCallback(() => {
    const next = {
      email: validators.email(formData.email),
      phone: validators.phone(formData.phone),
      linkedin: validators.linkedin(formData.linkedin),
      skills: validators.skills(formData.skills),
      languages: validators.languages(formData.languages),
      education: validators.education(formData.education),
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
    return Object.values(next).every((e) => e === '');
  }, [formData]);

  // generic setter for top-level string fields with live validation
  const setField = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (validators[field]) validateField(field, value);
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, formData[field]);
    },
    [formData, validateField]
  );

  // experience handlers
  const setExp = useCallback((idx, field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setFormData((prev) => ({ ...prev, experience: [...prev.experience, { title: '', company: '', startDate: '', endDate: '', description: '' }] }));
  }, []);

  const removeExperience = useCallback((idx) => {
    setFormData((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }));
  }, []);

  // education handlers
  const setEdu = useCallback((idx, field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((ed, i) => (i === idx ? { ...ed, [field]: value } : ed)),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setFormData((prev) => ({ ...prev, education: [...prev.education, { degree: '', institution: '', startDate: '', endDate: '', description: '' }] }));
  }, []);

  const removeEducation = useCallback((idx) => {
    setFormData((prev) => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));
  }, []);

  // skills handlers
  const addSkill = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = (skillInput || '').trim();
      if (!v) return;
      setFormData((prev) => {
        const updated = [...prev.skills, v];
        validateField('skills', updated);
        return { ...prev, skills: updated };
      });
      setSkillInput('');
    }
  }, [skillInput, validateField]);

  const addSkillClick = useCallback(() => {
    const v = (skillInput || '').trim();
    if (!v) return;
    setFormData((prev) => {
      const updated = [...prev.skills, v];
      validateField('skills', updated);
      return { ...prev, skills: updated };
    });
    setSkillInput('');
  }, [skillInput, validateField]);

  const removeSkill = useCallback((idx) => {
    setFormData((prev) => {
      const updated = prev.skills.filter((_, i) => i !== idx);
      validateField('skills', updated);
      return { ...prev, skills: updated };
    });
  }, [validateField]);

  // languages handlers
  const addLanguageFromInput = useCallback(() => {
    const v = (languageInput || '').trim();
    if (!v) return;
    setFormData((prev) => {
      const next = [...prev.languages, v];
      validateField('languages', next);
      return { ...prev, languages: next };
    });
    setLanguageInput('');
  }, [languageInput, validateField]);

  const addLanguageKey = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLanguageFromInput();
    }
  }, [addLanguageFromInput]);

  const removeLanguage = useCallback((idx) => {
    setFormData((prev) => {
      const next = prev.languages.filter((_, i) => i !== idx);
      validateField('languages', next);
      return { ...prev, languages: next };
    });
  }, [validateField]);

  // prevent Enter from submitting form outside textareas
  const onKeyDownPrevent = (e) => {
    if (e.key === 'Enter') {
      if (e.target && e.target.tagName !== 'TEXTAREA') e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please fix all errors before submitting.');
      return;
    }

    try {
      const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };
      const res = await axios.put(`${backendUrl}/api/resume/edit-resume/${id}`, formData, config);
      if (res.data && res.data.success) {
        toast.info('Resume updated successfully.');
        fetchResumes && fetchResumes();
        navigate && navigate(`/resume/${id}`);
      } else {
        toast.error(res.data?.message || 'Failed to update resume.');
      }
    } catch (err) {
      console.error('Update error', err);
      if (err?.response?.status === 401) {
        toast.error('Unauthorized - please login.');
        navigate && navigate('/login');
        return;
      }
      toast.error('Failed to update resume.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-slate-100 font-sans">
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl font-extrabold text-black tracking-tight">Edit Your <span className="text-black">CV</span></h1>
        <p className="mt-2 text-black/60 text-sm max-w-md mx-auto">Modify the fields below to update your resume.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-6 items-start">
        <form onSubmit={handleSubmit} onKeyDown={onKeyDownPrevent} className="w-full lg:w-1/2 flex flex-col gap-5">
          {/* Personal Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm text-left font-bold text-black uppercase tracking-widest mb-4">Personal Information</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelClass}>Full Name</label>
                <input className={`${inputClass}`} name="fullName" value={formData.fullName} onChange={setField('fullName')} placeholder="Jane Doe" required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={`${inputClass} ${touched.email && errors.email ? invalidBorder : ''}`} name="email" value={formData.email} onChange={setField('email')} onBlur={handleBlur('email')} placeholder="jane@example.com" required />
                <FieldError field="email" errors={errors} touched={touched} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Phone</label>
                  <input className={`${inputClass} ${touched.phone && errors.phone ? invalidBorder : ''}`} name="phone" value={formData.phone} onChange={setField('phone')} onBlur={handleBlur('phone')} placeholder="0300-8899123" required />
                  <FieldError field="phone" errors={errors} touched={touched} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} name="location" value={formData.location} onChange={setField('location')} placeholder="City, Country" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Github|LinkedIn Profile</label>
                <input className={`${inputClass} ${touched.linkedin && errors.linkedin ? invalidBorder : ''}`} name="linkedin" value={formData.linkedin} onChange={setField('linkedin')} onBlur={handleBlur('linkedin')} placeholder="github.com/yourname | linkedin.com/in/yourname" />
                <FieldError field="linkedin" errors={errors} touched={touched} />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Summary</h2>
            <textarea className={`${inputClass} resize-none`} name="summary" rows={4} value={formData.summary} onChange={setField('summary')} placeholder="Write a short professional summary..." />
          </div>

          {/* Skills */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Skills</h2>
            <div className="flex gap-2">
              <input className={inputClass} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter…" />
              <button type="button" onClick={addSkillClick} className="px-3 py-2 bg-black text-white rounded-md">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-black/5 text-black text-xs font-semibold px-3 py-1 rounded-full border border-black/10">
                  {skill}
                  <button type="button" onClick={() => removeSkill(i)} className="ml-1 text-black/50 hover:text-black text-xs leading-none">×</button>
                </span>
              ))}
            </div>
            <FieldError field="skills" errors={errors} touched={touched} />
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Work Experience</h2>
            <div className="flex flex-col gap-5">
              {formData.experience.map((exp, i) => (
                <div key={i} className="flex flex-col gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Job Title</label>
                      <input className={inputClass} value={exp.title} required onChange={setExp(i, 'title')} placeholder="Software Engineer" />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Company</label>
                      <input className={inputClass} value={exp.company} required onChange={setExp(i, 'company')} placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Start Date</label>
                      <input className={inputClass} value={exp.startDate} required onChange={setExp(i, 'startDate')} placeholder="Jan 2020" />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>End Date</label>
                      <input className={inputClass} value={exp.endDate} required onChange={setExp(i, 'endDate')} placeholder="Present" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea className={`${inputClass} resize-none`} rows={3} value={exp.description} onChange={setExp(i, 'description')} placeholder="Describe your responsibilities…" />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeExperience(i)} className="text-sm text-red-600 cursor-pointer border px-3  rounded-lg hover:bg-red-600 hover:text-white">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addExperience} className="mt-4 w-full text-sm font-semibold text-black border border-dashed border-black/10 rounded-md py-2 hover:bg-black/5 transition">+ Add Experience</button>
          </div>

          {/* Education */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Education</h2>
            <div className="flex flex-col gap-5">
              {formData.education.map((edu, i) => (
                <div key={i} className="flex flex-col gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Degree</label>
                      <input className={inputClass} value={edu.degree} required onChange={setEdu(i, 'degree')} placeholder="B.Sc. Computer Science" />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Institution</label>
                      <input className={inputClass} value={edu.institution} required onChange={setEdu(i, 'institution')} placeholder="MIT" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Start Date</label>
                      <input className={inputClass} value={edu.startDate} required onChange={setEdu(i, 'startDate')} placeholder="Sep 2016" />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>End Date</label>
                      <input className={inputClass} value={edu.endDate} required onChange={setEdu(i, 'endDate')} placeholder="May 2020" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>CGPA|GPA</label>
                    <input className={inputClass} value={edu.description} required onChange={setEdu(i, 'description')} placeholder="CGPA|GPA" />
                  </div>
                  <div className="flex justify-end ">
                    <button type="button" onClick={() => removeEducation(i)} className="text-sm text-red-600 cursor-pointer border px-3  rounded-lg hover:bg-red-600 hover:text-white">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addEducation} className="mt-4 w-full text-sm font-semibold text-black border border-dashed border-black/10 rounded-md py-2 hover:bg-black/5 transition">+ Add Education</button>
          </div>

          {/* Certificates */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Certificates</h2>
            <textarea className={`${inputClass} resize-none`} rows={3} value={formData.certificates} onChange={setField('certificates')} placeholder="e.g. AWS Certified Developer – 2024" />
          </div>

          {/* Languages */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-left text-sm font-bold text-black uppercase tracking-widest mb-4">Languages</h2>
            <div className="flex gap-2">
              <input className={inputClass} value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} onKeyDown={addLanguageKey} placeholder="Type a language and press Enter or click Add…" />
              <button type="button" onClick={addLanguageFromInput} className="px-3 py-2 bg-black text-white rounded-md">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.languages.map((lang, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-black/5 text-black text-xs font-semibold px-3 py-1 rounded-full border border-black/10">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(i)} className="ml-1 text-black/50 hover:text-black text-xs leading-none">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-800 transition">Update Resume</button>
          </div>
        </form>

        {/* Preview */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
            <div className="bg-white border-b border-black/10 px-5 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
              <span className="ml-3 text-xs font-semibold text-black/60 uppercase tracking-widest">Live Preview</span>
            </div>
            <div className="p-8 text-black">
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-black tracking-tight leading-tight">{formData.fullName || 'Your Name'}</h1>
                <p className="mt-2 text-xs text-black/60 flex flex-wrap gap-x-3 gap-y-1">
                  {formData.email && <span>{formData.email}</span>}
                  {formData.email && formData.phone && <span className="text-slate-300">|</span>}
                  {formData.phone && <span>{formData.phone}</span>}
                  {formData.phone && formData.location && <span className="text-slate-300">|</span>}
                  {formData.location && <span>{formData.location}</span>}
                  {formData.location && formData.linkedin && <span className="text-slate-300">|</span>}
                  {formData.linkedin && <span className="text-black">{formData.linkedin}</span>}
                </p>
              </div>

              {formData.summary && (
                <div className="mb-7 text-left">{sectionHeading('Summary')}<p className="text-sm text-slate-700 leading-relaxed">{formData.summary}</p></div>
              )}

              {formData.skills.length > 0 && (
                <div className="mb-7">{sectionHeading('Skills')}<div className="flex flex-wrap gap-2">{formData.skills.map((s, i) => (<span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200">{s}</span>))}</div></div>
              )}

              {formData.experience.some((e) => e.title || e.company) && (
                <div className="mb-7">{sectionHeading('Work Experience')}<div className="flex flex-col gap-4">{formData.experience.map((exp, i) => exp.title || exp.company ? (<div key={i}><div className="flex justify-between items-baseline flex-wrap gap-1"><span className="text-sm font-semibold text-slate-900">{exp.title || '—'}</span><span className="text-xs text-slate-400">{[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</span></div>{exp.company && (<p className="text-lg text-left text-blue-600 font-semibold mt-0.5">{exp.company}</p>)}{exp.description && (<p className="text-xs text-left text-slate-600 mt-1 leading-relaxed">{exp.description}</p>)}</div>) : null)}</div></div>
              )}

              {formData.education.some((e) => e.degree || e.institution) && (
                <div className="mb-7">{sectionHeading('Education')}<div className="flex flex-col gap-4">{formData.education.map((edu, i) => edu.degree || edu.institution ? (<div key={i}><div className="flex justify-between items-baseline flex-wrap gap-1 mb-0.5">{edu.institution && (<p className="text-left text-blue-600 font-semibold mt-0.5">{edu.institution}</p>)}{edu.description && (<p className="text-xs text-left text-slate-600 mt-1 leading-relaxed">{edu.description}</p>)}</div><div className="flex justify-between items-baseline flex-wrap gap-1"><span className="text-sm font-semibold text-slate-900">{edu.degree || '—'}</span><span className="text-xs text-slate-400">{[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}</span></div></div>) : null)}</div></div>
              )}

              {formData.certificates && (<div className="mb-7">{sectionHeading('Certificates')}<p className="text-sm text-left text-slate-700 leading-relaxed">{formData.certificates}</p></div>)}

              {formData.languages && formData.languages.length > 0 && (<div className="mb-4">{sectionHeading('Languages')}<div className="flex flex-wrap gap-2">{formData.languages.map((l, i) => (<span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium border border-slate-200">{l}</span>))}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
