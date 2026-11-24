import React, { useEffect, useMemo, useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

type AlgorithmKey = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'binary-search';

interface AlgoMeta {
  id: AlgorithmKey;
  label: string;
  best: string;
  average: string;
  worst: string;
  space: string;
}

const ALGORITHMS: AlgoMeta[] = [
  { id: 'bubble', label: 'Bubble Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  { id: 'selection', label: 'Selection Sort', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  { id: 'insertion', label: 'Insertion Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  { id: 'merge', label: 'Merge Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  { id: 'quick', label: 'Quick Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  { id: 'binary-search', label: 'Binary Search', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
];

interface TraceFrame {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
  range?: [number, number];
  foundIndex?: number;
  comparisons: number;
  swaps: number;
  note: string;
}

function generateArray(size: number, sorted = false): number[] {
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 10);
  return sorted ? [...arr].sort((a, b) => a - b) : arr;
}

function recordAlgorithmTrace(
  algo: AlgorithmKey,
  initial: number[],
  searchTarget: number
): TraceFrame[] {
  const arr = [...initial];
  const frames: TraceFrame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set<number>();

  const pushFrame = (partial: Omit<TraceFrame, 'array' | 'comparisons' | 'swaps' | 'sorted'> & { sorted?: number[] }) => {
    frames.push({
      array: [...arr],
      comparisons,
      swaps,
      sorted: partial.sorted ?? Array.from(sortedSet),
      comparing: partial.comparing,
      swapping: partial.swapping,
      pivot: partial.pivot,
      range: partial.range,
      foundIndex: partial.foundIndex,
      note: partial.note,
    });
  };

  if (algo === 'binary-search') {
    arr.sort((a, b) => a - b);
    pushFrame({
      comparing: [],
      swapping: [],
      range: [0, arr.length - 1],
      note: `Array sorted ascending. Searching for target ${searchTarget} across indices [0..${arr.length - 1}].`,
    });
    let lo = 0;
    let hi = arr.length - 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      comparisons++;
      pushFrame({
        comparing: [mid],
        swapping: [],
        range: [lo, hi],
        pivot: mid,
        note: `Check mid=${mid} (value ${arr[mid]}) against target ${searchTarget} in [${lo}..${hi}].`,
      });
      if (arr[mid] === searchTarget) {
        pushFrame({
          comparing: [],
          swapping: [],
          range: [lo, hi],
          foundIndex: mid,
          sorted: [mid],
          note: `Target ${searchTarget} found at index ${mid} in ${comparisons} comparisons.`,
        });
        return frames;
      }
      if (arr[mid] < searchTarget) {
        lo = mid + 1;
        pushFrame({
          comparing: [],
          swapping: [],
          range: [lo, hi],
          note: `${arr[mid]} < ${searchTarget}, discard left half -> new range [${lo}..${hi}].`,
        });
      } else {
        hi = mid - 1;
        pushFrame({
          comparing: [],
          swapping: [],
          range: [lo, hi],
          note: `${arr[mid]} > ${searchTarget}, discard right half -> new range [${lo}..${hi}].`,
        });
      }
    }
    pushFrame({
      comparing: [],
      swapping: [],
      note: `Target ${searchTarget} is not present in the array (${comparisons} comparisons).`,
    });
    return frames;
  }

  pushFrame({
    comparing: [],
    swapping: [],
    note: `Initial unsorted array of ${arr.length} elements.`,
  });

  if (algo === 'bubble') {
    for (let i = 0; i < arr.length; i++) {
      let swapped = false;
      for (let j = 0; j < arr.length - i - 1; j++) {
        comparisons++;
        pushFrame({
          comparing: [j, j + 1],
          swapping: [],
          note: `Compare arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}.`,
        });
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          swapped = true;
          pushFrame({
            comparing: [],
            swapping: [j, j + 1],
            note: `Swap arr[${j}] and arr[${j + 1}] because ${arr[j + 1]} > ${arr[j]}.`,
          });
        }
      }
      sortedSet.add(arr.length - 1 - i);
      if (!swapped) {
        for (let k = 0; k < arr.length; k++) sortedSet.add(k);
        break;
      }
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < arr.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        comparisons++;
        pushFrame({
          comparing: [minIdx, j],
          swapping: [],
          pivot: minIdx,
          note: `Compare current min arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}.`,
        });
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        pushFrame({
          comparing: [],
          swapping: [i, minIdx],
          note: `Place minimum value ${arr[i]} into index ${i}.`,
        });
      }
      sortedSet.add(i);
    }
  } else if (algo === 'insertion') {
    sortedSet.add(0);
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      pushFrame({
        comparing: [i],
        swapping: [],
        pivot: i,
        note: `Pick key arr[${i}]=${key} to insert into sorted prefix [0..${i - 1}].`,
      });
      while (j >= 0) {
        comparisons++;
        pushFrame({
          comparing: [j, j + 1],
          swapping: [],
          note: `Compare arr[${j}]=${arr[j]} with key ${key}.`,
        });
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;
          pushFrame({
            comparing: [],
            swapping: [j, j + 1],
            note: `Shift arr[${j}]=${arr[j]} right to index ${j + 1}.`,
          });
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      sortedSet.add(i);
    }
  } else if (algo === 'merge') {
    const mergeSort = (l: number, r: number) => {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m);
      mergeSort(m + 1, r);

      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0;
      let j = 0;
      let k = l;
      while (i < left.length && j < right.length) {
        comparisons++;
        pushFrame({
          comparing: [l + i, m + 1 + j],
          swapping: [],
          range: [l, r],
          note: `Merge [${l}..${r}]: compare ${left[i]} and ${right[j]}.`,
        });
        if (left[i] <= right[j]) {
          arr[k] = left[i++];
        } else {
          arr[k] = right[j++];
        }
        swaps++;
        pushFrame({
          comparing: [],
          swapping: [k],
          range: [l, r],
          note: `Write merged value ${arr[k]} at index ${k}.`,
        });
        k++;
      }
      while (i < left.length) {
        arr[k] = left[i++];
        swaps++;
        pushFrame({
          comparing: [],
          swapping: [k],
          range: [l, r],
          note: `Write remaining left value ${arr[k]} at index ${k}.`,
        });
        k++;
      }
      while (j < right.length) {
        arr[k] = right[j++];
        swaps++;
        pushFrame({
          comparing: [],
          swapping: [k],
          range: [l, r],
          note: `Write remaining right value ${arr[k]} at index ${k}.`,
        });
        k++;
      }
    };
    mergeSort(0, arr.length - 1);
    for (let k = 0; k < arr.length; k++) sortedSet.add(k);
  } else if (algo === 'quick') {
    const quickSort = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        sortedSet.add(lo);
        return;
      }
      const pivotVal = arr[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) {
        comparisons++;
        pushFrame({
          comparing: [j, hi],
          swapping: [],
          pivot: hi,
          range: [lo, hi],
          note: `Partition [${lo}..${hi}] around pivot ${pivotVal}: check arr[${j}]=${arr[j]}.`,
        });
        if (arr[j] < pivotVal) {
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            swaps++;
            pushFrame({
              comparing: [],
              swapping: [i, j],
              pivot: hi,
              range: [lo, hi],
              note: `Swap arr[${i}] and arr[${j}] (< pivot ${pivotVal}).`,
            });
          }
          i++;
        }
      }
      if (i !== hi) {
        [arr[i], arr[hi]] = [arr[hi], arr[i]];
        swaps++;
      }
      sortedSet.add(i);
      pushFrame({
        comparing: [],
        swapping: [i, hi],
        pivot: i,
        range: [lo, hi],
        note: `Pivot ${arr[i]} settled at final index ${i}.`,
      });
      quickSort(lo, i - 1);
      quickSort(i + 1, hi);
    };
    quickSort(0, arr.length - 1);
  }

  for (let k = 0; k < arr.length; k++) sortedSet.add(k);
  pushFrame({
    comparing: [],
    swapping: [],
    note: `Completed in ${comparisons} comparisons and ${swaps} swaps/writes.`,
  });

  return frames;
}

