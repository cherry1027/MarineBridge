"use client";

import { Anchor, Bluetooth, Cable, Check, ChevronDown, Cpu, DoorOpen, Lightbulb, Network, Play, Radio, Thermometer, Waves, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Protocol = "J1939" | "NMEA 2000" | "Zigbee" | "BLE";
type Device = { id: string; name: string; entity: "Light" | "TemperatureSensor" | "DoorSensor"; protocol: Protocol; state: string };

const initialDevices: Device[] = [
  { id: "cabin-light", name: "Cabin Light", entity: "Light", protocol: "J1939", state: "OFF" },
  { id: "deck-light", name: "Deck Light", entity: "Light", protocol: "Zigbee", state: "OFF" },
  { id: "temperature", name: "Temperature", entity: "TemperatureSensor", protocol: "NMEA 2000", state: "21.8 °C" },
  { id: "door-sensor", name: "Door Sensor", entity: "DoorSensor", protocol: "BLE", state: "CLOSED" },
];

const ratings = [
  { name: "MQTT", scores: [4, 4, 5, 2] },
  { name: "Home Assistant Core", scores: [5, 5, 3, 3] },
  { name: "Node-RED", scores: [4, 5, 4, 4] },
  { name: "Custom Adapter Layer", scores: [5, 5, 5, 1] },
];
const metricLabels = ["Protocol integration", "Extensibility", "Edge suitability", "Low effort"];

function DeviceIcon({ entity }: { entity: Device["entity"] }) {
  if (entity === "Light") return <Lightbulb size={19} />;
  if (entity === "TemperatureSensor") return <Thermometer size={19} />;
  return <DoorOpen size={19} />;
}

export default function Home() {
  const [devices, setDevices] = useState(initialDevices);
  const [active, setActive] = useState<Device | null>(null);
  const [stage, setStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [demoStatus, setDemoStatus] = useState<"idle" | "running" | "pass">("idle");
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { const timer = setTimeout(fn, ms); timers.current.push(timer); };
  const commandFor = (protocol: Protocol) => protocol === "J1939" ? "simulated CAN message · PGN 61184" : protocol === "Zigbee" ? "simulated Zigbee On command · 0x01" : "simulated protocol payload";

  // Both command buttons and the automatic demo deliberately call this same simulated API.
  const simulatedApi = (id: string, demo = false, delay = 0) => {
    const device = initialDevices.find((item) => item.id === id)!;
    later(() => {
      setActive(device); setStage(1); setLogs([]);
      later(() => setStage(2), 240); later(() => setStage(3), 480); later(() => setStage(4), 720);
      later(() => {
        setStage(5);
        setDevices((current) => current.map((item) => item.id === id ? { ...item, state: "ON" } : item));
        setLogs(["API: setState(ON)", `Entity: ${device.entity}`, `Protocol: ${device.protocol}`, `Translated command: ${commandFor(device.protocol)}`, "Result: SUCCESS"]);
        if (!demo) { setBusy(false); later(() => setStage(0), 1400); }
      }, 960);
    }, delay);
  };

  const runCommand = (id: string) => {
    if (busy) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setDemoStatus("idle"); setBusy(true); simulatedApi(id);
  };
  const runDemo = () => {
    if (busy) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setBusy(true); setDemoStatus("running"); setDevices(initialDevices);
    simulatedApi("cabin-light", true, 150); simulatedApi("deck-light", true, 1500);
    later(() => { setDemoStatus("pass"); setBusy(false); setStage(0); }, 2850);
  };
  const routeActive = (protocol?: Protocol) => active && stage > 0 && (!protocol || active.protocol === protocol);

  return (
    <main className="min-h-screen overflow-hidden bg-[#061018] text-[#e7f3f5]">
      <div className="ocean-grid" aria-hidden="true" />
      <div className="mx-auto max-w-[1480px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0a1923]/90 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-3"><div className="brand-mark"><Waves size={22} /></div><div><div className="flex items-baseline gap-2"><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">MarineBridge</h1><span className="hidden text-sm text-slate-400 sm:inline">Universal Marine IoT Gateway</span></div><p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-cyan-300/80">Protocol abstraction console</p></div></div>
          <div className="research-badge"><span className="pulse-dot" /> Research Prototype — Synthetic Devices &amp; Simulated Protocols</div>
        </header>

        <section aria-labelledby="devices-title" className="grid gap-4 xl:grid-cols-[0.9fr_1.65fr]">
          <div className="panel p-5">
            <div className="section-kicker">01 · Device panel</div>
            <div className="mb-4 flex items-end justify-between"><div><h2 id="devices-title" className="section-title">Standardized entities</h2><p className="section-copy">Four devices. One predictable software model.</p></div><span className="status-small"><span /> 4 online</span></div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {devices.map((device) => {
                const isActive = active?.id === device.id && stage > 0;
                return <article key={device.id} className={`device-row ${isActive ? "device-active" : ""}`}><div className={`device-icon ${device.state === "ON" ? "device-on" : ""}`}><DeviceIcon entity={device.entity} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-medium text-slate-100">{device.name}</h3><span className={`device-state ${device.state === "ON" ? "is-on" : ""}`}>{device.state}</span></div><div className="mt-1 flex items-center justify-between gap-2 text-xs"><span className="truncate font-mono text-slate-500">{device.entity}</span><span className="protocol-chip">{device.protocol}</span></div></div></article>;
              })}
            </div>
          </div>

          <div className="panel relative overflow-hidden p-5">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="section-kicker">02 · Universal API demo <span className="ml-2 rounded bg-cyan-300/10 px-2 py-0.5 text-cyan-300">Main feature</span></div>
            <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
              <div><h2 className="section-title">One command surface.</h2><p className="section-copy max-w-md">The application never needs to know which wire, radio, or marine bus sits underneath.</p>
                <div className="api-block mt-5"><div className="flex items-center gap-2 border-b border-white/7 px-4 py-3"><span className="method">POST</span><code>/api/device/&#123;id&#125;/state</code></div><pre>{`{ "state": "ON" }`}</pre></div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2"><button disabled={busy} onClick={() => runCommand("cabin-light")} className="command-button"><Cable size={16} /> Turn CAN Light ON</button><button disabled={busy} onClick={() => runCommand("deck-light")} className="command-button"><Radio size={16} /> Turn Zigbee Light ON</button></div>
                <button disabled={busy} onClick={runDemo} className="demo-button mt-3 w-full"><Play size={16} fill="currentColor" /> {demoStatus === "running" ? "RUNNING THESIS DEMO…" : "RUN THESIS DEMO"}</button>
              </div>
              <div className="flow-card" aria-live="polite">
                <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Live command route</span><span className={`signal-badge ${stage ? "signal-live" : ""}`}>{stage ? "SIGNAL LIVE" : "STANDBY"}</span></div>
                {["Universal API", "Standard Entity", "Protocol Adapter", active?.protocol ?? "Protocol", active?.name ?? "Device"].map((label, index) => <div key={`${label}-${index}`}><div className={`flow-step ${stage >= index + 1 ? "flow-active" : ""}`}><span className="flow-index">0{index + 1}</span><span>{index === 1 && active ? active.entity : label}</span>{stage >= index + 1 && <Check size={14} />}</div>{index < 4 && <div className={`flow-line ${stage > index + 1 ? "flow-line-active" : ""}`}><ChevronDown size={13} /></div>}</div>)}
                <div className={`same-api ${stage === 5 ? "same-api-active" : ""}`}>SAME API <span>—</span> DIFFERENT PROTOCOL</div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="abstraction-title" className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="panel p-5"><div className="section-kicker">03 · Protocol abstraction</div><div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div><h2 id="abstraction-title" className="section-title">Layered gateway architecture</h2><div className="architecture mt-4">
              {["Application", "Universal API", "Standard Entity Model", "Protocol Adapter Layer"].map((label, index) => <div key={label} className="flex flex-col items-center"><div className={`architecture-node ${stage >= Math.min(index + 1, 3) && stage > 0 ? "architecture-active" : ""}`}>{index === 0 ? <Cpu size={16} /> : index === 1 ? <Network size={16} /> : index === 2 ? <Anchor size={16} /> : <Zap size={16} />} {label}</div>{index < 3 && <div className={`architecture-line ${stage > index + 1 ? "architecture-line-active" : ""}`} />}</div>)}
              <div className="protocol-branches">{(["J1939", "NMEA 2000", "Zigbee", "BLE"] as Protocol[]).map((protocol) => <div key={protocol} className={`protocol-node ${routeActive(protocol) ? "protocol-node-active" : ""}`}>{protocol === "BLE" && <Bluetooth size={13} />}{protocol}</div>)}</div>
            </div></div>
            <div className="log-panel"><div className="flex items-center justify-between border-b border-white/7 px-4 py-3"><span className="font-mono text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">Translation log</span><span className="flex items-center gap-1.5 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> ready</span></div><div className="min-h-[194px] p-4 font-mono text-[13px] leading-7">{logs.length ? logs.map((log, index) => <div key={log} className="log-line" style={{ animationDelay: `${index * 80}ms` }}><span>{String(index + 1).padStart(2, "0")}</span> {log}</div>) : <div className="flex min-h-[160px] items-center justify-center text-center text-slate-600">Awaiting API command…<br />Select a light to trace translation.</div>}</div></div>
          </div></div>

          <div className="panel p-5"><div className="section-kicker">04 · Open-source reuse</div><h2 className="section-title">Preliminary Technology Evaluation</h2><p className="section-copy">Indicative fit for an edge gateway prototype.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr><th>Candidate</th>{metricLabels.map((label) => <th key={label} title={label}>{label.split(" ")[0]}</th>)}</tr></thead><tbody>{ratings.map((item) => <tr key={item.name}><td>{item.name}</td>{item.scores.map((score, i) => <td key={i}><div className="rating" aria-label={`${score} of 5`}><span style={{ width: `${score * 20}%` }} /></div><small>{score}/5</small></td>)}</tr>)}</tbody></table></div><div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span className="h-px flex-1 bg-white/8" /> Higher is better · Low effort is inverse complexity</div></div>
        </section>

        <section aria-live="assertive" className={`result-banner ${demoStatus === "pass" ? "result-visible" : ""}`}><div className="result-check"><Check size={22} strokeWidth={3} /></div><div><strong>PROTOCOL ABSTRACTION TEST: PASS</strong><span>2 devices • 2 protocols • 1 API</span></div><div className="ml-auto hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200/70 sm:flex"><span>J1939 ✓</span><span>Zigbee ✓</span></div></section>
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600"><span>MarineBridge / Thesis demonstrator / v0.1</span><span>Synthetic simulation only · No hardware I/O</span></footer>
      </div>
    </main>
  );
}
