import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectKmlFile, KmlBoundaryFeature, KmlCoordinate } from '../../types';
import { readKmlOrKmzFile, generateSampleKmlFile, calculatePolygonAreaHa } from '../../utils/kmlParser';
import { convertWgs84ToVn2000, Vn2000Coordinate } from '../../utils/vn2000Converter';
import { findKttConfigForProvince, validateKttMatch, COMMON_KTT_OPTIONS } from '../../utils/centralMeridianConfig';
import {
  X,
  MapPin,
  Upload,
  Layers,
  Download,
  Trash2,
  FileCode,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  CheckCircle2,
  Info,
  Globe,
  Plus,
  Compass,
  CornerDownRight,
  ShieldAlert,
  Copy,
  Check,
  FileSpreadsheet,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface Props {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProjectKml?: (updatedKmlFiles: ProjectKmlFile[]) => void;
}

export const KmlBoundaryViewerModal: React.FC<Props> = ({
  project,
  isOpen,
  onClose,
  onUpdateProjectKml
}) => {
  if (!isOpen) return null;

  const initialKmlFiles = project.kmlFiles && project.kmlFiles.length > 0
    ? project.kmlFiles
    : [];

  const [kmlFiles, setKmlFiles] = useState<ProjectKmlFile[]>(initialKmlFiles);
  const [activeFileId, setActiveFileId] = useState<string>(
    initialKmlFiles.length > 0 ? initialKmlFiles[0].id : ''
  );
  const [mapMode, setMapMode] = useState<'satellite' | 'standard' | 'dark' | 'terrain'>(() => {
    return (localStorage.getItem('vnrpbm_map_layer_mode') as any) || 'satellite';
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCoord, setSelectedCoord] = useState<{ coord: KmlCoordinate; index: number; featureName: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Map tile loading & service status
  const [isTileLoading, setIsTileLoading] = useState<boolean>(false);
  const [tileErrorCount, setTileErrorCount] = useState<number>(0);
  const [mapServiceStatus, setMapServiceStatus] = useState<'ok' | 'loading' | 'error'>('ok');

  // VN-2000 state
  const [coordSystem, setCoordSystem] = useState<'VN2000' | 'WGS84'>('VN2000');
  const [selectedKtt, setSelectedKtt] = useState<number>(() => {
    const cfg = findKttConfigForProvince(project.province);
    return cfg?.centralMeridian || project.centralMeridian || 106.25;
  });
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Save map mode preference
  useEffect(() => {
    localStorage.setItem('vnrpbm_map_layer_mode', mapMode);
  }, [mapMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeKmlFile = kmlFiles.find(f => f.id === activeFileId) || kmlFiles[0];

  // Export VN-2000 CSV file
  const handleExportVn2000Csv = () => {
    if (!activeKmlFile) return;
    let csvContent = `STT,Tên Mốc,Tọa độ X (Bắc - m),Tọa độ Y (Đông - m),Cao độ Z (m),Hệ Tọa Độ,Kinh Tuyến Trục\n`;
    let count = 1;

    activeKmlFile.boundaryFeatures.forEach(feat => {
      feat.coordinates.forEach(c => {
        const vn = convertWgs84ToVn2000(c.lat, c.lng, c.alt, selectedKtt, '3deg');
        csvContent += `${count},Mốc ${count},${vn.x.toFixed(3)},${vn.y.toFixed(3)},${vn.alt ?? 0},VN-2000 Múi 3°,${selectedKtt}°\n`;
        count++;
      });
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bang_Toa_Do_VN2000_${project.code}_KTT${selectedKtt}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy VN-2000 Table to Clipboard
  const handleCopyTable = () => {
    if (!activeKmlFile) return;
    let text = `BẢNG MỐC TỌA ĐỘ CHI TIẾT VN-2000 - DỰ ÁN: ${project.name} (${project.code})\n`;
    text += `Hệ tọa độ: VN-2000 | Múi chiếu 3° (k=0.9999) | Kinh tuyến trục KTT: ${selectedKtt}°\n`;
    text += `STT\tTên Mốc\tTọa độ X (m - Bắc)\tTọa độ Y (m - Đông)\tCao độ Z (m)\n`;

    let count = 1;
    activeKmlFile.boundaryFeatures.forEach(feat => {
      feat.coordinates.forEach(c => {
        const vn = convertWgs84ToVn2000(c.lat, c.lng, c.alt, selectedKtt, '3deg');
        text += `${count}\tMốc ${count}\t${vn.x.toFixed(3)}\t${vn.y.toFixed(3)}\t${vn.alt ?? 0}\n`;
        count++;
      });
    });

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Helper to sync changes back to parent
  const handleFilesChanged = (newFiles: ProjectKmlFile[]) => {
    setKmlFiles(newFiles);
    if (newFiles.length > 0 && !newFiles.some(f => f.id === activeFileId)) {
      setActiveFileId(newFiles[0].id);
    }
    if (onUpdateProjectKml) {
      onUpdateProjectKml(newFiles);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const file = files[0];
      const parsed = await readKmlOrKmzFile(file);
      const updated = [parsed, ...kmlFiles];
      handleFilesChanged(updated);
      setActiveFileId(parsed.id);
    } catch (err: any) {
      setUploadError(err.message || 'Không thể đọc file KML/KMZ. Vui lòng kiểm tra định dạng XML.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle sample file generation
  const handleGenerateSample = () => {
    const sample = generateSampleKmlFile(project.name, project.province);
    const updated = [sample, ...kmlFiles];
    handleFilesChanged(updated);
    setActiveFileId(sample.id);
  };

  // Handle delete file
  const handleDeleteFile = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa file KML/KMZ ranh vị trí này khỏi dự án?')) {
      const updated = kmlFiles.filter(f => f.id !== id);
      handleFilesChanged(updated);
    }
  };

  // Canvas map drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to container
    const width = canvas.width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.height = canvas.parentElement?.clientHeight || 500;

    // Background base
    if (mapMode === 'satellite') {
      ctx.fillStyle = '#0b132b';
    } else if (mapMode === 'dark') {
      ctx.fillStyle = '#020617';
    } else {
      ctx.fillStyle = '#0f172a';
    }
    ctx.fillRect(0, 0, width, height);

    // Draw Grid overlay
    ctx.strokeStyle = mapMode === 'dark' ? '#1e293b' : 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40 * zoomLevel;
    const startX = (panOffset.x % gridSize);
    const startY = (panOffset.y % gridSize);

    for (let x = startX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = startY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!activeKmlFile || !activeKmlFile.boundaryFeatures || activeKmlFile.boundaryFeatures.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Chưa có dữ liệu tọa độ ranh rà phá KML/KMZ', width / 2, height / 2);
      return;
    }

    // Gather all points across features
    const allCoords: KmlCoordinate[] = [];
    activeKmlFile.boundaryFeatures.forEach(f => allCoords.push(...f.coordinates));
    if (allCoords.length === 0) return;

    // Bounds
    let minLat = Math.min(...allCoords.map(c => c.lat));
    let maxLat = Math.max(...allCoords.map(c => c.lat));
    let minLng = Math.min(...allCoords.map(c => c.lng));
    let maxLng = Math.max(...allCoords.map(c => c.lng));

    // Pad bounds slightly
    const latSpan = (maxLat - minLat) || 0.005;
    const lngSpan = (maxLng - minLng) || 0.005;

    minLat -= latSpan * 0.15;
    maxLat += latSpan * 0.15;
    minLng -= lngSpan * 0.15;
    maxLng += lngSpan * 0.15;

    // Projection lat/lng -> canvas x/y
    const padding = 60;
    const mapW = width - padding * 2;
    const mapH = height - padding * 2;

    const toCanvasX = (lng: number) => {
      const norm = (lng - minLng) / (maxLng - minLng);
      return padding + norm * mapW * zoomLevel + panOffset.x;
    };

    const toCanvasY = (lat: number) => {
      // Invert Y because lat increases going UP
      const norm = (maxLat - lat) / (maxLat - minLat);
      return padding + norm * mapH * zoomLevel + panOffset.y;
    };

    // Draw features
    activeKmlFile.boundaryFeatures.forEach((feature) => {
      if (feature.coordinates.length < 2) return;

      const pts = feature.coordinates.map(c => ({
        x: toCanvasX(c.lng),
        y: toCanvasY(c.lat),
        coord: c
      }));

      // Polygon fill & stroke
      if (feature.type === 'Polygon') {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        // Polygon Fill
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.fill();

        // Polygon Border
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (feature.type === 'LineString') {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw vertex markers (mốc tọa độ ranh)
      pts.forEach((pt, i) => {
        const isSelected = selectedCoord?.coord.lat === pt.coord.lat && selectedCoord?.coord.lng === pt.coord.lng;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ef4444' : '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw point label
        ctx.fillStyle = isSelected ? '#ef4444' : '#e2e8f0';
        ctx.font = isSelected ? 'bold 12px monospace' : '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`M${i + 1}`, pt.x + 8, pt.y - 6);
      });
    });

    // Draw Centroid pin
    if (activeKmlFile.centerCoordinate) {
      const cx = toCanvasX(activeKmlFile.centerCoordinate.lng);
      const cy = toCanvasY(activeKmlFile.centerCoordinate.lat);

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📍 Tâm ranh dự án', cx, cy - 10);
    }
  }, [activeKmlFile, mapMode, zoomLevel, panOffset, selectedCoord]);

  // Handle canvas mouse dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Export KML file
  const handleExportKml = (file: ProjectKmlFile) => {
    if (!file.kmlContentXml) return;
    const blob = new Blob([file.kmlContentXml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                {project.code}
              </span>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                Bản đồ Ranh Vị trí Địa điểm Thi công RPBM (Section 7.1)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dự án: <strong className="text-amber-300">{project.name}</strong> • Vị trí: {project.commune}, {project.district}, {project.province}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".kml,.kmz"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Đang đọc...' : 'Tải file KML/KMZ'}</span>
            </button>

            <button
              onClick={handleGenerateSample}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              title="Khởi tạo file KML mẫu khảo sát dự án"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>KML Mẫu</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload error banner if any */}
        {uploadError && (
          <div className="bg-red-950/80 border-b border-red-800/60 p-3 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Modal Main Layout: Left Sidebar + Right Interactive Map */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: Files & Coordinates List */}
          <div className="w-full lg:w-80 bg-slate-950/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 text-xs">
            
            {/* Attached KML Files List */}
            <div>
              <div className="flex justify-between items-center mb-2 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                <span>Tập tin KML/KMZ đã gắn ({kmlFiles.length})</span>
              </div>

              {kmlFiles.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 space-y-2">
                  <FileCode className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Chưa có file KML/KMZ ranh vị trí nào.</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-400 font-semibold underline hover:text-emerald-300"
                  >
                    Bấm để tải lên file .KML hoặc .KMZ
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {kmlFiles.map(file => {
                    const isActive = file.id === activeKmlFile?.id;
                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isActive
                            ? 'bg-slate-900 border-emerald-500/70 shadow-md'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 truncate flex items-center gap-1.5">
                            <FileCode className={`w-3.5 h-3.5 ${file.fileType === 'kmz' ? 'text-amber-400' : 'text-emerald-400'}`} />
                            {file.fileName}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            file.fileType === 'kmz' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            .{file.fileType}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Diện tích: <strong className="text-emerald-400">{file.totalAreaHa || 0} ha</strong></span>
                          <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                          <span className="text-slate-500">{file.uploadedAt}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportKml(file);
                              }}
                              className="text-slate-400 hover:text-emerald-400"
                              title="Tải về file KML"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id);
                              }}
                              className="text-slate-400 hover:text-red-400"
                              title="Xóa file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active KML Statistics */}
            {activeKmlFile && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="font-bold text-emerald-400 text-xs flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Thông số Ranh Vị Trí
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeKmlFile.boundaryFeatures.length} Đối tượng ranh
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Tổng diện tích ranh</div>
                    <div className="font-bold text-emerald-400 text-sm">{activeKmlFile.totalAreaHa} ha</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Số điểm mốc ranh</div>
                    <div className="font-bold text-amber-400 text-sm">
                      {activeKmlFile.boundaryFeatures.reduce((acc, f) => acc + f.coordinates.length, 0)} mốc
                    </div>
                  </div>
                </div>

                {activeKmlFile.centerCoordinate && (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
                    <div className="text-emerald-400 font-bold uppercase text-[9px] flex items-center justify-between">
                      <span>📍 Tọa độ tâm ranh dự án:</span>
                      <span className="text-slate-400">KTT {selectedKtt}°</span>
                    </div>
                    {(() => {
                      const centerVn = convertWgs84ToVn2000(
                        activeKmlFile.centerCoordinate.lat,
                        activeKmlFile.centerCoordinate.lng,
                        0,
                        selectedKtt,
                        '3deg'
                      );
                      return (
                        <div className="space-y-0.5 pt-0.5 border-t border-slate-900">
                          <div className="text-amber-300 font-bold">
                            VN-2000: X = {centerVn.x.toLocaleString('en-US')} m | Y = {centerVn.y.toLocaleString('en-US')} m
                          </div>
                          <div className="text-slate-400">
                            WGS-84: Lat {activeKmlFile.centerCoordinate.lat}° N, Lng {activeKmlFile.centerCoordinate.lng}° E
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* VN-2000 Settings & Coordinates Points Inspector Table */}
            {activeKmlFile && activeKmlFile.boundaryFeatures.length > 0 && (
              <div className="space-y-2.5">
                
                {/* System & Central Meridian KTT Controls */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" /> Hệ Tọa Độ & Kinh Tuyến Trục:
                    </span>
                    
                    {/* Switcher VN2000 vs WGS84 */}
                    <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center">
                      <button
                        onClick={() => setCoordSystem('VN2000')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          coordSystem === 'VN2000'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        VN-2000 (X,Y m)
                      </button>
                      <button
                        onClick={() => setCoordSystem('WGS84')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          coordSystem === 'WGS84'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        WGS-84 (Lat,Lng)
                      </button>
                    </div>
                  </div>

                  {coordSystem === 'VN2000' && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">Kinh tuyến trục (KTT):</span>
                      <select
                        value={selectedKtt}
                        onChange={(e) => setSelectedKtt(parseFloat(e.target.value))}
                        className="bg-slate-950 text-emerald-400 border border-slate-800 rounded px-2 py-1 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value={106.25}>106°15' (Quảng Trị / KTT 106.25°)</option>
                        <option value={106.0}>106°00' (Quảng Bình / KTT 106.0°)</option>
                        <option value={107.0}>107°00' (Thừa Thiên Huế / KTT 107.0°)</option>
                        <option value={107.75}>107°45' (Đà Nẵng & Quảng Nam)</option>
                        <option value={105.0}>105°00' (Hà Nội & Thanh Hóa)</option>
                        <option value={105.75}>105°45' (TP. Hồ Chí Minh)</option>
                        <option value={104.75}>104°45' (Nghệ An)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Table Header with Export & Copy Actions */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    Bảng Mốc Tọa độ Chi tiết {coordSystem === 'VN2000' ? '(VN-2000)' : '(WGS-84)'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyTable}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Sao chép bảng mốc tọa độ"
                    >
                      {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                      <span>{copiedSuccess ? 'Đã chép!' : 'Sao chép'}</span>
                    </button>

                    <button
                      onClick={handleExportVn2000Csv}
                      className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      title="Tải bảng mốc tọa độ VN-2000 dạng CSV/Excel"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Xuất CSV</span>
                    </button>
                  </div>
                </div>

                {/* Detailed Coordinates Table List */}
                <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl divide-y divide-slate-800 font-mono text-[11px] bg-slate-950">
                  {/* Table Header Row */}
                  <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 bg-slate-900 font-bold text-slate-400 text-[10px] sticky top-0 z-10 border-b border-slate-800">
                    <div className="col-span-3">Mốc</div>
                    {coordSystem === 'VN2000' ? (
                      <>
                        <div className="col-span-4 text-emerald-400">X (m - Bắc)</div>
                        <div className="col-span-4 text-amber-400">Y (m - Đông)</div>
                        <div className="col-span-1 text-right">Z</div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-4 text-emerald-400">Lat (Vĩ độ)</div>
                        <div className="col-span-4 text-amber-400">Lng (Kinh độ)</div>
                        <div className="col-span-1 text-right">Alt</div>
                      </>
                    )}
                  </div>

                  {activeKmlFile.boundaryFeatures.flatMap(feat =>
                    feat.coordinates.map((c, i) => {
                      const isSel = selectedCoord?.coord.lat === c.lat && selectedCoord?.coord.lng === c.lng;
                      const vn = convertWgs84ToVn2000(c.lat, c.lng, c.alt, selectedKtt, '3deg');

                      return (
                        <div
                          key={`${feat.name}-${i}`}
                          onClick={() => setSelectedCoord({ coord: c, index: i, featureName: feat.name })}
                          className={`grid grid-cols-12 gap-1 px-2.5 py-2 cursor-pointer transition-colors items-center ${
                            isSel
                              ? 'bg-emerald-950/90 text-emerald-300 font-bold border-l-4 border-emerald-500'
                              : 'hover:bg-slate-900 text-slate-300'
                          }`}
                        >
                          <div className="col-span-3 font-bold text-amber-400 truncate">
                            Mốc {i + 1}
                          </div>

                          {coordSystem === 'VN2000' ? (
                            <>
                              <div className="col-span-4 text-emerald-300 font-semibold truncate">
                                {vn.x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                              </div>
                              <div className="col-span-4 text-amber-300 font-semibold truncate">
                                {vn.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                              </div>
                              <div className="col-span-1 text-right text-slate-500 text-[10px]">
                                {vn.alt ?? 0}m
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-span-4 text-emerald-300 truncate">
                                {c.lat.toFixed(6)}°
                              </div>
                              <div className="col-span-4 text-amber-300 truncate">
                                {c.lng.toFixed(6)}°
                              </div>
                              <div className="col-span-1 text-right text-slate-500 text-[10px]">
                                {c.alt ?? 0}m
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Canvas Map */}
          <div className="flex-1 bg-slate-950 relative flex flex-col">
            
            {/* Map Controls Top Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
              
              {/* Layer Selection */}
              <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-lg pointer-events-auto">
                <button
                  onClick={() => {
                    setMapMode('satellite');
                    setTileErrorCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapMode === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛰️ Nền Vệ tinh
                </button>
                <button
                  onClick={() => {
                    setMapMode('standard');
                    setTileErrorCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapMode === 'standard' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🗺️ Bản đồ Thường
                </button>
                <button
                  onClick={() => setMapMode('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapMode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌙 Nền Quân sự
                </button>
                <button
                  onClick={() => setMapMode('terrain')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapMode === 'terrain' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⛰️ Địa hình
                </button>
              </div>

              {/* Zoom & Fit Bounds */}
              <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-lg pointer-events-auto">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
                  title="Phóng to"
                >
                  +
                </button>
                <span className="text-xs font-mono text-emerald-400 font-bold px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 text-xs text-amber-400 hover:bg-slate-800 rounded-lg font-mono font-semibold"
                >
                  Fit Ranh
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="w-full flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full block"
              />

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1 text-slate-300 shadow-xl pointer-events-none">
                <div className="font-bold text-emerald-400 text-xs mb-1">Chú giải Ranh giới:</div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500/40 border-2 border-emerald-400 rounded-sm"></span>
                  <span>Vùng Ranh Rà Phá (Polygon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-amber-400"></span>
                  <span>Tuyến khảo sát (LineString)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900"></span>
                  <span>Mốc ranh tọa độ (M1, M2...)</span>
                </div>
              </div>

              {/* Selected Point Badge */}
              {selectedCoord && (() => {
                const vn = convertWgs84ToVn2000(
                  selectedCoord.coord.lat,
                  selectedCoord.coord.lng,
                  selectedCoord.coord.alt,
                  selectedKtt,
                  '3deg'
                );
                return (
                  <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-emerald-500/60 rounded-xl p-3 text-xs font-mono space-y-1.5 text-slate-200 shadow-2xl max-w-xs">
                    <div className="font-bold text-emerald-400 flex justify-between items-center border-b border-slate-800 pb-1">
                      <span>📍 Mốc {selectedCoord.index + 1} ({selectedCoord.featureName})</span>
                      <button onClick={() => setSelectedCoord(null)} className="text-slate-400 hover:text-white p-0.5">✕</button>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Hệ VN-2000 (KTT {selectedKtt}°):</div>
                      <div>X (Bắc): <strong className="text-emerald-300">{vn.x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} m</strong></div>
                      <div>Y (Đông): <strong className="text-amber-300">{vn.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} m</strong></div>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5 pt-0.5">
                      <div>WGS-84 Lat: <strong className="text-slate-200">{selectedCoord.coord.lat}° N</strong></div>
                      <div>WGS-84 Lng: <strong className="text-slate-200">{selectedCoord.coord.lng}° E</strong></div>
                      {selectedCoord.coord.alt !== undefined && (
                        <div>Độ cao Z: <strong className="text-slate-300">{selectedCoord.coord.alt} m</strong></div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <div className="text-slate-400 font-mono">
                {activeKmlFile ? (
                  <span>Tên file ranh: <strong className="text-slate-200">{activeKmlFile.fileName}</strong> ({activeKmlFile.totalAreaHa} ha)</span>
                ) : (
                  <span>Chưa chọn file KML</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  Xác nhận & Đóng
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