export default function AlgorithmVisualizerTool() {
  const [algo, setAlgo] = useState<AlgorithmKey>('quick');
  const [arraySize, setArraySize] = useState<number>(20);
  const [speedMs, setSpeedMs] = useState<number>(120);
  const [baseArray, setBaseArray] = useState<number[]>(() => generateArray(20));
  const [searchTarget, setSearchTarget] = useState<number>(52);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'algorithm-visualizer') return;
      setIsPlaying(false);
      setStepIndex(0);
      if (ce.detail?.presetIndex === 1) {
        setAlgo('binary-search');
        setArraySize(24);
        const arr = generateArray(24);
        setBaseArray(arr);
        const sorted = [...arr].sort((a, b) => a - b);
        setSearchTarget(sorted[Math.floor(sorted.length * 0.7)]);
      } else {
        setAlgo('quick');
        setArraySize(24);
        setBaseArray(generateArray(24));
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const activeMeta = useMemo(() => ALGORITHMS.find((a) => a.id === algo)!, [algo]);

  const frames = useMemo(
    () => recordAlgorithmTrace(algo, baseArray, searchTarget),
    [algo, baseArray, searchTarget]
  );

  const currentFrame = frames[Math.min(stepIndex, frames.length - 1)] || frames[0];

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= frames.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, frames.length - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, frames.length, speedMs]);

  const regenerateArray = (nextSize = arraySize, nextAlgo = algo) => {
    setIsPlaying(false);
    const next = generateArray(nextSize, nextAlgo === 'binary-search');
    setBaseArray(next);
    if (nextAlgo === 'binary-search') {
      setSearchTarget(next[Math.floor(next.length * 0.65)]);
    }
    setStepIndex(0);
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="Interactive Sorting & Pathfinding Algorithm Visualizer"
        category="Algorithms & Data Structures"
        description="Trace Bubble, Selection, Insertion, Merge, Quick Sort, and Binary Search step by step with live comparison and swap counters."
        onLoadSample={() => {
          const sample = [64, 25, 82, 14, 47, 91, 33, 52, 19, 76, 41, 68, 29, 88, 12, 57];
          setIsPlaying(false);
          setArraySize(sample.length);
          setBaseArray(sample);
          setSearchTarget(52);
          setStepIndex(0);
        }}
        onCopyOutput={() =>
          `${activeMeta.label}\nFinal Array: [${frames[frames.length - 1].array.join(', ')}]\nComparisons: ${frames[frames.length - 1].comparisons}\nSwaps/Writes: ${frames[frames.length - 1].swaps}\nTime (Avg): ${activeMeta.average} · Space: ${activeMeta.space}`
        }
        onClear={() => {
          setIsPlaying(false);
          setStepIndex(0);
        }}
      />

      {/* Algorithm Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
        {ALGORITHMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setAlgo(item.id);
              setStepIndex(0);
              if (item.id === 'binary-search') {
                const sorted = [...baseArray].sort((a, b) => a - b);
                setSearchTarget(sorted[Math.floor(sorted.length * 0.6)]);
              }
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              algo === item.id
                ? 'bg-orange-600 text-white'
                : 'text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Controls & Parameters Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (stepIndex >= frames.length - 1) setStepIndex(0);
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex((s) => Math.max(0, s - 1));
            }}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex((s) => Math.min(frames.length - 1, s + 1));
            }}
            disabled={stepIndex >= frames.length - 1}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <span>Step</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => regenerateArray()}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-orange-50 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-orange-600" />
            <span>New Array</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(0);
            }}
            className="inline-flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex justify-between">
              <span>Array Size</span>
              <span className="font-mono text-orange-700 tabular-nums">{arraySize} items</span>
            </label>
            <input
              type="range"
              min={8}
              max={40}
              value={arraySize}
              onChange={(e) => {
                const next = Number(e.target.value);
                setArraySize(next);
                regenerateArray(next);
              }}
              className="w-full accent-orange-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex justify-between">
              <span>Step Delay</span>
              <span className="font-mono text-orange-700 tabular-nums">{speedMs} ms</span>
            </label>
            <input
              type="range"
              min={20}
              max={600}
              step={20}
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-full accent-orange-600"
            />
          </div>

          {algo === 'binary-search' ? (
            <div className="space-y-1">
              <label htmlFor="bsearch-target" className="text-xs font-semibold text-slate-700">
                Search Target Value
              </label>
              <input
                id="bsearch-target"
                type="number"
                value={searchTarget}
                onChange={(e) => {
                  setIsPlaying(false);
                  setSearchTarget(Number(e.target.value));
                  setStepIndex(0);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-600 tabular-nums">
              Step {stepIndex + 1} / {frames.length}
            </div>
          )}
        </div>
      </div>

      {/* Live Metrics & Complexity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs tabular-nums">
        <div className="rounded-xl bg-orange-50/70 border border-orange-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-orange-800">Comparisons</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{currentFrame.comparisons}</div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-slate-500">Swaps / Writes</div>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{currentFrame.swaps}</div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-slate-500">Best Time</div>
          <div className="text-sm font-bold text-emerald-700 mt-1">{activeMeta.best}</div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-slate-500">Average Time</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{activeMeta.average}</div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-slate-500">Worst Time</div>
          <div className="text-sm font-bold text-amber-700 mt-1">{activeMeta.worst}</div>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="font-sans text-[11px] font-semibold text-slate-500">Aux Space</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{activeMeta.space}</div>
        </div>
      </div>

      {/* SVG Animated Bar Stage */}
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-orange-300">{currentFrame.note}</span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 font-sans">
            <span>Comparing: Amber</span>
            <span>·</span>
            <span>Swapping/Active: Orange</span>
            <span>·</span>
            <span>Sorted/Found: Emerald</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full flex items-end gap-1 pt-4">
          {currentFrame.array.map((val, idx) => {
            const isComparing = currentFrame.comparing.includes(idx);
            const isSwapping = currentFrame.swapping.includes(idx);
            const isSorted = currentFrame.sorted.includes(idx);
            const isPivot = currentFrame.pivot === idx;
            const isFound = currentFrame.foundIndex === idx;
            const outOfRange =
              currentFrame.range && (idx < currentFrame.range[0] || idx > currentFrame.range[1]);

            let barColor = 'bg-slate-600';
            if (isFound || isSorted) barColor = 'bg-emerald-500';
            if (isPivot) barColor = 'bg-sky-500';
            if (isComparing) barColor = 'bg-amber-400';
            if (isSwapping) barColor = 'bg-orange-500';

            return (
              <div
                key={idx}
                className={`flex-1 flex flex-col items-center justify-end h-full transition-opacity ${
                  outOfRange ? 'opacity-25' : 'opacity-100'
                }`}
              >
                {arraySize <= 24 && (
                  <span className="font-mono text-[10px] text-slate-300 mb-1 tabular-nums">
                    {val}
                  </span>
                )}
                <div
                  style={{ height: `${Math.max(8, val)}%` }}
                  className={`w-full rounded-t-md ${barColor} transition-colors duration-100`}
                />
                {arraySize <= 24 && (
                  <span className="font-mono text-[9px] text-slate-500 mt-1 tabular-nums">
                    {idx}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
