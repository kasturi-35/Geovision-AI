import React, { useEffect, useMemo, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { fromLonLat } from "ol/proj";
import { Fill, Stroke, Style, Text } from "ol/style";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudUpload,
  Database,
  FileCheck2,
  FileText,
  Layers3,
  MapPinned,
  Menu,
  PanelRight,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  X,
  Zap
} from "lucide-react";

const demoParcels = [
  { id: "UV-1028", area: "1,245 m²", confidence: 94.6, status: "Validated", issue: "None", coords: [[78.4050,17.4250],[78.4064,17.4252],[78.4061,17.4265],[78.4047,17.4263]] },
  { id: "UV-1029", area: "982 m²", confidence: 88.2, status: "Accepted", issue: "None", coords: [[78.4066,17.4251],[78.4080,17.4253],[78.4077,17.4267],[78.4062,17.4265]] },
  { id: "UV-1030", area: "1,514 m²", confidence: 72.4, status: "Review", issue: "Boundary obscured", coords: [[78.4048,17.4267],[78.4061,17.4268],[78.4058,17.4282],[78.4044,17.4280]] },
  { id: "UV-1031", area: "768 m²", confidence: 61.8, status: "Field Verify", issue: "Dense structure", coords: [[78.4063,17.4270],[78.4077,17.4269],[78.4079,17.4283],[78.4061,17.4284]] },
  { id: "UV-1032", area: "1,105 m²", confidence: 91.3, status: "Validated", issue: "None", coords: [[78.4080,17.4270],[78.4093,17.4272],[78.4090,17.4284],[78.4078,17.4283]] }
];

const navItems = [
  ["Dashboard", BarChart3],
  ["Map Workspace", MapPinned],
  ["Upload Imagery", CloudUpload],
  ["AI Extraction", Sparkles],
  ["Validation", ClipboardCheck],
  ["Review Queue", Users],
  ["Reports", FileText]
];

function App() {
  const [active, setActive] = useState("Dashboard");
  const [selected, setSelected] = useState(demoParcels[0]);
  const [layers, setLayers] = useState({ parcels: true, buildings: true, roads: true, confidence: false });
  const [notice, setNotice] = useState("");
  const [processing, setProcessing] = useState(false);
  const [uploadName, setUploadName] = useState("");

  const selectNav = (name) => {
    setActive(name);
    setNotice("");
  };

  const runAI = () => {
    setProcessing(true);
    setNotice("AI analysis started: feature extraction → topology validation → confidence scoring.");
    setTimeout(() => {
      setProcessing(false);
      setNotice("AI analysis completed successfully. 1,167 preliminary features generated.");
    }, 1800);
  };

  const changeStatus = (status) => {
    setSelected((p) => ({ ...p, status }));
    setNotice(`${selected.id} marked as ${status}.`);
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onSelect={selectNav} />
      <div className="main-area">
        <Topbar active={active} />
        <main className="content">
          {active === "Dashboard" && (
            <Dashboard
              onMap={() => selectNav("Map Workspace")}
              onUpload={() => selectNav("Upload Imagery")}
              onAI={runAI}
              processing={processing}
            />
          )}
          {active === "Map Workspace" && (
            <MapWorkspace
              selected={selected}
              setSelected={setSelected}
              layers={layers}
              setLayers={setLayers}
              onStatus={changeStatus}
            />
          )}
          {active === "Upload Imagery" && (
            <UploadScreen
              uploadName={uploadName}
              setUploadName={setUploadName}
              onAI={runAI}
              processing={processing}
              notice={notice}
            />
          )}
          {active === "AI Extraction" && (
            <AIExtraction processing={processing} onRun={runAI} notice={notice} />
          )}
          {active === "Validation" && <Validation />}
          {active === "Review Queue" && <ReviewQueue onSelect={(p) => { setSelected(p); selectNav("Map Workspace"); }} />}
          {active === "Reports" && <Reports />}
        </main>
        <footer className="footer">
          <span><ShieldCheck size={14}/> AI-assisted preliminary mapping</span>
          <span>DEMO DATA • SIH 2026 Prototype</span>
          <span>Final cadastral/legal decisions remain with authorized authorities.</span>
        </footer>
      </div>
      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}
    </div>
  );
}

