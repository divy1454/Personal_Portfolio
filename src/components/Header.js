import React, { useState, useEffect, useCallback } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const navItems = ['Home', 'About', 'Skills', 'Experience', 'Projects', 'Contact'];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);

    // Determine active section
    const sections = navItems.map(item => item.toLowerCase());
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <header
      className="glass-strong"
      style={{
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 100,
        transition: 'all 0.4s ease',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          {/* Logo */}
          <a
            href="#home"
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              transition: 'all 0.3s ease',
            }}
          >
            {'<'}Divy{' />'}
          </a>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '0.5rem' }}>
            {navItems.map(item => {
              const isActive = activeSection === item.toLowerCase();
              return (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.target.style.color = 'var(--text-primary)';
                      e.target.style.background = 'rgba(148, 163, 184, 0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.target.style.color = 'var(--text-secondary)';
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {item}
                </a>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-toggle"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
            aria-label="Toggle navigation"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          style={{
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '0.25rem',
            paddingBottom: '1rem',
            animation: isOpen ? 'slideDown 0.3s ease' : 'none',
          }}
          className="mobile-menu"
        >
          {navItems.map((item, index) => {
            const isActive = activeSection === item.toLowerCase();
            return (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {item}
              </a>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
