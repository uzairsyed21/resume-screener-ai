
import React from 'react';
import { JobTemplate } from '../types';

const TEMPLATES: JobTemplate[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    icon: 'fa-code',
    description: "Build scalable web applications. Requirements: React, TypeScript, Tailwind CSS, 5+ years experience, modern testing frameworks, performance optimization, and deep architectural knowledge of frontend state management."
  },
  {
    id: '2',
    title: 'Data Scientist',
    icon: 'fa-chart-network',
    description: "Extract insights from complex data. Requirements: Python, SQL, Machine Learning (PyTorch/TensorFlow), statistical analysis, A/B testing, and 3+ years in a production environment deploying predictive models."
  },
  {
    id: '3',
    title: 'Product Manager',
    icon: 'fa-lightbulb',
    description: "Own the product lifecycle. Requirements: Market research, user story mapping, agile methodologies, cross-functional leadership, data-driven decision making, and experience scaling consumer-facing products."
  },
  {
    id: '4',
    title: 'Backend Node.js Architect',
    icon: 'fa-server',
    description: "Design high-performance systems. Requirements: Node.js, Microservices, PostgreSQL, Redis, Kubernetes, AWS, API design (REST/GraphQL), and experience with distributed system patterns."
  }
];

interface JobTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: JobTemplate) => void;
}

const JobTemplatesModal: React.FC<JobTemplatesModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Job Templates</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a role to pre-fill description</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors">
            <i className="fas fa-times-circle text-2xl"></i>
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map(template => (
            <button 
              key={template.id}
              onClick={() => onSelect(template)}
              className="p-6 text-left bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-3xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <i className={`fas ${template.icon}`}></i>
              </div>
              <h3 className="font-black text-slate-800 mb-1">{template.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobTemplatesModal;
