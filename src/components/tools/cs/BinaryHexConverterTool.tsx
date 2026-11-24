import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

type ConverterTab = 'bases' | 'twos' | 'ieee754' | 'bitwise';
type BitWidth = 8 | 16 | 32;
type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'SHL' | 'SHR' | 'USHR';

function parseBigIntBase(raw: string, base: 2 | 8 | 10 | 16): bigint | null {
  const cleaned = raw.trim().replace(/[\s_]/g, '');
  if (!cleaned) return null;
  const negative = cleaned.startsWith('-');
  const body = negative ? cleaned.slice(1) : cleaned;
  if (!body) return null;

  const validators: Record<2 | 8 | 10 | 16, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  };
  if (!validators[base].test(body)) return null;

  const prefix: Record<2 | 8 | 10 | 16, string> = {
    2: '0b',
    8: '0o',
    10: '',
    16: '0x',
  };
  const val = BigInt(`${prefix[base]}${body}`);
  return negative ? -val : val;
}

function formatBigIntBase(value: bigint, base: 2 | 8 | 10 | 16): string {
  const neg = value < 0n;
  const abs = neg ? -value : value;
  const str = abs.toString(base).toUpperCase();
  return neg ? `-${str}` : str;
}

function encodeIeee754Float32(value: number) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, value, false);
  const bits32 = view.getUint32(0, false);
  const actualStored = view.getFloat32(0, false);
  const bin = bits32.toString(2).padStart(32, '0');
  const signBit = bin[0];
  const exponentBits = bin.slice(1, 9);
  const mantissaBits = bin.slice(9);
  const exponentRaw = parseInt(exponentBits, 2);
  const exponentUnbiased = exponentRaw - 127;
  const hex = '0x' + bits32.toString(16).toUpperCase().padStart(8, '0');

  let classification = 'Normalized';
  if (exponentRaw === 255) {
    classification = parseInt(mantissaBits, 2) === 0 ? (signBit === '1' ? '-Infinity' : '+Infinity') : 'NaN (Not a Number)';
  } else if (exponentRaw === 0) {
    classification = parseInt(mantissaBits, 2) === 0 ? (signBit === '1' ? '-0.0 (Negative Zero)' : '+0.0 (Zero)') : 'Subnormal (Denormalized)';
  }

  let mantissaFrac = 0;
  for (let i = 0; i < mantissaBits.length; i++) {
    if (mantissaBits[i] === '1') mantissaFrac += Math.pow(2, -(i + 1));
  }

  return {
    bits32,
    bin,
    signBit,
    exponentBits,
    mantissaBits,
    exponentRaw,
    exponentUnbiased,
    mantissaFrac,
    hex,
    actualStored,
    classification,
  };
}

