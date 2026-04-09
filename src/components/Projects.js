import React, { useState } from 'react';
import { FaGithub, FaExternalLinkAlt, FaStar, FaFolder } from 'react-icons/fa';

const Projects = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const projects = [
    {
      title: 'Enterprise CRM System',
      subtitle: 'Live Production',
      description: 'Developed and maintained a scalable CRM platform for managing leads, tasks, and administrative workflows. Implemented complete lead lifecycle system with secure REST APIs, role-based access control, and dynamic dashboards.',
      tech: ['React', 'REST API', 'JavaScript', 'CSS'],
      featured: true,
      color: '#22d3ee',
    },
    {
      title: 'TexPort App',
      subtitle: 'Mobile + Admin Panel',
      description: 'Developed textile management mobile application with staff attendance and salary modules. Implemented secure authentication and subscription-based admin management with real-time data synchronization.',
      tech: ['React Native', 'Laravel API', 'MySQL'],
      github: 'https://github.com/divy1454/TexPortApp',
      live: 'https://textile.texportapp.in/',
      color: '#8b5cf6',
    },
    {
      title: 'Inventory Management System',
      subtitle: 'Web Application',
      description: 'Built role-based authentication system with billing, reporting, and product management modules. Complete web application for managing inventory operations.',
      tech: ['PHP', 'MySQL', 'Bootstrap'],
      github: 'https://github.com/divy1454/InventoryManagement',
      color: '#ec4899',
    },
  ];

  return (
    <section id="projects" style={{ padding: '6rem 0', position: 'relative', background: 'rgba(17, 24, 39, 0.5)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Title */}
        <div className="reveal">
          <h2 className="section-title gradient-text">Featured Projects</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            A selection of projects that showcase my skills and passion for development
          </p>
        </div>

        {/* Projects Grid */}
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {projects.map((project, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: `1px solid ${hoveredIndex === index ? project.color + '40' : 'var(--glass-border)'}`,
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hoveredIndex === index ? 'translateY(-10px)' : 'translateY(0)',
                boxShadow: hoveredIndex === index
                  ? `0 25px 60px ${project.color}15, 0 0 0 1px ${project.color}25`
                  : '0 4px 20px rgba(0,0,0,0.2)',
                position: 'relative',
              }}
            >
              {/* Top Gradient Bar */}
              <div style={{
                height: '4px',
                background: `linear-gradient(90deg, ${project.color}, ${project.color}60, transparent)`,
              }} />

              {/* Card Content */}
              <div style={{ padding: '2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: `${project.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: project.color, fontSize: '1.2rem',
                    }}>
                      <FaFolder />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.15rem', fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: 'var(--text-primary)',
                        marginBottom: '0.15rem',
                      }}>
                        {project.title}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {project.subtitle}
                      </span>
                    </div>
                  </div>
                  {project.featured && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.25rem 0.6rem', borderRadius: '999px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      <FaStar style={{ fontSize: '0.6rem' }} /> Featured
                    </div>
                  )}
                </div>

                {/* Project Number */}
                <div style={{
                  position: 'absolute',
                  top: '1.5rem', right: '1.5rem',
                  fontSize: '4rem', fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'rgba(148, 163, 184, 0.05)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}>
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {project.tech.map(tech => (
                    <span key={tech} style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '8px',
                      background: `${project.color}10`,
                      border: `1px solid ${project.color}20`,
                      fontSize: '0.75rem',
                      color: project.color,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div style={{
                  display: 'flex', gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--glass-border)',
                }}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.85rem', fontWeight: 500,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = project.color;
                        e.currentTarget.style.background = `${project.color}10`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FaGithub /> Source Code
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.85rem', fontWeight: 500,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = project.color;
                        e.currentTarget.style.background = `${project.color}10`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FaExternalLinkAlt /> Live Demo
                    </a>
                  )}
                  {!project.github && !project.live && (
                    <span style={{
                      fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic',
                      padding: '0.4rem 0',
                    }}>
                      🔒 Private / NDA Protected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
