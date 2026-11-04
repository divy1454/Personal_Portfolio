import React from 'react';

const Hero = () => (
  <section className="chapter hero" id="top" data-chapter="hero" data-side="right">
    <div className="wrap chapter__grid">
      <div className="chapter__text">
        <p className="label">Frontend developer, React and React Native</p>
        <h1>I build the apps businesses run on</h1>
        <p className="lead">The latest is an enterprise CRM in live production. Based in Mehsana, Gujarat.</p>
        <div className="actions">
          <a className="btn" href="#work">
            See my work
          </a>
          <a className="link" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
    </div>
    <div className="wrap">
      <div className="strip">
        <span>
          <b>Previously</b> · Frontend intern at Spontaneous Enterprise
        </span>
        <span>Available for new opportunities</span>
      </div>
    </div>
  </section>
);

export default Hero;
