import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

// EmailJS delivers this form to divy9954@gmail.com.
// The EmailJS template uses {{from_name}}, {{from_email}} and {{message}}; {{reply_to}} is there for the Reply-To field.
const EMAILJS = {
  serviceId: 'service_3vuxmek',
  templateId: 'template_3g8768r',
  publicKey: 'Fopi7hNCDbHgcMsvE',
};
const EMAIL = 'divy9954@gmail.com';
const EMPTY = { from_name: '', from_email: '', message: '', company: '' };

const notes = {
  sent: 'Thanks, your message is on its way. I’ll reply by email.',
  error: `That didn’t send. Please email me at ${EMAIL} instead.`,
};

const Contact = () => {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [copyLabel, setCopyLabel] = useState('Copy');

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status === 'sent' || status === 'error') setStatus('idle');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    // "company" is a hidden field people never see. If it is filled in, a bot sent the form: skip sending.
    if (form.company) {
      setForm(EMPTY);
      setStatus('sent');
      return;
    }

    setStatus('sending');
    const fromEmail = form.from_email.trim();
    try {
      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          from_name: form.from_name.trim(),
          from_email: fromEmail,
          reply_to: fromEmail,
          message: form.message.trim(),
        },
        { publicKey: EMAILJS.publicKey }
      );
      setForm(EMPTY);
      setStatus('sent');
    } catch (error) {
      // EmailJS explains the failure in error.text, for example an expired Gmail connection.
      console.error('EmailJS could not send the message', error);
      setStatus('error');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyLabel('Copied');
    } catch {
      setCopyLabel('Press Ctrl+C to copy');
    }
    window.setTimeout(() => setCopyLabel('Copy'), 1600);
  };

  return (
    <section className="chapter" id="contact" data-chapter="contact" data-side="right">
      <div className="wrap chapter__grid">
        <div className="chapter__text">
          <p className="label">Contact</p>
          <h2>Let’s build something</h2>
          <p>Have a role or a project in mind? Email me directly or send a note with the form.</p>

          <dl className="rows">
            <div>
              <dt>Email</dt>
              <dd>
                <a className="link" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                <button className="copy" type="button" onClick={copyEmail}>
                  {copyLabel}
                </button>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a className="link" href="tel:+918999911999">
                  +91 89999 11999
                </a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a className="link" href="https://github.com/divy1454" target="_blank" rel="noopener noreferrer">
                  github.com/divy1454
                </a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a className="link" href="https://www.linkedin.com/in/divy-patel14" target="_blank" rel="noopener noreferrer">
                  linkedin.com/in/divy-patel14
                </a>
              </dd>
            </div>
          </dl>

          <form className="form" onSubmit={submit}>
            <div className="field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="from_name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={form.from_name}
                onChange={update}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="from_email"
                type="email"
                autoComplete="email"
                required
                maxLength={200}
                value={form.from_email}
                onChange={update}
              />
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                maxLength={5000}
                value={form.message}
                onChange={update}
              />
            </div>
            <div className="hp" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input
                id="contact-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={update}
              />
            </div>
            <div className="form__foot">
              <button className="btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              <p className={`form__note${status === 'error' ? ' form__note--error' : ''}`} role="status" aria-live="polite">
                {notes[status] || ''}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
