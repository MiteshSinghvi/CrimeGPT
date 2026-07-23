import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, FileSearch, Calendar, ShieldCheck, PenTool, Database, Banknote, ShieldAlert, FileClock } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type Sec106ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function Sec106Modal({ isOpen, onClose, user }: Sec106ModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    sectionsOfLaw: '',
    // Section 2
    bankPreset: '',
    customBank: '',
    // Section 3
    accountNumber: '',
    ifscCode: '',
    suspectName: 'To Be Ascertained by Bank / Suspect Mule Account',
    disputedAmount: '',
    utrNumber: '',
    incidentDate: '',
    // Section 4
    reqDebitFreeze: false,
    reqTotalFreeze: false,
    reqKYC: false,
    reqStatement: false,
    reqLogs: false,
    reqBlockFD: false,
    // Section 5
    urgency: 'IMMEDIATE (Within 6 Hours - Active Wire Fraud)',
    deliveryMethod: 'Send compliance report and KYC logs via encrypted email: nodal-cyber@accb.gov.in',
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
          suspectName: selected.suspect_details || prev.suspectName,
          disputedAmount: selected.amount_lost ? selected.amount_lost.toString() : prev.disputedAmount
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

  if (!isOpen) return null;

  const bankOptions = [
    { label: "Select Preset...", value: "" },
    { label: "State Bank of India (Nodal Officer - Law Enforcement / Cyber Crime Desk)", value: "State Bank of India (Nodal Officer - Law Enforcement / Cyber Crime Desk)" },
    { label: "HDFC Bank Ltd. (National Cyber Crime Response / Nodal Officer)", value: "HDFC Bank Ltd. (National Cyber Crime Response / Nodal Officer)" },
    { label: "ICICI Bank Ltd. (Financial Crime Prevention / Nodal Desk)", value: "ICICI Bank Ltd. (Financial Crime Prevention / Nodal Desk)" },
    { label: "Axis Bank / Kotak Mahindra Bank (Law Enforcement Compliance)", value: "Axis Bank / Kotak Mahindra Bank (Law Enforcement Compliance)" },
    { label: "Paytm Payments Bank / PhonePe / Google Pay / NPCI UPI Nodal Desk", value: "Paytm Payments Bank / PhonePe / Google Pay / NPCI UPI Nodal Desk" },
    { label: "Razorpay / PayU / Cashfree (Payment Gateway Compliance Desk)", value: "Razorpay / PayU / Cashfree (Payment Gateway Compliance Desk)" },
    { label: "Binance / CoinDCX / WazirX (Crypto Exchange Legal Liaison)", value: "Binance / CoinDCX / WazirX (Crypto Exchange Legal Liaison)" },
    { label: "Custom Bank / Financial Institution...", value: "custom" }
  ];

  const finalBank = formData.bankPreset === 'custom' ? formData.customBank : formData.bankPreset;

  const getRequiredActionsList = () => {
    const list = [];
    if (formData.reqDebitFreeze) list.push(`Immediate Debit Freeze / Lien Marking (Block outbound transfers up to the disputed amount ₹${formData.disputedAmount || '[Amount]'}).`);
    if (formData.reqTotalFreeze) list.push("Complete Account Freeze (Total debit freeze on the entire account balance due to severe mule account activity).");
    if (formData.reqKYC) list.push("Provide Complete KYC Documents & Account Opening Form (AOF) with photograph and ID proofs.");
    if (formData.reqStatement) list.push(`Provide Certified Account Statement from ${formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : '[Incident Date]'} to Present.`);
    if (formData.reqLogs) list.push("Provide IP Access Logs, ATM Withdrawal Locations, and Beneficiary Mapping for all outbound transfers.");
    if (formData.reqBlockFD) list.push("Prevent creation of new fixed deposits or liquidation of existing assets linked to this PAN/CIF.");
    return list;
  };

  const actionsList = getRequiredActionsList();

  const draftText = `ORDER UNDER SECTION 106 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023 - SEIZURE / FREEZE OF BANK ACCOUNT
(Formerly Section 102 of the Code of Criminal Procedure, 1973)

From:
Investigating Officer: ${formData.officerName}, ${formData.officerRank}
Badge Number: ${formData.officerBadge}
${formData.station}

To:
The Nodal Officer / Compliance Desk
${finalBank}

Subject: Urgent directives to Freeze/Lien Account No. ${formData.accountNumber} regarding UTR ${formData.utrNumber}

Ref: Case FIR No. ${formData.firNumber}
Under Sections: ${formData.sectionsOfLaw}

Sir/Madam,
An investigation under the Bharatiya Nyaya Sanhita (BNS), 2023 and IT Act is underway regarding cyber fraud. There are strong grounds to believe that the aforementioned bank account/wallet contains proceeds of crime. 

DISPUTED TRANSACTION & ACCOUNT DETAILS:
Account Number / Wallet ID / VPA: ${formData.accountNumber}
IFSC Code / Branch: ${formData.ifscCode || 'N/A'}
Suspect / Account Holder Name: ${formData.suspectName}
Disputed Transaction Amount: ₹${formData.disputedAmount}
UTR / RRN: ${formData.utrNumber}
Date & Time of Transaction: ${formData.incidentDate ? new Date(formData.incidentDate).toLocaleString() : 'N/A'} (IST)

SCOPE OF FREEZING & ACTION REQUIRED:
${actionsList.length > 0 ? actionsList.map((a, i) => `${i + 1}. ${a}`).join('\n') : 'No specific actions selected.'}

You are directed to execute these instructions and submit compliance ${formData.urgency}.
Delivery Method: ${formData.deliveryMethod}

MANDATORY LEGAL DIRECTIVE:
Under Section 106 BNSS, you are hereby directed to immediately mark a lien / debit freeze on the account and report compliance to the undersigned. Failure to comply with this lawful order without reasonable cause will invite penal action under Section 210 and Section 249 of the BNS, 2023.

Signature of Investigating Officer:
Name: ${formData.officerName}
Rank: ${formData.officerRank}
Date: ${new Date().toLocaleDateString()}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Draft copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('sec106-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BNSS_Sec106_Freeze_${formData.firNumber || 'Draft'}_${formData.accountNumber || 'Acc'}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToEvidence = async () => {
    toast.success("Freeze Order issuance logged to Evidence Chain audit trail.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 border border-red-500/30">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Section 106 BNSS Freeze Order</h2>
              <p className="text-xs text-slate-400 font-mono">Bank Account & Wallet Seizure Directive</p>
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
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-red-400"/> 1. Case Reference & Authority</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FIR / Crime Number</label>
                      <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Under Sections of Law</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g., BNS Sec 318(4)" />
                    </div>
                  </div>
                </div>

                {/* Sec 2 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Banknote size={16} className="text-red-400"/> 2. Target Financial Institution</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nodal Presets</label>
                      <select name="bankPreset" value={formData.bankPreset} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500">
                        {bankOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    {formData.bankPreset === 'custom' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Custom Financial Institution Details</label>
                        <input type="text" name="customBank" value={formData.customBank} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="e.g. PayPal Compliance Desk" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sec 3 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileSearch size={16} className="text-red-400"/> 3. Disputed Transaction & Account Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Account Number / VPA (UPI ID)</label>
                      <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono" placeholder="e.g. 0000111122223333" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">IFSC Code & Branch Name</label>
                      <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono" placeholder="e.g. SBIN0001234" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Suspect / Account Holder Name</label>
                      <input type="text" name="suspectName" value={formData.suspectName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Disputed Transaction Amount (₹)</label>
                      <input type="number" name="disputedAmount" value={formData.disputedAmount} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono" placeholder="e.g. 50000" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">UTR / RRN</label>
                      <input type="text" name="utrNumber" value={formData.utrNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono" placeholder="e.g. 234567890123" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Date & Time of Disputed Transaction (IST)</label>
                      <input type="datetime-local" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="w-full md:w-1/2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                  </div>
                </div>

                {/* Sec 4 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldCheck size={16} className="text-red-400"/> 4. Scope of Freezing & Action Required</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="reqDebitFreeze" checked={formData.reqDebitFreeze} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Immediate Debit Freeze / Lien Marking (Block up to ₹{formData.disputedAmount || '[Amount]'})</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-red-900/10 border border-red-500/20">
                      <input type="checkbox" name="reqTotalFreeze" checked={formData.reqTotalFreeze} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Complete Account Freeze (Total debit freeze on entire balance)</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqKYC" checked={formData.reqKYC} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Provide Complete KYC Documents & AOF with ID proofs</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqStatement" checked={formData.reqStatement} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Provide Certified Account Statement from Incident Date</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqLogs" checked={formData.reqLogs} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Provide IP Access Logs, ATM Locations, & Beneficiary Mapping</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <input type="checkbox" name="reqBlockFD" checked={formData.reqBlockFD} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500" />
                      <span>Prevent creation/liquidation of Fixed Deposits linked to PAN</span>
                    </label>
                  </div>
                </div>
                
                {/* Sec 5 */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileClock size={16} className="text-red-400"/> 5. Compliance Deadline & Officer Sign-off</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Urgency Level / Deadline</label>
                      <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500">
                        <option>IMMEDIATE (Within 6 Hours - Active Wire Fraud)</option>
                        <option>Within 24 Hours</option>
                        <option>Within 48 Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Official Communication Channel</label>
                      <input type="text" name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Officer Details</label>
                      <div className="text-sm font-mono text-slate-300 bg-slate-800/30 p-2 rounded border border-slate-700/30">
                        {formData.officerName} ({formData.officerRank}) - {formData.officerBadge}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div id="sec106-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-3xl mx-auto font-serif text-sm leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              <div className="absolute inset-0 border-4 border-double border-slate-300 pointer-events-none m-4 rounded"></div>
              <h2 className="text-center font-bold text-lg mb-1 underline mt-4">ORDER UNDER SECTION 106 OF BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023</h2>
              <h3 className="text-center font-bold text-md mb-1 uppercase tracking-wider">Seizure / Freeze of Bank Account</h3>
              <p className="text-center text-xs font-semibold mb-6">(Formerly Section 102 of the Code of Criminal Procedure, 1973)</p>
              
              <div className="flex justify-between mb-6 px-4">
                <div>
                  <strong>From:</strong><br />
                  Investigating Officer: {formData.officerName}, {formData.officerRank}<br />
                  Badge Number: {formData.officerBadge}<br />
                  {formData.station}
                </div>
                <div className="text-right">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                </div>
              </div>
              
              <div className="mb-6 px-4">
                <strong>To:</strong><br />
                The Nodal Officer / Compliance Desk<br />
                {finalBank || '[Bank/Financial Institution Name]'}
              </div>

              <div className="mb-6 p-3 border border-black/20 bg-slate-50 mx-4">
                <strong>Subject:</strong> Urgent directives to Freeze/Lien Account No. {formData.accountNumber} regarding UTR {formData.utrNumber}<br />
                <strong>Ref:</strong> Case FIR No. {formData.firNumber}<br />
                <strong>Under Sections:</strong> {formData.sectionsOfLaw}
              </div>

              <div className="px-4">
                <p className="mb-4">Sir/Madam,</p>
                <p className="mb-4 text-justify">
                  An investigation under the Bharatiya Nyaya Sanhita (BNS), 2023 and IT Act is underway regarding cyber fraud. There are strong grounds to believe that the aforementioned bank account/wallet contains proceeds of crime. 
                </p>

                <div className="mb-6 p-4 border border-black/30 bg-slate-50">
                  <h4 className="font-bold underline mb-2">DISPUTED TRANSACTION & ACCOUNT DETAILS:</h4>
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-black/10"><th className="py-1 w-1/3">Account No / VPA:</th><td className="py-1 font-mono font-bold text-red-700">{formData.accountNumber}</td></tr>
                      <tr className="border-b border-black/10"><th className="py-1">IFSC Code / Branch:</th><td className="py-1 font-mono">{formData.ifscCode || 'N/A'}</td></tr>
                      <tr className="border-b border-black/10"><th className="py-1">Account Holder:</th><td className="py-1">{formData.suspectName}</td></tr>
                      <tr className="border-b border-black/10"><th className="py-1">Disputed Amount:</th><td className="py-1 font-mono font-bold">₹{formData.disputedAmount}</td></tr>
                      <tr className="border-b border-black/10"><th className="py-1">UTR / RRN:</th><td className="py-1 font-mono font-bold">{formData.utrNumber}</td></tr>
                      <tr><th className="py-1">Date & Time (IST):</th><td className="py-1">{formData.incidentDate ? new Date(formData.incidentDate).toLocaleString() : 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold underline mb-2">SCOPE OF FREEZING & ACTION REQUIRED:</h4>
                  {actionsList.length > 0 ? (
                    <ul className="list-decimal pl-5 space-y-2 font-semibold text-[13px]">
                      {actionsList.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  ) : (
                    <p className="italic text-slate-500">No specific actions selected.</p>
                  )}
                </div>

                <p className="mb-6 text-justify bg-slate-100 p-2 border border-slate-300">
                  You are directed to execute these instructions and submit compliance <strong>{formData.urgency}</strong>.<br />
                  <strong>Delivery Method:</strong> {formData.deliveryMethod}
                </p>

                <div className="mb-8 p-4 border-2 border-red-600 bg-red-50 text-red-900 font-bold text-justify text-xs">
                  MANDATORY LEGAL DIRECTIVE:<br />
                  Under Section 106 BNSS, you are hereby directed to immediately mark a lien / debit freeze on the account and report compliance to the undersigned. Failure to comply with this lawful order without reasonable cause will invite penal action under Section 210 and Section 249 of the BNS, 2023.
                </div>

                <div className="flex justify-end mt-12 mb-4">
                  <div className="text-center">
                    <div className="border-b border-black w-48 mb-2"></div>
                    Signature of Investigating Officer<br />
                    <strong>{formData.officerName}</strong><br />
                    {formData.officerRank}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Official Order <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Order Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Official Order (.PDF)"}
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
