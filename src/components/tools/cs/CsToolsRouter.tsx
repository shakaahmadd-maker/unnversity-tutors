import React, { Suspense, lazy } from 'react';
import { CsToolSlug, resolveCsRoute } from '../../../data/csToolsRegistry';
import { CsToolPageShell } from './CsToolShared';

const CsToolsHub = lazy(() => import('./CsToolsHub'));
const SqlPlaygroundTool = lazy(() => import('./SqlPlaygroundTool'));
const TruthTableGeneratorTool = lazy(() => import('./TruthTableGeneratorTool'));
const BinaryHexConverterTool = lazy(() => import('./BinaryHexConverterTool'));
const AlgorithmVisualizerTool = lazy(() => import('./AlgorithmVisualizerTool'));
const DataStructureVisualizerTool = lazy(() => import('./DataStructureVisualizerTool'));
const SubnetCalculatorTool = lazy(() => import('./SubnetCalculatorTool'));
const RegexTesterTool = lazy(() => import('./RegexTesterTool'));
const BigOCalculatorTool = lazy(() => import('./BigOCalculatorTool'));
const CodeFormatterDiffTool = lazy(() => import('./CodeFormatterDiffTool'));
const CryptoJwtTool = lazy(() => import('./CryptoJwtTool'));

const TOOL_COMPONENTS: Record<CsToolSlug, React.LazyExoticComponent<React.ComponentType>> = {
  'sql-playground': SqlPlaygroundTool,
  'truth-table-generator': TruthTableGeneratorTool,
  'binary-hex-converter': BinaryHexConverterTool,
  'algorithm-visualizer': AlgorithmVisualizerTool,
  'data-structure-visualizer': DataStructureVisualizerTool,
  'subnet-calculator': SubnetCalculatorTool,
  'regex-tester': RegexTesterTool,
  'big-o-calculator': BigOCalculatorTool,
  'code-formatter-diff': CodeFormatterDiffTool,
  'crypto-jwt-tool': CryptoJwtTool,
};

export interface CsToolsRouterProps {
  currentView: string;
  onNavigate?: (view: string) => void;
  onOpenBecomeTutor?: () => void;
}

function CsToolLoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] bg-[#FAF6F0] flex items-center justify-center p-8">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="w-4 h-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
        <span>Loading Computer Science workspace...</span>
      </div>
    </div>
  );
}

export default function CsToolsRouter({
  currentView,
  onNavigate,
  onOpenBecomeTutor,
}: CsToolsRouterProps) {
  const resolved = resolveCsRoute(currentView);

  if (!resolved || resolved.kind === 'hub') {
    return (
      <Suspense fallback={<CsToolLoadingFallback />}>
        <CsToolsHub onNavigate={onNavigate} onOpenBecomeTutor={onOpenBecomeTutor} />
      </Suspense>
    );
  }

  const ToolComponent = TOOL_COMPONENTS[resolved.tool.slug];

  return (
    <CsToolPageShell
      tool={resolved.tool}
      onNavigate={onNavigate}
      onOpenBecomeTutor={onOpenBecomeTutor}
    >
      <Suspense fallback={<CsToolLoadingFallback />}>
        <ToolComponent />
      </Suspense>
    </CsToolPageShell>
  );
}
