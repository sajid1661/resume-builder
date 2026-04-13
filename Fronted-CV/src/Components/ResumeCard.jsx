//Resume Card.

import React from 'react';

export default function ResumeCard({ name, experience }) {
  const hasName = Boolean(name && String(name).trim());
  const hasExperience = experience && typeof experience === 'object' && (experience.title || experience.company);

  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-lg hover:scale-105 transform transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10"
    >
      <h3 className="text-lg font-semibold text-black">{hasName ? name : 'No Name'}</h3>

      {hasExperience ? (
        <div className="mt-2 text-sm text-black/80">
          {experience.title && <div className="font-medium">{experience.title}</div>}
          {experience.company ? (
            <div className="text-black/60">{experience.company}</div>
          ) : (
            <div className="text-black/60">user Not have experience any company</div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-black/60">user Not have experience any company</p>
      )}
    </div>
  );
}
