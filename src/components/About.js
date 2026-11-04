import React from 'react';

const facts = [
  { label: 'Frontend', value: 'React and modern JavaScript' },
  { label: 'Backend', value: 'Node.js and Laravel' },
  { label: 'Education', value: 'M.Sc. CA & IT, Ganpat University' },
  { label: 'Location', value: 'Mehsana, Gujarat' },
];

const About = () => (
  <section className="chapter" id="about" data-chapter="about" data-side="left">
    <div className="wrap chapter__grid">
      <div className="chapter__text">
        <p className="label">About</p>
        <h2>Business software, built in React</h2>
        <p>
          I’m a frontend developer working in React. I build business software: lead pipelines, dashboards with search,
          filters and pagination, and role-based access on top of REST APIs.
        </p>
        <p>
          Most of that work went into an enterprise CRM in live production. Outside it, I’ve built a React Native app for
          textile businesses, a PHP inventory system, and JDMatcher, a SaaS for US IT staffing agencies.
        </p>
        <dl className="facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

export default About;
