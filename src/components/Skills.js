import React from 'react';

const areas = [
  { area: 'Frontend', items: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap'] },
  { area: 'Backend', items: ['Node.js', 'Express.js', 'PHP', 'Laravel', 'REST APIs'] },
  { area: 'Database', items: ['MySQL', 'MongoDB'] },
  { area: 'Mobile', items: ['React Native'] },
  { area: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Postman'] },
];

const Skills = () => (
  <section className="chapter" id="skills" data-chapter="skills" data-side="right">
    <div className="wrap chapter__grid">
      <div className="chapter__text">
        <p className="label">Skills</p>
        <h2>What I work with</h2>
        <dl className="rows">
          {areas.map(({ area, items }) => (
            <div key={area}>
              <dt>{area}</dt>
              <dd>{items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

export default Skills;
