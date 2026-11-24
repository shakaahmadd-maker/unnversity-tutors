import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CsToolWorkspaceHeader } from './CsToolShared';

function parseIpv4ToUint32(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    acc = ((acc << 8) | n) >>> 0;
  }
  return acc >>> 0;
}

function uint32ToIpv4(val: number): string {
  return [
    (val >>> 24) & 255,
    (val >>> 16) & 255,
    (val >>> 8) & 255,
    val & 255,
  ].join('.');
}

function prefixToMaskUint32(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff >>> 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function maskUint32ToPrefix(mask: number): number | null {
  const bin = (mask >>> 0).toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(bin)) return null;
  return bin.indexOf('0') === -1 ? 32 : bin.indexOf('0');
}

function getIpClassAndScope(ipUint: number): { ipClass: string; scope: string } {
  const first = (ipUint >>> 24) & 255;
  const second = (ipUint >>> 16) & 255;

  let ipClass = 'Class A';
  if (first >= 128 && first <= 191) ipClass = 'Class B';
  else if (first >= 192 && first <= 223) ipClass = 'Class C';
  else if (first >= 224 && first <= 239) ipClass = 'Class D (Multicast)';
  else if (first >= 240) ipClass = 'Class E (Experimental)';

  let scope = 'Public (Globally Routable)';
  if (first === 10) scope = 'Private (RFC 1918 · 10.0.0.0/8)';
  else if (first === 172 && second >= 16 && second <= 31) scope = 'Private (RFC 1918 · 172.16.0.0/12)';
  else if (first === 192 && second === 168) scope = 'Private (RFC 1918 · 192.168.0.0/16)';
  else if (first === 127) scope = 'Loopback (127.0.0.0/8)';
  else if (first === 169 && second === 254) scope = 'Link-Local / APIPA (169.254.0.0/16)';
  else if (first === 100 && second >= 64 && second <= 127) scope = 'Shared Address Space / CGNAT (RFC 6598)';
  else if (first >= 224 && first <= 239) scope = 'Multicast (224.0.0.0/4)';
  else if (first === 0) scope = 'Current Network (0.0.0.0/8)';

  return { ipClass, scope };
}

const SUBNET_PRESETS = [
  { label: '192.168.10.42 /24 (Office LAN)', ip: '192.168.10.42', cidr: 24 },
  { label: '10.24.16.5 /16 (Campus Network)', ip: '10.24.16.5', cidr: 16 },
  { label: '172.16.45.190 /26 (62-Host Subnet)', ip: '172.16.45.190', cidr: 26 },
  { label: '203.0.113.17 /29 (6-Host DMZ)', ip: '203.0.113.17', cidr: 29 },
  { label: '198.51.100.2 /31 (P2P Router Link)', ip: '198.51.100.2', cidr: 31 },
];

