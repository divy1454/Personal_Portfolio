import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">About Me</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-12"></div>
        
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
          <p>
            I'm a passionate Full Stack Developer with expertise in building modern web applications. 
            I love creating efficient, scalable solutions and learning new technologies.
          </p>
          <p>
            With a strong foundation in both frontend and backend development, I specialize in 
            creating seamless user experiences backed by robust server-side architecture.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
