import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaDownload } from 'react-icons/fa';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
          Hi, I'm <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Divy Patel</span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-300">Full Stack Developer</h2>
        <p className="text-xl mb-8 text-gray-400">Building modern web applications with passion and precision</p>
        
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <a href="#projects" className="px-6 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-all hover:scale-105 shadow-lg shadow-cyan-500/50">
            View Projects
          </a>
          <a href="#contact" className="px-6 py-3 border-2 border-cyan-500 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-500 hover:text-white transition-all">
            Contact Me
          </a>
          <a href={process.env.PUBLIC_URL + '/Divy_CV.pdf'} download className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/50">
            <FaDownload /> Download CV
          </a>
        </div>

        <div className="flex gap-6 justify-center text-3xl">
          <a href="https://github.com/divy1454" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-gray-300 hover:text-cyan-400">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/divypatel14/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-gray-300 hover:text-cyan-400">
            <FaLinkedin />
          </a>
          <a href="mailto:divy9954@gmail.com" className="hover:scale-110 transition-transform text-gray-300 hover:text-cyan-400">
            <FaEnvelope />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