export default function SubnetCalculatorTool() {
  const [ipInput, setIpInput] = useState<string>('192.168.10.42');
  const [cidr, setCidr] = useState<number>(24);
  const [maskInput, setMaskInput] = useState<string>('255.255.255.0');
  const [maskError, setMaskError] = useState<string | null>(null);

  const handleCidrChange = (nextCidr: number) => {
    const clamped = Math.max(0, Math.min(32, Math.round(nextCidr)));
    setCidr(clamped);
    setMaskInput(uint32ToIpv4(prefixToMaskUint32(clamped)));
    setMaskError(null);
  };

  const handleMaskInputChange = (val: string) => {
    setMaskInput(val);
    const parsed = parseIpv4ToUint32(val);
    if (parsed === null) {
      setMaskError('Enter a valid dotted-decimal IPv4 subnet mask (e.g., 255.255.255.0).');
      return;
    }
    const derivedPrefix = maskUint32ToPrefix(parsed);
    if (derivedPrefix === null) {
      setMaskError('Subnet mask bits must be contiguous 1s followed by 0s (e.g., 255.255.240.0).');
      return;
    }
    setMaskError(null);
    setCidr(derivedPrefix);
  };

  useEffect(() => {
    const onLoadPreset = (e: Event) => {
      const ce = e as CustomEvent<{ slug?: string; presetIndex?: number }>;
      if (ce.detail?.slug !== 'subnet-calculator') return;
      if (ce.detail?.presetIndex === 1) {
        setIpInput('10.10.0.4');
        handleCidrChange(31);
      } else {
        setIpInput('192.168.10.42');
        handleCidrChange(26);
      }
    };
    window.addEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
    return () => window.removeEventListener('ut-cs-load-preset', onLoadPreset as EventListener);
  }, []);

  const result = useMemo(() => {
    const ipUint = parseIpv4ToUint32(ipInput);
    if (ipUint === null) {
      return {
        error: 'Invalid IPv4 address. Enter four octets between 0 and 255 (e.g., 192.168.10.42).',
        data: null,
      };
    }

    const maskUint = prefixToMaskUint32(cidr);
    const wildcardUint = (~maskUint) >>> 0;
    const networkUint = (ipUint & maskUint) >>> 0;
    const broadcastUint = (networkUint | wildcardUint) >>> 0;
    const totalAddresses = Math.pow(2, 32 - cidr);

    let usableHosts = Math.max(0, totalAddresses - 2);
    let firstUsable = uint32ToIpv4((networkUint + 1) >>> 0);
    let lastUsable = uint32ToIpv4((broadcastUint - 1) >>> 0);

    if (cidr === 32) {
      usableHosts = 1;
      firstUsable = uint32ToIpv4(networkUint);
      lastUsable = uint32ToIpv4(networkUint);
    } else if (cidr === 31) {
      // RFC 3021 point-to-point link
      usableHosts = 2;
      firstUsable = uint32ToIpv4(networkUint);
      lastUsable = uint32ToIpv4(broadcastUint);
    }

    const { ipClass, scope } = getIpClassAndScope(ipUint);
    const ipBin = ipUint.toString(2).padStart(32, '0');
    const maskBin = maskUint.toString(2).padStart(32, '0');
    const networkBin = networkUint.toString(2).padStart(32, '0');

    return {
      error: null,
      data: {
        ipAddress: uint32ToIpv4(ipUint),
        cidr,
        cidrNotation: `${uint32ToIpv4(networkUint)}/${cidr}`,
        subnetMask: uint32ToIpv4(maskUint),
        wildcardMask: uint32ToIpv4(wildcardUint),
        networkAddress: uint32ToIpv4(networkUint),
        broadcastAddress: cidr === 31 ? 'N/A (RFC 3021 P2P)' : uint32ToIpv4(broadcastUint),
        firstUsable,
        lastUsable,
        totalAddresses,
        usableHosts,
        ipClass,
        scope,
        ipBin,
        maskBin,
        networkBin,
      },
    };
  }, [ipInput, cidr]);

  const buildCopyOutput = () => {
    if (!result.data) return null;
    const d = result.data;
    return [
      `IPv4 / CIDR: ${d.ipAddress}/${d.cidr}`,
      `Network Address: ${d.networkAddress}`,
      `Broadcast Address: ${d.broadcastAddress}`,
      `Usable Host Range: ${d.firstUsable} - ${d.lastUsable}`,
      `Total IPs: ${d.totalAddresses.toLocaleString()} | Usable Hosts: ${d.usableHosts.toLocaleString()}`,
      `Subnet Mask: ${d.subnetMask} | Wildcard Mask: ${d.wildcardMask}`,
      `Class: ${d.ipClass} | Scope: ${d.scope}`,
    ].join('\n');
  };

  return (
    <div className="space-y-6">
      <CsToolWorkspaceHeader
        title="IPv4 / CIDR Subnet Mask Calculator"
        category="Networking & Security"
        description="Calculate Network ID, Broadcast Address, First/Last Usable Host, Wildcard Mask, IP Class, RFC 1918 scope, and a 32-bit binary network/host bit map."
        onLoadSample={() => {
          setIpInput('192.168.10.42');
          handleCidrChange(24);
        }}
        onCopyOutput={buildCopyOutput}
        onClear={() => {
          setIpInput('10.0.0.1');
          handleCidrChange(24);
        }}
      />

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {SUBNET_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setIpInput(p.ip);
              handleCidrChange(p.cidr);
            }}
            className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-800 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="md:col-span-4 space-y-1.5">
          <label htmlFor="ipv4-addr-input" className="text-xs font-semibold text-slate-700">
            IPv4 Address
          </label>
          <input
            id="ipv4-addr-input"
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="192.168.10.42"
            spellCheck={false}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label htmlFor="cidr-range" className="text-xs font-semibold text-slate-700 flex justify-between">
            <span>CIDR Prefix Length</span>
            <span className="font-mono font-bold text-orange-700">/{cidr}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              id="cidr-range"
              type="range"
              min={0}
              max={32}
              value={cidr}
              onChange={(e) => handleCidrChange(Number(e.target.value))}
              className="w-full accent-orange-600"
            />
            <input
              type="number"
              min={0}
              max={32}
              value={cidr}
              onChange={(e) => handleCidrChange(Number(e.target.value))}
              aria-label="CIDR prefix numeric value"
              className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-2 font-mono text-xs text-center text-slate-900"
            />
          </div>
        </div>

        <div className="md:col-span-4 space-y-1.5">
          <label htmlFor="subnet-mask-input" className="text-xs font-semibold text-slate-700">
            Dotted Subnet Mask
          </label>
          <input
            id="subnet-mask-input"
            type="text"
            value={maskInput}
            onChange={(e) => handleMaskInputChange(e.target.value)}
            placeholder="255.255.255.0"
            spellCheck={false}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {(result.error || maskError) && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{result.error || maskError}</span>
        </div>
      )}

      {result.data && !maskError && (
        <div className="space-y-5">
          {/* Core Subnet Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono tabular-nums">
            {[
              { label: 'Network Address (CIDR)', value: result.data.cidrNotation, highlight: true },
              { label: 'Broadcast Address', value: result.data.broadcastAddress },
              { label: 'First Usable Host', value: result.data.firstUsable },
              { label: 'Last Usable Host', value: result.data.lastUsable },
              { label: 'Total IP Addresses', value: result.data.totalAddresses.toLocaleString() },
              { label: 'Usable Host Addresses', value: result.data.usableHosts.toLocaleString(), highlight: true },
              { label: 'Subnet Mask', value: result.data.subnetMask },
              { label: 'Wildcard Mask (ACL)', value: result.data.wildcardMask },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl border p-3.5 ${
                  item.highlight
                    ? 'bg-orange-50/70 border-orange-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-sans text-[11px] font-semibold text-slate-500">{item.label}</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 break-all">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Classification Strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">IP Class: </span>
              <span className="font-bold text-slate-900">{result.data.ipClass}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Address Scope: </span>
              <span className="font-bold text-orange-700">{result.data.scope}</span>
            </div>
            <div className="font-mono">
              <span className="text-slate-500 font-sans font-medium">Bit Split: </span>
              <span className="font-bold text-orange-700">{cidr} Network bits</span>
              <span className="text-slate-400"> / </span>
              <span className="font-bold text-slate-800">{32 - cidr} Host bits</span>
            </div>
          </div>

          {/* 32-Bit Color-Coded Binary Bit Map */}
          <div className="rounded-xl border border-slate-200 bg-slate-950 text-slate-100 p-4 sm:p-5 space-y-4 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white">32-Bit Binary Network vs. Host Bit Map</h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-orange-400 font-semibold">Orange = Network Prefix ({cidr} bits)</span>
                <span className="text-sky-300 font-semibold">Slate/Blue = Host Portion ({32 - cidr} bits)</span>
              </div>
            </div>

            {[
              { label: 'IPv4 Address', bits: result.data.ipBin },
              { label: 'Subnet Mask', bits: result.data.maskBin },
              { label: 'Network ID', bits: result.data.networkBin },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">{row.label}</div>
                <div className="grid grid-cols-4 gap-3 min-w-[600px]">
                  {[0, 1, 2, 3].map((octetIdx) => {
                    const start = octetIdx * 8;
                    const octetBits = row.bits.slice(start, start + 8);
                    return (
                      <div key={octetIdx} className="flex items-center gap-0.5">
                        {octetBits.split('').map((b, bitOff) => {
                          const globalIdx = start + bitOff;
                          const isNetworkBit = globalIdx < cidr;
                          return (
                            <span
                              key={globalIdx}
                              className={`flex-1 py-1.5 text-center rounded font-mono text-xs font-bold tabular-nums ${
                                isNetworkBit
                                  ? 'bg-orange-600/90 text-white'
                                  : 'bg-slate-800 text-sky-300'
                              }`}
                            >
                              {b}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
