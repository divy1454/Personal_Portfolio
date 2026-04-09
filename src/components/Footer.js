import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const quickLinks = ['Home', 'About', 'Skills', 'Experience', 'Projects', 'Contact'];
  const socials = [
    { icon: <FaGithub />, href: 'https://github.com/divy1454', label: 'GitHub' },
    { icon: <FaLinkedin />, href: 'https://www.linkedin.com/in/divypatel14/', label: 'LinkedIn' },
    { icon: <FaEnvelope />, href: 'mailto:divy9954@gmail.com', label: 'Email' },
  ];

  return (
    <footer style={{
      position: 'relative',
      background: 'rgba(5, 8, 18, 0.8)',
      borderTop: '1px solid var(--glass-border)',
    }}>
      {/* Gradient Line */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-violet), var(--accent-pink), transparent)',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 1.5rem 2rem' }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <a href="#home" style={{
              display: 'inline-block',
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              textDecoration: 'none',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {'<'}Divy{' />'}
            </a>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '320px',
              marginTop: '0.75rem',
            }}>
              Full Stack Developer passionate about creating modern web experiences with clean code and pixel-perfect design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
            }}>
              Quick Links
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {quickLinks.map(link => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    fontWeight: 400,
                  }}
                  onMouseEnter={e => {
                    e.target.style.color = 'var(--accent-cyan)';
                    e.target.style.paddingLeft = '6px';
                  }}
                  onMouseLeave={e => {
                    e.target.style.color = 'var(--text-secondary)';
                    e.target.style.paddingLeft = '0';
                  }}
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <h4 style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
            }}>
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {socials.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  title={social.label}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(148, 163, 184, 0.06)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent-cyan)';
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    e.currentTarget.style.background = 'rgba(34, 211, 238, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '1.5rem' }} />

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Divy Patel. Built with <FaHeart style={{ color: 'var(--accent-pink)', verticalAlign: 'middle', fontSize: '0.7rem' }} /> and React
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--accent-cyan)';
              e.currentTarget.style.borderColor = 'var(--accent-cyan)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
            }}
          >
            <FaChevronUp style={{ fontSize: '0.65rem' }} /> Back to top
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
