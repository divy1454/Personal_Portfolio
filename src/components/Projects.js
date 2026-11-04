import React from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

// Each project is its own chapter, so the clay stage shows a different object for each one.
const projects = [
  {
    id: 'work',
    chapter: 'crm',
    side: 'right',
    title: 'Enterprise CRM system',
    meta: 'Live production at Spontaneous Enterprise',
    text: 'A CRM for managing leads, tasks and administrative workflows. I built the lead lifecycle end to end, wired secure REST APIs with role-based access, and made the dashboards the team works from.',
    stack: ['React', 'REST API', 'JavaScript', 'CSS'],
    note: 'Private, under NDA',
  },
  {
    id: 'jdmatcher',
    chapter: 'jd',
    side: 'left',
    title: 'JDMatcher',
    meta: 'SaaS and Chrome extension',
    text: 'A SaaS for US IT staffing agencies. Its Chrome extension checks a job post against a bench candidate’s resume, returns an apply or skip verdict and can autofill the application. Next.js portals cover recruiters, agency admins and billing.',
    stack: ['Next.js', 'TypeScript', 'Fastify', 'PostgreSQL', 'Chrome MV3'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/divy1454/JDMatcher' }],
  },
  {
    id: 'texport',
    chapter: 'texport',
    side: 'right',
    title: 'TexPort App',
    meta: 'Mobile app and admin panel',
    text: 'A textile management app with staff attendance and salary modules. Secure sign-in, subscription-based admin management and real-time sync through Laravel APIs.',
    stack: ['React Native', 'Laravel API', 'MySQL'],
    links: [
      { label: 'Source', href: 'https://github.com/divy1454/TexPortApp' },
      { label: 'Live demo', href: 'https://textile.texportapp.in/' },
    ],
  },
  {
    id: 'inventory',
    chapter: 'inventory',
    side: 'left',
    title: 'Inventory management system',
    meta: 'Web application',
    text: 'An inventory app with role-based sign-in and modules for billing, reporting and product management.',
    stack: ['PHP', 'MySQL', 'Bootstrap'],
    links: [{ label: 'Source on GitHub', href: 'https://github.com/divy1454/InventoryManagement' }],
  },
];

const Projects = () => (
  <>
    {projects.map((project, index) => (
      <section className="chapter" id={project.id} key={project.id} data-chapter={project.chapter} data-side={project.side}>
        <div className="wrap chapter__grid">
          <div className="chapter__text">
            <p className="label">
              Selected work · {index + 1} of {projects.length}
            </p>
            <h2>{project.title}</h2>
            <p className="meta">{project.meta}</p>
            <p>{project.text}</p>
            <p className="stack">{project.stack.join(' · ')}</p>
            <div className="more">
              {project.note && <span className="private">{project.note}</span>}
              {project.links &&
                project.links.map((link) => (
                  <a className="link" href={link.href} target="_blank" rel="noopener noreferrer" key={link.href}>
                    {link.label}
                    <LuArrowUpRight className="icon" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>
    ))}
  </>
);

export default Projects;
