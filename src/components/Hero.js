import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload, FaChevronDown } from 'react-icons/fa';

const roles = ['Frontend Developer.', 'React Specialist.', 'React Native Dev.'];

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sleek IDE Typewriter effect
  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timeout;

    if (!isDeleting) {
      if (displayText.length < currentRole.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentRole.slice(0, displayText.length + 1));
        }, Math.random() * 50 + 50); // Random typing speed
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 3000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  const socials = [
    { icon: <FaGithub />, href: 'https://github.com/divy1454', label: 'GitHub' },
    { icon: <FaLinkedin />, href: 'https://www.linkedin.com/in/divypatel14/', label: 'LinkedIn' },
    { icon: <FaEnvelope />, href: 'mailto:divy9954@gmail.com', label: 'Email' },
  ];

  /* GSAP-like entrance variants for Framer Motion */
  const parentVariant = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const childVariant = {
    hidden: { y: 60, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', bounce: 0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <section id="home" className="ag-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingTop: '80px' }}>

      <motion.div
        variants={parentVariant}
        initial="hidden"
        animate="show"
        style={{ width: '100%', maxWidth: '1200px', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr lg:1fr', gap: '4rem', alignItems: 'center', zIndex: 2 }}
      >
        {/* Left Side: Text Details */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

          <motion.div variants={childVariant} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 1rem', borderRadius: '32px', background: 'var(--tag-subtle-bg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            <span style={{ marginRight: '0.5rem', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block' }}></span>
            Available for new opportunities
          </motion.div>

          <motion.h1 variants={childVariant} style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Build the <br />
            <span style={{ color: 'var(--accent-blue)' }}>new way.</span>
          </motion.h1>

          <motion.div variants={childVariant} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', height: '2rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace' }}>I am a {displayText}</span>
            <span style={{ display: 'inline-block', width: '10px', height: '1.2em', background: 'var(--accent-blue)', marginLeft: '4px', animation: 'blink 1s step-end infinite' }} />
          </motion.div>

          <motion.p variants={childVariant} style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Delivering high-performance, polished web experiences with clean architecture and modern tooling. I bring designs to life.
          </motion.p>

          <motion.div variants={childVariant} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#projects" className="ag-button" style={{ padding: '0.8rem 2rem', background: '#FFFFFF', color: '#000000', textDecoration: 'none', fontWeight: 500, fontSize: '1rem' }}>
              View Projects
            </a>
            <a href={process.env.PUBLIC_URL + '/Divy_CV.pdf'} download className="ag-button" style={{ padding: '0.8rem 2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaDownload /> Resume
            </a>
          </motion.div>

          {/* Social Links Mini */}
          <motion.div variants={childVariant} style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color 0.3s ease' }} onMouseEnter={e => e.target.style.color = 'var(--text-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                {social.icon}
              </a>
            ))}
          </motion.div>
        </div>

        {/* IDE Mockup removed */}

      </motion.div>

      {/* Scroll Down Indicator */}
      <a href="#about" style={{
        position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em',
        opacity: scrolledPast ? 0 : 1, transition: 'opacity 0.3s ease',
      }}>
        Scroll
        <FaChevronDown style={{ animation: 'bounceDown 2s infinite' }} />
      </a>
    </section>
  );
};

export default Hero;
