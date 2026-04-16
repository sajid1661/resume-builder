import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext.jsx';
import axios from 'axios';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {toast} from 'react-toastify';

export default function ResumeDetail() {
  const { resumeData, navigate, backendUrl, token, fetchResumes } = useContext(ShopContext);
  const { id } = useParams();

  // always resolve resume by id from context
  const resume = (resumeData || []).find((r) => String(r._id) === String(id));

  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="w-fit text-lg font-semibold px-8 sm:px-11 py-2 bg-gray-100 text-black rounded-2xl cursor-pointer hover:bg-gray-300">← Back</button>
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <p className="text-left text-sm text-black/70">Resume not found.</p>
        </div>
      </div>
    );
  }

  const {
    fullName,
    email,
    phone,
    location,
    linkedin,
    summary,
    skills = [],
    languages = [],
    experience = [],
    education = [],
    certificates
  } = resume;

  // handle delete action using axios to call backend API and then navigate back to dashboard
  const handleDelete = async (resumeId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/resume/resumes/${resumeId}`, { headers: { token } });
      if (response.data.success) {
        toast.error("Resume deleted successfully.");
        fetchResumes();
        navigate("/");
      } else {
        toast.error("Failed to delete resume.");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume.");
    }
  };

  const handleDownload = async () => {
  const element = document.getElementById("resume-preview");

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",

    onclone: (doc) => {
      const elements = doc.querySelectorAll("*");

      elements.forEach((el) => {
        // REMOVE problematic styles
        el.style.boxShadow = "none";

        // FORCE SAFE COLORS
        el.style.color = "#000000";
        el.style.backgroundColor = "#ffffff";
        el.style.borderColor = "#000000";
      });
    },
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save("resume.pdf");
}

  return (
    <div className="max-w-4xl mx-auto max-[400px]:p-3 p-6">
      <div className=" flex gap-3 justify-between mb-4 ">
        <button onClick={() => navigate(-1)} className="w-fit text-lg font-semibold px-8 sm:px-11 py-2 bg-gray-100 text-black rounded-2xl cursor-pointer hover:bg-gray-300">← Back</button>
        <button onClick={handleDownload} className="w-fit text-lg font-semibold px-2 sm:px-6 py-2 bg-gray-100 text-black rounded-2xl cursor-pointer hover:bg-gray-300">
          Download CV
        </button>
        </div>
      <div className="bg-white text-black border border-gray-200 rounded-lg shadow-md max-[400px]:p-3 p-6" id="resume-preview">
        {/* Header */}
        <div className="mb-4 text-left">
          <h1 className="text-center max-[400px]:text-2xl text-3xl font-bold text-black leading-tight">{fullName || 'Your Name'}</h1>

          <p className="mt-2  text-xs sm:text-base text-black/60 flex justify-center flex-wrap gap-x-3 gap-y-1">
            {email && <span>{email}</span>}
            {email && phone && <span className="text-black/30">|</span>}
            {phone && <span>{phone}</span>}
            {phone && location && <span className="text-black/30">|</span>}
            {location && <span>{location}</span>}
            {location && linkedin && <span className="text-black/30">|</span>}
            {linkedin && (
              <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-blue-500 hover:underline">
                {linkedin}
              </a>
            )}
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Summary</h3>
            <hr className="border-black my-2" />
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Skills</h3>
            <hr className="border-black my-2" />
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gray-200 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Work Experience</h3>
            <hr className="border-black my-2" />
            <div className="flex flex-col gap-4">
              {experience.map((exp, i) =>
                exp.title || exp.company ? (
                  <div key={i}>
                    <div className="flex justify-between items-baseline flex-wrap p-1 gap-1 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{exp.title || '—'}</span>
                      <span className="text-xs text-gray-400">{[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</span>
                    </div>
                    {exp.company && (
                      <p className="text-lg text-left text-blue-600 font-semibold">{exp.company}</p>
                    )}
                    {exp.description && (
                      <p className="text-xs text-left text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Education</h3>
            <hr className="border-black my-2" />
            <div className="flex flex-col gap-3">
              {education.map((edu, i) => (
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
                            <span className="max-[400px]:text-xs     text-sm font-semibold text-slate-900">
                              {edu.degree || "—"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                            </span>
                          </div>
                          
                        </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Certificates</h3>
            <hr className="border-black my-2" />
            <p className="text-sm text-gray-700">{certificates}</p>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="mb-4 text-left">
            <h3 className="text-left text-sm font-semibold uppercase">Languages</h3>
            <hr className="border-black my-2" />
            <div className="flex flex-wrap gap-2">
              {languages.map((l, i) => (
                <span key={i} className="px-2 py-1 bg-gray-200 rounded-full text-sm">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 sm:text-sm md:text-base flex items-center justify-between sm:justify-around">
        <button onClick={() => navigate(`/edit-resume/${id}`)} className="px-11 sm:px-14 py-2 bg-blue-500 text-white rounded-2xl cursor-pointer hover:bg-blue-700">Edit</button>
        <button onClick={() => handleDelete(id)} className="px-11  sm:px-14 py-2 bg-red-600 text-white rounded-2xl cursor-pointer hover:bg-red-700">
          Delete
        </button>
      </div>
    </div>
  );
}