function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Layers3 size={23}/></div>
        <div><strong>GEO VISION</strong><span>AI</span><small>URBAN GIS INTELLIGENCE</small></div>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {navItems.map(([name, Icon]) => (
          <button key={name} className={active === name ? "nav-item active" : "nav-item"} onClick={() => onSelect(name)}>
            <Icon size={18}/><span>{name}</span>{active === name && <ChevronRight size={15}/>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="system-card"><span className="live-dot"></span><div><b>System Online</b><small>GIS services operational</small></div></div>
        <button className="nav-item"><Settings size={18}/><span>Settings</span></button>
      </div>
    </aside>
  );
}

function Topbar({ active }) {
  return (
    <header className="topbar">
      <div className="mobile-title"><Menu size={20}/><b>GEO VISION AI</b></div>
      <div className="breadcrumb"><span>GEO VISION AI</span><ChevronRight size={14}/><b>{active}</b></div>
      <div className="top-actions">
        <div className="demo-badge"><span className="pulse"></span> DEMO ENVIRONMENT</div>
        <div className="user-chip"><div className="avatar">GV</div><div><b>Surveyor</b><small>Authorized User</small></div></div>
      </div>
    </header>
  );
}

function Dashboard({ onMap, onUpload, onAI, processing }) {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> AI + GIS INTEGRATED URBAN MAPPING</div>
          <h1>Urban Parcel Mapping <span>&amp; Cadastral Intelligence</span></h1>
          <p>AI-assisted extraction of buildings, roads and parcel boundaries from georeferenced imagery with confidence-based surveyor verification.</p>
          <div className="hero-actions"><button className="primary" onClick={onMap}><MapPinned size={17}/> Open Map Workspace</button><button className="secondary" onClick={onUpload}><Upload size={17}/> Upload Imagery</button></div>
        </div>
        <div className="hero-status"><div className="radar"><div className="radar-ring"></div><Sparkles size={30}/></div><b>AI ENGINE</b><small>READY FOR ANALYSIS</small></div>
      </section>
      <div className="stat-grid">
        <Stat icon={MapPinned} label="TOTAL PARCELS" value="1,284" sub="+8.4% processed"/>
        <Stat icon={Sparkles} label="AI DETECTED" value="1,167" sub="Preliminary extraction"/>
        <Stat icon={CheckCircle2} label="HIGH CONFIDENCE" value="982" sub="≥ 85% confidence"/>
        <Stat icon={AlertTriangle} label="NEEDS REVIEW" value="185" sub="Human verification"/>
      </div>
      <div className="dashboard-grid">
        <section className="panel mini-map-panel">
          <PanelTitle title="Urban Mapping Overview" icon={MapPinned} action="OPEN MAP" onAction={onMap}/>
          <MiniMap/>
        </section>
        <section className="panel">
          <PanelTitle title="AI Processing Pipeline" icon={Activity}/>
          <div className="pipeline">
            {["Georeferenced imagery","AI feature extraction","Parcel generation","Topology validation","Confidence scoring"].map((x,i)=>
              <div className="pipeline-row" key={x}><span className="step-num">{i+1}</span><span>{x}</span><CheckCircle2 size={17}/></div>
            )}
          </div>
          <button className="wide-primary" onClick={onAI}>{processing ? <><RefreshCw className="spin" size={17}/> Processing...</> : <><Zap size={17}/> Run AI Analysis</>}</button>
        </section>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}

function PanelTitle({ title, icon: Icon, action, onAction }) {
  return <div className="panel-title"><div><Icon size={18}/><b>{title}</b></div>{action && <button onClick={onAction}>{action}<ChevronRight size={14}/></button>}</div>;
}

function MiniMap() {
  return <div className="mini-map"><div className="map-grid"></div>{[
    [18,28,20,22],[40,19,18,25],[61,31,21,18],[26,57,18,22],[48,52,22,23],[73,57,15,20]
  ].map((p,i)=><div key={i} className="mini-parcel" style={{left:`${p[0]}%`,top:`${p[1]}%`,width:`${p[2]}%`,height:`${p[3]}%`}}></div>)}<div className="map-tag"><span></span> LIVE GIS VIEW • DEMO</div></div>;
}

function MapWorkspace({ selected, setSelected, layers, setLayers, onStatus }) {
  return <section className="workspace">
    <div className="workspace-head"><div><div className="eyebrow">GIS WORKSPACE</div><h2>Urban Parcel Map</h2><p>Interactive preliminary cadastral feature view</p></div><div className="map-tools"><button><Search size={17}/></button><button><RefreshCw size={17}/></button></div></div>
    <div className="gis-layout">
      <RealMap selected={selected} setSelected={setSelected} layers={layers}/>
      <aside className="parcel-panel">
        <div className="panel-section-head"><span>SELECTED PARCEL</span><span className="status-dot"></span></div>
        <div className="parcel-id">{selected.id}<span>{selected.status}</span></div>
        <div className="confidence-box"><div><small>AI CONFIDENCE</small><strong>{selected.confidence}%</strong></div><div className="confidence-bar"><i style={{width:`${selected.confidence}%`}}></i></div></div>
        <InfoRow label="Parcel Area" value={selected.area}/><InfoRow label="Building Detected" value="YES"/><InfoRow label="Topology Status" value="VALID"/><InfoRow label="Issue" value={selected.issue}/>
        <div className="panel-section-head">MAP LAYERS</div>
        {[["parcels","Parcel Boundaries"],["buildings","Buildings"],["roads","Road Network"],["confidence","Confidence Heatmap"]].map(([key,label])=>
          <label className="toggle-row" key={key}><span>{label}</span><input type="checkbox" checked={layers[key]} onChange={e=>setLayers({...layers,[key]:e.target.checked})}/><i></i></label>
        )}
        <div className="panel-section-head">SURVEYOR ACTION</div>
        <div className="action-grid">
          <button className="accept" onClick={()=>onStatus("Accepted")}><CheckCircle2 size={16}/> ACCEPT</button>
          <button onClick={()=>onStatus("Edited")}><FileCheck2 size={16}/> EDIT</button>
          <button className="verify" onClick={()=>onStatus("Field Verify")}><AlertTriangle size={16}/> FIELD VERIFY</button>
          <button className="reject" onClick={()=>onStatus("Rejected")}><X size={16}/> REJECT</button>
        </div>
        <div className="disclaimer"><ShieldCheck size={15}/><span>AI-assisted preliminary mapping. Final cadastral/legal decisions remain with authorized authorities.</span></div>
      </aside>
    </div>
  </section>;
}

function InfoRow({label,value}) { return <div className="info-row"><span>{label}</span><b>{value}</b></div>; }

function RealMap({selected, setSelected, layers}) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const vectorSource = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const source = new VectorSource();
    vectorSource.current = source;
    const vector = new VectorLayer({ source, visible: layers.parcels });
    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() }), vector],
      view: new View({ center: fromLonLat([78.4068,17.4268]), zoom: 18 })
    });
    mapObj.current = map;

    demoParcels.forEach((p, index) => {
      const feature = new Feature({ geometry: new Polygon([[...p.coords.map(c=>fromLonLat(c)), fromLonLat(p.coords[0])]]), parcel: p });
      feature.setStyle(new Style({
        fill: new Fill({ color: index === 0 ? "rgba(24, 210, 184, 0.22)" : "rgba(30, 120, 190, 0.13)" }),
        stroke: new Stroke({ color: index === 0 ? "#24d2b8" : "#55a9ff", width: index === 0 ? 3 : 2 }),
        text: new Text({ text: p.id, fill: new Fill({ color:"#e9f7ff" }), stroke:new Stroke({color:"#06101c",width:4}), scale:1.1 })
      }));
      source.addFeature(feature);
    });

    map.on("singleclick", (evt) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const p = feature.get("parcel");
        if (p) setSelected(p);
      });
    });
    return () => map.setTarget(undefined);
  }, [setSelected]);

  useEffect(() => {
    if (!mapObj.current) return;
    const layersList = mapObj.current.getLayers().getArray();
    if (layersList[1]) layersList[1].setVisible(layers.parcels);
  }, [layers.parcels]);

  return <div className="real-map-wrap"><div ref={mapRef} className="real-map"></div><div className="map-overlay top-left"><span className="live-dot"></span> GIS BASEMAP • OSM</div><div className="map-overlay bottom-left">17.4268° N &nbsp; 78.4068° E</div><div className="map-legend"><b>FEATURE LEGEND</b><span><i className="legend-parcel"></i> AI Parcel</span><span><i className="legend-building"></i> Building</span><span><i className="legend-road"></i> Road</span></div></div>;
}

