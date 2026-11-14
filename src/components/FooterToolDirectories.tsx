import React from 'react';
import { isModifiedAnchorClick } from '../data/dedicatedServiceRoutes';
import { STUDENT_TOOLS } from '../data/studentToolsData';
import { MATH_TOOLS_REGISTRY } from '../data/mathToolsRegistry';

interface FooterToolDirectoriesProps {
  mode: 'math' | 'student';
  onNavigate: (view: string) => void;
}

export default function FooterToolDirectories({ mode, onNavigate }: FooterToolDirectoriesProps) {
  if (mode === 'math') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs mt-3">
        {MATH_TOOLS_REGISTRY.map((mTool) => (
          <a
            key={mTool.slug}
            href={mTool.path}
            onClick={(e) => {
              if (!isModifiedAnchorClick(e)) {
                e.preventDefault();
                onNavigate(mTool.viewKey);
              }
            }}
            className="px-3 py-2.5 min-h-[40px] flex items-center rounded-xl bg-[#fffbf7] border border-[#ffab85]/45 hover:border-orange-500 hover:bg-[#ffece1] text-[#542104] hover:text-orange-800 font-semibold transition-colors truncate cursor-pointer"
          >
            <span className="truncate">{mTool.shortTitle}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs mt-3">
      {STUDENT_TOOLS.map((tool) => (
        <a
          key={tool.slug}
          href={tool.path}
          onClick={(e) => {
            if (!isModifiedAnchorClick(e)) {
              e.preventDefault();
              onNavigate(tool.viewKey);
            }
          }}
          className="px-3 py-2.5 min-h-[40px] flex items-center rounded-xl bg-[#fffbf7] border border-[#ffab85]/45 hover:border-orange-500 hover:bg-[#ffece1] text-[#542104] hover:text-orange-800 font-semibold transition-colors truncate cursor-pointer"
        >
          <span className="truncate">{tool.shortName}</span>
        </a>
      ))}
    </div>
  );
}
