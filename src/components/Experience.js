import React from 'react';

const job = {
  title: 'Frontend intern, React developer',
  company: 'Spontaneous Enterprise',
  period: 'Dec 2025 to Apr 2026',
  type: 'Internship',
  points: [
    'Developed and maintained a scalable CRM platform for managing leads, tasks and administrative workflows',
    'Implemented the full lead lifecycle: creation, assignment, status tracking and conversion',
    'Designed modular, reusable React components to keep the codebase maintainable',
    'Integrated secure REST APIs with authentication and role-based access control',
    'Built dashboards with search, filtering, pagination and structured data tables',
  ],
  stack: ['React', 'REST API', 'JavaScript', 'CSS'],
};

const Experience = () => (
  <section className="chapter" id="experience" data-chapter="experience" data-side="left">
    <div className="wrap chapter__grid">
      <div className="chapter__text">
        <p className="label">Experience · {job.period}</p>
        <h2>{job.title}</h2>
        <p className="meta">
          {job.company} · {job.type}
        </p>
        <ul className="points">
          {job.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="stack">{job.stack.join(' · ')}</p>
      </div>
    </div>
  </section>
);

export default Experience;
