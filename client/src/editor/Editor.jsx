import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect as KonvaRect, Text, Image as KImage, Circle as KonvaCircle, Transformer } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TfiText, TfiSave } from 'react-icons/tfi';
import { IoCloudUploadOutline, IoApps } from "react-icons/io5";
import { BsBoxArrowRight, BsSquare, BsCircle } from "react-icons/bs";
import { FaUndo, FaRedo, FaFilePdf, FaImage } from "react-icons/fa";
import { templates } from './templates';

const API_URL = 'http://localhost:4000/api';

// --- Helper Components ---
const ToolButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="tool-btn">
    {icon}
    <span>{label}</span>
  </button>
);

// --- Properties Panel Component ---
const PropertiesPanel = ({ selectedObject, onUpdateObject, onZIndex }) => {
  if (!selectedObject) {
    return (
      <div className="panel-body">
        <p style={{ color: '#64748b', fontSize: '14px' }}>Select an object on the canvas to see its properties.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    onUpdateObject({ ...selectedObject, [e.target.name]: e.target.value });
  };
  
  const handleFontSizeChange = (e) => onUpdateObject({ ...selectedObject, fontSize: Number(e.target.value) });

  return (
    <div className="panel-body">
      {/* TEXT PROPERTIES */}
      {selectedObject.type === 'text' && (
        <>
          <div className="form-group">
            <label>Text Content</label>
            <textarea name="text" value={selectedObject.text} onChange={handleChange} className="form-input" rows={3} />
          </div>
          <div className="form-group">
            <label>Font Size</label>
            <input type="number" name="fontSize" value={selectedObject.fontSize} onChange={handleFontSizeChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Font Color</label>
            <input type="color" name="fill" value={selectedObject.fill} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Font Family</label>
            <select name="fontFamily" value={selectedObject.fontFamily} onChange={handleChange} className="form-input">
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Impact">Impact</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
        </>
      )}

      {/* SHAPE PROPERTIES */}
      {selectedObject.type === 'shape' && (
         <div className="form-group">
            <label>Fill Color</label>
            <input type="color" name="fill" value={selectedObject.fill} onChange={handleChange} className="form-input" />
         </div>
      )}

      {/* IMAGE PROPERTIES */}
      {selectedObject.type === 'image' && (
        <>
          <div className="form-group">
            <label>Opacity ({Math.round((selectedObject.opacity ?? 1) * 100)}%)</label>
            <input 
              type="range" name="opacity" min="0" max="1" step="0.1" 
              value={selectedObject.opacity ?? 1} 
              onChange={handleChange} 
              style={{ width: '100%', cursor: 'pointer' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Width</label>
              <input type="number" name="width" value={Math.round(selectedObject.width)} onChange={(e) => onUpdateObject({ ...selectedObject, width: Number(e.target.value) })} className="form-input" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Height</label>
              <input type="number" name="height" value={Math.round(selectedObject.height)} onChange={(e) => onUpdateObject({ ...selectedObject, height: Number(e.target.value) })} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label>Corner Radius</label>
            <input type="number" name="cornerRadius" value={selectedObject.cornerRadius || 0} onChange={(e) => onUpdateObject({ ...selectedObject, cornerRadius: Number(e.target.value) })} className="form-input" />
          </div>
        </>
      )}

      {/* LAYER BUTTONS (For All Objects) */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
        <label style={{display:'block', marginBottom:'8px', fontSize:'12px', fontWeight:600}}>Layer Order</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onZIndex('top')} className="tool-btn" style={{width:'auto', flex:1, height:'40px', fontSize:'12px'}}>
             Bring to Front
          </button>
          <button onClick={() => onZIndex('bottom')} className="tool-btn" style={{width:'auto', flex:1, height:'40px', fontSize:'12px'}}>
             Send to Back
          </button>
        </div>
      </div>

    </div>
  );
};

// --- Canvas Components (Unchanged logic, just simplified) ---
function URLImage({ shapeProps, isSelected, onSelect, onChange }) {
  const [img] = useImage(shapeProps.src, 'anonymous');
  const shapeRef = useRef();
  const trRef = useRef();
  useEffect(() => { if (isSelected) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer().batchDraw(); } }, [isSelected]);
  return (
    <>
      <KImage image={img} onClick={onSelect} onTap={onSelect} ref={shapeRef} {...shapeProps} draggable onDragEnd={(e) => { onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() }); }} onTransformEnd={() => { const node = shapeRef.current; const scaleX = node.scaleX(); const scaleY = node.scaleY(); node.scaleX(1); node.scaleY(1); onChange({ ...shapeProps, x: node.x(), y: node.y(), width: Math.max(5, node.width() * scaleX), height: Math.max(node.height() * scaleY), }); }} />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </>
  );
}
function TextNode({ shapeProps, isSelected, onSelect, onChange }) {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = () => {
    const textNode = shapeRef.current;
    const stage = textNode.getStage();
    
    // 1. Hide current text
    textNode.hide();
    if (trRef.current) trRef.current.hide();
    textNode.getLayer().batchDraw();

    // 2. Calculate absolute position (accounting for scroll)
    const textPosition = textNode.absolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    
    const areaPosition = {
      x: stageBox.left + textPosition.x + window.scrollX,
      y: stageBox.top + textPosition.y + window.scrollY,
    };

    // 3. Create HTML Input
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    
    // --- FIXES ARE HERE ---
    // A. Width Buffer: Adds 20px extra space to prevent "ghost" wrapping
    textarea.style.width = `${(textNode.width() * textNode.scaleX()) + 20}px`; 
    textarea.style.height = `${textNode.height() * textNode.scaleY() + 5}px`;
    
    // B. Disable Spellcheck: Removes the red wavy lines
    textarea.spellcheck = false; 
    // ----------------------

    textarea.style.fontSize = `${textNode.fontSize() * textNode.scaleY()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    textarea.style.zIndex = '1000'; // Keep on top

    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;

    // Auto-height
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    const removeTextarea = () => {
      if (!textarea.parentNode) return;
      textarea.parentNode.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      
      textNode.show();
      if (trRef.current) {
        trRef.current.show();
        trRef.current.forceUpdate(); 
      }
      textNode.getLayer().batchDraw();

      onChange({
        ...shapeProps,
        text: textarea.value,
      });
    };

    const handleOutsideClick = (e) => {
      if (e.target !== textarea) {
        removeTextarea();
      }
    };

    textarea.addEventListener('keydown', function (e) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 3 + 'px';
      
      // FIX: Enter = New Line. Escape = Save & Close.
      if (e.keyCode === 27) { 
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            fontSize: node.fontSize() * scaleY,
            width: Math.max(5, node.width() * scaleX),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </>
  );
}
function ShapeNode({ shapeProps, isSelected, onSelect, onChange }) {
    const shapeRef = useRef();
    const trRef = useRef();
    useEffect(() => { if (isSelected) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer().batchDraw(); } }, [isSelected]);
    const ShapeComponent = shapeProps.shapeType === 'rect' ? KonvaRect : KonvaCircle;
    return (
        <>
            <ShapeComponent onClick={onSelect} onTap={onSelect} ref={shapeRef} {...shapeProps} draggable onDragEnd={(e) => { onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() }); }} onTransformEnd={() => { const node = shapeRef.current; const scaleX = node.scaleX(); const scaleY = node.scaleY(); node.scaleX(1); node.scaleY(1); let newProps = { ...shapeProps, x: node.x(), y: node.y() }; if (shapeProps.shapeType === 'rect') { newProps.width = Math.max(5, node.width() * scaleX); newProps.height = Math.max(5, node.height() * scaleY); } else if (shapeProps.shapeType === 'circle') { newProps.radius = Math.max(5, (node.radius() * (scaleX + scaleY)) / 2); } onChange(newProps); }} />
            {isSelected && <Transformer ref={trRef} />}
        </>
    );
}

// --- Main Editor Component ---
export default function Editor({ user, onLogout, setPage, designId }) {
  const [objects, setObjects] = useState([]);
  const [selectedId, selectObject] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isTemplateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const stageRef = useRef();
  const fileInputRef = useRef();
  
  // -- Logic Functions --
  const handleStateChange = (newObjects) => {
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, newObjects]);
    setHistoryStep(newHistory.length);
    setObjects(newObjects);
  };
  const handleUndo = () => { if (historyStep > 0) { const newStep = historyStep - 1; setHistoryStep(newStep); setObjects(history[newStep]); } };
  const handleRedo = () => { if (historyStep < history.length - 1) { const newStep = historyStep + 1; setHistoryStep(newStep); setObjects(history[newStep]); } };
  const updateObjectInList = (updatedObject) => { handleStateChange(objects.map(obj => obj.id === updatedObject.id ? updatedObject : obj)); };
  const checkDeselect = (e) => { if (e.target === e.target.getStage()) { selectObject(null); } };
  const handleSelectTemplate = (template) => { const newObjects = template.objects.map(obj => ({ ...obj, id: `${obj.type}-${Date.now() + Math.random()}` })); handleStateChange(newObjects); setTemplateBrowserOpen(false); };
  
  // -- Load Design --
  useEffect(() => {
    const loadDesign = async (id) => {
      try { const res = await axios.get(`${API_URL}/designs/${id}`); const loadedObjects = res.data.jsonData.objects || []; setObjects(loadedObjects); setHistory([loadedObjects]); setHistoryStep(0); } catch (error) { console.error("Failed to load design:", error); }
    };
    if (designId) { loadDesign(designId); } else { setObjects([]); setHistory([[]]); setHistoryStep(0); }
  }, [designId]);

  // -- Actions --
  const addText = () => { handleStateChange([...objects, { id: `text-${Date.now()}`, type: 'text', x: 50, y: 50, text: 'New Text', fontSize: 30, fill: '#000000', fontFamily: 'Arial' }]); };
  const addRectangle = () => { handleStateChange([...objects, { id: `rect-${Date.now()}`, type: 'shape', shapeType: 'rect', x: 150, y: 150, width: 100, height: 100, fill: '#94a3b8' }]); };
  const addCircle = () => { handleStateChange([...objects, { id: `circle-${Date.now()}`, type: 'shape', shapeType: 'circle', x: 250, y: 250, radius: 50, fill: '#94a3b8' }]); };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Generate unique ID and Local Preview URL
    const newId = `image-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);

    // 2. Add to Canvas IMMEDIATELY (at default 100,100 position)
    const newImageObj = { 
      id: newId, 
      type: 'image', 
      x: 100, 
      y: 100, 
      src: localUrl, 
      width: 200, 
      height: 200 
    };

    handleStateChange([...objects, newImageObj]);

    // 3. Upload in Background
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = user?.token;
      const res = await axios.post(`${API_URL}/upload`, formData, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      // 4. Success! Swap Local URL with Cloudinary URL
      setObjects((prevObjects) => 
        prevObjects.map(obj => 
          obj.id === newId 
            ? { ...obj, src: res.data.url } 
            : obj
        )
      );

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
      // If it fails, remove the temporary image
      setObjects(prev => prev.filter(obj => obj.id !== newId));
    }

    // Reset the input so you can select the same file again if you want
    e.target.value = null;
  };
  const saveDesign = async () => {
    try { const token = user?.token; const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }); await axios.post(`${API_URL}/designs`, { title: 'Design ' + new Date().toLocaleTimeString(), jsonData: { objects }, thumbnailUrl: dataURL }, { headers: { 'Authorization': `Bearer ${token}` } }); alert('Design Saved!'); } catch (error) { alert('Failed to save design.'); }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newObjects = objects.filter(obj => obj.id !== selectedId);
    handleStateChange(newObjects);
    selectObject(null); // Deselect after deleting
  };
  const handleZIndex = (action) => {
    if (!selectedId) return;

    const currentIndex = objects.findIndex(obj => obj.id === selectedId);
    const newObjects = [...objects];
    const item = newObjects[currentIndex];

    // Remove item from current position
    newObjects.splice(currentIndex, 1);

    if (action === 'top') {
      newObjects.push(item); // Add to end (Top)
    } else if (action === 'bottom') {
      newObjects.unshift(item); // Add to start (Bottom)
    } else if (action === 'up') {
      const newIndex = Math.min(objects.length - 1, currentIndex + 1);
      newObjects.splice(newIndex, 0, item);
    } else if (action === 'down') {
      const newIndex = Math.max(0, currentIndex - 1);
      newObjects.splice(newIndex, 0, item);
    }

    handleStateChange(newObjects);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only delete if we have a selection and are NOT typing in an input
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Check if user is typing in an input/textarea
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, objects]);
  // --- Drag & Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault(); // This is crucial! It tells the browser "we can drop here"
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
      // 1. Calculate Position & Generate ID
      stageRef.current.setPointersPositions(e);
      const pointer = stageRef.current.getPointerPosition();
      const newId = `image-${Date.now()}`;
      
      // 2. Create a Local Preview URL (Instant!)
      const localUrl = URL.createObjectURL(file);

      // 3. Add Image to Canvas IMMEDIATELY (Optimistic)
      const newImageObj = { 
        id: newId, 
        type: 'image', 
        x: pointer ? pointer.x : 100, 
        y: pointer ? pointer.y : 100, 
        src: localUrl, // Display local blob first
        width: 200, 
        height: 200,
        isUploading: true // (Optional) You could use this to show a spinner
      };
      
      // Update the main state so user sees it instantly
      handleStateChange([...objects, newImageObj]);

      // 4. Upload in Background
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = user?.token;
        const res = await axios.post(`${API_URL}/upload`, formData, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        // 5. Success! Swap Local URL with Real Cloudinary URL
        // We use a functional update to ensure we don't break if the user moved the object while uploading
        setObjects((prevObjects) => 
          prevObjects.map(obj => 
            obj.id === newId 
              ? { ...obj, src: res.data.url, isUploading: false } 
              : obj
          )
        );
        
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed. Removing image.");
        // If upload fails, remove the temp image
        setObjects(prev => prev.filter(obj => obj.id !== newId));
      }
    }
  };
  const exportPNG = () => { const link = document.createElement('a'); link.download = 'design.png'; link.href = stageRef.current.toDataURL({ pixelRatio: 3 }); link.click(); };
  const exportPDF = () => { selectObject(null); setIsExporting(true); setTimeout(() => { html2canvas(stageRef.current.container(), { scale: 2 }).then(canvas => { const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [stageRef.current.width(), stageRef.current.height()] }); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, stageRef.current.width(), stageRef.current.height()); pdf.save("design.pdf"); setIsExporting(false); }); }, 100); };

  const selectedObject = objects.find(obj => obj.id === selectedId);

  return (
    <div className="app-container">
      {isTemplateBrowserOpen && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', justifyContent:'center', alignItems:'center'}}>
           <div style={{background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '800px', width: '100%'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}><h2>Templates</h2><button onClick={() => setTemplateBrowserOpen(false)}>Close</button></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px'}}>
                  {templates.map(t => <div key={t.id} onClick={() => handleSelectTemplate(t)} style={{cursor:'pointer', border:'1px solid #ddd'}}><img src={t.preview} style={{width:'100%'}}/></div>)}
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <header className="editor-header">
        <div className="header-left">
          <div className="app-logo"><IoApps size={20} /></div>
          <div className="app-title"><h1>Matty Editor</h1><span>Draft - {user.user.username}</span></div>
        </div>

        <div className="header-center">
          <button onClick={handleUndo} disabled={historyStep === 0} className="icon-btn" title="Undo"><FaUndo size={14} /></button>
          <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="icon-btn" title="Redo"><FaRedo size={14} /></button>
        </div>

        <div className="header-right">
          <button onClick={() => setPage('dashboard')} className="btn-secondary">My Designs</button>
          <div className="divider"></div>
          {/* NEW DELETE BUTTON */}
          <button 
            onClick={deleteSelected} 
            disabled={!selectedId} 
            className="icon-btn btn-danger" 
            title="Delete Selected"
            style={{ marginRight: '8px' }} // Add some spacing
          >
            <span style={{ fontSize: '18px' }}>🗑️</span> {/* Or import FaTrash from react-icons */}
          </button>

          <button onClick={saveDesign} className="icon-btn" title="Save"><TfiSave size={18} /></button>
          <button onClick={saveDesign} className="icon-btn" title="Save"><TfiSave size={18} /></button>
          <button onClick={exportPNG} className="btn-primary"><FaImage /> Export PNG</button>
          <button onClick={exportPDF} disabled={isExporting} className="icon-btn" title="Export PDF"><FaFilePdf size={18} /></button>
          <button onClick={onLogout} className="icon-btn btn-danger" title="Logout"><BsBoxArrowRight size={20} /></button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="editor-workspace" 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}>
        {/* LEFT TOOLBAR */}
        <aside className="toolbar-left">
          <ToolButton icon={<IoApps size={24} />} label="Templates" onClick={() => setTemplateBrowserOpen(true)} />
          <ToolButton icon={<TfiText size={22} />} label="Text" onClick={addText} />
          <ToolButton icon={<IoCloudUploadOutline size={24} />} label="Upload" onClick={() => fileInputRef.current.click()} />
          <div style={{ width: '40px', height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>
          <ToolButton icon={<BsSquare size={20} />} label="Rect" onClick={addRectangle} />
          <ToolButton icon={<BsCircle size={20} />} label="Circle" onClick={addCircle} />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}} accept="image/*" />
        </aside>

        {/* CANVAS CENTER */}
        <main className="canvas-area">
          <div className="canvas-container">
            <Stage width={800} height={600} onMouseDown={checkDeselect} onTouchStart={checkDeselect} ref={stageRef}>
              <Layer>
                <KonvaRect x={0} y={0} width={800} height={600} fill="white" />
                {objects.map((obj) => {
                  const props = { key: obj.id, isSelected: obj.id === selectedId, onSelect: () => selectObject(obj.id), onChange: updateObjectInList };
                  if (obj.type === 'image') return <URLImage {...props} shapeProps={obj} />;
                  if (obj.type === 'text') return <TextNode {...props} shapeProps={obj} />;
                  if (obj.type === 'shape') return <ShapeNode {...props} shapeProps={obj} />;
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </main>

        {/* RIGHT PROPERTIES */}
        <aside className="properties-panel">
          <div className="panel-header">Properties</div>
          <PropertiesPanel selectedObject={selectedObject} onUpdateObject={updateObjectInList}onZIndex={handleZIndex} />
        </aside>
        
      </div>
    </div>
  );
}