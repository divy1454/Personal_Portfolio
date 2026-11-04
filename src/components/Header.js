import React from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

export const RESUME_URL = `${process.env.PUBLIC_URL}/Divy_CV.pdf`;

const Header = () => (
  <header className="top">
    <div className="wrap top__row">
      <a className="name" href="#top">
        Divy Patel
      </a>
      <nav aria-label="Sections">
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#contact">Contact</a>
        <a className="resume" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
          Resume
          <LuArrowUpRight className="icon" strokeWidth={1.5} aria-hidden="true" />
        </a>
      </nav>
    </div>
  </header>
);

export default Header;
