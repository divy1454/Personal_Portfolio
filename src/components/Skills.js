import React from 'react';

const Skills = () => {
  const skillsData = {
    "Frontend": ["React", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap"],
    "Backend": ["Node.js", "Express.js", "PHP", "Laravel", "REST APIs"],
    "Database": ["MySQL", "MongoDB"],
    "Mobile": ["React Native"],
    "Tools": ["Git", "GitHub", "VS Code", "Postman"]
  };

  return (
    <section id="skills" className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Technical Skills</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-12"></div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skillsData).map(([category, skills]) => (
            <div key={category} className="bg-slate-900 p-6 rounded-xl shadow-xl hover:shadow-cyan-500/20 transition-all border border-slate-700 hover:border-cyan-500">
              <h3 className="text-xl font-bold mb-4 text-cyan-400">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-800 text-gray-300 rounded-full text-sm font-medium border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