function UploadScreen({uploadName,setUploadName,onAI,processing,notice}) {
  return <section className="page-section"><div className="eyebrow">DATA INGESTION</div><h2>Upload Geospatial Imagery</h2><p className="section-desc">Import drone imagery and supporting elevation/GIS layers for AI-assisted preliminary mapping.</p>
    <div className="upload-grid">
      <label className="upload-zone"><input type="file" accept=".tif,.tiff,.jpg,.jpeg,.png,.geojson" onChange={e=>setUploadName(e.target.files?.[0]?.name || "")}/><CloudUpload size={42}/><b>{uploadName || "Drop imagery here or browse"}</b><span>GeoTIFF • Orthomosaic • JPG • PNG • GeoJSON</span><small>Demo upload interface</small></label>
      <div className="panel processing-panel"><PanelTitle title="Processing Workflow" icon={Activity}/>{["Upload & inspect","Georeferencing check","AI feature extraction","Parcel generation","Topology validation","Confidence scoring"].map((x,i)=><div className="pipeline-row" key={x}><span className="step-num">{i+1}</span><span>{x}</span><CheckCircle2 size={17}/></div>)}<button className="wide-primary" onClick={onAI}>{processing ? "PROCESSING..." : "START AI PIPELINE"}</button>{notice&&<div className="inline-note">{notice}</div>}</div>
    </div>
  </section>;
}

