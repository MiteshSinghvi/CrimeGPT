import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, BookOpen, UserCircle, AlertTriangle, ShieldCheck, PenTool, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type FIRModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FIRModal({ isOpen, onClose }: FIRModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1
    station: 'Ahmedabad Cyber Crime Branch',
    district: 'Ahmedabad, Gujarat',
    firNumber: `FIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    infoDateTime: new Date().toISOString().slice(0, 16),
    // Section 2
    compName: '',
    compRelName: '',
    compAge: '',
    compGender: 'Male',
    compContact: '',
    compEmail: '',
    compAddress: '',
    // Section 3
    occDateTime: '',
    medium: 'UPI / Banking Fraud',
    financialLoss: '',
    // Section 4
    suspectName: 'Unknown / Unidentified',
    digitalTraces: '',
    // Section 5 (Sections)
    sec318: false,
    sec319: false,
    sec308: false,
    sec66D: false,
    sec66C: false,
    sec67: false,
    customSections: '',
    // Section 6
    narrative: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetchCases();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const { data, error } = await supabase.from('cases').select('id, case_number, title, description, status').order('created_at', { ascending: false });
      if (!error && data) {
        setCases(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCaseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCaseId(id);
    const selected = cases.find(c => c.id === id);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        narrative: selected.description || '',
      }));
      toast.success(`Imported data from ${selected.title}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateDraft = () => {
    setStep(2);
  };

  const activeSections = [
    formData.sec318 && "Section 318(4) BNS (Cheating / Fraud)",
    formData.sec319 && "Section 319 BNS (Cheating by Personation)",
    formData.sec308 && "Section 308 BNS (Extortion)",
    formData.sec66D && "Section 66D IT Act (Cheating by personation using computer resource)",
    formData.sec66C && "Section 66C IT Act (Identity Theft)",
    formData.sec67 && "Section 67 IT Act (Publishing obscene material in electronic form)",
    formData.customSections
  ].filter(Boolean).join(", ");

  const draftText = `FIRST INFORMATION REPORT
UNDER SECTION 173 BNSS

1. Police Station / Branch: ${formData.station}
2. District & State: ${formData.district}
3. FIR Number & Year: ${formData.firNumber}
4. Date & Time of Information Received: ${new Date(formData.infoDateTime).toLocaleString()}

COMPLAINANT / INFORMANT DETAILS:
Name: ${formData.compName}
Father's / Husband's Name: ${formData.compRelName}
Age/Gender: ${formData.compAge} / ${formData.compGender}
Contact: ${formData.compContact} | Email: ${formData.compEmail}
Permanent Address: ${formData.compAddress}

CYBER INCIDENT SPECIFICATIONS:
Date & Time of Occurrence: ${formData.occDateTime ? new Date(formData.occDateTime).toLocaleString() : 'N/A'}
Medium / Platform Involved: ${formData.medium}
Total Financial Loss: ₹${formData.financialLoss || '0'}

SUSPECT / ACCUSED DIGITAL IDENTIFIERS:
Name / Alias: ${formData.suspectName}
Known Digital Traces: ${formData.digitalTraces}

STATUTORY PENAL SECTIONS APPLICABLE:
${activeSections || 'N/A'}

BRIEF FACTS OF THE CASE / COMPLAINT NARRATIVE:
${formData.narrative}

----------------------------------------------------
Signature of Investigating Officer:
Name: ______________________
Date: ______________________`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Draft copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('fir-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FIR_${formData.firNumber || 'Draft'}_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToCase = async () => {
    if (!selectedCaseId) {
      toast.error("Please select an active case from the dropdown first to save to its history.");
      return;
    }
    const selected = cases.find(c => c.id === selectedCaseId);
    if (!selected) return;
    
    try {
      const appendText = `\n\n[SYSTEM: FIR Draft Attached (${formData.firNumber})]\n` + draftText;
      const { error } = await supabase.from('cases').update({
        description: (selected.description || '') + appendText
      }).eq('id', selectedCaseId);
      
      if (error) throw error;
      toast.success("FIR Draft saved to case file successfully!");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save to case file.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="w-full max-w-4xl bg-[#1C2541] border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-[#0B132B]/50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Official FIR Generator</h2>
              <p className="text-xs text-slate-400 font-['DM_Sans']">Section 173 Bharatiya Nagarik Suraksha Sanhita (BNSS)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "none" }}>
          {step === 1 ? (
            <div className="space-y-6">
              {/* Import Bar */}
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-blue-400">Import from Existing Case (Optional)</h3>
                  <p className="text-xs text-slate-400">Auto-fill narrative and suspect details from an active investigation.</p>
                </div>
                <select 
                  value={selectedCaseId} 
                  onChange={handleCaseSelect}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-64"
                >
                  <option value="">-- Select Active Case --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                  ))}
                </select>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 gap-6">
                
                {/* Sec 1 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><BookOpen size={16} className="text-blue-400"/> 1. Jurisdiction & General Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">District & State</label>
                      <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR Number & Year</label>
                      <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Date/Time Information Received</label>
                      <input type="datetime-local" name="infoDateTime" value={formData.infoDateTime} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Sec 2 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><UserCircle size={16} className="text-blue-400"/> 2. Complainant / Informant Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                      <input type="text" name="compName" value={formData.compName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Father's / Husband's Name</label>
                      <input type="text" name="compRelName" value={formData.compRelName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Age</label>
                      <input type="number" name="compAge" value={formData.compAge} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Gender</label>
                      <select name="compGender" value={formData.compGender} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Male</option><option>Female</option><option>Other</option><option>Organization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contact No.</label>
                      <input type="text" name="compContact" value={formData.compContact} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Email</label>
                      <input type="email" name="compEmail" value={formData.compEmail} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-xs text-slate-400 mb-1">Permanent Address</label>
                      <input type="text" name="compAddress" value={formData.compAddress} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Sec 3 & 4 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><AlertTriangle size={16} className="text-blue-400"/> 3. Cyber Incident Specs</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Date/Time of Occurrence</label>
                        <input type="datetime-local" name="occDateTime" value={formData.occDateTime} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Medium / Platform Involved</label>
                        <select name="medium" value={formData.medium} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>UPI / Banking Fraud</option>
                          <option>Social Media Impersonation</option>
                          <option>Phishing / Malicious Link</option>
                          <option>Data Breach / Extortion</option>
                          <option>Crypto Scam</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Financial Loss Amount (₹)</label>
                        <input type="number" name="financialLoss" value={formData.financialLoss} onChange={handleChange} placeholder="0.00" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><UserCircle size={16} className="text-blue-400"/> 4. Suspect Digital Identifiers</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Suspect Name / Alias</label>
                        <input type="text" name="suspectName" value={formData.suspectName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Known Digital Traces</label>
                        <textarea name="digitalTraces" value={formData.digitalTraces} onChange={handleChange} placeholder="Phone Numbers, UPI IDs, IP Addresses, URLs..." rows={4} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sec 5 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldCheck size={16} className="text-blue-400"/> 5. Statutory Penal Sections</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec318" checked={formData.sec318} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      BNS Sec 318(4) - Cheating / Fraud
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec319" checked={formData.sec319} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      BNS Sec 319 - Cheating by Personation
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec308" checked={formData.sec308} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      BNS Sec 308 - Extortion
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec66D" checked={formData.sec66D} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      IT Act Sec 66D - Impersonation via Computer
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec66C" checked={formData.sec66C} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      IT Act Sec 66C - Identity Theft
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="sec67" checked={formData.sec67} onChange={handleChange} className="rounded border-slate-700 bg-slate-800 text-blue-500" />
                      IT Act Sec 67 - Obscene Material
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Additional Specialized Sections</label>
                    <input type="text" name="customSections" value={formData.customSections} onChange={handleChange} placeholder="e.g. IT Act Sec 43, BNS Sec 316..." className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Sec 6 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><PenTool size={16} className="text-blue-400"/> 6. Complaint Narrative</h4>
                  <textarea name="narrative" value={formData.narrative} onChange={handleChange} rows={6} placeholder="Paste the raw victim complaint or write the chronological summary of the cyber fraud here..." className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
                </div>

              </div>
            </div>
          ) : (
            <div id="fir-preview-container" className="bg-white text-black p-8 rounded-lg shadow-inner max-w-3xl mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {draftText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 rounded-b-xl flex justify-end gap-3 shrink-0">
          {step === 1 ? (
            <button onClick={generateDraft} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Official FIR <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Legal Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Official FIR (.PDF)"}
              </button>
              <button onClick={saveToCase} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Save size={16} /> Save to Case File
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
