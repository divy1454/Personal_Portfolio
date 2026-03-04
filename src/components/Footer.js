import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-400">&copy; {new Date().getFullYear()} Divy Patel. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
