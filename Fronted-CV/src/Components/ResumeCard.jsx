import React from 'react';

export default function ResumeCard({ resume }) {
  if (!resume) return null;

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
    certificates,
  } = resume;

  return (
    <div
      className="text-left bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
      style={{ width: '250px', height: '260px' }}
    >
      <div className="px-2 pt-1.5 pb-1 h-full flex flex-col gap-[2px] overflow-hidden">

        {/* Header */}
        <div className="text-center leading-tight">
          <p className="text-[9px] font-bold text-gray-900 truncate">{fullName}</p>
          <p className="text-[7px] text-gray-500 truncate">
            {[email, phone, location].filter(Boolean).join(' | ')}
          </p>
          {linkedin && (
            <p className="text-[7px] text-blue-500 truncate">{linkedin}</p>
          )}
        </div>

        <hr className="border-gray-200 my-[1px]" />

        {/* Summary */}
        {summary && (
          <div>
            <p className="text-[8px] mb-[1px] font-semibold uppercase text-gray-800 leading-tight">Summary</p>
            <p className="text-[7px] text-gray-600 leading-tight line-clamp-2">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className='mb-1'>
            <p className="text-[8px] font-semibold uppercase text-gray-800 leading-tight mb-0.5">Skills</p>
            <div className="flex flex-wrap gap-[2px]">
              {skills.slice(0,10).map((s, i) => (
                <span key={i} className="px-1 py-[1px] bg-gray-100 text-gray-700 text-[6px] rounded leading-tight truncate max-w-[70px]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <p className="text-[8px] font-semibold uppercase text-gray-800 leading-tight mb-1">Experience</p>
            {experience.slice().map((exp, i) =>
              exp.title || exp.company ? (
                <div key={i} className="flex justify-between items-baseline gap-1 mb-1">
                  <div className="overflow-hidden">
                    <p className="text-[7px] font-semibold text-gray-800 truncate leading-tight">{exp.title}</p>
                    <p className="text-[7px] text-blue-500 truncate leading-tight">{exp.company}</p>
                  </div>
                  <p className="text-[6px] text-gray-400 leading-tight shrink-0">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                  </p>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <p className="text-[8px] font-semibold uppercase text-gray-800 leading-tight mb-1">Education</p>
            {education.slice(0, 1).map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline gap-1 mb-[1px]">
                <div className="overflow-hidden">
                  <p className="text-[7px] font-semibold text-gray-800 truncate leading-tight">{edu.degree}</p>
                  <p className="text-[7px] text-blue-500 truncate leading-tight">{edu.institution}</p>
                </div>
                <p className="text-[6px] text-gray-400 leading-tight shrink-0">
                  {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className='mb-1'>
            <p className="text-[7px] font-semibold uppercase text-gray-800 leading-tight mb-0.5">Languages</p>
            <div className="flex flex-wrap gap-[2px]">
              {languages.slice().map((l, i) => (
                <span key={i} className="px-1 py-[1px] bg-blue-50 text-blue-600 text-[6px] rounded leading-tight">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates && (
          <div>
            <p className="text-[7px] font-semibold uppercase text-gray-800 leading-tight mb-0.5">Certificates</p>
            <p className="text-[7px] text-gray-600 leading-tight truncate">{certificates}</p>
          </div>
        )}

      </div>
    </div>
  );
}