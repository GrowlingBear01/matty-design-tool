import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect as KonvaRect, Text, Image as KImage, Circle as KonvaCircle, Transformer } from 'react-konva';
import useImage from 'use-image';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TfiText, TfiSave } from 'react-icons/tfi';
import { IoCloudUploadOutline, IoApps } from "react-icons/io5";
import { BsBoxArrowInDown, BsBoxArrowRight, BsLayoutTextSidebarReverse, BsSquare, BsCircle } from "react-icons/bs";
import { FaUndo, FaRedo, FaFilePdf } from "react-icons/fa"; // New PDF Icon
import { templates } from './templates';

const API_URL = 'http://localhost:4000/api';

// All reusable components (URLImage, TextNode, ShapeNode, PropertiesPanel, TemplateBrowser) remain the same.
// ... (omitting component code for brevity, as it is unchanged) ...

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
  useEffect(() => { if (isSelected) { trRef.current.nodes([shapeRef.current]); trRef.current.getLayer().batchDraw(); } }, [isSelected]);
  return (
    <>
      <Text onClick={onSelect} onTap={onSelect} ref={shapeRef} {...shapeProps} draggable onDragEnd={(e) => { onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() }); }} onTransformEnd={() => { const node = shapeRef.current; const scaleX = node.scaleX(); const scaleY = node.scaleY(); node.scaleX(1); node.scaleY(1); onChange({ ...shapeProps, x: node.x(), y: node.y(), fontSize: node.fontSize() * scaleY }); }} />
      {isSelected && <Transformer ref={trRef} enabledAnchors={['middle-left', 'middle-right']} boundBoxFunc={(oldBox, newBox) => { newBox.width = Math.max(30, newBox.width); return newBox; }} />}
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
const PropertiesPanel = ({ selectedObject, onUpdateObject }) => {
  if (!selectedObject) { return (<div className="p-4"><h3 className="font-bold mb-4">Properties</h3><p className="text-sm text-gray-500">Select an object on the canvas to see its properties.</p></div>); }
  const handleChange = (e) => { const { name, value } = e.target; onUpdateObject({ ...selectedObject, [name]: value }); };
  const handleFontSizeChange = (e) => { onUpdateObject({ ...selectedObject, fontSize: Number(e.target.value) }); }
  if (selectedObject.type === 'text') { return (<div className="p-4"><h3 className="font-bold mb-4">Text Properties</h3><div className="space-y-4"><div> <label className="text-sm font-semibold">Text Content</label> <textarea name="text" value={selectedObject.text} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" rows={3} /> </div><div> <label className="text-sm font-semibold">Font Size</label> <input type="number" name="fontSize" value={selectedObject.fontSize} onChange={handleFontSizeChange} className="w-full mt-1 p-2 border rounded-md" /> </div><div> <label className="text-sm font-semibold">Font Color</label> <input type="color" name="fill" value={selectedObject.fill} onChange={handleChange} className="w-full mt-1 p-1 h-10 border rounded-md" /> </div><div> <label className="text-sm font-semibold">Font Family</label> <select name="fontFamily" value={selectedObject.fontFamily} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"> <option value="Arial">Arial</option> <option value="Helvetica">Helvetica</option> <option value="Times New Roman">Times New Roman</option> <option value="Georgia">Georgia</option> <option value="Verdana">Verdana</option> <option value="Courier New">Courier New</option> <option value="Impact">Impact</option> </select> </div></div></div>); }
  if (selectedObject.type === 'shape') { return (<div className="p-4"><h3 className="font-bold mb-4">Shape Properties</h3><div className="space-y-4"><div><label className="text-sm font-semibold">Fill Color</label><input type="color" name="fill" value={selectedObject.fill} onChange={handleChange} className="w-full mt-1 p-1 h-10 border rounded-md" /></div></div></div>); }
  return (<div className="p-4"><h3 className="font-bold mb-4">Image Properties</h3><p className="text-sm text-gray-500">Editing for images coming soon!</p></div>);
};
const TemplateBrowser = ({ onSelectTemplate, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Choose a Template</h2>
                    <button onClick={onClose} className="text-2xl font-bold">&times;</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                    {templates.map(template => (
                        <div key={template.id} onClick={() => onSelectTemplate(template)} className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden">
                            <img src={template.preview} alt={template.name} className="w-full h-auto object-cover" />
                            <p className="text-center font-semibold p-2">{template.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Main Editor Component
export default function Editor({ user, onLogout, setPage, designId }) {
  const [objects, setObjects] = useState([]);
  const [selectedId, selectObject] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isTemplateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // State for PDF export loading

  const stageRef = useRef();
  const fileInputRef = useRef();
  
  const handleStateChange = (newObjects) => {
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, newObjects]);
    setHistoryStep(newHistory.length);
    setObjects(newObjects);
  };

  const handleUndo = () => { if (historyStep > 0) { const newStep = historyStep - 1; setHistoryStep(newStep); setObjects(history[newStep]); } };
  const handleRedo = () => { if (historyStep < history.length - 1) { const newStep = historyStep + 1; setHistoryStep(newStep); setObjects(history[newStep]); } };
  
  useEffect(() => {
    const loadDesign = async (id) => {
      try { const res = await axios.get(`${API_URL}/designs/${id}`); const loadedObjects = res.data.jsonData.objects || []; setObjects(loadedObjects); setHistory([loadedObjects]); setHistoryStep(0); } catch (error) { console.error("Failed to load design:", error); }
    };
    if (designId) { loadDesign(designId); } else { setObjects([]); setHistory([[]]); setHistoryStep(0); }
  }, [designId]);

  const updateObjectInList = (updatedObject) => { handleStateChange(objects.map(obj => obj.id === updatedObject.id ? updatedObject : obj)); };
  const selectedObject = objects.find(obj => obj.id === selectedId);
  const checkDeselect = (e) => { if (e.target === e.target.getStage()) { selectObject(null); } };

  const handleSelectTemplate = (template) => { const newObjects = template.objects.map(obj => ({ ...obj, id: `${obj.type}-${Date.now() + Math.random()}` })); handleStateChange(newObjects); setTemplateBrowserOpen(false); };
  const addText = () => { const newText = { id: `text-${Date.now()}`, type: 'text', x: 50, y: 50, text: 'New Text', fontSize: 30, fill: '#000000', fontFamily: 'Arial' }; handleStateChange([...objects, newText]); selectObject(newText.id); };
  const addRectangle = () => { const newRect = { id: `rect-${Date.now()}`, type: 'shape', shapeType: 'rect', x: 150, y: 150, width: 100, height: 100, fill: '#cccccc' }; handleStateChange([...objects, newRect]); selectObject(newRect.id); };
  const addCircle = () => { const newCircle = { id: `circle-${Date.now()}`, type: 'shape', shapeType: 'circle', x: 250, y: 250, radius: 50, fill: '#cccccc' }; handleStateChange([...objects, newCircle]); selectObject(newCircle.id); };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return; const formData = new FormData(); formData.append('file', file);
    try { const token = user?.token; if (!token) throw new Error("No token found"); const res = await axios.post(`${API_URL}/upload`, formData, { headers: { 'Authorization': `Bearer ${token}` } }); const newImage = { id: `image-${Date.now()}`, type: 'image', x: 100, y: 100, src: res.data.url, width: 200, height: 200 }; handleStateChange([...objects, newImage]); selectObject(newImage.id); } catch (error) { console.error("Image upload failed:", error); alert("Failed to upload image."); } e.target.value = null;
  };
  const saveDesign = async () => {
    try { const token = user?.token; if (!token) throw new Error("No token found"); const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }); const payload = { title: 'My Design - ' + new Date().toLocaleTimeString(), jsonData: { objects }, thumbnailUrl: dataURL }; await axios.post(`${API_URL}/designs`, payload, { headers: { 'Authorization': `Bearer ${token}` } }); alert('Design Saved!'); } catch (error) { console.error("Failed to save design:", error); alert('Failed to save design.'); }
  };
  const exportPNG = () => { const uri = stageRef.current.toDataURL({ pixelRatio: 3 }); const link = document.createElement('a'); link.download = 'matty-design.png'; link.href = uri; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

  // *** NEW FUNCTION FOR PDF EXPORT ***
  const exportPDF = () => {
    selectObject(null); // Deselect objects to hide transformers
    setIsExporting(true);

    setTimeout(() => {
        const stage = stageRef.current;
        const stageContainer = stage.container(); // This gets the DOM element container for the Konva Stage

        html2canvas(stageContainer, {
            // Options to improve quality
            scale: 2,
            useCORS: true, 
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [stage.width(), stage.height()]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, stage.width(), stage.height());
            pdf.save("matty-design.pdf");
            setIsExporting(false); // Reset exporting state
        }).catch(err => {
            console.error("PDF export failed:", err);
            alert("Could not export to PDF. Please try again.");
            setIsExporting(false);
        });
    }, 100); // A short timeout ensures transformers are hidden before capture
  };

  return (
    <>
      {isTemplateBrowserOpen && <TemplateBrowser onSelectTemplate={handleSelectTemplate} onClose={() => setTemplateBrowserOpen(false)} />}
      
      <div className="h-screen w-full bg-gray-100 text-gray-800 flex flex-col">
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-bold">Matty Editor</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Welcome, {user.user.username}!</span>
            <button onClick={handleUndo} disabled={historyStep === 0} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"> <FaUndo /> </button>
            <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"> <FaRedo /> </button>
            <button onClick={() => setPage('dashboard')} className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-semibold"> <BsLayoutTextSidebarReverse /> <span>My Designs</span> </button>
            <button onClick={saveDesign} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"> <TfiSave /> <span>Save</span> </button>
            <button onClick={exportPNG} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"> <BsBoxArrowInDown /> <span>Export PNG</span> </button>
            
            {/* *** NEW PDF EXPORT BUTTON *** */}
            <button onClick={exportPDF} disabled={isExporting} className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                <FaFilePdf />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button onClick={onLogout} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"> <BsBoxArrowRight /> <span>Logout</span> </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-20 bg-white shadow-lg p-4 flex flex-col items-center space-y-6">
            <button onClick={() => setTemplateBrowserOpen(true)} title="Templates" className="p-3 rounded-lg hover:bg-gray-200"> <IoApps size={24} /> </button>
            <hr className="w-full" />
            <button onClick={addText} title="Add Text" className="p-3 rounded-lg hover:bg-gray-200"> <TfiText size={24} /> </button>
            <button onClick={() => fileInputRef.current.click()} title="Upload Image" className="p-3 rounded-lg hover:bg-gray-200"> <IoCloudUploadOutline size={24} /> </button>
            <button onClick={addRectangle} title="Add Rectangle" className="p-3 rounded-lg hover:bg-gray-200"> <BsSquare size={24} /> </button>
            <button onClick={addCircle} title="Add Circle" className="p-3 rounded-lg hover:bg-gray-200"> <BsCircle size={24} /> </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
          </aside>

          <main className="flex-1 bg-gray-200 p-8 flex justify-center items-center overflow-auto">
            <div className="bg-white shadow-lg" id="canvas-container">
              <Stage width={800} height={600} onMouseDown={checkDeselect} onTouchStart={checkDeselect} ref={stageRef}>
                <Layer>
                  <KonvaRect x={0} y={0} width={800} height={600} fill="white" />
                  {objects.map((obj) => {
                    const commonProps = { key: obj.id, isSelected: obj.id === selectedId, onSelect: () => selectObject(obj.id), onChange: updateObjectInList };
                    if (obj.type === 'image') { return <URLImage {...commonProps} shapeProps={obj} />; }
                    if (obj.type === 'text') { return <TextNode {...commonProps} shapeProps={obj} />; }
                    if (obj.type === 'shape') { return <ShapeNode {...commonProps} shapeProps={obj} />; }
                    return null;
                  })}
                </Layer>
              </Stage>
            </div>
          </main>
          
          <aside className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
              <PropertiesPanel selectedObject={selectedObject} onUpdateObject={updateObjectInList} />
          </aside>
        </div>
      </div>
    </>
  );
}