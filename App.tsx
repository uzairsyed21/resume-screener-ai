
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Candidate, JobDescription, AppView, JobTemplate, SavedJD, Notification } from './types';
import { analyzeResume } from './services/geminiService';
import AnalysisDashboard from './components/AnalysisDashboard';
import SessionAnalytics from './components/SessionAnalytics';
import JobTemplatesModal from './components/JobTemplatesModal';

type SortCriteria = 'name' | 'score' | 'status';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  const [jd, setJd] = useState<JobDescription>({ title: '', content: '' });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isScreening, setIsScreening] = useState(false);
  const [view, setView] = useState<AppView>('setup');
  const [isDragging, setIsDragging] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [savedJDs, setSavedJDs] = useState<SavedJD[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sorting State
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const stored = localStorage.getItem('uzr_saved_jds');
    if (stored) setSavedJDs(JSON.parse(stored));
  }, []);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const saveJDToWorkspace = () => {
    if (!jd.title || !jd.content) return;
    const newSaved: SavedJD = {
      ...jd,
      id: Math.random().toString(36).substr(2, 9),
      savedAt: Date.now()
    };
    const updated = [newSaved, ...savedJDs];
    setSavedJDs(updated);
    localStorage.setItem('uzr_saved_jds', JSON.stringify(updated));
    addNotification("JD Saved", `Successfully added "${jd.title}" to Workspace.`, "success");
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newCandidate: Candidate = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ""),
          resumeText: (isImage || isPdf) ? '' : result,
          resumeImage: (isImage || isPdf) ? result : undefined, 
          status: 'pending'
        };
        setCandidates(prev => [...prev, newCandidate]);
      };

      if (isImage || isPdf) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    addNotification("Files Uploaded", `Added ${files.length} resumes.`, "info");
  };

  const startScreening = async () => {
    if (!jd.content.trim() || candidates.length === 0) return;
    setIsScreening(true);
    setView('results');
    setCandidates(prev => prev.map(c => ({ ...c, status: 'processing' })));
    const promises = candidates.map(async (candidate) => {
      if (candidate.status === 'completed') return;
      try {
        const result = await analyzeResume(jd.content, candidate.resumeText, candidate.resumeImage);
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'completed', result } : c));
        setActiveCandidateId(prev => prev || candidate.id);
      } catch (error) {
        setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'failed' } : c));
      }
    });
    await Promise.all(promises);
    setIsScreening(false);
    addNotification("Batch Complete", `Screened ${candidates.length} candidates.`, "success");
  };

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleSortChange = (criteria: SortCriteria) => {
    if (sortCriteria === criteria) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('desc');
    }
  };

  const getSortedCandidates = () => {
    return [...candidates].sort((a, b) => {
      let comparison = 0;
      if (sortCriteria === 'name') {
        const nameA = (a.result?.candidateName || a.name).toLowerCase();
        const nameB = (b.result?.candidateName || b.name).toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortCriteria === 'score') {
        const scoreA = a.result?.finalScore || 0;
        const scoreB = b.result?.finalScore || 0;
        comparison = scoreA - scoreB;
      } else if (sortCriteria === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const activeCandidate = candidates.find(c => c.id === activeCandidateId);
  const compareCandidates = candidates.filter(c => comparisonIds.includes(c.id));
  const sortedCandidates = getSortedCandidates();

  return (
    <Layout onViewChange={setView} currentView={view} notifications={notifications} onMarkRead={markNotificationRead}>
      <JobTemplatesModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelect={(t) => {setJd({title: t.title, content: t.description}); setIsTemplateModalOpen(false);}} />

      {view === 'setup' ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 animate-in">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl space-y-8">
            <div className="flex justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-indigo-600 w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center"><i className="fas fa-briefcase text-2xl"></i></div>
                <div><h2 className="text-2xl font-black text-slate-800">JD</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Context</p></div>
              </div>
              <button onClick={() => setIsTemplateModalOpen(true)} className="px-4 py-2 text-xs font-black text-indigo-600 bg-indigo-50 rounded-xl uppercase tracking-widest">Templates</button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Job Title" className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800" value={jd.title} onChange={(e) => setJd({...jd, title: e.target.value})} />
              <textarea placeholder="Paste Job Description..." className="w-full h-80 px-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none resize-none text-sm font-semibold" value={jd.content} onChange={(e) => setJd({...jd, content: e.target.value})} />
            </div>
            <button onClick={saveJDToWorkspace} disabled={!jd.title || !jd.content} className="w-full py-4 text-xs font-black text-white bg-slate-900 rounded-2xl uppercase tracking-widest disabled:opacity-50">Save JD</button>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col">
            <div className="flex items-center gap-5 mb-8">
              <div className="bg-emerald-500 w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center"><i className="fas fa-cloud-upload text-2xl"></i></div>
              <div><h2 className="text-2xl font-black text-slate-800">Resumes</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multi-upload</p></div>
            </div>
            <div className="flex-grow flex flex-col space-y-6">
              <div onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}} onDragLeave={() => setIsDragging(false)} onDrop={(e) => {e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files);}} className={`border-3 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer relative ${isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
                <input type="file" multiple accept=".txt,.md,.png,.jpg,.jpeg,.pdf" onChange={(e) => e.target.files && processFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer" />
                <i className={`fas text-3xl mb-4 ${isDragging ? 'fa-cloud-upload-alt text-indigo-600' : 'fa-file-import text-slate-300'}`}></i>
                <p className="text-sm font-black text-slate-700 uppercase">Drag & Drop Resumes</p>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {candidates.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-700">{c.name}</span>
                    <button onClick={() => setCandidates(prev => prev.filter(x => x.id !== c.id))} className="text-slate-300 hover:text-rose-500"><i className="fas fa-times-circle"></i></button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={startScreening} disabled={isScreening || !jd.content.trim() || candidates.length === 0} className="w-full mt-8 py-6 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl">
              {isScreening ? 'Screening...' : 'Run Optimized Batch'}
            </button>
          </div>
        </div>
      ) : view === 'results' ? (
        <div className="flex flex-col lg:flex-row gap-8 animate-in h-full">
          <div className="lg:w-80 shrink-0 space-y-4">
            <div className="flex flex-col gap-4 px-2">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Actions</h2>
                <button onClick={() => setView('compare')} disabled={comparisonIds.length < 2} className="text-xs font-black text-indigo-600 disabled:opacity-30">Versus Mode</button>
              </div>
              
              {/* Sorting UI */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                <button 
                  onClick={() => handleSortChange('score')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${sortCriteria === 'score' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Score {sortCriteria === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  onClick={() => handleSortChange('name')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${sortCriteria === 'name' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Name {sortCriteria === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  onClick={() => handleSortChange('status')}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${sortCriteria === 'status' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Status {sortCriteria === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
              {sortedCandidates.map(candidate => (
                <div key={candidate.id} className="relative group">
                  <button onClick={() => setActiveCandidateId(candidate.id)} className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all ${activeCandidateId === candidate.id ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl' : 'border-white bg-white hover:border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-black truncate max-w-[140px]">{candidate.result?.candidateName || candidate.name}</span>
                      {candidate.status === 'completed' && <span className="text-[10px] font-black">{candidate.result?.finalScore}/10</span>}
                      {candidate.status === 'failed' && <span className="text-[10px] font-black text-rose-400">Failed</span>}
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${activeCandidateId === candidate.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {candidate.status === 'processing' ? <i className="fas fa-circle-notch fa-spin mr-1"></i> : null}
                      {candidate.status === 'processing' ? 'Processing' : (candidate.result?.domain || 'Analyzing')}
                    </div>
                  </button>
                  {candidate.status === 'completed' && (
                    <button onClick={() => toggleComparison(candidate.id)} className={`absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${comparisonIds.includes(candidate.id) ? 'bg-amber-500 border-amber-600 text-white scale-110' : 'bg-white border-slate-100 text-slate-300 opacity-0 group-hover:opacity-100'}`}>
                      <i className="fas fa-plus text-[10px]"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-grow">{activeCandidate?.result ? <AnalysisDashboard result={activeCandidate.result} /> : <div className="h-[60vh] flex flex-col items-center justify-center text-slate-200"><i className="fas fa-user-check text-6xl mb-4"></i><p className="font-black uppercase tracking-widest">Select Candidate</p></div>}</div>
        </div>
      ) : view === 'compare' ? (
        <div className="max-w-7xl mx-auto space-y-12 animate-in pb-20">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-black text-slate-800">Versus Mode</h1>
            <button onClick={() => setView('results')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Back to Results</button>
          </div>
          <div className="grid grid-cols-2 gap-12">
            {compareCandidates.map((c, idx) => (
              <div key={c.id} className={`bg-white p-10 rounded-[3rem] border-4 ${idx === 0 ? 'border-indigo-500' : 'border-emerald-500'} shadow-2xl`}>
                <div className="text-center mb-8">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidate {idx + 1}</span>
                  <h2 className="text-3xl font-black text-slate-800 mt-2">{c.result?.candidateName}</h2>
                  <div className="text-5xl font-black mt-4 text-indigo-600">{c.result?.finalScore}<span className="text-xl text-slate-300">/10</span></div>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Comparison</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">JD Match</span><span className="text-xs font-black">{c.result?.overallMatchScore}%</span></div>
                      <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">ATS Rank</span><span className="text-xs font-black">{c.result?.atsScore}/10</span></div>
                      <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Readiness</span><span className={`text-xs font-black ${c.result?.hiringReadiness === 'High' ? 'text-emerald-500' : 'text-amber-500'}`}>{c.result?.hiringReadiness}</span></div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top 3 Skills</h3>
                    {c.result?.skillsAnalysis.slice(0, 3).map(s => (
                      <div key={s.name} className="mb-3">
                        <div className="flex justify-between text-[10px] font-black mb-1"><span>{s.name}</span><span>{s.score}%</span></div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{width: `${s.score}%`}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'analytics' ? (
        <SessionAnalytics candidates={candidates} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-in pb-20">
          <div className="flex items-center justify-between"><div><h1 className="text-4xl font-black text-slate-800">Workspace</h1><p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Personal JD Repository</p></div><div className="bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Stored Assets</span><span className="text-2xl font-black text-indigo-600">{savedJDs.length} JDs</span></div></div>
          {savedJDs.length === 0 ? <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100"><i className="fas fa-folder-open text-slate-200 text-3xl mb-6"></i><p className="text-slate-400 font-bold uppercase tracking-widest">Workspace is empty</p></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedJDs.map(sjd => (
                <div key={sjd.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl group relative">
                  <button onClick={() => {const updated = savedJDs.filter(j => j.id !== sjd.id); setSavedJDs(updated); localStorage.setItem('uzr_saved_jds', JSON.stringify(updated));}} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-500"><i className="fas fa-trash"></i></button>
                  <h3 className="text-lg font-black text-slate-800 mb-2">{sjd.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-8">{sjd.content}</p>
                  <button onClick={() => { setJd({ title: sjd.title, content: sjd.content }); setView('setup'); }} className="w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all rounded-2xl font-black text-[10px] uppercase text-slate-500">Load Setup</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
