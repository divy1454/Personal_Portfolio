import React from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';

const Projects = () => {
  const projects = [
    {
      title: "Enterprise CRM System (Live Production)",
      description: "Developed and maintained a scalable CRM platform for managing leads, tasks, and administrative workflows. Implemented complete lead lifecycle system with secure REST APIs, role-based access control, and dynamic dashboards with search, filtering, and pagination.",
      tech: ["React", "REST API", "JavaScript"],
      github: "#",
      live: "#"
    },
    {
      title: "TexPort App (Mobile + Admin Panel)",
      description: "Developed textile management mobile application with staff attendance and salary modules. Implemented secure authentication and subscription-based admin management system with Laravel APIs for real-time data synchronization.",
      tech: ["React Native", "Laravel API", "MySQL"],
      github: "https://github.com/divy1454/TexPortApp",
      live: "https://textile.texportapp.in/"
    },
    {
      title: "Inventory Management System",
      description: "Built role-based authentication system with billing, reporting, and product management modules. Complete web application for managing inventory operations.",
      tech: ["PHP", "MySQL", "Bootstrap"],
      github: "https://github.com/divy1454/InventoryManagement",
      live: "#"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">Featured Projects</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-12"></div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-slate-900 rounded-xl shadow-xl hover:shadow-cyan-500/20 transition-all hover:-translate-y-2 overflow-hidden border border-slate-700 hover:border-cyan-500">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-white">{project.title}</h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map(tech => (
                    <span key={tech} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-semibold border border-cyan-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-slate-700">
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <FaGithub /> Code
                  </a>
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <FaExternalLinkAlt /> Live
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
