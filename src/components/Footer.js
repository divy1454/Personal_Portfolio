import React from 'react';

const Footer = () => (
  <footer>
    <div className="wrap">
      <div className="foot">
        <span>© {new Date().getFullYear()} Divy Patel</span>
        <a className="link" href="#top">
          Back to top
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