function AIExtraction({processing,onRun,notice}) {
  return <section className="page-section"><div className="eyebrow">AI COMPUTER VISION</div><h2>AI Feature Extraction</h2><p className="section-desc">Extract buildings, roads, land-use features and preliminary parcel boundaries.</p>
    <div className="extraction-grid"><div className="image-demo original"><span>INPUT • DRONE IMAGERY</span><div className="fake-aerial"><div className="road r1"></div><div className="road r2"></div>{[1,2,3,4,5,6,7].map(i=><div className="building" key={i} style={{left:`${12+i*10}%`,top:`${22+(i%3)*18}%`}}></div>)}</div></div>
    <div className="extraction-arrow"><ChevronRight size={28}/><Sparkles size={18}/></div>
    <div className="image-demo output"><span>AI OUTPUT • FEATURES</span><div className="fake-aerial ai"><div className="road r1"></div><div className="road r2"></div>{[1,2,3,4,5,6,7].map(i=><div className="building detected" key={i} style={{left:`${12+i*10}%`,top:`${22+(i%3)*18}%`}}></div>)}<div className="ai-boundary b1"></div><div className="ai-boundary b2"></div><div className="ai-boundary b3"></div></div></div></div>
    <div className="ai-result-bar"><div><small>EXTRACTION STATUS</small><b>{processing ? "PROCESSING..." : "READY"}</b></div><div><small>BUILDINGS</small><b>428</b></div><div><small>ROADS</small><b>76</b></div><div><small>PARCELS</small><b>1,167</b></div><div><button className="primary" onClick={onRun}>{processing ? <RefreshCw className="spin"/> : <Sparkles/>}{processing?"Running AI":"Run AI Analysis"}</button></div></div>{notice&&<div className="inline-note">{notice}</div>}
  </section>;
}

