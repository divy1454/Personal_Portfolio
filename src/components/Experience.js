import React from 'react';
import { FaBriefcase, FaCalendarAlt } from 'react-icons/fa';

const Experience = () => {
  const experiences = [
    {
      title: 'Frontend Intern – React Developer',
      company: 'Spontaneous Enterprise',
      period: 'Dec 2025 – Present',
      type: 'Internship',
      description: [
        'Developed and maintained scalable CRM platform for managing leads, tasks, and administrative workflows',
        'Designed modular and reusable React components to ensure maintainable code architecture',
        'Implemented complete lead lifecycle system including creation, assignment, status tracking, and conversion',
        'Integrated secure REST APIs with authentication and role-based access control',
        'Built dynamic dashboards with search, filtering, pagination, and structured data tables',
      ],
      tech: ['React', 'REST API', 'JavaScript', 'CSS'],
    },
  ];

  return (
    <section id="experience" style={{ padding: '6rem 0', position: 'relative' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Title */}
        <div className="reveal">
          <h2 className="section-title gradient-text">Experience</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Professional journey and contributions
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: '3rem' }}>
          {/* Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '11px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'linear-gradient(180deg, var(--accent-cyan), var(--accent-violet), transparent)',
          }} />

          {experiences.map((exp, index) => (
            <div
              key={index}
              className="reveal-left"
              style={{
                position: 'relative',
                marginBottom: '2rem',
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '-3rem',
                top: '2rem',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                border: '3px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  animation: 'glow 2s ease-in-out infinite',
                }} />
              </div>

              {/* Pulse Ring */}
              <div style={{
                position: 'absolute',
                left: 'calc(-3rem + 2px)',
                top: 'calc(2rem + 2px)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid var(--accent-cyan)',
                animation: 'pulse-ring 2s ease-in-out infinite',
                opacity: 0.5,
                zIndex: 1,
              }} />

              {/* Card */}
              <div
                className="card-hover"
                style={{
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                  borderLeft: '3px solid var(--accent-cyan)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: 'var(--text-primary)',
                      marginBottom: '0.4rem',
                    }}>
                      {exp.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaBriefcase style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }} />
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 600 }}>
                        {exp.company}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.3rem 0.75rem', borderRadius: '999px',
                      background: 'var(--highlight-bg-hover)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 500,
                    }}>
                      <FaCalendarAlt style={{ fontSize: '0.7rem' }} /> {exp.period}
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      background: 'var(--highlight-bg)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      fontSize: '0.7rem', color: 'var(--accent-violet)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {exp.type}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0' }}>
                  {exp.description.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        fontSize: '0.95rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      <span style={{
                        color: 'var(--accent-cyan)',
                        fontSize: '0.6rem',
                        marginTop: '0.55rem',
                        flexShrink: 0,
                      }}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Tech Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  {exp.tech.map(tech => (
                    <span key={tech} style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      background: 'var(--highlight-bg)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-violet)',
                      fontWeight: 600,
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
