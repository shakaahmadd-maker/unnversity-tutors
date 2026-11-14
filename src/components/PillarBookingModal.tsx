import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface PillarBookingModalProps {
  service: string;
  onClose: () => void;
  onSubmitConsult: (msg: string) => void;
  onNavigate: (view: string) => void;
}

export default function PillarBookingModal({
  service,
  onClose,
  onSubmitConsult,
  onNavigate,
}: PillarBookingModalProps) {
  const [pillarBookingName, setPillarBookingName] = useState<string>('');
  const [pillarBookingLevel, setPillarBookingLevel] = useState<string>('');
  const [pillarBookingNote, setPillarBookingNote] = useState<string>('');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 block">
              INSTANT RESERVATION
            </span>
            <h2 className="font-extrabold text-base text-slate-900">Get Matched with a Mentor</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking dialog"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitConsult(
              `Pillar Consultation: ${service} | Student: ${
                pillarBookingName || 'Inquirer'
              } (${pillarBookingLevel || 'Unspecified'}) | Notes: ${pillarBookingNote || 'None'}`
            );
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label htmlFor="pillar-selected-input" className="block font-semibold text-slate-700 mb-1">
              Selected Pillar
            </label>
            <input
              id="pillar-selected-input"
              type="text"
              readOnly
              className="w-full bg-slate-100 border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg font-medium text-slate-700"
              value={service}
            />
          </div>

          <div>
            <label htmlFor="pillar-student-name" className="block font-semibold text-slate-700 mb-1">
              Your Full Name
            </label>
            <input
              id="pillar-student-name"
              required
              type="text"
              value={pillarBookingName}
              onChange={(e) => setPillarBookingName(e.target.value)}
              placeholder="e.g. Alex Henderson"
              className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
            />
          </div>

          <div>
            <label htmlFor="pillar-student-level" className="block font-semibold text-slate-700 mb-1">
              University / Academic Level
            </label>
            <input
              id="pillar-student-level"
              required
              type="text"
              value={pillarBookingLevel}
              onChange={(e) => setPillarBookingLevel(e.target.value)}
              placeholder="e.g. Undergraduate Year 2"
              className="w-full border border-slate-200 px-3 py-2 min-h-[44px] rounded-lg focus:outline-orange-500"
            />
          </div>

          <div>
            <label htmlFor="pillar-student-note" className="block font-semibold text-slate-700 mb-1">
              Brief Note / Deadline
            </label>
            <textarea
              id="pillar-student-note"
              rows={2}
              value={pillarBookingNote}
              onChange={(e) => setPillarBookingNote(e.target.value)}
              placeholder="Tell us about your upcoming project or goals..."
              className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:outline-orange-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 min-h-[44px] bg-orange-650 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-650/20 active:scale-[0.99] transition mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Request Callback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('get-a-quote');
              }}
              className="text-[11px] text-slate-600 hover:text-orange-700 underline font-medium min-h-[44px] cursor-pointer"
            >
              Or get a detailed price quotation →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
