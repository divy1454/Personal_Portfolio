import React from 'react';

const points = [
  'Developed and maintained a scalable CRM platform for managing leads, tasks and administrative workflows',
  'Implemented the full lead lifecycle: creation, assignment, status tracking and conversion',
  'Designed modular, reusable React components to keep the codebase maintainable',
  'Integrated secure REST APIs with authentication and role-based access control',
  'Built dashboards with search, filtering, pagination and structured data tables',
];

const Experience = () => (
  <section className="chapter" id="experience" data-chapter="experience" data-side="right">
    <div className="wrap chapter__grid">
      <div className="slot" aria-hidden="true" />
      <div className="chapter__text">
        <p className="kicker">Experience</p>
        <h2>Frontend intern at Spontaneous Enterprise</h2>
        <p className="meta">React developer, Dec 2025 to Apr 2026</p>
        <ul className="points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="stack">React, REST APIs, JavaScript, CSS</p>
      </div>
    </div>
  </section>
);

export default Experience;
