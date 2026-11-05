import React, { useEffect } from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

export const RESUME_URL = `${process.env.PUBLIC_URL}/Divy_CV.pdf`;

// The stage marks the current section on these links with aria-current as you scroll.
const Header = () => {
  useEffect(() => {
    const root = document.documentElement;
    const check = () => root.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', check);
      root.classList.remove('is-scrolled');
    };
  }, []);

  return (
    <header className="top">
      <div className="wrap top__row">
        <a className="name" href="#top">
          Divy Patel
        </a>
        <nav aria-label="Sections">
          <a href="#about" data-nav="about">
            About
          </a>
          <a href="#work" data-nav="work">
            Work
          </a>
          <a href="#contact" data-nav="contact">
            Contact
          </a>
          <a className="resume" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
            Resume
            <LuArrowUpRight className="icon" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
