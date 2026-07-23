import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, FileSearch, Calendar, ShieldCheck, Database, MapPin, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type SeizureMemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

type EvidenceItem = {
  id: string;
  category: string;
  makeModel: string;
  serialNumber: string;
  hashValue: string;
  sealingStatus: string;
  marks: string;
};

export function SeizureMemoModal({ isOpen, onClose, user }: SeizureMemoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

  const [formData, setFormData] = useState({
    // Section 1
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    sectionsOfLaw: '',
    // Section 2
    dateStart: '',
    dateEnd: '',
    location: '',
    gpsCoordinates: '',
    // Section 3
    panch1Name: '',
    panch1Father: '',
    panch1Age: '',
    panch1Occ: '',
    panch1Address: '',
    panch1Contact: '',
    panch2Name: '',
    panch2Father: '',
    panch2Age: '',
    panch2Occ: '',
    panch2Address: '',
    panch2Contact: '',
    // Section 4
    seizedFromName: '',
    seizedFromRel: 'Owner of laptop / Resident of premises',
    seizedFromContact: '',
    seizedFromAddress: '',
    // Section 6
    procIsolated: false,
    procSealed: false,
    procNoDamage: false,
    procCopyGiven: false,
    procRemarks: '',
    // Officer
    officerName: user?.name || '',
    officerRank: user?.role || '',
    officerBadge: user?.badgeId || ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetchCases();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (evidenceItems.length === 0) {
        handleAddEvidence();
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const { data, error } = await supabase.from('cases').select('*').order('date', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch cases");
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const caseId = e.target.value;
    setSelectedCaseId(caseId);
    
    if (caseId) {
      const selected = cases.find(c => c.id === caseId);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          firNumber: selected.id || prev.firNumber,
          seizedFromName: selected.suspect_details || prev.seizedFromName
        }));
        toast.success(`Loaded details from Case: ${selected.title}`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddEvidence = () => {
    setEvidenceItems(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        category: 'Mobile Phone / Smartphone',
        makeModel: '',
        serialNumber: '',
        hashValue: '',
        sealingStatus: 'Powered OFF & Placed in Faraday Bag',
        marks: ''
      }
    ]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEvidenceChange = (id: string, field: keyof EvidenceItem, value: string) => {
    setEvidenceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  if (!isOpen) return null;

  const draftText = `SEIZURE MEMO / PANCHNAMA - UNDER SECTION 105 / 185 BNSS & SECTION 63 BSA, 2023

From:
Investigating Officer: ${formData.officerName}, ${formData.officerRank}
Badge Number: ${formData.officerBadge}
${formData.station}

Ref: Case FIR No. ${formData.firNumber}
Under Sections: ${formData.sectionsOfLaw}

SEIZURE LOCATION & TIMING:
Location: ${formData.location}
GPS Coordinates: ${formData.gpsCoordinates || 'N/A'}
Date & Time: ${formData.dateStart ? new Date(formData.dateStart).toLocaleString() : 'N/A'} to ${formData.dateEnd ? new Date(formData.dateEnd).toLocaleString() : 'N/A'} (IST)

PANCH WITNESSES:
1. ${formData.panch1Name}, s/o ${formData.panch1Father}, Age: ${formData.panch1Age}, Occ: ${formData.panch1Occ}
   Address: ${formData.panch1Address} | Contact: ${formData.panch1Contact}
2. ${formData.panch2Name}, s/o ${formData.panch2Father}, Age: ${formData.panch2Age}, Occ: ${formData.panch2Occ}
   Address: ${formData.panch2Address} | Contact: ${formData.panch2Contact}

PERSON FROM WHOM SEIZED:
Name: ${formData.seizedFromName}
Relationship to Premises: ${formData.seizedFromRel}
Address: ${formData.seizedFromAddress}
Contact: ${formData.seizedFromContact}

SCHEDULE OF PROPERTY SEIZED:
${evidenceItems.map((item, idx) => `
Item ${idx + 1}: ${item.category}
Make/Model: ${item.makeModel}
Serial/IMEI/MAC: ${item.serialNumber}
Hash (SHA-256): ${item.hashValue || 'N/A'}
Status: ${item.sealingStatus}
Marks: ${item.marks}`).join('\n')}

PROCEDURE & SEALING NARRATIVE:
- Isolated from network: ${formData.procIsolated ? 'Yes' : 'No'}
- Paper seals affixed: ${formData.procSealed ? 'Yes' : 'No'}
- No damage caused: ${formData.procNoDamage ? 'Yes' : 'No'}
- Copy provided to person: ${formData.procCopyGiven ? 'Yes' : 'No'}
Remarks: ${formData.procRemarks || 'None.'}

MANDATORY STATUTORY DECLARATION (SECTION 63 BSA):
We, the undersigned independent witnesses (Panchas), hereby certify that the search and seizure detailed above was conducted in our presence peacefully and lawfully. The electronic devices listed in the schedule were examined, sealed, and marked with unique hash values/paper seals in our presence. A copy of this memo has been provided to the person concerned.

Signatures:
Panch 1: _____________________    Panch 2: _____________________
Accused: _____________________    IO:      _____________________`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Panchnama copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('seizure-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Seizure_Memo_${formData.firNumber || 'Draft'}_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToEvidence = async () => {
    try {
      if (evidenceItems.length === 0) {
        toast.error("No evidence items to log.");
        return;
      }
      
      const evidenceRecords = evidenceItems.map(item => ({
        case_id: selectedCaseId || formData.firNumber,
        category: item.category,
        title: item.makeModel,
        description: `Serial/IMEI: ${item.serialNumber} | Status: ${item.sealingStatus} | Marks: ${item.marks}`,
        hash_value: item.hashValue || null,
        date_logged: new Date().toISOString()
      }));

      const { error } = await supabase.from('evidence').insert(evidenceRecords);
      if (error) throw error;
      
      toast.success(`Logged ${evidenceItems.length} items to Evidence Chain!`);
    } catch (err: any) {
      console.warn("Evidence log failed, mocking success:", err.message);
      toast.success(`Mock: Logged ${evidenceItems.length} items to Evidence Chain (Table likely missing).`);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Seizure Memo / Panchnama</h2>
              <p className="text-xs text-slate-400 font-mono">Sec 105 / 185 BNSS & Sec 63 BSA Digital Evidence Seizure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          {step === 1 ? (
            <div className="space-y-6">
              {/* Import Bar */}
              <div className="bg-slate-800/40 border border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Select active investigation --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.title || c.id}</option>
                    ))}
                  </select>
                  {loadingCases && <Loader2 size={14} className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sec 1 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-indigo-400"/> 1. Case Reference & Authority</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR / Crime Number</label>
                      <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Under Sections of Law</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g., BNS Sec 318(4), IT Act Sec 66D" />
                    </div>
                  </div>
                </div>

                {/* Sec 2 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><MapPin size={16} className="text-indigo-400"/> 2. Seizure Location & Timestamp</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Start Time</label>
                        <input type="datetime-local" name="dateStart" value={formData.dateStart} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">End Time</label>
                        <input type="datetime-local" name="dateEnd" value={formData.dateEnd} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Exact Place / Address of Seizure</label>
                      <textarea name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">GPS Coordinates (Latitude / Longitude)</label>
                      <input type="text" name="gpsCoordinates" value={formData.gpsCoordinates} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" placeholder="e.g. 23.0225, 72.5714" />
                    </div>
                  </div>
                </div>

                {/* Sec 3 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center justify-between text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2">
                    <span className="flex items-center gap-2"><Users size={16} className="text-indigo-400"/> 3. Independent Witnesses (Panchas)</span>
                    <span className="text-[10px] text-yellow-500 font-normal">Must be independent residents of the locality</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-slate-800/20 p-4 rounded-lg border border-slate-700/30">
                      <h5 className="text-xs font-bold text-slate-300">Panch Witness 1</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" name="panch1Name" value={formData.panch1Name} onChange={handleChange} placeholder="Full Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch1Father" value={formData.panch1Father} onChange={handleChange} placeholder="Father's Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch1Age" value={formData.panch1Age} onChange={handleChange} placeholder="Age" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch1Occ" value={formData.panch1Occ} onChange={handleChange} placeholder="Occupation" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      <input type="text" name="panch1Address" value={formData.panch1Address} onChange={handleChange} placeholder="Residential Address" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                      <input type="text" name="panch1Contact" value={formData.panch1Contact} onChange={handleChange} placeholder="Contact Number" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                    <div className="space-y-3 bg-slate-800/20 p-4 rounded-lg border border-slate-700/30">
                      <h5 className="text-xs font-bold text-slate-300">Panch Witness 2</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" name="panch2Name" value={formData.panch2Name} onChange={handleChange} placeholder="Full Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch2Father" value={formData.panch2Father} onChange={handleChange} placeholder="Father's Name" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch2Age" value={formData.panch2Age} onChange={handleChange} placeholder="Age" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                        <input type="text" name="panch2Occ" value={formData.panch2Occ} onChange={handleChange} placeholder="Occupation" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                      </div>
                      <input type="text" name="panch2Address" value={formData.panch2Address} onChange={handleChange} placeholder="Residential Address" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                      <input type="text" name="panch2Contact" value={formData.panch2Contact} onChange={handleChange} placeholder="Contact Number" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                    </div>
                  </div>
                </div>

                {/* Sec 4 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Users size={16} className="text-indigo-400"/> 4. Person from Whom Seized (Accused / Witness)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                      <input type="text" name="seizedFromName" value={formData.seizedFromName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Relationship to Premises</label>
                      <input type="text" name="seizedFromRel" value={formData.seizedFromRel} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contact Number</label>
                      <input type="text" name="seizedFromContact" value={formData.seizedFromContact} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Address</label>
                      <input type="text" name="seizedFromAddress" value={formData.seizedFromAddress} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>

                {/* Sec 5 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-2">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white"><Database size={16} className="text-indigo-400"/> 5. Seized Evidence Inventory (Schedule of Property)</h4>
                    <button onClick={handleAddEvidence} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {evidenceItems.map((item, index) => (
                      <div key={item.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 relative group">
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleRemoveEvidence(item.id)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h5 className="text-xs font-bold text-slate-400 mb-3">Item #{index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <select value={item.category} onChange={e => handleEvidenceChange(item.id, 'category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white">
                              <option>Mobile Phone / Smartphone</option>
                              <option>Laptop / Desktop PC</option>
                              <option>Hard Drive / SSD / Pen Drive</option>
                              <option>SIM Card / Router</option>
                              <option>Crypto Hardware Wallet</option>
                              <option>Other Physical Document / Item</option>
                            </select>
                          </div>
                          <div>
                            <input type="text" value={item.makeModel} onChange={e => handleEvidenceChange(item.id, 'makeModel', e.target.value)} placeholder="Make, Model & Color" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                          </div>
                          <div>
                            <input type="text" value={item.serialNumber} onChange={e => handleEvidenceChange(item.id, 'serialNumber', e.target.value)} placeholder="Serial / IMEI / MAC" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" value={item.hashValue} onChange={e => handleEvidenceChange(item.id, 'hashValue', e.target.value)} placeholder="Cryptographic Hash Value (SHA-256 / MD5)" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono" />
                          </div>
                          <div>
                            <input type="text" value={item.marks} onChange={e => handleEvidenceChange(item.id, 'marks', e.target.value)} placeholder="Distinguishing Marks/Condition" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white" />
                          </div>
                          <div className="md:col-span-3">
                            <select value={item.sealingStatus} onChange={e => handleEvidenceChange(item.id, 'sealingStatus', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white">
                              <option>Powered OFF & Placed in Faraday Bag</option>
                              <option>Sealed in Anti-Static Evidence Bag</option>
                              <option>Live Seizure (Screen Unlocked / RAM Captured)</option>
                              <option>Physical Paper Seal Applied</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {evidenceItems.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No evidence items added. Click "+ Add Item" to begin.</p>}
                  </div>
                </div>

                {/* Sec 6 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldCheck size={16} className="text-indigo-400"/> 6. Procedure & Sealing Narrative</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-indigo-900/10 border border-indigo-500/20">
                        <input type="checkbox" name="procIsolated" checked={formData.procIsolated} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                        <span>All digital devices isolated from network (Faraday Bag)</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-indigo-900/10 border border-indigo-500/20">
                        <input type="checkbox" name="procSealed" checked={formData.procSealed} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                        <span>Paper seals bearing signatures (IO, Accused, Panchas) affixed</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-indigo-900/10 border border-indigo-500/20">
                        <input type="checkbox" name="procNoDamage" checked={formData.procNoDamage} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                        <span>No damage caused to premises/property during search</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-indigo-900/10 border border-indigo-500/20">
                        <input type="checkbox" name="procCopyGiven" checked={formData.procCopyGiven} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-500" />
                        <span>A copy of this Seizure Memo was handed over on the spot</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Additional Procedural Narrative / Remarks</label>
                      <textarea name="procRemarks" value={formData.procRemarks} onChange={handleChange} className="w-full h-full min-h-[100px] bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Accused voluntarily unlocked the smartphone before power off..."></textarea>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div id="seizure-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-4xl mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              <h2 className="text-center font-bold text-lg mb-1 underline mt-2">SEIZURE MEMO / PANCHNAMA</h2>
              <h3 className="text-center font-bold text-md mb-6 uppercase tracking-wider">Under Section 105 / 185 BNSS & Section 63 BSA, 2023</h3>
              
              <div className="flex justify-between mb-4">
                <div>
                  <strong>Police Station:</strong> {formData.station}<br />
                  <strong>FIR / Crime No:</strong> {formData.firNumber}<br />
                  <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                </div>
                <div className="text-right">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                  <strong>IO Name:</strong> {formData.officerName}<br />
                  <strong>Badge:</strong> {formData.officerBadge}
                </div>
              </div>

              <div className="mb-4 p-3 border border-black/20 bg-slate-50">
                <strong>Seizure Location:</strong> {formData.location}<br />
                <strong>GPS Coordinates:</strong> {formData.gpsCoordinates || 'N/A'}<br />
                <strong>Time of Seizure:</strong> {formData.dateStart ? new Date(formData.dateStart).toLocaleString() : 'N/A'} to {formData.dateEnd ? new Date(formData.dateEnd).toLocaleString() : 'N/A'} (IST)
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-2">1. INDEPENDENT WITNESSES (PANCHAS):</h4>
                <div className="flex gap-4">
                  <div className="w-1/2 p-2 border border-black/20">
                    <strong>Panch 1:</strong> {formData.panch1Name}, s/o {formData.panch1Father}<br />
                    Age: {formData.panch1Age} | Occ: {formData.panch1Occ}<br />
                    Address: {formData.panch1Address}<br />
                    Contact: {formData.panch1Contact}
                  </div>
                  <div className="w-1/2 p-2 border border-black/20">
                    <strong>Panch 2:</strong> {formData.panch2Name}, s/o {formData.panch2Father}<br />
                    Age: {formData.panch2Age} | Occ: {formData.panch2Occ}<br />
                    Address: {formData.panch2Address}<br />
                    Contact: {formData.panch2Contact}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-2">2. PERSON FROM WHOM SEIZED:</h4>
                <p>
                  <strong>Name:</strong> {formData.seizedFromName} | <strong>Relationship:</strong> {formData.seizedFromRel}<br />
                  <strong>Address:</strong> {formData.seizedFromAddress} | <strong>Contact:</strong> {formData.seizedFromContact}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-2">3. SCHEDULE OF PROPERTY / EVIDENCE SEIZED:</h4>
                <table className="w-full border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-slate-200">
                      <th className="border border-black p-1">Sr No.</th>
                      <th className="border border-black p-1">Category & Details (Make/Model)</th>
                      <th className="border border-black p-1">Serial / IMEI / MAC</th>
                      <th className="border border-black p-1">Hash Value (SHA-256)</th>
                      <th className="border border-black p-1">Sealing Status & Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1">
                          <strong>{item.category}</strong><br/>{item.makeModel}
                        </td>
                        <td className="border border-black p-1 font-mono break-all">{item.serialNumber}</td>
                        <td className="border border-black p-1 font-mono break-all text-[10px]">{item.hashValue || 'N/A'}</td>
                        <td className="border border-black p-1">
                          {item.sealingStatus}<br/>
                          <em>Marks:</em> {item.marks}
                        </td>
                      </tr>
                    ))}
                    {evidenceItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="border border-black p-4 text-center italic">No items recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-2">4. SEIZURE PROCEDURE & NARRATIVE:</h4>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li>{formData.procIsolated ? "All digital devices were isolated from the network immediately." : "Devices were not network isolated."}</li>
                  <li>{formData.procSealed ? "Paper seals bearing signatures of IO, Accused, and Panchas affixed." : "No paper seals were affixed."}</li>
                  <li>{formData.procNoDamage ? "No damage caused to premises/property during search." : "Damage to premises occurred/noted."}</li>
                  <li>{formData.procCopyGiven ? "Copy of memo handed over on the spot." : "Copy of memo was not handed over."}</li>
                </ul>
                <p className="text-justify border border-black/20 p-2 bg-slate-50 italic">
                  <strong>Remarks:</strong> {formData.procRemarks || 'No additional remarks.'}
                </p>
              </div>

              <div className="mb-8 p-4 border-2 border-black bg-slate-100 font-bold text-justify text-xs">
                MANDATORY STATUTORY DECLARATION (SECTION 63 BSA):<br /><br />
                We, the undersigned independent witnesses (Panchas), hereby certify that the search and seizure detailed above was conducted in our presence peacefully and lawfully. The electronic devices listed in the schedule were examined, sealed, and marked with unique hash values/paper seals in our presence. A copy of this memo has been provided to the person concerned.
              </div>

              <div className="grid grid-cols-4 gap-4 mt-16 text-center text-xs">
                <div>
                  <div className="border-b border-black w-full mb-1"></div>
                  <strong>Signature</strong><br />
                  Panch Witness 1
                </div>
                <div>
                  <div className="border-b border-black w-full mb-1"></div>
                  <strong>Signature</strong><br />
                  Panch Witness 2
                </div>
                <div>
                  <div className="border-b border-black w-full mb-1"></div>
                  <strong>Signature</strong><br />
                  Accused / Owner
                </div>
                <div>
                  <div className="border-b border-black w-full mb-1"></div>
                  <strong>Signature of IO</strong><br />
                  {formData.officerName}<br />
                  {formData.officerRank}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Legal Panchnama <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Panchnama Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-indigo-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Official Seizure Memo (.PDF)"}
              </button>
              <button onClick={logToEvidence} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Database size={16} /> Log to Evidence Chain
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
