import React from 'react';
import { FaCode, FaServer, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';

const About = () => {
  const highlights = [
    { icon: <FaCode />, label: 'Frontend', value: 'React & Modern JS' },
    { icon: <FaServer />, label: 'Backend', value: 'Node.js & Laravel' },
    { icon: <FaGraduationCap />, label: 'Education', value: 'M.Sc. (CA & IT)' },
    { icon: <FaMapMarkerAlt />, label: 'Location', value: 'Mehsana, Gujarat' },
  ];

  return (
    <section id="about" style={{ padding: '6rem 0', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Section Title */}
        <div className="reveal">
          <h2 className="section-title gradient-text">About Me</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            A passionate developer who loves turning ideas into elegant, functional digital experiences.
          </p>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="about-grid">
          {/* Left - Terminal */}
          <div className="reveal-left">
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-card)',
              boxShadow: '0 20px 60px var(--card-shadow)',
            }}>
              {/* Terminal Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.25rem',
                background: 'var(--terminal-header-bg)',
                borderBottom: '1px solid var(--glass-border)',
              }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  ~/divy-patel
                </span>
              </div>
              {/* Terminal Body */}
              <div style={{ padding: '1.5rem', fontFamily: "'Courier New', monospace", fontSize: '0.85rem', lineHeight: 1.8 }}>
                <div><span className="code-keyword">const</span> <span className="code-identifier">developer</span> <span className="code-operator">=</span> {'{'}</div>
                <div style={{ paddingLeft: '1.5rem' }}><span className="code-keyword">name</span>: <span className="code-string">"Divy Patel"</span>,</div>
                <div style={{ paddingLeft: '1.5rem' }}><span className="code-keyword">role</span>: <span className="code-string">"Frontend Developer"</span>,</div>
                <div style={{ paddingLeft: '1.5rem' }}><span className="code-keyword">skills</span>: [<span className="code-string">"React"</span>, <span className="code-string">"Node.js"</span>, <span className="code-string">"Laravel"</span>],</div>
                <div style={{ paddingLeft: '1.5rem' }}><span className="code-keyword">passion</span>: <span className="code-string">"Building great UX"</span>,</div>
                <div style={{ paddingLeft: '1.5rem' }}><span className="code-keyword">available</span>: <span className="code-boolean">true</span></div>
                <div>{'}'};</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className="code-prompt">{'>'}</span>
                  <span className="code-cursor" />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Text */}
          <div className="reveal-right">
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                I'm a passionate Frontend Developer with hands-on experience in building modern, scalable web applications.
                I specialize in crafting seamless user experiences backed by robust component architecture.
              </p>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                From developing enterprise CRM systems to building mobile apps with React Native,
                I thrive on solving complex problems and delivering quality solutions that make a real impact.
              </p>
            </div>

            {/* Highlight Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {highlights.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: 'var(--highlight-bg)',
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
                    e.currentTarget.style.background = 'var(--highlight-bg-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.background = 'var(--highlight-bg)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '1rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, paddingLeft: '2.5rem' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default About;
