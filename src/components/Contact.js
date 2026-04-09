import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { FaEnvelope, FaMapMarkerAlt, FaGithub, FaLinkedin, FaPaperPlane, FaCheck, FaExclamationTriangle, FaSpinner, FaPhoneAlt } from 'react-icons/fa';

// ============================================
// 🔧 EmailJS Configuration — FILL THESE IN
// ============================================
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add your Gmail as an Email Service → copy the SERVICE_ID
// 3. Create an Email Template → copy the TEMPLATE_ID
//    Template variables to use: {{from_name}}, {{from_email}}, {{message}}
// 4. Go to Account → copy your PUBLIC_KEY
// ============================================
const EMAILJS_SERVICE_ID = 'service_3vuxmek';
const EMAILJS_TEMPLATE_ID = 'template_3g8768r';
const EMAILJS_PUBLIC_KEY = 'Fopi7hNCDbHgcMsvE';

const Contact = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({ from_name: '', from_email: '', message: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if EmailJS is configured
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      setStatus('error');
      setErrorMsg('EmailJS is not configured yet. Please update the credentials in Contact.js');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setStatus('sending');

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setFormData({ from_name: '', from_email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus('error');
      setErrorMsg('Failed to send message. Please try again or email me directly.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const contactInfo = [
    { icon: <FaEnvelope />, label: 'Email', value: 'divy9954@gmail.com', href: 'mailto:divy9954@gmail.com' },
    { icon: <FaPhoneAlt />, label: 'Phone', value: '+91 89999 11999', href: 'tel:+918999911999' },
    { icon: <FaMapMarkerAlt />, label: 'Location', value: 'Mehsana, Gujarat', href: null },
    { icon: <FaGithub />, label: 'GitHub', value: 'github.com/divy1454', href: 'https://github.com/divy1454' },
    { icon: <FaLinkedin />, label: 'LinkedIn', value: 'in/divy-patel14', href: 'https://www.linkedin.com/in/divy-patel14' },
  ];


  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '1rem 1.25rem',
    paddingTop: formData[fieldName] || focusedField === fieldName ? '1.5rem' : '1rem',
    background: 'var(--input-bg)',
    border: `1px solid ${focusedField === fieldName ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === fieldName ? '0 0 0 3px rgba(34, 211, 238, 0.1)' : 'none',
  });

  const labelStyle = (fieldName) => ({
    position: 'absolute',
    left: '1.25rem',
    top: formData[fieldName] || focusedField === fieldName ? '0.5rem' : '1rem',
    fontSize: formData[fieldName] || focusedField === fieldName ? '0.7rem' : '0.95rem',
    color: focusedField === fieldName ? 'var(--accent-cyan)' : 'var(--text-muted)',
    fontWeight: formData[fieldName] || focusedField === fieldName ? 600 : 400,
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    textTransform: formData[fieldName] || focusedField === fieldName ? 'uppercase' : 'none',
    letterSpacing: formData[fieldName] || focusedField === fieldName ? '0.05em' : '0',
  });

  const getButtonContent = () => {
    switch (status) {
      case 'sending':
        return <><FaSpinner style={{ animation: 'spin-slow 1s linear infinite' }} /> Sending...</>;
      case 'success':
        return <><FaCheck /> Message Sent!</>;
      case 'error':
        return <><FaExclamationTriangle /> {errorMsg.length > 30 ? 'Failed!' : errorMsg}</>;
      default:
        return <><FaPaperPlane /> Send Message</>;
    }
  };

  const getButtonStyle = () => {
    const base = {
      width: '100%',
      padding: '1rem',
      borderRadius: '12px',
      border: 'none',
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      cursor: status === 'idle' ? 'pointer' : 'default',
      transition: 'all 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    };

    switch (status) {
      case 'success':
        return { ...base, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)' };
      case 'error':
        return { ...base, background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)' };
      case 'sending':
        return { ...base, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', opacity: 0.7, boxShadow: '0 8px 32px rgba(34, 211, 238, 0.25)' };
      default:
        return { ...base, background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', boxShadow: '0 8px 32px rgba(34, 211, 238, 0.25)' };
    }
  };

  return (
    <section id="contact" style={{ padding: '6rem 0', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Title */}
        <div className="reveal">
          <h2 className="section-title gradient-text">Get In Touch</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Have a project in mind or want to collaborate? I'd love to hear from you.
          </p>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '3rem', alignItems: 'start' }} className="contact-grid">
          {/* Left - Contact Cards */}
          <div className="reveal-left">
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem', fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>
                Let's work together
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Feel free to reach out through any of the channels below or use the contact form.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {contactInfo.map((info) => {
                const Wrapper = info.href ? 'a' : 'div';
                return (
                  <Wrapper
                    key={info.label}
                    href={info.href || undefined}
                    target={info.href?.startsWith('http') ? '_blank' : undefined}
                    rel={info.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--glass-border)',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: info.href ? 'pointer' : 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px',
                      background: 'var(--highlight-bg-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-cyan)', fontSize: '1rem',
                      flexShrink: 0,
                    }}>
                      {info.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
                        {info.label}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {info.value}
                      </div>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          {/* Right - Form */}
          <div className="reveal-right">
            <div style={{
              padding: '2.5rem',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 20px 60px var(--card-shadow-light)',
            }}>
              <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Name */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle('from_name')}>Your Name</label>
                  <input
                    type="text"
                    name="from_name"
                    value={formData.from_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('from_name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={inputStyle('from_name')}
                  />
                </div>

                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle('from_email')}>Your Email</label>
                  <input
                    type="email"
                    name="from_email"
                    value={formData.from_email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('from_email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={inputStyle('from_email')}
                  />
                </div>

                {/* Message */}
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle('message')}>Your Message</label>
                  <textarea
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...inputStyle('message'),
                      resize: 'vertical',
                      minHeight: '140px',
                    }}
                  />
                </div>

                {/* Status Message */}
                {status === 'error' && errorMsg && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <FaExclamationTriangle /> {errorMsg}
                  </div>
                )}

                {status === 'success' && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <FaCheck /> Your message has been sent successfully! I'll get back to you soon.
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  style={getButtonStyle()}
                  onMouseEnter={e => {
                    if (status === 'idle') {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 40px rgba(34, 211, 238, 0.35)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (status === 'idle') {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 32px rgba(34, 211, 238, 0.25)';
                    }
                  }}
                >
                  {getButtonContent()}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