export default function BinaryHexConverterTool() {
  const [activeTab, setActiveTab] = useState<ConverterTab>('bases');

  // 1. Base converter states
  const [binStr, setBinStr] = useState('11010110');
  const [octStr, setOctStr] = useState('326');
  const [decStr, setDecStr] = useState('214');
  const [hexStr, setHexStr] = useState('D6');
  const [baseError, setBaseError] = useState<string | null>(null);

  // 2. Two's complement states
  const [bitWidth, setBitWidth] = useState<BitWidth>(8);
  const [twosInput, setTwosInput] = useState<string>('-42');

  // 3. IEEE 754 state
  const [floatInput, setFloatInput] = useState<string>('-13.625');

  // 4. Bitwise calculator states
  const [opA, setOpA] = useState<string>('170');
  const [opB, setOpB] = useState<string>('204');
  const [bitOp, setBitOp] = useState<BitwiseOp>('XOR');
  const [shiftAmt, setShiftAmt] = useState<number>(2);

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'binary-hex-converter') return;
      if (ce.detail?.presetIndex === 0) {
        setActiveTab('ieee754');
        setFloatInput('-13.625');
      } else {
        setActiveTab('twos');
        setBitWidth(8);
        setTwosInput('-42');
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const syncFromBase = (raw: string, base: 2 | 8 | 10 | 16) => {
    if (base === 2) setBinStr(raw);
    if (base === 8) setOctStr(raw);
    if (base === 10) setDecStr(raw);
    if (base === 16) setHexStr(raw);

    if (!raw.trim()) {
      setBinStr('');
      setOctStr('');
      setDecStr('');
      setHexStr('');
      setBaseError(null);
      return;
    }

    const parsed = parseBigIntBase(raw, base);
    if (parsed === null) {
      const expected: Record<2 | 8 | 10 | 16, string> = {
        2: '0 and 1',
        8: '0–7',
        10: '0–9',
        16: '0–9 and A–F',
      };
      setBaseError(`Invalid Base-${base} input. Allowed digits: ${expected[base]} (optional leading minus).`);
      return;
    }

    setBaseError(null);
    if (base !== 2) setBinStr(formatBigIntBase(parsed, 2));
    if (base !== 8) setOctStr(formatBigIntBase(parsed, 8));
    if (base !== 10) setDecStr(formatBigIntBase(parsed, 10));
    if (base !== 16) setHexStr(formatBigIntBase(parsed, 16));
  };

  // Two's Complement computed values
  const twosAnalysis = useMemo(() => {
    const minSigned = -(1n << BigInt(bitWidth - 1));
    const maxSigned = (1n << BigInt(bitWidth - 1)) - 1n;
    const mod = 1n << BigInt(bitWidth);
    const trimmed = twosInput.trim();
    if (!trimmed || !/^-?\d+$/.test(trimmed)) {
      return {
        error: `Enter a valid integer between ${minSigned.toString()} and ${maxSigned.toString()}.`,
        bits: '0'.repeat(bitWidth),
        onesComp: '0'.repeat(bitWidth),
        signedVal: 0n,
        unsignedVal: 0n,
        hex: '0x00',
        minSigned,
        maxSigned,
      };
    }
    const parsed = BigInt(trimmed);
    if (parsed < minSigned || parsed > maxSigned) {
      return {
        error: `Overflow: ${parsed.toString()} exceeds ${bitWidth}-bit signed range [${minSigned.toString()}, ${maxSigned.toString()}].`,
        bits: '0'.repeat(bitWidth),
        onesComp: '0'.repeat(bitWidth),
        signedVal: parsed,
        unsignedVal: 0n,
        hex: '',
        minSigned,
        maxSigned,
      };
    }
    const unsignedVal = parsed < 0n ? mod + parsed : parsed;
    const bits = unsignedVal.toString(2).padStart(bitWidth, '0');
    const magnitudeBits = (parsed < 0n ? -parsed : parsed).toString(2).padStart(bitWidth, '0');
    const onesComp =
      parsed < 0n
        ? magnitudeBits
            .split('')
            .map((b) => (b === '1' ? '0' : '1'))
            .join('')
        : bits;
    const hex = '0x' + unsignedVal.toString(16).toUpperCase().padStart(bitWidth / 4, '0');

    return {
      error: null,
      bits,
      onesComp,
      signedVal: parsed,
      unsignedVal,
      hex,
      minSigned,
      maxSigned,
    };
  }, [twosInput, bitWidth]);

  const toggleTwosBit = (bitIndexFromLeft: number) => {
    const chars = twosAnalysis.bits.split('');
    chars[bitIndexFromLeft] = chars[bitIndexFromLeft] === '1' ? '0' : '1';
    const nextUnsigned = BigInt('0b' + chars.join(''));
    const signThreshold = 1n << BigInt(bitWidth - 1);
    const mod = 1n << BigInt(bitWidth);
    const nextSigned = nextUnsigned >= signThreshold ? nextUnsigned - mod : nextUnsigned;
    setTwosInput(nextSigned.toString());
  };

  // IEEE 754 computed values
  const ieeeAnalysis = useMemo(() => {
    const trimmed = floatInput.trim();
    if (!trimmed) return { error: 'Enter a decimal floating-point number (e.g., -13.625, 0.1, Infinity, NaN).', data: null };
    let num: number;
    if (/^nan$/i.test(trimmed)) num = Number.NaN;
    else if (/^\+?inf(inity)?$/i.test(trimmed)) num = Infinity;
    else if (/^-inf(inity)?$/i.test(trimmed)) num = -Infinity;
    else {
      num = Number(trimmed);
      if (Number.isNaN(num)) {
        return { error: `Invalid floating-point number: "${trimmed}".`, data: null };
      }
    }
    return { error: null, data: encodeIeee754Float32(num) };
  }, [floatInput]);

  // Bitwise computed values
  const bitwiseAnalysis = useMemo(() => {
    const a = parseInt(opA.trim(), 10);
    const b = parseInt(opB.trim(), 10);
    if (Number.isNaN(a) || (bitOp !== 'NOT' && bitOp !== 'SHL' && bitOp !== 'SHR' && bitOp !== 'USHR' && Number.isNaN(b))) {
      return { error: 'Enter valid 32-bit decimal integers for operands.', result: 0, a: 0, b: 0 };
    }
    const a32 = a | 0;
    const b32 = Number.isNaN(b) ? 0 : b | 0;
    const s = Math.max(0, Math.min(31, shiftAmt));
    let res = 0;
    switch (bitOp) {
      case 'AND':
        res = a32 & b32;
        break;
      case 'OR':
        res = a32 | b32;
        break;
      case 'XOR':
        res = a32 ^ b32;
        break;
      case 'NOT':
        res = ~a32;
        break;
      case 'SHL':
        res = a32 << s;
        break;
      case 'SHR':
        res = a32 >> s;
        break;
      case 'USHR':
        res = a32 >>> s;
        break;
    }
    return { error: null, result: res, a: a32, b: b32 };
  }, [opA, opB, bitOp, shiftAmt]);

  const toBin32Spaced = (n: number) => {
    const raw = (n >>> 0).toString(2).padStart(32, '0');
    return raw.replace(/(.{8})/g, '$1 ').trim();
  };

  const buildCopyOutput = () => {
    if (activeTab === 'bases') {
      return `Binary: ${binStr}\nOctal: ${octStr}\nDecimal: ${decStr}\nHex: 0x${hexStr}`;
    }
    if (activeTab === 'twos') {
      return `${bitWidth}-bit Two's Complement for ${twosInput}:\nBinary: ${twosAnalysis.bits}\nHex: ${twosAnalysis.hex}\nUnsigned: ${twosAnalysis.unsignedVal.toString()}`;
    }
    if (activeTab === 'ieee754' && ieeeAnalysis.data) {
      const d = ieeeAnalysis.data;
      return `IEEE 754 Float32 (${floatInput}):\nSign: ${d.signBit}\nExponent: ${d.exponentBits} (raw=${d.exponentRaw}, unbiased=${d.exponentUnbiased})\nMantissa: ${d.mantissaBits}\nHex: ${d.hex}`;
    }
    return `Bitwise ${bitOp}: Result = ${bitwiseAnalysis.result} (0x${(bitwiseAnalysis.result >>> 0).toString(16).toUpperCase().padStart(8, '0')})\nBinary: ${toBin32Spaced(bitwiseAnalysis.result)}`;
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="Number Base, Two's Complement & IEEE 754 Converter"
        category="Systems & Logic"
        description="Real-time Binary, Octal, Decimal, and Hexadecimal conversion plus interactive Two's Complement registers, IEEE 754 float32 bitmaps, and bitwise arithmetic."
        onLoadSample={() => {
          syncFromBase('214', 10);
          setBitWidth(8);
          setTwosInput('-42');
          setFloatInput('-13.625');
          setOpA('170');
          setOpB('204');
          setBitOp('XOR');
        }}
        onCopyOutput={buildCopyOutput}
        onClear={() => {
          if (activeTab === 'bases') syncFromBase('', 10);
          else if (activeTab === 'twos') setTwosInput('0');
          else if (activeTab === 'ieee754') setFloatInput('0');
          else {
            setOpA('0');
            setOpB('0');
          }
        }}
      />

      {/* Interactive Mode Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        {(
          [
            { id: 'bases', label: 'Base Converter (2/8/10/16)' },
            { id: 'twos', label: "Two's Complement" },
            { id: 'ieee754', label: 'IEEE 754 Float32' },
            { id: 'bitwise', label: 'Bitwise Calculator' },
          ] as { id: ConverterTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BIDIRECTIONAL BASE CONVERTER */}
      {activeTab === 'bases' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Binary (Base 2)', prefix: '0b', value: binStr, base: 2 as const, placeholder: '11010110' },
              { label: 'Octal (Base 8)', prefix: '0o', value: octStr, base: 8 as const, placeholder: '326' },
              { label: 'Decimal (Base 10)', prefix: '10', value: decStr, base: 10 as const, placeholder: '214' },
              { label: 'Hexadecimal (Base 16)', prefix: '0x', value: hexStr, base: 16 as const, placeholder: 'D6' },
            ].map((field) => (
              <div key={field.base} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">{field.label}</label>
                <div className="flex items-stretch rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 bg-white">
                  <span className="px-3 flex items-center bg-slate-100 border-r border-slate-200 font-mono text-xs font-bold text-slate-500 select-none">
                    {field.prefix}
                  </span>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => syncFromBase(e.target.value, field.base)}
                    placeholder={field.placeholder}
                    spellCheck={false}
                    className="w-full px-3.5 py-3 font-mono text-sm text-slate-900 focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            ))}
          </div>

          {baseError && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{baseError}</span>
            </div>
          )}

          {!baseError && binStr && (
            <div className="rounded-xl bg-orange-50/60 border border-orange-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-500">Nibble-grouped Binary: </span>
                <span className="font-bold text-slate-900">
                  {binStr.replace('-', '').replace(/\B(?=(\d{4})+(?!\d))/g, ' ')}
                </span>
              </div>
              <div className="text-orange-800 font-semibold">
                Bit length: {binStr.replace('-', '').length} bits
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TWO'S COMPLEMENT */}
      {activeTab === 'twos' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 w-full sm:w-64">
              <label htmlFor="twos-int-input" className="text-xs font-semibold text-slate-700">
                Signed Decimal Integer
              </label>
              <input
                id="twos-int-input"
                type="text"
                value={twosInput}
                onChange={(e) => setTwosInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700">Register Width</div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {([8, 16, 32] as BitWidth[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setBitWidth(w)}
                    className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold cursor-pointer transition-colors ${
                      bitWidth === w ? 'bg-orange-600 text-white' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {w}-bit
                  </button>
                ))}
              </div>
            </div>
          </div>

          {twosAnalysis.error ? (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{twosAnalysis.error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">
                    Interactive Bit Register (Click any bit to toggle 0 / 1)
                  </span>
                  <span className="font-mono">
                    MSB (Bit {bitWidth - 1}) = Sign Bit ({twosAnalysis.bits[0] === '1' ? 'Negative' : 'Non-Negative'})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {twosAnalysis.bits.split('').map((bit, idx) => {
                    const isSign = idx === 0;
                    const bitPos = bitWidth - 1 - idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTwosBit(idx)}
                        className={`w-10 h-12 rounded-lg border font-mono flex flex-col items-center justify-center transition-colors cursor-pointer ${
                          isSign
                            ? 'bg-orange-600 text-white border-orange-700'
                            : bit === '1'
                            ? 'bg-orange-50 text-orange-800 border-orange-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                        title={`Toggle bit ${bitPos}`}
                      >
                        <span className="text-sm font-bold leading-none">{bit}</span>
                        <span className={`text-[9px] mt-1 ${isSign ? 'text-orange-100' : 'text-slate-400'}`}>
                          {bitPos}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs tabular-nums">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="text-slate-500 font-sans text-[11px] font-semibold">Signed Two&apos;s Complement</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{twosAnalysis.signedVal.toString()}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="text-slate-500 font-sans text-[11px] font-semibold">Unsigned Interpretation</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{twosAnalysis.unsignedVal.toString()}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="text-slate-500 font-sans text-[11px] font-semibold">Hexadecimal</div>
                  <div className="text-base font-bold text-orange-700 mt-1">{twosAnalysis.hex}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="text-slate-500 font-sans text-[11px] font-semibold">1&apos;s Complement Step</div>
                  <div className="text-xs font-bold text-slate-800 mt-1.5 break-all">{twosAnalysis.onesComp}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IEEE 754 SINGLE-PRECISION FLOAT32 */}
      {activeTab === 'ieee754' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-72 space-y-1.5">
              <label htmlFor="ieee-float-input" className="text-xs font-semibold text-slate-700">
                Decimal Floating-Point Number
              </label>
              <input
                id="ieee-float-input"
                type="text"
                value={floatInput}
                onChange={(e) => setFloatInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['-13.625', '0.1', '3.1415927', '-0', 'Infinity', 'NaN'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFloatInput(preset)}
                  className="px-2.5 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 font-mono text-xs font-semibold text-orange-800 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {ieeeAnalysis.error || !ieeeAnalysis.data ? (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{ieeeAnalysis.error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Color-Coded 32-Bit IEEE 754 Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono">
                <div className="lg:col-span-2 rounded-xl bg-orange-600 text-white p-4 space-y-1">
                  <div className="text-[11px] font-sans font-semibold text-orange-100">Sign (1 bit · b31)</div>
                  <div className="text-2xl font-bold">{ieeeAnalysis.data.signBit}</div>
                  <div className="text-[11px] font-sans text-orange-100">
                    {ieeeAnalysis.data.signBit === '1' ? 'Negative (-1)' : 'Positive (+1)'}
                  </div>
                </div>

                <div className="lg:col-span-4 rounded-xl bg-slate-900 text-white p-4 space-y-1">
                  <div className="text-[11px] font-sans font-semibold text-slate-300">Exponent (8 bits · b30–b23)</div>
                  <div className="text-lg font-bold tracking-wider">{ieeeAnalysis.data.exponentBits}</div>
                  <div className="text-[11px] font-sans text-slate-300 tabular-nums">
                    Biased = {ieeeAnalysis.data.exponentRaw} · Unbiased (E - 127) = {ieeeAnalysis.data.exponentUnbiased}
                  </div>
                </div>

                <div className="lg:col-span-6 rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-1">
                  <div className="text-[11px] font-sans font-semibold text-orange-800">Mantissa / Fraction (23 bits · b22–b0)</div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 break-all tracking-wider">
                    {ieeeAnalysis.data.mantissaBits}
                  </div>
                  <div className="text-[11px] font-sans text-slate-600 tabular-nums">
                    Fraction = {ieeeAnalysis.data.mantissaFrac.toPrecision(7)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs tabular-nums">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="font-sans text-[11px] font-semibold text-slate-500">Hexadecimal Word</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{ieeeAnalysis.data.hex}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="font-sans text-[11px] font-semibold text-slate-500">Exact Stored Float32 Value</div>
                  <div className="text-sm font-bold text-orange-700 mt-1">
                    {Object.is(ieeeAnalysis.data.actualStored, -0) ? '-0' : String(ieeeAnalysis.data.actualStored)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <div className="font-sans text-[11px] font-semibold text-slate-500">IEEE Classification</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 font-sans">{ieeeAnalysis.data.classification}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BITWISE CALCULATOR */}
      {activeTab === 'bitwise' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Operand A (Decimal 32-bit)</label>
              <input
                type="text"
                value={opA}
                onChange={(e) => setOpA(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Bitwise Operator</label>
              <div className="flex flex-wrap gap-1.5">
                {(['AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR', 'USHR'] as BitwiseOp[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setBitOp(op)}
                    className={`px-2.5 py-2 rounded-lg font-mono text-xs font-bold cursor-pointer border transition-colors ${
                      bitOp === op
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-orange-400'
                    }`}
                  >
                    {op === 'SHL' ? '<<' : op === 'SHR' ? '>>' : op === 'USHR' ? '>>>' : op}
                  </button>
                ))}
              </div>
            </div>

            {bitOp === 'SHL' || bitOp === 'SHR' || bitOp === 'USHR' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Shift Amount: <span className="font-mono text-orange-700">{shiftAmt} bits</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={31}
                  value={shiftAmt}
                  onChange={(e) => setShiftAmt(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>
            ) : bitOp !== 'NOT' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Operand B (Decimal 32-bit)</label>
                <input
                  type="text"
                  value={opB}
                  onChange={(e) => setOpB(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ) : (
              <div className="text-xs text-slate-500 pb-2">Unary bitwise complement (~A)</div>
            )}
          </div>

          {bitwiseAnalysis.error ? (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800">
              {bitwiseAnalysis.error}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-950 text-slate-100 p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto tabular-nums">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 w-24 shrink-0">A ({bitwiseAnalysis.a})</span>
                <span className="tracking-wider">{toBin32Spaced(bitwiseAnalysis.a)}</span>
              </div>
              {bitOp !== 'NOT' && bitOp !== 'SHL' && bitOp !== 'SHR' && bitOp !== 'USHR' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 w-24 shrink-0">B ({bitwiseAnalysis.b})</span>
                  <span className="tracking-wider">{toBin32Spaced(bitwiseAnalysis.b)}</span>
                </div>
              )}
              <div className="border-t border-slate-700 pt-2 flex items-center justify-between gap-4 text-orange-400 font-bold">
                <span className="w-24 shrink-0">
                  RES ({bitwiseAnalysis.result})
                </span>
                <span className="tracking-wider">{toBin32Spaced(bitwiseAnalysis.result)}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Hex: 0x{(bitwiseAnalysis.result >>> 0).toString(16).toUpperCase().padStart(8, '0')} · Unsigned 32-bit: {bitwiseAnalysis.result >>> 0}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
