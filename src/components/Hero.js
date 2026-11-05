import React from 'react';

// The hero stage is a wide band above the headline. On load the clay D turns into DIVY on it.
const Hero = () => (
  <section className="chapter hero" id="top" data-chapter="hero" data-side="center">
    <div className="wrap">
      <div className="hero__stage" id="hero-stage" aria-hidden="true" />
      <div className="hero__text">
        <h1>
          <span className="ln">
            <span>I build the apps</span>
          </span>
          <span className="ln">
            <span>businesses run on.</span>
          </span>
        </h1>
        <div className="hero__side">
          <p className="lead">
            Frontend developer working in React and React Native. I build business software, and the latest is an
            enterprise CRM in live production.
          </p>
          <div className="actions">
            <a className="btn" href="#work">
              See my work
            </a>
            <a className="link" href="#contact">
              Get in touch
            </a>
          </div>
          <p className="meta">Based in Mehsana, Gujarat. Open to full-time frontend roles.</p>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
