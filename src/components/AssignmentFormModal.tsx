import React, { useState } from 'react';
import { X, Upload, Check, FileText, AlertCircle } from 'lucide-react';
import { Assignment, User, AssignmentStatus } from '../types';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Assignment, 'id' | 'status' | 'progressPercent' | 'createdAt'>) => void;
  studentId: string;
  tutors: User[];
  prefilledTutorId?: string;
}

export default function AssignmentFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  studentId, 
  tutors,
  prefilledTutorId 
}: AssignmentFormModalProps) {
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('English Literature');
  const [deadline, setDeadline] = useState('');
  const [wordCount, setWordCount] = useState(1000);
  const [referenceStyle, setReferenceStyle] = useState('APA Style');
  const [sourcesCount, setSourcesCount] = useState(3);
  const [instructions, setInstructions] = useState('');
  const [tutorId, setTutorId] = useState(prefilledTutorId || '');
  const [files, setFiles] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subjects = [
    'English Literature', 'Essays & Editing', 'History', 'Philosophy',
    'Advanced Mathematics', 'Statistics', 'Physics', 'Mechanical Engineering',
    'Psychology', 'Business Administration', 'Marketing', 'Sociology',
    'Computer Science', 'Data Structures', 'Coding & Python', 'Database Systems',
    'Biochemistry', 'Medicine', 'Organic Chemistry', 'Academic Lab Reports',
    'Environmental Science', 'Geography', 'Ecology', 'GIS Analysis'
  ];

  const citationStyles = ['APA Style', 'MLA Style', 'Harvard Referencing', 'Chicago Manual', 'IEEE Convention'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files) as File[];
      if (fileList.length + files.length > 5) {
        setErrorMsg('Maximum limit is 5 documents.');
        return;
      }
      setFiles(prev => [...prev, ...fileList.map((f: File) => f.name)]);
      setErrorMsg('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !deadline || !instructions || files.length === 0) {
      setErrorMsg('Please complete all mandatory fields, including brief files upload.');
      return;
    }

    onSubmit({
      studentId,
      tutorId: tutorId || tutors[0]?.id || '',
      title,
      subject,
      deadline,
      wordCount,
      referenceStyle,
      sourcesCount,
      instructions,
      fileUrls: files.map(name => `https://example.com/uploads/${name}`),
      fileNames: files
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border shadow-2xl relative my-8" id="assignment-form-modal">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-150">
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-950 font-sans tracking-tight">Assignment Briefing Checklist</h3>
            <p className="text-xs text-gray-400 font-medium">Coordinate requirements, formatting, and deadlines with certified tutors.</p>
          </div>
          <button 
            id="close-assignment-form"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div id="assign-form-error" className="m-6 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Assignment Title *</label>
              <input
                type="text"
                id="assign-input-title"
                required
                placeholder="e.g. Critical Prose on Frankenstein"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2.5 px-3 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Subject Focus *</label>
              <select
                id="assign-select-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 py-2.5 px-3 rounded-xl text-xs"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Due Deadline *</label>
              <input
                type="datetime-local"
                id="assign-input-deadline"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 py-2 px-2.5 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Word Count *</label>
              <input
                type="number"
                id="assign-input-wordcount"
                min="100"
                max="50000"
                value={wordCount}
                onChange={(e) => setWordCount(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Citation Format *</label>
              <select
                id="assign-select-citation"
                value={referenceStyle}
                onChange={(e) => setReferenceStyle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 py-2.5 px-3 rounded-xl text-xs"
              >
                {citationStyles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Sumber Bibliografi (Optional)</label>
              <input
                type="number"
                id="assign-input-sources"
                min="0"
                max="50"
                value={sourcesCount}
                onChange={(e) => setSourcesCount(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 py-2 px-3 rounded-xl text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Preferred Scholar Advisor (Optional)</label>
              <select
                id="assign-select-tutor"
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 py-2.5 px-3 rounded-xl text-xs"
              >
                <option value="">-- Let System Select First --</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (${t.hourlyRate}/hr)</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Critical Instructions *</label>
            <textarea
              id="assign-textarea-instructions"
              required
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Structure parameters, essay prompt questions, syllabus rubrics, learning targets, context notes..."
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-orange-500 py-2 px-3 rounded-xl text-xs focus:outline-hidden"
            />
          </div>

          {/* Files Upload Widget */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Brief Documents Upload * (at least 1 document required)</label>
            <div className="border border-dashed border-gray-250 rounded-xl p-5 bg-gray-50 text-center relative hover:bg-orange-50/25 hover:border-orange-200 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              <span className="text-xs font-bold text-gray-800 block">Click to attach assignment briefs</span>
              <span className="text-[10px] text-gray-405 block mt-0.5">Maximum limit 5 documents (DOC, PDF, PPTX, JPG, ZIP up to 25MB)</span>
              
              <input 
                type="file" 
                id="assign-file-upload-input"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Uploaded File lists */}
            {files.length > 0 && (
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Attached Documents Checklist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {files.map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border text-xs">
                      <div className="flex items-center gap-1.5 truncate max-w-[85%]">
                        <FileText className="w-3.5 h-3.5 text-orange-500" />
                        <span className="truncate font-mono font-medium text-gray-705">{name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-assign-form"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 border text-gray-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-assign-form"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 transition-colors cursor-pointer"
            >
              Submit Brief Form
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
