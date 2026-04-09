import React from 'react';
import { FaReact, FaNodeJs, FaPhp, FaMobile, FaGitAlt, FaJs, FaHtml5, FaCss3Alt, FaBootstrap, FaNpm } from 'react-icons/fa';
import { SiExpress, SiLaravel, SiMongodb, SiMysql, SiTailwindcss, SiPostman, SiVisualstudiocode } from 'react-icons/si';

const Skills = () => {
  const skillsData = [
    {
      category: 'Frontend',
      color: '#22d3ee',
      skills: [
        { name: 'React', icon: <FaReact />, level: 90 },
        { name: 'JavaScript', icon: <FaJs />, level: 85 },
        { name: 'HTML5', icon: <FaHtml5 />, level: 95 },
        { name: 'CSS3', icon: <FaCss3Alt />, level: 90 },
        { name: 'Tailwind CSS', icon: <SiTailwindcss />, level: 85 },
        { name: 'Bootstrap', icon: <FaBootstrap />, level: 80 },
      ]
    },
    {
      category: 'Backend',
      color: '#8b5cf6',
      skills: [
        { name: 'Node.js', icon: <FaNodeJs />, level: 80 },
        { name: 'Express.js', icon: <SiExpress />, level: 75 },
        { name: 'PHP', icon: <FaPhp />, level: 75 },
        { name: 'Laravel', icon: <SiLaravel />, level: 70 },
        { name: 'REST APIs', icon: <FaNpm />, level: 85 },
      ]
    },
    {
      category: 'Database',
      color: '#ec4899',
      skills: [
        { name: 'MySQL', icon: <SiMysql />, level: 80 },
        { name: 'MongoDB', icon: <SiMongodb />, level: 75 },
      ]
    },
    {
      category: 'Mobile',
      color: '#3b82f6',
      skills: [
        { name: 'React Native', icon: <FaMobile />, level: 70 },
      ]
    },
    {
      category: 'Tools & Others',
      color: '#10b981',
      skills: [
        { name: 'Git', icon: <FaGitAlt />, level: 85 },
        { name: 'GitHub', icon: <FaGitAlt />, level: 85 },
        { name: 'VS Code', icon: <SiVisualstudiocode />, level: 90 },
        { name: 'Postman', icon: <SiPostman />, level: 80 },
      ]
    },
  ];

  return (
    <section id="skills" style={{ padding: '6rem 0', position: 'relative', background: 'var(--section-tinted-bg)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Title */}
        <div className="reveal">
          <h2 className="section-title gradient-text">Technical Skills</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Technologies I work with to bring ideas to life
          </p>
        </div>

        {/* Skills Grid */}
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {skillsData.map((category) => (
            <div
              key={category.category}
              className="card-hover"
              style={{
                padding: '2rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.4s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = category.color + '40';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              {/* Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: category.color,
                  boxShadow: `0 0 12px ${category.color}60`,
                }} />
                <h3 style={{
                  fontSize: '1.2rem', fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: category.color,
                }}>
                  {category.category}
                </h3>
              </div>

              {/* Skills List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {category.skills.map((skill) => (
                  <div key={skill.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ color: category.color, fontSize: '1rem' }}>{skill.icon}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{skill.name}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{skill.level}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{
                      width: '100%', height: '4px',
                      borderRadius: '999px',
                      background: 'var(--progress-bar-bg)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${skill.level}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`,
                        transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: `0 0 8px ${category.color}40`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
