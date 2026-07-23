import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, FileText, Download, Save, Copy, Loader2, ArrowRight, FileDown, Briefcase, Database, Scale, MapPin, ShieldAlert, MonitorCheck, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type SearchWarrantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
};

export function SearchWarrantModal({ isOpen, onClose, user }: SearchWarrantModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loadingCases, setLoadingCases] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    // Sec 1: Jurisdiction & Ref
    courtName: "In the Court of the Hon'ble Chief Judicial Magistrate / Area Magistrate, Ahmedabad",
    station: 'Ahmedabad Cyber Crime Branch',
    firNumber: '',
    firDate: '',
    sectionsOfLaw: '',
    statutoryProvision: 'Section 97 BNSS (Search of Place Suspected to Contain Cyber Fraud Infrastructure / Stolen Property)',
    
    // Sec 2: Target Scope
    searchScope: 'physical' as 'physical' | 'digital',
    targetAddress: '', // Used for both Physical Addr or Digital Cloud Identifiers based on toggle
    gpsCoordinates: '',
    occupantDetails: '',
    
    // Sec 3: Urgency Matrix
    urgencyWiping: true,
    urgencyInfrastructure: true,
    urgencyCrypto: false,
    urgencyNonCompliance: false,
    detailedIntelligence: '',
    
    // Sec 4: Property Schedule
    propDevices: true,
    propNetworking: true,
    propCrypto: true,
    propServers: false,
    propForgedIDs: false,
    
    // Sec 5: Undertakings
    underAudioVideo: true,
    underWitnesses: true,
    publicProsecutor: 'Learned Public Prosecutor, State of Gujarat',
    
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
          firDate: selected.date ? selected.date.split('T')[0] : prev.firDate,
          sectionsOfLaw: selected.title ? selected.title.replace('Case ', '') : prev.sectionsOfLaw,
          occupantDetails: selected.suspect_details || prev.occupantDetails,
        }));
        
        toast.success(`Imported Case File: ${selected.title}`);
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

  const groundsList = [];
  if (formData.urgencyWiping) groundsList.push("Risk of Remote Data Wiping: Issuing a standard Section 94 BNSS notice will alert the accused, who possesses advanced technical tools to remotely wipe cloud storage, format hard drives, or delete Telegram/WhatsApp server logs.");
  if (formData.urgencyInfrastructure) groundsList.push("Illegal Cyber Fraud Infrastructure: Strong intelligence confirms the premises is operating as an illegal call center / phishing hub equipped with SIM boxes, multiple laptops, and spoofing servers.");
  if (formData.urgencyCrypto) groundsList.push("Concealment of Crypto Wallets: Proceeds of crime are stored in physical cold hardware wallets (e.g., Ledger/Trezor) concealed inside the premises.");
  if (formData.urgencyNonCompliance) groundsList.push("Non-Compliance with Previous Notices: The accused was previously summoned under Section 94 BNSS but deliberately suppressed electronic records and refused to cooperate.");

  const propList = [];
  if (formData.propDevices) propList.push("All desktop PCs, laptops, mobile phones, tablets, and hard drives found on the premises.");
  if (formData.propNetworking) propList.push("SIM cards, routers, modems, SIM boxes, and networking hardware used for cyber spoofing.");
  if (formData.propCrypto) propList.push("Cryptocurrency hardware wallets, written recovery seed phrases, and financial accounting ledgers.");
  if (formData.propServers) propList.push("Server racks, external SSDs, and authorization to execute live RAM forensics on powered-on machines.");
  if (formData.propForgedIDs) propList.push("Forged government IDs, SIM card KYC registers, and debit/credit cards belonging to victims.");

  const sectionCode = formData.statutoryProvision.includes('96') ? '96' : '97';

  const draftText = `IN THE COURT OF THE HON'BLE ${formData.courtName.toUpperCase().replace('IN THE COURT OF THE HON\'BLE ', '')}

STATE OF GUJARAT
Through: ${formData.officerName}, ${formData.officerRank}, ${formData.station}
- VERSUS -
${formData.occupantDetails} (Suspect / Occupant)

APPLICATION FOR ISSUANCE OF SEARCH WARRANT UNDER SECTION ${sectionCode} OF THE BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023

MAY IT PLEASE THIS HON'BLE COURT:

1. CASE REFERENCE:
FIR No: ${formData.firNumber} | Date: ${formData.firDate || '[Date]'}
Police Station: ${formData.station}
Under Sections: ${formData.sectionsOfLaw}

2. TARGET PREMISES DIRECTORY (${formData.searchScope === 'physical' ? 'Physical Hideout' : 'Remote Digital Scope'}):
${formData.searchScope === 'physical' ? `Target Address: ${formData.targetAddress}\nGPS Coordinates: ${formData.gpsCoordinates || 'N/A'}` : `Digital Identifiers (IP Ranges / Cloud Hosts / Domains): ${formData.targetAddress}`}
Person in Control / Occupant: ${formData.occupantDetails}

3. STATUTORY GROUNDS & URGENCY (Why Summons Will Fail):
The Investigating Agency has reason to believe that crucial evidence is concealed at the target premises and an immediate, unannounced search is mandatory on the following grounds:
${groundsList.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Detailed Intelligence & Grounds for Belief:
${formData.detailedIntelligence || 'Detailed intelligence narrative goes here...'}

4. SCHEDULE OF PROPERTY / ELECTRONIC RECORDS SOUGHT TO BE SEIZED:
${propList.map((p, i) => `- ${p}`).join('\n')}

5. STATUTORY UNDERTAKINGS UNDER BNSS:
${formData.underAudioVideo ? '- Mandatory Audio-Video Recording: The Investigating Officer undertakes to conduct continuous audio-video recording (videography) of the entire search and seizure procedure as strictly mandated under Section 105 BNSS.\n' : ''}${formData.underWitnesses ? '- Independent Witnesses: The IO undertakes to execute the warrant in the presence of two independent respectable residents of the locality (Panchas) and supply a copy of the Panchnama to the occupant.\n' : ''}

PRAYER:
In light of the facts and circumstances stated above, it is humbly prayed that this Hon'ble Court may be pleased to issue a Search Warrant under Section ${sectionCode} BNSS, authorizing the Investigating Officer to:
a) Enter and search the aforementioned target premises.
b) Break open doors, server racks, or encrypted devices if resisted.
c) Seize the properties detailed in the Schedule of Property.

VERIFICATION:
I, ${formData.officerName}, do hereby verify that the contents of this application are true and correct based on official intelligence and investigation records.

Date: ${new Date().toLocaleDateString()}

___________________________               ___________________________
${formData.officerName} (${formData.officerRank})                       ${formData.publicProsecutor}
Investigating Officer                     Public Prosecutor`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    toast.success("Warrant Application copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const printElement = document.getElementById('warrant-preview-container');
      if (!printElement) return;

      const canvas = await html2canvas(printElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BNSS_Sec${sectionCode}_SearchWarrantApp_${formData.firNumber || 'Draft'}.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch(e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const logToCaseFile = async () => {
    toast.success("Logged Search Warrant Application to Case File & Audit Trail.");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto w-screen h-screen">
      <div className="bg-[#1C2541] dark:bg-[#0B132B] border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden anim-fadeup">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-[#0B132B]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Search Warrant Application</h2>
              <p className="text-xs text-slate-400 font-mono">Sec 96/97 BNSS Judicial Authorization</p>
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
              <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-pink-400 font-semibold">
                  <Database size={16} /> Import from Existing Case
                </div>
                <div className="flex-1 w-full relative">
                  <select 
                    value={selectedCaseId} 
                    onChange={handleCaseSelect}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 appearance-none cursor-pointer"
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
                
                {/* Sec 1: Jurisdiction & Ref */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><Briefcase size={16} className="text-pink-400"/> 1. Court Jurisdiction & Case Reference</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Target Court Name</label>
                      <input type="text" name="courtName" value={formData.courtName} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 font-serif" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Police Station / Branch</label>
                      <input type="text" name="station" value={formData.station} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Number</label>
                        <input type="text" name="firNumber" value={formData.firNumber} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">FIR Date</label>
                        <input type="date" name="firDate" value={formData.firDate} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Charged Sections of Law (BNSS/IT Act)</label>
                      <input type="text" name="sectionsOfLaw" value={formData.sectionsOfLaw} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="e.g. BNS Sec 318(4)" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-bold text-pink-300">Statutory Provision</label>
                      <select name="statutoryProvision" value={formData.statutoryProvision} onChange={handleChange} className="w-full bg-slate-800/50 border border-pink-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500">
                        <option>Section 96 BNSS (General Search Warrant for Documents/Things)</option>
                        <option>Section 97 BNSS (Search of Place Suspected to Contain Cyber Fraud Infrastructure / Stolen Property)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sec 2: Target Scope */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><MapPin size={16} className="text-pink-400"/> 2. Target Premises Directory (Physical & Digital Scope)</h4>
                  
                  {/* Scope Toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/50 shadow-inner mb-4">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, searchScope: 'physical' }))}
                      className={`flex-1 flex flex-col items-center justify-center p-3 transition-all ${formData.searchScope === 'physical' ? 'bg-pink-600/20 border-b-2 border-pink-500 text-pink-400' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <span className="font-bold text-sm">Physical Premises / Hideout</span>
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, searchScope: 'digital' }))}
                      className={`flex-1 flex flex-col items-center justify-center p-3 transition-all ${formData.searchScope === 'digital' ? 'bg-blue-600/20 border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <span className="font-bold text-sm">Remote Digital / Cloud Server</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        {formData.searchScope === 'physical' ? 'Complete Physical Address (House, Office, Call Center)' : 'Digital Cloud Identifiers (IP Ranges, Cloud Host, Domains, Server IDs)'}
                      </label>
                      <textarea name="targetAddress" value={formData.targetAddress} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" rows={2}></textarea>
                    </div>
                    {formData.searchScope === 'physical' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">GPS Coordinates (Optional)</label>
                        <input type="text" name="gpsCoordinates" value={formData.gpsCoordinates} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="e.g. 23.0225 N, 72.5714 E" />
                      </div>
                    )}
                    <div className={formData.searchScope === 'digital' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs text-slate-400 mb-1">Person in Control / Occupant Details</label>
                      <input type="text" name="occupantDetails" value={formData.occupantDetails} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" placeholder="Name, alias, relationship" />
                    </div>
                  </div>
                </div>

                {/* Sec 3: Urgency Matrix */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30 md:col-span-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><ShieldAlert size={16} className="text-pink-400"/> 3. Statutory Grounds & Why Summons Will Fail (Urgency Matrix)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-pink-900/10 border border-pink-500/20">
                      <input type="checkbox" name="urgencyWiping" checked={formData.urgencyWiping} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span className="text-xs"><strong>Risk of Remote Data Wiping:</strong> Issuing notice will alert accused to remotely wipe cloud storage or format drives.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-pink-900/10 border border-pink-500/20">
                      <input type="checkbox" name="urgencyInfrastructure" checked={formData.urgencyInfrastructure} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span className="text-xs"><strong>Illegal Cyber Infrastructure:</strong> Premises operating as an illegal call center / phishing hub with SIM boxes.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-pink-900/10 border border-pink-500/20">
                      <input type="checkbox" name="urgencyCrypto" checked={formData.urgencyCrypto} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span className="text-xs"><strong>Concealment of Crypto Wallets:</strong> Proceeds of crime stored in physical cold hardware wallets inside premises.</span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/50 transition-colors bg-pink-900/10 border border-pink-500/20">
                      <input type="checkbox" name="urgencyNonCompliance" checked={formData.urgencyNonCompliance} onChange={handleChange} className="mt-1 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span className="text-xs"><strong>Non-Compliance with Notices:</strong> Accused was previously summoned but deliberately suppressed electronic records.</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Detailed Intelligence & Grounds for Belief</label>
                    <textarea name="detailedIntelligence" value={formData.detailedIntelligence} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500 min-h-[100px]" placeholder="Summarize secret informant reports or technical IP tracing leading to this location..."></textarea>
                  </div>
                </div>

                {/* Sec 4: Property Schedule */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><MonitorCheck size={16} className="text-pink-400"/> 4. Schedule of Property to be Seized</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="propDevices" checked={formData.propDevices} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span>Desktop PCs, laptops, mobile phones, tablets, hard drives.</span>
                    </label>
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="propNetworking" checked={formData.propNetworking} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span>SIM cards, routers, modems, SIM boxes, networking hardware.</span>
                    </label>
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="propCrypto" checked={formData.propCrypto} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span>Cryptocurrency hardware wallets, written recovery seed phrases.</span>
                    </label>
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="propServers" checked={formData.propServers} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span>Server racks, external SSDs, and live RAM forensics authorization.</span>
                    </label>
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="propForgedIDs" checked={formData.propForgedIDs} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span>Forged government IDs, SIM card KYC registers, debit/credit cards.</span>
                    </label>
                  </div>
                </div>

                {/* Sec 5: Undertakings */}
                <div className="border border-slate-700/50 rounded-xl p-5 bg-[#0B132B]/30">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-700/50 pb-2"><FileCheck size={16} className="text-pink-400"/> 5. BNSS Safeguard Undertakings</h4>
                  <div className="space-y-4 mb-4">
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="underAudioVideo" checked={formData.underAudioVideo} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span><strong className="text-pink-300">Mandatory Audio-Video Recording:</strong> IO undertakes to conduct continuous videography of search (Sec 105 BNSS).</span>
                    </label>
                    <label className="flex items-start gap-3 text-xs text-slate-300">
                      <input type="checkbox" name="underWitnesses" checked={formData.underWitnesses} onChange={handleChange} className="mt-0.5 rounded border-slate-700 bg-slate-800 text-pink-500" />
                      <span><strong className="text-pink-300">Independent Witnesses:</strong> IO undertakes to execute warrant in presence of two independent local Panchas.</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Learned Public Prosecutor Name</label>
                    <input type="text" name="publicProsecutor" value={formData.publicProsecutor} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // PREVIEW
            <div id="warrant-preview-container" className="bg-white text-black p-10 rounded-lg shadow-inner max-w-4xl mx-auto font-serif text-[13px] leading-relaxed whitespace-pre-wrap border border-slate-300 relative">
              <h2 className="text-center font-bold text-lg mb-1 uppercase">{formData.courtName}</h2>
              <h3 className="text-center font-bold text-md mb-6 uppercase tracking-wider underline">
                APPLICATION FOR ISSUANCE OF SEARCH WARRANT UNDER SECTION {sectionCode} OF THE BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS), 2023
              </h3>
              
              <div className="flex justify-center mb-6">
                <div className="text-center p-4 inline-block min-w-[300px]">
                  <strong>STATE OF GUJARAT</strong><br />
                  Through: {formData.officerName}, {formData.station}<br />
                  <br />
                  <strong>- VERSUS -</strong><br />
                  <br />
                  <strong>{formData.occupantDetails}</strong><br />
                  (Suspect / Occupant)
                </div>
              </div>

              <p className="font-bold mb-4">MAY IT PLEASE THIS HON'BLE COURT:</p>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">1. CASE REFERENCE:</h4>
                <p>
                  <strong>FIR No:</strong> {formData.firNumber} | <strong>Date:</strong> {formData.firDate || '[Date]'}<br />
                  <strong>Police Station:</strong> {formData.station}<br />
                  <strong>Under Sections:</strong> {formData.sectionsOfLaw}
                </p>
              </div>

              <div className="mb-4 p-3 border-2 border-black bg-slate-50">
                <h4 className="font-bold underline mb-1">2. TARGET PREMISES DIRECTORY ({formData.searchScope === 'physical' ? 'Physical Scope' : 'Remote Digital Scope'}):</h4>
                <p>
                  {formData.searchScope === 'physical' ? (
                    <><strong>Target Address:</strong> {formData.targetAddress}<br /><strong>GPS Coordinates:</strong> {formData.gpsCoordinates || 'N/A'}</>
                  ) : (
                    <><strong>Digital Identifiers:</strong> {formData.targetAddress}</>
                  )}
                  <br />
                  <strong className="text-red-800">Person in Control / Occupant:</strong> {formData.occupantDetails}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">3. STATUTORY GROUNDS & URGENCY (Why Summons Will Fail):</h4>
                <p className="mb-2">The Investigating Agency has reason to believe that crucial evidence is concealed at the target premises and an immediate, unannounced search is mandatory on the following grounds:</p>
                {groundsList.length > 0 ? (
                  <ul className="list-decimal pl-6 space-y-2 mb-4 font-semibold">
                    {groundsList.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                ) : (
                  <p className="italic text-slate-500 mb-4">No specific grounds selected.</p>
                )}
                <div className="text-justify border border-black/20 p-2 bg-slate-50">
                  <strong>Detailed Intelligence & Grounds for Belief:</strong><br />
                  {formData.detailedIntelligence || 'Detailed intelligence narrative goes here...'}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold underline mb-1">4. SCHEDULE OF PROPERTY SOUGHT TO BE SEIZED:</h4>
                <ul className="list-disc pl-6 space-y-1 font-bold">
                  {propList.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-bold underline mb-1 text-red-900">5. STATUTORY UNDERTAKINGS UNDER BNSS:</h4>
                <ul className="list-none space-y-2">
                  {formData.underAudioVideo && <li><strong>Mandatory Audio-Video Recording:</strong> The Investigating Officer undertakes to conduct continuous audio-video recording (videography) of the entire search and seizure procedure as strictly mandated under Section 105 BNSS.</li>}
                  {formData.underWitnesses && <li><strong>Independent Witnesses:</strong> The IO undertakes to execute the warrant in the presence of two independent respectable residents of the locality (Panchas) and supply a copy of the Panchnama to the occupant.</li>}
                </ul>
              </div>

              <div className="mb-10 mt-6 font-bold text-justify p-3 border-2 border-black bg-slate-100">
                PRAYER:<br /><br />
                In light of the facts and circumstances stated above, it is humbly prayed that this Hon'ble Court may be pleased to issue a Search Warrant under Section {sectionCode} BNSS, authorizing the Investigating Officer to:<br />
                a) Enter and search the aforementioned target premises.<br />
                b) Break open doors, server racks, or encrypted devices if resisted.<br />
                c) Seize the properties detailed in the Schedule of Property.
              </div>

              <div className="mb-6">
                <strong>VERIFICATION:</strong><br />
                I verify that the contents of this application are true and correct based on official intelligence and investigation records.
              </div>

              <div className="flex justify-between mt-12 mb-4 text-center">
                <div className="w-1/3">
                  <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
                  <strong>Investigating Officer</strong><br />
                  {formData.officerName} ({formData.officerRank})
                </div>
                <div className="w-1/3">
                  <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
                  <strong>Learned Public Prosecutor</strong><br />
                  {formData.publicProsecutor}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0B132B]/50 shrink-0 flex justify-end gap-3 rounded-b-xl">
          {step === 1 ? (
            <button onClick={() => setStep(2)} className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              Draft Court Application <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mr-auto">
                Back to Edit
              </button>
              <button onClick={copyToClipboard} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-slate-700 transition-colors">
                <Copy size={16} /> Copy Application Text
              </button>
              <button onClick={handleDownloadPDF} disabled={isGenerating} className="bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 border border-pink-500/30 transition-colors disabled:opacity-50">
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} 
                {isGenerating ? "Generating..." : "Download Court Application (.PDF)"}
              </button>
              <button onClick={logToCaseFile} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Database size={16} /> Log to Case File
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
