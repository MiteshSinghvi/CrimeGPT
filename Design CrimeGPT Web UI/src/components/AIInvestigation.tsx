import React, { useState, useEffect } from 'react';
import {
  ChevronRight, FileText, Activity, ShieldAlert, Cpu, UserCircle,
  Target, Loader2, Scale, ListTodo, Trash2, AlertTriangle, Download,
  CheckSquare, Square, Globe, Key, Phone, CreditCard, Calendar, Mail,
  Shield, Building2, Zap
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ══════════════════════════════════════════════════════════════════
//  OFFLINE TYPESCRIPT LEGAL ENGINE (mirrors backend/legal_engine.py)
// ══════════════════════════════════════════════════════════════════

interface StatuteEntry {
  section_id: string;
  badge: string;
  title: string;
  keywords: string[];
  checklist: string[];
  context_template: string;
}

interface ExtractedEntity {
  type: 'VICTIM' | 'SUSPECT' | 'ARTIFACT';
  label: string;
  sublabel: string;
}

interface MappedSection {
  section_id: string;
  badge: string;
  title: string;
  context: string;
  checklist: string[];
  score: number;
  matched_keywords: string[];
}

interface AnalysisResult {
  classification: string;
  severity: string;
  executive_summary: string;
  immediate_actions: string[];
  mapped_sections: MappedSection[];
  entities: ExtractedEntity[];
  total_statutes_scanned: number;
}

// ── Core Statutes Database (curated Indian law sections) ──
const STATUTES_DB: StatuteEntry[] = [
  {
    section_id: "IT Act Sec 43",
    badge: "[IT ACT 43]",
    title: "Penalty for Damage to Computer, Computer System",
    keywords: ["unauthorized access","download","virus","malware","damage","computer","server","data","extract","copy","denial of service","ddos","ransomware","trojan","worm","spyware","bot","botnet","intrusion"],
    checklist: ["Isolate the affected computer system/server from the network immediately","Collect volatile data (RAM dump) before powering down the system","Create forensic bit-stream image (dd/FTK) of all affected storage media","Calculate and record SHA-256 / MD5 hash values of all seized digital evidence","Preserve firewall logs, IDS/IPS alerts, and system event logs","Request ISP logs under Sec 67C IT Act for data retention compliance"],
    context_template: "The narrative describes unauthorized access and/or damage to computer systems, directly invoking Section 43 of the IT Act which provides for compensation up to Rs. 5 crore for unauthorized access, data extraction, virus introduction, or denial of service attacks."
  },
  {
    section_id: "IT Act Sec 65",
    badge: "[IT ACT 65]",
    title: "Tampering with Computer Source Documents",
    keywords: ["source code","tamper","alter","destroy","source document","program","concealed","modified code","software"],
    checklist: ["Obtain original and tampered versions of the source code for comparison","Engage a certified software forensic expert for code diff analysis","Preserve version control history (Git logs, SVN history)","Seize development machines and build servers"],
    context_template: "Evidence suggests tampering with computer source documents. Section 65 criminalizes concealing, destroying, or altering computer source code when required by law, punishable with imprisonment up to 3 years and/or fine up to Rs. 2 lakh."
  },
  {
    section_id: "IT Act Sec 66",
    badge: "[IT ACT 66]",
    title: "Computer Related Offences (Hacking)",
    keywords: ["hack","hacking","breach","intrusion","unauthorized","crack","exploit","penetrate","compromise","attack","cyber attack","access"],
    checklist: ["Document the method of unauthorized access (exploit, brute force, social engineering)","Preserve network traffic captures (PCAP files) showing the attack pattern","Identify and record the attack vector and entry point","Collect server access logs showing unauthorized sessions","Issue Sec 91 BNSS notice to hosting providers for server logs","Engage CERT-In for incident response if critical infrastructure is affected"],
    context_template: "The complaint describes acts of computer hacking or unauthorized system access. Section 66 IT Act provides for imprisonment up to 3 years and/or fine up to Rs. 5 lakh for any person who dishonestly or fraudulently commits any act referred to in Section 43."
  },
  {
    section_id: "IT Act Sec 66C",
    badge: "[IT ACT 66C]",
    title: "Identity Theft — Fraudulent Use of Electronic Signature, Password, or Unique ID",
    keywords: ["identity theft","password","credential","login","uid","impersonat","hack","proxy","vpn","aadhaar","otp","two factor","2fa","stolen identity","fake id","electronic signature","digital signature"],
    checklist: ["Preserve server access logs and IP authentication tables under Sec 67C IT Act","Issue Sec 91 BNSS / 91 CrPC notice to VPN and ISP nodes for KYC and routing logs","Seize digital devices and calculate SHA-256 hash values immediately","Request OTP delivery logs from telecom operators","Trace compromised credentials back to the original phishing or breach vector","Freeze compromised accounts and force password resets"],
    context_template: "The narrative reveals use of stolen electronic signatures, passwords, or unique identification features. Section 66C IT Act criminalizes identity theft with imprisonment up to 3 years and fine up to Rs. 1 lakh."
  },
  {
    section_id: "IT Act Sec 66D",
    badge: "[IT ACT 66D]",
    title: "Cheating by Personation Using Computer Resource",
    keywords: ["phishing","scam","impersonate","fake profile","spoof","email spoof","website clone","fake website","social engineering","vishing"],
    checklist: ["Identify and screenshot the fraudulent website/profile before takedown","Request WHOIS records and domain registration details from the registrar","Obtain hosting provider server logs via Sec 91 BNSS notice","Trace financial transactions to identify mule accounts","Freeze associated fraudulent bank accounts via Sec 106 BNSS","Coordinate with CERT-In for phishing domain blacklisting"],
    context_template: "The complaint describes cheating by personation using computer resources such as fake websites, spoofed emails, or fraudulent online profiles. Section 66D provides imprisonment up to 3 years and fine up to Rs. 1 lakh."
  },
  {
    section_id: "IT Act Sec 66E",
    badge: "[IT ACT 66E]",
    title: "Violation of Privacy — Capturing and Publishing Private Images",
    keywords: ["privacy","intimate","photo","video","morphed","deepfake","recording","camera","surveillance","voyeur","nude"],
    checklist: ["Secure copies of the offending images/videos with hash verification","Identify the platform(s) where the content was published","Issue takedown notices to social media platforms and ISPs","Obtain IP logs and account details of the uploader"],
    context_template: "The incident involves intentional capture, publication, or transmission of images of a private area of a person without consent. Section 66E provides imprisonment up to 3 years and/or fine up to Rs. 2 lakh."
  },
  {
    section_id: "IT Act Sec 66F",
    badge: "[IT ACT 66F]",
    title: "Cyber Terrorism",
    keywords: ["terrorism","critical infrastructure","national security","bomb","threat","defense","nuclear","power grid","sabotage","critical"],
    checklist: ["Immediately escalate to National Investigation Agency (NIA) and CERT-In","Isolate all affected critical infrastructure systems","Activate national cyber crisis management protocols","Preserve all digital evidence under strict chain of custody","Coordinate with intelligence agencies for threat assessment"],
    context_template: "The acts described constitute cyber terrorism targeting critical information infrastructure. Section 66F provides for life imprisonment for acts of cyber terrorism threatening the unity, integrity, security, or sovereignty of India."
  },
  {
    section_id: "IT Act Sec 67",
    badge: "[IT ACT 67]",
    title: "Publishing Obscene Material in Electronic Form",
    keywords: ["obscene","pornography","explicit","adult content","indecent","lewd","sexual content"],
    checklist: ["Preserve the obscene electronic content with forensic imaging","Identify the publisher/transmitter through IP and account tracing","Issue takedown notices to hosting platforms","Record the chain of transmission"],
    context_template: "Publishing or transmitting obscene material in electronic form. Section 67 provides first conviction imprisonment up to 3 years and fine up to Rs. 5 lakh."
  },
  {
    section_id: "IT Act Sec 67A",
    badge: "[IT ACT 67A]",
    title: "Publishing Sexually Explicit Material",
    keywords: ["sexually explicit","pornograph","sex video","mms","revenge porn","sextortion","explicit video"],
    checklist: ["Preserve all sexually explicit electronic material as evidence","Identify victims and obtain their consent status","Trace the origin through metadata analysis","Issue immediate takedown requests"],
    context_template: "Transmission of sexually explicit material in electronic form. Section 67A provides first conviction imprisonment up to 5 years and fine up to Rs. 10 lakh."
  },
  {
    section_id: "IT Act Sec 67B",
    badge: "[IT ACT 67B]",
    title: "Child Sexual Abuse Material (CSAM)",
    keywords: ["child","minor","csam","child abuse","child exploitation","pedophil","underage"],
    checklist: ["Immediately report to NCMEC/Interpol and local SJPU","Invoke POCSO Act provisions in parallel","Preserve all digital evidence with strict chain of custody","Identify and rescue child victims as top priority"],
    context_template: "Material depicting children in sexually explicit acts. Section 67B provides first conviction imprisonment up to 5 years and fine up to Rs. 10 lakh. POCSO Act must be invoked concurrently."
  },
  {
    section_id: "BNS Sec 303",
    badge: "[BNS 303]",
    title: "Theft",
    keywords: ["theft","stole","stolen","rob","snatch","took away","missing","shoplifting"],
    checklist: ["Document the stolen property with descriptions and serial numbers","Check CCTV footage at and around the crime scene","Record witness statements from bystanders and security personnel","Alert pawn shops and second-hand dealers"],
    context_template: "Theft of property under BNS Section 303 (replacing IPC 378). Defined as dishonest removal of movable property from lawful possession, punishable with imprisonment up to 3 years and/or fine."
  },
  {
    section_id: "BNS Sec 308",
    badge: "[BNS 308]",
    title: "Extortion",
    keywords: ["extortion","blackmail","threat","demand","ransom","pay or else","threatening"],
    checklist: ["Preserve all communications containing threats","Set up call recording for future threat communications","Identify the extortionist through phone/digital trace","Coordinate with the bank if ransom payment is demanded"],
    context_template: "Extortion through threats. BNS Section 308 (replacing IPC 383-389) criminalizes putting a person in fear of injury to dishonestly induce delivery of property."
  },
  {
    section_id: "BNS Sec 316",
    badge: "[BNS 316]",
    title: "Criminal Breach of Trust",
    keywords: ["breach of trust","employee","insider","stole","trust","misappropriation","corporate","embezzle","fiduciary","entrusted"],
    checklist: ["Audit internal access logs, financial records, and physical entry logs","Examine employment contracts, NDA agreements, and fiduciary duties","Seize the employee's official laptop, mobile device, and access cards","Trace misappropriated funds through bank statements and UPI logs"],
    context_template: "Criminal breach of trust where the accused, entrusted with property, dishonestly misappropriated or converted it. BNS Section 316 provides imprisonment up to 7 years and fine."
  },
  {
    section_id: "BNS Sec 318",
    badge: "[BNS 318]",
    title: "Cheating and Dishonestly Inducing Delivery of Property",
    keywords: ["cheat","fraud","money","transfer","bank","financial","lakhs","rupees","crore","deceive","dishonest","upi","neft","rtgs","wallet","inducing"],
    checklist: ["Liaise with FIU and nodal officers of the concerned bank","Execute Sec 106 BNSS to freeze the beneficiary accounts within the golden hour","Obtain KYC documents of the suspect account holders","Trace the money trail through bank statements and UPI transaction logs","File a report on the National Cyber Crime Reporting Portal (cybercrime.gov.in)"],
    context_template: "Cheating by deception and dishonestly inducing delivery of property. BNS Section 318 (replacing IPC 420) provides imprisonment up to 7 years and fine."
  },
  {
    section_id: "BNS Sec 319",
    badge: "[BNS 319]",
    title: "Cheating by Impersonation",
    keywords: ["impersonation","pretending","fake identity","assumed name","pose as","disguise"],
    checklist: ["Collect evidence of the false identity used","Compare the actual identity with the assumed identity","Trace communications under the false identity","Identify victims deceived by the impersonation"],
    context_template: "Cheating by personation. BNS Section 319 (replacing IPC 419) specifically addresses cheating by pretending to be another person, punishable with imprisonment up to 5 years and fine."
  },
  {
    section_id: "BNS Sec 336",
    badge: "[BNS 336]",
    title: "Forgery",
    keywords: ["forge","forgery","forged","fake document","counterfeit","fabricated","falsified"],
    checklist: ["Obtain original and forged documents for comparison","Engage handwriting/document forensic expert for analysis","Identify the tools and materials used for forgery","Trace the usage and distribution of forged documents"],
    context_template: "Forgery of documents. BNS Section 336 (replacing IPC 463-468) criminalizes making a false document with intent to cause damage or fraud, punishable with imprisonment up to 2 years and fine."
  },
  {
    section_id: "BNS Sec 351",
    badge: "[BNS 351]",
    title: "Criminal Intimidation",
    keywords: ["intimidate","threaten","death threat","injury threat","menace","coerce","scare"],
    checklist: ["Preserve evidence of threatening communications","Assess the credibility and immediacy of the threat","Provide immediate protection to the threatened person","Trace the source of anonymous threats"],
    context_template: "Criminal intimidation — threatening injury to person, reputation, or property. BNS Section 351 (replacing IPC 503-506) provides imprisonment up to 2 years and/or fine."
  },
  {
    section_id: "BNS Sec 61",
    badge: "[BNS 61]",
    title: "Criminal Conspiracy",
    keywords: ["conspiracy","conspire","plan","plot","scheme","hatched","colluded","ring","syndicate","cartel","nexus"],
    checklist: ["Map the conspiracy network using communication analysis (CDR/IPDR)","Identify the ringleader and hierarchy","Document meetings, communications, and fund flows","Obtain confessional statements while adhering to Sec 22/23 BSA"],
    context_template: "Criminal conspiracy — agreement between two or more persons to commit an illegal act. BNS Section 61 (replacing IPC 120A-120B) is punishable with the same severity as the planned offence."
  },
  {
    section_id: "BNS Sec 111",
    badge: "[BNS 111]",
    title: "Organised Crime",
    keywords: ["organised crime","organized crime","syndicate","gang","criminal network","mafia","cartel","racket"],
    checklist: ["Establish the continuing unlawful activity of the criminal group","Map the organizational structure and hierarchy","Trace financial flows and money laundering channels","Coordinate with MCOCA/state organised crime units"],
    context_template: "Organised crime involving continuing unlawful activities by syndicates. BNS Section 111 provides enhanced punishment up to life imprisonment and fine up to Rs. 10 lakh."
  },
  {
    section_id: "BNS Sec 335",
    badge: "[BNS 335]",
    title: "Criminal Trespass and House Trespass",
    keywords: ["trespass","break in","breaking","entry","unauthorized entry","intrusion","burglary","house breaking"],
    checklist: ["Document the point of entry and method of trespass","Collect fingerprints, footprints, and tool marks from the scene","Check CCTV and motion sensor alerts","Interview neighbors and security guards"],
    context_template: "Criminal trespass — entering property in possession of another with intent to commit offence. BNS Section 335 (replacing IPC 441-462)."
  },
  {
    section_id: "BNS Sec 332",
    badge: "[BNS 332]",
    title: "Mischief by Fire or Explosive",
    keywords: ["arson","fire","explosion","explosive","bomb","blast","burning","set fire","incendiary"],
    checklist: ["Secure the blast/fire scene and request FSL team","Collect residue samples for explosive/accelerant analysis","Identify the source and type of explosive/incendiary device","Check CCTV footage for suspect planting the device"],
    context_template: "Mischief by fire or explosive substance. BNS Section 332 provides enhanced punishment with imprisonment up to 7 years and fine."
  },
  {
    section_id: "BNSS Sec 91",
    badge: "[BNSS 91]",
    title: "Summons to Produce Document or Other Thing",
    keywords: ["summons","produce","document","records","evidence production","notice","data request"],
    checklist: ["Draft the Sec 91 BNSS notice specifying exact documents/data required","Serve notice on the custodian (ISP, bank, platform)","Set a reasonable compliance deadline (typically 72 hours for digital records)","Maintain record of service and acknowledgment"],
    context_template: "A Sec 91 BNSS notice (replacing CrPC 91) must be issued to compel production of documents, electronic records, or other evidence material to the investigation."
  },
  {
    section_id: "BNSS Sec 105",
    badge: "[BNSS 105]",
    title: "Seizure of Property — Digital Evidence Seizure Procedure",
    keywords: ["seize","seizure","evidence","digital evidence","electronic evidence","confiscate"],
    checklist: ["Prepare seizure memo/panchnama with two independent witnesses","Calculate SHA-256 hash of all digital storage media at the scene","Photograph each item before and after seizure","Maintain strict chain of custody documentation","Store digital evidence in anti-static, tamper-evident bags"],
    context_template: "Evidence must be seized following strict digital forensic protocols under Sec 105 BNSS (replacing CrPC 102). All digital evidence must be hashed, documented, and stored in tamper-evident packaging."
  },
  {
    section_id: "BNSS Sec 106",
    badge: "[BNSS 106]",
    title: "Power to Freeze Bank Accounts and Property",
    keywords: ["freeze","bank freeze","account freeze","property freeze","attachment","hold funds","block account"],
    checklist: ["Issue urgent freeze order to the nodal bank officer within the golden hour","Specify exact account numbers, UPI IDs, and wallet addresses","Coordinate with I4C financial fraud helpline (1930)","Follow up with a formal written order within 24 hours"],
    context_template: "Fraudulent accounts must be frozen under Sec 106 BNSS to prevent dissipation of stolen funds. This power enables immediate freezing of bank accounts, digital wallets, and property."
  },
  {
    section_id: "BNSS Sec 173",
    badge: "[BNSS 173]",
    title: "FIR Registration — Information in Cognizable Cases",
    keywords: ["fir","first information report","complaint","report","cognizable","lodge fir","register case"],
    checklist: ["Register the FIR immediately upon receipt — zero delay","Read over the FIR to the informant and obtain their signature","Provide a free copy of the FIR to the informant","Enter the FIR in the General Diary / Station Diary"],
    context_template: "An FIR must be registered under Sec 173 BNSS (replacing CrPC 154) for this cognizable offence. Police are mandated to register without delay."
  },
  {
    section_id: "BSA Sec 63",
    badge: "[BSA 63]",
    title: "Admissibility of Electronic Records — Certificate Requirement",
    keywords: ["certificate","electronic evidence","authentication","sec 65b","forensic certificate","hash certificate"],
    checklist: ["Prepare Section 63 BSA certificate (replacing Sec 65B Indian Evidence Act)","Include SHA-256 hash values in the certificate","Certificate must be signed by the person responsible for the computer","Attach the certificate to all electronic evidence submitted to court"],
    context_template: "A certificate under Sec 63 BSA is mandatory for admissibility of electronic records as evidence. The certificate must identify the electronic record, its source device, and authentication details."
  },
  {
    section_id: "PMLA Sec 3",
    badge: "[PMLA 3]",
    title: "Offence of Money Laundering",
    keywords: ["money laundering","launder","proceeds of crime","hawala","shell company","benami","layering"],
    checklist: ["Report to Enforcement Directorate (ED) for PMLA investigation","Trace the proceeds of crime through multiple transactions","Identify layering techniques (multiple transfers, shell companies)","Coordinate with FIU-IND for Suspicious Transaction Reports (STRs)"],
    context_template: "Financial trail indicates money laundering activity. PMLA Section 3 defines money laundering as involvement with proceeds of crime, punishable with rigorous imprisonment of 3-7 years."
  },
  {
    section_id: "Aircraft Act r/w IT Act Sec 43",
    badge: "[AIRCRAFT + IT 43]",
    title: "Unauthorized Drone Surveillance / Illegal Drone Operation",
    keywords: ["drone","uav","quadcopter","aerial surveillance","dji","mavic","matrice","unmanned aerial","flying"],
    checklist: ["Seize the drone and all associated equipment (controller, SD cards, batteries)","Extract flight logs from the drone's onboard storage","Identify the operator through DAN (Drone Acknowledgement Number)","Check DGCA Digital Sky registration status","Analyze intercepted Wi-Fi/network data","Geo-fence data analysis to determine exact flight path"],
    context_template: "Unauthorized drone operation and/or aerial surveillance. The Aircraft Act read with IT Act Section 43 applies to unauthorized flights near restricted zones and digital surveillance via drone-mounted equipment."
  },
  {
    section_id: "IT Act Sec 66 r/w BNS 318",
    badge: "[IT 66 + BNS 318]",
    title: "Online Financial Fraud (Composite Charge)",
    keywords: ["online fraud","upi fraud","net banking fraud","e-commerce fraud","payment gateway","debit card","credit card","card fraud"],
    checklist: ["File complaint on cybercrime.gov.in and call 1930 helpline immediately","Issue Sec 106 BNSS freeze order on suspect bank accounts within golden hour","Obtain UPI/NEFT/RTGS transaction trail from the victim's bank","Request beneficiary KYC from the receiving bank","Coordinate with I4C"],
    context_template: "Online financial fraud combining computer offences (IT Act 66) with cheating (BNS 318). Covers fraud through UPI, net banking, or card transactions."
  },
  {
    section_id: "IT Act Sec 66C r/w PMLA 3",
    badge: "[IT 66C + PMLA 3]",
    title: "SIM Swap Fraud — Financial Crime",
    keywords: ["sim swap","sim clone","sim fraud","mobile number takeover","otp intercept","sim replacement"],
    checklist: ["Contact the telecom operator immediately to block the swapped SIM","Obtain SIM swap request records from the telecom company","Verify identity documents used for the fraudulent SIM swap","Trace all financial transactions after the SIM swap","Freeze compromised bank accounts and wallets"],
    context_template: "SIM swap fraud combining identity theft (IT Act 66C) with money laundering (PMLA 3) — fraudulent SIM replacement enables OTP interception for financial fraud."
  },
  {
    section_id: "BNS Sec 316 r/w IT Act 43",
    badge: "[BNS 316 + IT 43]",
    title: "Insider Data Theft — Corporate Espionage",
    keywords: ["insider threat","data theft","corporate espionage","trade secret","proprietary data","employee theft data","competitor"],
    checklist: ["Audit access logs to determine exactly what data was accessed/copied","Image the insider's workstation and mobile devices","Review email logs and cloud storage access patterns","Examine USB/external device connection history","Verify if data was shared with competitors"],
    context_template: "Insider data theft constituting criminal breach of trust (BNS 316) and unauthorized data extraction (IT Act 43). Common in corporate espionage scenarios."
  },
  {
    section_id: "IT Act Sec 43 r/w BNS 329",
    badge: "[IT 43 + BNS 329]",
    title: "Website Defacement / Digital Vandalism",
    keywords: ["defacement","website hack","deface","vandalize website","hacked page"],
    checklist: ["Capture and preserve the defaced website (screenshots, WARC archive)","Analyze web server logs for the attack vector","Check for SQL injection, XSS, or file upload vulnerabilities","Identify the attacker through IP and session logs"],
    context_template: "Website defacement constituting damage to computer systems (IT Act 43) and criminal mischief (BNS 329)."
  },
  {
    section_id: "IT Act Sec 66 r/w BNS 308",
    badge: "[IT 66 + BNS 308]",
    title: "Ransomware Attack / Cyber Extortion",
    keywords: ["ransomware","encrypt","locked files","decrypt demand","bitcoin ransom","crypto ransom","wannacry","lockbit"],
    checklist: ["Isolate affected systems immediately — disconnect from network","Do NOT pay the ransom — it does not guarantee data recovery","Identify the ransomware variant using tools like ID Ransomware","Check for available decryptors from NoMoreRansom project","Report to CERT-In with IOCs (Indicators of Compromise)"],
    context_template: "Ransomware attack constituting computer-related offence (IT Act 66) and cyber extortion (BNS 308). Encrypted data held hostage with cryptocurrency ransom demand."
  },
  {
    section_id: "BNS Sec 335 r/w Aircraft Act",
    badge: "[BNS 335 + AIRCRAFT]",
    title: "Drone Trespassing Over Restricted Area",
    keywords: ["airspace","restricted area","no fly zone","military area","airport","drone trespass"],
    checklist: ["Document the drone's flight path and restricted zone violated","Report to DGCA and the relevant security authority","Seize the drone and operator's equipment","Check if the drone was transmitting data to a remote server"],
    context_template: "Drone trespassing over restricted areas combines criminal trespass (BNS 335) with aircraft regulation violations. Flying drones in no-fly zones is a serious offence."
  },
  {
    section_id: "IT Act Sec 43 r/w Aircraft Act",
    badge: "[IT 43 + AIRCRAFT-WIFI]",
    title: "Drone-Based Wi-Fi/Network Interception",
    keywords: ["wifi intercept","packet sniff","network intercept","man in the middle","wifi hacking","wardriving","pineapple","wi-fi"],
    checklist: ["Analyze the drone's payload for Wi-Fi interception equipment","Check for packet capture files on seized storage media","Identify the target networks that were intercepted","Assess the sensitivity of any data captured"],
    context_template: "Drone equipped with Wi-Fi/network interception capabilities. Unauthorized interception via drone-mounted equipment constitutes damage to computer systems (IT Act 43) and aircraft violations."
  },
  {
    section_id: "POCSO Sec 3",
    badge: "[POCSO 3]",
    title: "Penetrative Sexual Assault on Child",
    keywords: ["child sexual assault","minor","pocso","child abuse","pedophile","child rape"],
    checklist: ["Register FIR immediately under POCSO and BNS","Medical examination within 24 hours by female doctor","Record statement under Sec 183 BNSS before a Judicial Magistrate","Ensure victim's identity is protected at all stages"],
    context_template: "Penetrative sexual assault on a child under POCSO Section 3, punishable with rigorous imprisonment of not less than 10 years extending to life imprisonment."
  },
  {
    section_id: "IT Act Sec 66D r/w BNS 318",
    badge: "[IT 66D + BNS 318]",
    title: "Vishing (Voice Phishing) Fraud",
    keywords: ["vishing","phone scam","fake call","rbi call","bank call fraud","customer care fraud","kyc update call"],
    checklist: ["Preserve call recordings and CDR of the fraud calls","Trace the caller's phone number through CDR/IPDR","Check if VoIP was used and identify the VoIP provider","Freeze the beneficiary accounts"],
    context_template: "Vishing (voice phishing) where fraudsters impersonate bank officials or government agencies over phone calls to extract money."
  },
  {
    section_id: "IT Act Sec 66C r/w BNS 318",
    badge: "[IT 66C + BNS 318-ATM]",
    title: "ATM Skimming / Card Cloning Fraud",
    keywords: ["skimming","card cloning","atm fraud","card reader","shimming","magnetic stripe"],
    checklist: ["Seize the skimming device from the ATM","Obtain ATM CCTV footage showing device installation","Identify all compromised cards from transaction logs","Alert banks to block compromised cards"],
    context_template: "ATM skimming/card cloning fraud combining identity theft (IT Act 66C) with cheating (BNS 318)."
  },
  {
    section_id: "IT Act Sec 66 r/w BNS 318",
    badge: "[IT 66 + BNS 318-CRYPTO]",
    title: "Cryptocurrency Fraud / Crypto Scam",
    keywords: ["crypto fraud","bitcoin scam","cryptocurrency theft","wallet hack","blockchain fraud","defi scam","rug pull","crypto ponzi"],
    checklist: ["Identify and record all cryptocurrency wallet addresses involved","Use blockchain analytics tools to trace transaction flows","Coordinate with cryptocurrency exchanges for KYC data","Apply for freezing of exchange accounts under Sec 106 BNSS"],
    context_template: "Cryptocurrency fraud combining computer hacking (IT Act 66) with cheating (BNS 318). Covers exchange hacks, wallet thefts, rug pulls, and crypto Ponzi schemes."
  },
  {
    section_id: "BNS Sec 100",
    badge: "[BNS 100]",
    title: "Murder",
    keywords: ["murder","killed","homicide","death","dead body","stabbed to death","shot dead","fatal"],
    checklist: ["Secure the crime scene and call forensic team immediately","Conduct post-mortem examination within 24 hours","Collect DNA samples, fingerprints, and ballistic evidence","Record dying declaration if victim is still alive"],
    context_template: "Culpable homicide amounting to murder. BNS Section 100 (replacing IPC 302) provides for punishment of death or life imprisonment along with fine."
  },
  {
    section_id: "BNS Sec 137",
    badge: "[BNS 137]",
    title: "Kidnapping, Abduction, and Related Offences",
    keywords: ["kidnap","abduct","abduction","missing person","taken away","minor missing","child kidnap"],
    checklist: ["Issue immediate lookout notice and alert nearby police stations","Activate 'Operation Smile' or 'Track Child' protocols for missing minors","Analyze CDR/IPDR of victim's and suspect's mobile phones","Check CCTV footage along possible routes"],
    context_template: "Kidnapping or abduction. BNS Section 137 (replacing IPC 359-369) addresses kidnapping from lawful guardianship or from India, and abduction by force."
  },
  {
    section_id: "BNS Sec 263",
    badge: "[BNS 263]",
    title: "Assault or Criminal Force to Woman with Intent to Outrage Modesty",
    keywords: ["sexual harassment","molestation","outrage modesty","groping","eve teasing","inappropriately touched"],
    checklist: ["Record the victim's statement with a female officer present","Obtain medical examination if applicable","Secure CCTV footage from the incident location","Ensure victim protection under Sec 173 BNSS"],
    context_template: "Assault or criminal force against a woman with intent to outrage modesty. BNS Section 263 (replacing IPC 354) provides imprisonment of 1-5 years and fine."
  },
  {
    section_id: "BNS Sec 78",
    badge: "[BNS 78]",
    title: "Stalking",
    keywords: ["stalking","follow","following","harass","persistent","watching","contact repeatedly","cyberstalking"],
    checklist: ["Document all instances of stalking with dates, times, and locations","Preserve digital evidence (messages, calls, social media contacts)","Issue restraining/protection order under BNSS","Trace the stalker's movements through CDR/IPDR/GPS data"],
    context_template: "Stalking — repeatedly following, contacting, or monitoring a person. BNS Section 78 (replacing IPC 354D) provides imprisonment up to 3 years and fine."
  },
  {
    section_id: "BNS Sec 329",
    badge: "[BNS 329]",
    title: "Mischief Causing Damage",
    keywords: ["mischief","vandalism","damage","destroy","break","smash","arson","fire","burn"],
    checklist: ["Document and photograph the damage caused","Estimate the monetary value of the damage","Identify the accused through witnesses or CCTV","Preserve any tools or materials used"],
    context_template: "Mischief by intentionally causing damage or destruction to property. BNS Section 329 (replacing IPC 425-440)."
  },
  {
    section_id: "NDPS Act Sec 8",
    badge: "[NDPS 8]",
    title: "Prohibition of Operations — Narcotic Drugs",
    keywords: ["drugs","narcotics","ganja","cocaine","heroin","cannabis","meth","amphetamine","opium","contraband"],
    checklist: ["Seize the narcotic substance and weigh under panchnama","Send samples to FSL for chemical analysis","Draw up spot panchnama with two independent witnesses","Inform NCB and state anti-narcotics cell"],
    context_template: "Narcotic drugs or psychotropic substances case. NDPS Act Section 8 prohibits cultivation, production, sale, purchase, transport, or use of narcotic drugs except for medical/scientific purposes."
  },
  {
    section_id: "Arms Act Sec 25",
    badge: "[ARMS 25]",
    title: "Punishment for Illegal Possession of Arms",
    keywords: ["illegal arms","unlicensed weapon","gun","pistol","revolver","firearm","ammunition"],
    checklist: ["Seize the weapon and ammunition with proper panchnama","Send weapon for ballistic forensic examination","Verify arms license status with licensing authority","Check the weapon against crime records"],
    context_template: "Illegal possession of arms under Arms Act Section 25 with imprisonment of 1-3 years for non-prohibited arms, and 5-10 years for prohibited arms."
  },
  {
    section_id: "Prevention of Corruption Act Sec 7",
    badge: "[PCA 7]",
    title: "Bribery of Public Servant",
    keywords: ["bribe","corruption","kickback","gratification","public servant","government officer"],
    checklist: ["Conduct trap operation with pre-marked currency","Video-record the entire trap operation","Apply phenolphthalein test on hands of accused","Seize the bribe amount with panchnama"],
    context_template: "Bribery of a public servant under Prevention of Corruption Act Section 7, punishable with imprisonment of 3-7 years and fine."
  },
  {
    section_id: "BNS Sec 195",
    badge: "[BNS 195]",
    title: "Act of Terrorism",
    keywords: ["terrorist act","terror attack","mass casualty","UAPA"],
    checklist: ["Immediately alert NIA, IB, and state ATS","Secure and evacuate the blast zone/attack site","Activate mass casualty incident response protocols","Preserve all CCTV footage in a 5km radius"],
    context_template: "Act of terrorism. BNS Section 195 defines terrorism with severe punishment including death or life imprisonment. Must be investigated by NIA."
  },
];

// ── Entity Extraction (mirrors Python backend) ──
function extractEntities(narrative: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const lower = narrative.toLowerCase();

  // IP Addresses
  const ips = narrative.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
  ips.forEach(ip => entities.push({ type: "ARTIFACT", label: `IP Address: ${ip}`, sublabel: "Network Indicator" }));

  // Email Addresses
  const emails = narrative.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
  emails.forEach(em => entities.push({ type: "ARTIFACT", label: `Email: ${em}`, sublabel: "Communication Identifier" }));

  // Phone Numbers
  const phones = narrative.match(/\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g) || [];
  phones.forEach(ph => entities.push({ type: "ARTIFACT", label: `Phone: ${ph}`, sublabel: "Telecom Identifier" }));

  // UIDs / Credentials
  const uids = narrative.match(/UID[:\s]+([A-Za-z0-9_-]+)/gi) || [];
  uids.forEach(uid => entities.push({ type: "SUSPECT", label: `Credential: ${uid}`, sublabel: "Compromised Identity" }));

  // Monetary Values
  const money = narrative.match(/(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?/gi) || [];
  money.slice(0, 3).forEach(val => entities.push({ type: "ARTIFACT", label: val.trim(), sublabel: "Financial Amount" }));

  // MAC Addresses
  const macs = narrative.match(/\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g) || [];
  macs.forEach(mac => entities.push({ type: "ARTIFACT", label: `MAC: ${mac}`, sublabel: "Hardware Identifier" }));

  // Dates
  const dates = narrative.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/gi) || [];
  dates.slice(0, 3).forEach(d => entities.push({ type: "ARTIFACT", label: `Date: ${d}`, sublabel: "Temporal Indicator" }));

  // Keyword-based entities
  const victimMap: Record<string, [string, string]> = {
    "alphatech": ["AlphaTech R&D Complex", "Corporate Facility"],
    "hospital": ["Hospital / Medical Facility", "Healthcare"],
    "server farm": ["Data Center / Server Farm", "IT Infrastructure"],
    "bank": ["Banking Institution", "Financial Sector"],
    "government": ["Government Office", "Government"],
    "airport": ["Airport / Aviation Facility", "Critical Infrastructure"],
    "school": ["Educational Institution", "Education Sector"],
    "university": ["University / Academic Institute", "Education Sector"],
    "power plant": ["Power Generation Facility", "Energy Sector"],
    "military": ["Military Installation", "Defense"],
  };
  for (const [kw, [label, sublabel]] of Object.entries(victimMap)) {
    if (lower.includes(kw) && !entities.some(e => e.label === label)) {
      entities.push({ type: "VICTIM", label, sublabel });
    }
  }

  const suspectMap: Record<string, [string, string]> = {
    "drone": ["Unauthorized Drone / UAV", "Aerial Platform"],
    "dji": ["Modified DJI Drone Platform", "Aerial Platform"],
    "matrice": ["Modified DJI Matrice 300 RTK", "Surveillance Drone"],
    "vpn": ["VPN Service / Anonymizer", "Anonymization Tool"],
    "dark web": ["Dark Web Marketplace", "Criminal Platform"],
    "tor": ["TOR Network / Anonymization", "Anonymization Tool"],
    "sim": ["SIM Card / Telecom Identity", "Telecom Asset"],
    "laptop": ["Suspect Laptop Device", "Computing Device"],
  };
  for (const [kw, [label, sublabel]] of Object.entries(suspectMap)) {
    if (lower.includes(kw) && !entities.some(e => e.label === label)) {
      entities.push({ type: "SUSPECT", label, sublabel });
    }
  }

  return entities;
}

// ── Statute Scoring Engine ──
function scoreStatutes(narrative: string): (StatuteEntry & { score: number; matched_keywords: string[] })[] {
  const lower = narrative.toLowerCase();
  const scored: (StatuteEntry & { score: number; matched_keywords: string[] })[] = [];

  for (const statute of STATUTES_DB) {
    let score = 0;
    const matchedKws: string[] = [];
    for (const keyword of statute.keywords) {
      const kwLower = keyword.toLowerCase();
      const regex = new RegExp(kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = narrative.match(regex);
      if (matches && matches.length > 0) {
        const weight = kwLower.split(/\s+/).length * 2 + 1;
        score += matches.length * weight;
        matchedKws.push(keyword);
      }
    }
    if (score > 0) {
      scored.push({ ...statute, score, matched_keywords: matchedKws });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ── Classification ──
function determineClassification(matched: { title: string }[]): string {
  if (!matched.length) return "Insufficient Data for Classification";
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const s of matched.slice(0, 5)) {
    const short = s.title.split(" — ")[0].split(" (")[0].trim();
    if (!seen.has(short)) { titles.push(short); seen.add(short); }
  }
  return titles.slice(0, 4).join(", ");
}

// ── Severity ──
function determineSeverity(narrative: string, matched: { context_template: string }[]): string {
  const lower = narrative.toLowerCase();
  const criticalKws = ["murder","death","killed","terrorism","bomb","explosive","critical infrastructure","national security","child","gang rape","kidnap","ransom","crore","nuclear","defense","military"];
  const highKws = ["fraud","hack","breach","unauthorized","stolen","malware","ransomware","extortion","identity theft","phishing","lakhs","drone","surveillance","espionage"];
  const crit = criticalKws.filter(k => lower.includes(k)).length;
  const high = highKws.filter(k => lower.includes(k)).length;
  const severe = matched.slice(0, 3).some(s => /life imprisonment|death/i.test(s.context_template));
  if (crit >= 2 || severe) return "CRITICAL";
  if (crit >= 1 || high >= 2) return "HIGH";
  if (high >= 1) return "ELEVATED";
  return "MODERATE";
}

// ── Executive Summary ──
function generateSummary(classification: string, severity: string, entities: ExtractedEntity[], matched: MappedSection[]): string {
  const victims = entities.filter(e => e.type === "VICTIM");
  const victimStr = victims.slice(0, 2).map(e => e.label).join(", ") || "an unidentified target";
  const topSections = matched.slice(0, 3).map(s => s.badge).join(", ") || "pending legal mapping";
  return `EXECUTIVE SUMMARY: This incident has been classified as ${classification} with a severity level of ${severity}. The narrative describes actions targeting ${victimStr}. Preliminary analysis has identified ${entities.length} forensic entities. The top applicable legal provisions are ${topSections}. Immediate investigative action is recommended under the mapped legal framework.`;
}

// ── Immediate Actions ──
function generateActions(severity: string, entities: ExtractedEntity[], matched: MappedSection[]): string[] {
  const actions = ["Register FIR immediately under applicable sections of BNS 2023 and IT Act 2000."];
  actions.push("Preserve all digital evidence with SHA-256 hash verification and maintain strict chain of custody.");
  if (entities.some(e => e.sublabel.includes("Financial"))) actions.push("Issue Sec 106 BNSS freeze orders on all identified bank accounts and UPI wallets within the golden hour.");
  if (entities.some(e => e.label.includes("IP") || e.sublabel === "Network Indicator")) actions.push("Issue Sec 91 BNSS notices to ISPs and VPN providers for subscriber logs and session data.");
  if (entities.some(e => e.sublabel === "Telecom Identifier")) actions.push("Request CDR/IPDR from telecom operators for all identified phone numbers.");
  if (severity === "CRITICAL") { actions.push("ESCALATE: Notify CERT-In, NIA, and state cyber cell for coordinated response."); actions.push("Activate crisis management protocols and brief senior officers."); }
  if (entities.some(e => e.label.includes("Drone") || e.label.includes("UAV"))) actions.push("Seize drone equipment, extract flight logs, and verify DGCA Digital Sky registration.");
  if (matched.some(s => s.section_id.includes("IT"))) actions.push("Report the cyber incident to CERT-In within 6 hours as mandated by Cyber Security Directions 2022.");
  return actions;
}

// ── Main Analysis Function ──
function analyzeNarrative(narrative: string): AnalysisResult {
  const entities = extractEntities(narrative);
  const allScored = scoreStatutes(narrative);
  const topStatutes = allScored.slice(0, 8);
  const classification = determineClassification(topStatutes);
  const severity = determineSeverity(narrative, topStatutes);
  const mappedSections: MappedSection[] = topStatutes.map(s => ({
    section_id: s.section_id, badge: s.badge, title: s.title,
    context: s.context_template, checklist: s.checklist,
    score: s.score, matched_keywords: s.matched_keywords
  }));
  const executive_summary = generateSummary(classification, severity, entities, mappedSections);
  const immediate_actions = generateActions(severity, entities, mappedSections);
  return { classification, severity, executive_summary, immediate_actions, mapped_sections: mappedSections, entities, total_statutes_scanned: STATUTES_DB.length };
}

// ══════════════════════════════════════════════════════════════════
//  REACT COMPONENT
// ══════════════════════════════════════════════════════════════════

export function AIInvestigation() {
  const [narrative, setNarrative] = useState(() => sessionStorage.getItem('ai_narrative') || "");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(() => {
    const saved = sessionStorage.getItem('ai_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [analysisComplete, setAnalysisComplete] = useState(() => !!sessionStorage.getItem('ai_result'));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = sessionStorage.getItem('ai_checked');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => { sessionStorage.setItem('ai_narrative', narrative); }, [narrative]);
  useEffect(() => {
    if (analysisResult) sessionStorage.setItem('ai_result', JSON.stringify(analysisResult));
    else sessionStorage.removeItem('ai_result');
  }, [analysisResult]);
  useEffect(() => { sessionStorage.setItem('ai_checked', JSON.stringify(checkedItems)); }, [checkedItems]);

  const handleClear = () => {
    setNarrative(""); setAnalysisResult(null); setAnalysisComplete(false); setCheckedItems({});
    sessionStorage.removeItem('ai_narrative'); sessionStorage.removeItem('ai_result'); sessionStorage.removeItem('ai_checked');
  };

  const handleAnalyze = () => {
    if (!narrative.trim()) return;
    setIsAnalyzing(true); setAnalysisComplete(false);
    setTimeout(() => {
      const result = analyzeNarrative(narrative);
      setAnalysisResult(result);
      setIsAnalyzing(false); setAnalysisComplete(true);
    }, 1200);
  };

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const entityIcon = (type: string) => {
    if (type === 'VICTIM') return <Shield size={14} />;
    if (type === 'SUSPECT') return <AlertTriangle size={14} />;
    return <Globe size={14} />;
  };
  const entityColor = (type: string) => {
    if (type === 'VICTIM') return { border: 'border-emerald-800/40', bg: 'bg-emerald-500', text: 'text-emerald-400', indicator: 'bg-emerald-500' };
    if (type === 'SUSPECT') return { border: 'border-red-800/40', bg: 'bg-red-500', text: 'text-red-400', indicator: 'bg-red-500' };
    return { border: 'border-blue-800/40', bg: 'bg-blue-500', text: 'text-blue-400', indicator: 'bg-blue-500' };
  };

  const handleExportPDF = () => {
    if (!analysisResult) {
      alert("Please run an analysis before exporting a report.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header & Agency Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ACCB CYBER COMMAND", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Official AI Forensic Investigation Report", 14, 28);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
    doc.line(14, 38, pageWidth - 14, 38);

    // 2. Incident Overview (Classification & Severity)
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. Incident Overview", 14, 48);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Classification: ${analysisResult.classification || "N/A"}`, 14, 56);
    doc.text(`Severity Level: ${analysisResult.severity || "HIGH"}`, 14, 62);

    // 3. Executive Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("2. Executive Summary", 14, 74);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryText = doc.splitTextToSize(analysisResult.executive_summary || "No executive summary generated.", pageWidth - 28);
    doc.text(summaryText, 14, 82);

    let currentY = 82 + (summaryText.length * 6) + 6;

    // 4. Extracted Entities Table
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. Extracted Forensic Entities", 14, currentY);

    const entityRows = (analysisResult.entities || []).map((ent: any) => [
      ent.type || "UNKNOWN",
      ent.label || "N/A",
      ent.sublabel || "Entity"
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Entity Type', 'Value / Identifier', 'Context / Category']],
      body: entityRows.length > 0 ? entityRows : [['None', 'No entities extracted', '-']],
      theme: 'grid',
      headStyles: { fillColor: [28, 37, 65] }, // Dark Navy theme matching UI
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // 5. Mapped Legal Provisions & Statutes Table
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. Mapped Legal Provisions (BNS / IT Act / IPC)", 14, currentY);

    const statuteRows = (analysisResult.mapped_sections || []).map((stat: any) => [
      typeof stat === 'string' ? stat : (stat.badge || "[SECTION]"),
      typeof stat === 'string' ? "-" : (stat.title || stat.section_id || "Legal Statute"),
      typeof stat === 'string' ? "-" : (stat.checklist ? stat.checklist.slice(0, 2).join("; ") : "Applicable provision")
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Statute / Section', 'Title / Provision', 'Recommended Action / Checklist']],
      body: statuteRows.length > 0 ? statuteRows : [['N/A', 'No legal provisions mapped', '-']],
      theme: 'grid',
      headStyles: { fillColor: [28, 37, 65] },
      styles: { fontSize: 9 },
      columnStyles: { 2: { cellWidth: 80 } }
    });

    // 6. Save the PDF
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`ACCB_Case_Report_${dateStr}.pdf`);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 pb-24 bg-transparent text-slate-200 font-['Outfit'] overflow-y-auto" style={{ scrollbarWidth: "none" }}>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" style={{ boxShadow: "0 0 10px rgba(59,130,246,0.8)" }} />
        <span className="text-xs font-mono tracking-wider font-semibold text-blue-400">AI-COPILOT-ACTIVE</span>
        <ChevronRight size={14} className="text-slate-500" />
        <span className="text-sm font-medium text-slate-100">Advanced Narrative Analysis</span>
        {analysisResult && (
          <>
            <ChevronRight size={14} className="text-slate-500" />
            <span className="text-xs font-mono text-amber-400">{analysisResult.total_statutes_scanned} STATUTES SCANNED</span>
          </>
        )}
      </div>

      {/* ── Main 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ════ LEFT COLUMN (2/3) ════ */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Card 1: Raw Complaint Narrative */}
          <div className="bg-[#1C2541] border border-slate-700/50 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between text-slate-100 mb-1">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                <h3 className="font-semibold tracking-wide">Raw Complaint Narrative</h3>
              </div>
              <button onClick={handleClear} title="Clear Case Data" className="text-slate-400 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
            </div>
            <textarea
              value={narrative}
              onChange={(e) => { setNarrative(e.target.value); setAnalysisComplete(false); }}
              className="w-full h-36 bg-[#151b2b] text-slate-300 border border-slate-700/50 rounded-lg p-4 resize-y focus:outline-none focus:border-blue-500/50 text-sm leading-relaxed font-['DM_Sans']"
              placeholder="Paste raw case narrative here (e.g., compromised credentials, IP addresses, FIR requests, drone intercepts, financial fraud descriptions)..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !narrative.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${isAnalyzing || !narrative.trim() ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'}`}
              >
                {isAnalyzing ? <><Loader2 size={16} className="animate-spin" />Processing {STATUTES_DB.length} Statutes...</> : analysisComplete ? <><Activity size={16} />Update Analysis</> : <><Activity size={16} />Analyze Narrative</>}
              </button>
            </div>
          </div>

          {/* ── Results (hidden until analysis complete) ── */}
          {analysisComplete && analysisResult && (
            <>
              {/* Row 2: Classification + Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1C2541] border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Predicted Classification</h4>
                  <div className="flex items-start gap-3 bg-[#151b2b] p-4 rounded-lg border border-slate-800">
                    <ShieldAlert className="text-blue-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">{analysisResult.classification}</p>
                  </div>
                </div>
                <div className="bg-[#1C2541] border border-slate-700/50 rounded-2xl p-6 shadow-lg flex flex-col justify-center items-center gap-3">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest w-full text-left">Incident Severity</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${analysisResult.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : analysisResult.severity === 'HIGH' ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]' : 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]'}`} />
                    <span className={`text-2xl font-bold tracking-widest ${analysisResult.severity === 'CRITICAL' ? 'text-red-500' : analysisResult.severity === 'HIGH' ? 'text-orange-500' : 'text-yellow-500'}`}>{analysisResult.severity}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Executive Summary */}
              <div className="bg-[#1C2541] border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Executive Summary</h4>
                  <button onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 cursor-pointer hover:bg-slate-700">
                    <Download size={12} />Export Official Case Report
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-['DM_Sans'] bg-[#151b2b] p-4 rounded-lg border border-slate-800">{analysisResult.executive_summary}</p>
              </div>

              {/* Card 4: Immediate Action Required */}
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-amber-400" />
                  <h4 className="text-sm font-bold text-amber-300 tracking-wide uppercase">Immediate Action Required</h4>
                </div>
                <ol className="space-y-2">
                  {analysisResult.immediate_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-amber-100/90 font-['DM_Sans']">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">{idx + 1}</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Section 5: Mapped Legal Provisions */}
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Scale size={18} className="text-purple-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Mapped Legal Provisions</h3>
                  <span className="text-xs text-slate-500 font-mono">({analysisResult.mapped_sections.length} matched)</span>
                </div>

                <div className="flex flex-col gap-5">
                  {analysisResult.mapped_sections.map((section, idx) => (
                    <div key={idx} className="bg-[#1C2541] border border-slate-700/50 rounded-2xl p-6 shadow-lg">
                      {/* Section Header */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/30">
                        <span className="text-xs font-bold text-amber-900 bg-amber-400 px-2.5 py-1 rounded-md tracking-wide">{section.badge}</span>
                        <h4 className="text-sm font-bold text-slate-100 flex-1">{section.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Score: {section.score}</span>
                      </div>

                      {/* Two Interior Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Contextual Application */}
                        <div>
                          <h5 className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">Contextual Application</h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-['DM_Sans']">{section.context}</p>
                          {section.matched_keywords.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {section.matched_keywords.map((kw, ki) => (
                                <span key={ki} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{kw}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Investigation Checklist */}
                        <div>
                          <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-2">Investigation Checklist</h5>
                          <ul className="space-y-2">
                            {section.checklist.map((item, ci) => {
                              const checkKey = `${section.section_id}-${ci}`;
                              const isChecked = checkedItems[checkKey] || false;
                              return (
                                <li key={ci} className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleCheck(checkKey)}>
                                  {isChecked
                                    ? <CheckSquare size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                    : <Square size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
                                  }
                                  <span className={`text-xs font-['DM_Sans'] leading-relaxed ${isChecked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{item}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ════ RIGHT COLUMN: EXTRACTED ENTITIES (1/3) ════ */}
        <div className="lg:col-span-1">
          <div className="bg-[#1C2541]/80 border border-slate-700/50 rounded-2xl p-6 shadow-lg sticky top-6">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <Cpu size={14} /> Extracted Entities
            </h3>

            {!analysisComplete || !analysisResult ? (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-3 min-h-[200px]">
                <Target size={32} className="opacity-20" />
                <p className="text-xs text-center font-['DM_Sans']">Run the analysis to extract entities from the narrative.</p>
              </div>
            ) : analysisResult.entities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-3 min-h-[200px]">
                <Target size={32} className="opacity-20" />
                <p className="text-xs text-center font-['DM_Sans']">No entities detected. Try adding specific identifiers (IPs, names, devices).</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {analysisResult.entities.map((entity, idx) => {
                  const colors = entityColor(entity.type);
                  return (
                    <div key={idx} className={`bg-[#151b2b] border ${colors.border} rounded-xl p-3.5 flex flex-col gap-1 relative overflow-hidden`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.indicator}`} />
                      <span className={`text-[10px] font-bold ${colors.text} tracking-wider flex items-center gap-1.5 ml-2`}>
                        {entityIcon(entity.type)} {entity.type}
                      </span>
                      <p className="text-xs font-semibold text-slate-100 ml-2">{entity.label}</p>
                      <p className="text-[10px] text-slate-500 ml-2 font-['DM_Sans']">{entity.sublabel}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