function Validation() {
  const checks=[["Geometry validity","No self-intersections detected","PASS"],["Gap detection","2 potential boundary gaps","REVIEW"],["Overlap detection","No critical overlaps","PASS"],["Boundary consistency","98.2% consistent","PASS"],["Coordinate reference","EPSG:4326 / WGS84","PASS"]];
  return <section className="page-section"><div className="eyebrow">GIS TOPOLOGY ENGINE</div><h2>Validation & Quality Control</h2><p className="section-desc">Automated checks identify geometry issues before surveyor acceptance.</p><div className="validation-grid"><div className="panel"><PanelTitle title="Topology Checks" icon={ClipboardCheck}/>{checks.map(([a,b,c])=><div className="check-row" key={a}><div><b>{a}</b><span>{b}</span></div><strong className={c==="PASS"?"pass":"review"}>{c==="PASS"?<CheckCircle2 size={15}/>:<AlertTriangle size={15}/>} {c}</strong></div>)}</div><div className="panel quality"><div className="quality-ring"><b>94.8%</b><span>DATA QUALITY</span></div><p>Overall validation confidence based on automated GIS topology checks.</p><button className="secondary">View Validation Log</button></div></div></section>;
}

function ReviewQueue({onSelect}) {
  const rows=demoParcels.filter(p=>p.confidence<85);
  return <section className="page-section"><div className="eyebrow">HUMAN-IN-THE-LOOP</div><h2>Surveyor Review Queue</h2><p className="section-desc">Low-confidence or flagged parcels are routed for authorized human verification.</p><div className="panel table-panel"><div className="table-head"><b>Parcels Requiring Review</b><div className="filter"><Search size={15}/> Filter queue</div></div><table><thead><tr><th>PARCEL ID</th><th>AREA</th><th>CONFIDENCE</th><th>ISSUE</th><th>STATUS</th><th></th></tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><b>{p.id}</b></td><td>{p.area}</td><td><span className={p.confidence<70?"low-confidence":"mid-confidence"}>{p.confidence}%</span></td><td>{p.issue}</td><td><span className="status-pill">{p.status}</span></td><td><button className="view-btn" onClick={()=>onSelect(p)}>VIEW <ChevronRight size={14}/></button></td></tr>)}</tbody></table></div></section>;
}

function Reports() {
  return <section className="page-section"><div className="eyebrow">MAPPING INTELLIGENCE</div><h2>Reports & Summary</h2><p className="section-desc">Prototype summary for processed urban parcel data.</p><div className="report-grid"><div className="panel report-main"><PanelTitle title="Mapping Summary" icon={BarChart3}/><div className="report-bars">{[["AI accepted",86],["Manually verified",11],["Field verification",4]].map(([x,v])=><div className="bar-row" key={x}><div><span>{x}</span><b>{v}%</b></div><i><em style={{width:`${v}%`}}></em></i></div>)}</div></div><div className="panel export-panel"><FileText size={30}/><b>Export-ready outputs</b><span>GIS-ready preliminary parcel data and validation report.</span><button className="primary"><Database size={16}/> Export GIS</button><button className="secondary"><FileText size={16}/> Export Report</button></div></div></section>;
}

export default App;