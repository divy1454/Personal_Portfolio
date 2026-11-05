import React from 'react';

const rows = [
  { label: 'Frontend', value: 'React, JavaScript, HTML5, CSS3, Tailwind CSS, Bootstrap' },
  { label: 'Backend', value: 'Node.js, Express.js, PHP, Laravel, REST APIs' },
  { label: 'Database', value: 'MySQL, MongoDB' },
  { label: 'Mobile', value: 'React Native' },
  { label: 'Tools', value: 'Git, GitHub, VS Code, Postman' },
];

const Skills = () => (
  <section className="chapter" id="skills" data-chapter="skills" data-side="left">
    <div className="wrap chapter__grid">
      <div className="slot" aria-hidden="true" />
      <div className="chapter__text">
        <p className="kicker">Skills</p>
        <h2>The stack I work in</h2>
        <p>Frontend first, with enough backend to ship a whole product on my own.</p>
        <dl className="rows">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

export default Skills;
