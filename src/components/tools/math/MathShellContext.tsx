import React, { createContext, useContext } from 'react';
import type { MathToolItem } from '../../../data/mathToolsRegistry';

export interface MathShellContextValue {
  tool: MathToolItem | null;
  isFullScreen: boolean;
  setFullScreen: (open: boolean) => void;
  toggleFullScreen: () => void;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  exportPdfWithSolution: (solutionText?: string, modeLabel?: string) => void;
}

export const MathShellContext = createContext<MathShellContextValue>({
  tool: null,
  isFullScreen: false,
  setFullScreen: () => {},
  toggleFullScreen: () => {},
  workspaceRef: { current: null },
  exportPdfWithSolution: () => {},
});

export function useMathShell(): MathShellContextValue {
  return useContext(MathShellContext);
}
