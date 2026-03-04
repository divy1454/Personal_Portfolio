import React from 'react';

const Experience = () => {
  const experiences = [
    {
      title: "Frontend Intern – React Developer",
      company: "Spontaneous Enterprise",
      period: "Dec 2024 – Present",
      description: [
        "Developed and maintained scalable CRM platform for managing leads, tasks, and administrative workflows",
        "Designed modular and reusable React components to ensure maintainable code architecture",
        "Implemented complete lead lifecycle system including creation, assignment, status tracking, and conversion",
        "Integrated secure REST APIs with authentication and role-based access control",
        "Built dynamic dashboards with search, filtering, pagination, and structured data tables"
      ]
    }
  ];

  return (
    <section id="experience" className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Experience</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-12"></div>
        
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="bg-slate-800 p-8 rounded-xl border-l-4 border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
              <h4 className="text-xl text-cyan-400 font-semibold mb-2">{exp.company}</h4>
              <p className="text-gray-400 italic mb-4">{exp.period}</p>
              <ul className="space-y-2">
                {exp.description.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-cyan-400 mr-2 text-xl">▹</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
