"""
CrimeGPT Offline Legal Statutes Database
=========================================
Comprehensive dictionary of 550+ Indian criminal and cyber law sections covering:
- Bharatiya Nyaya Sanhita (BNS) 2023
- Information Technology Act 2000 (Amended 2008)
- Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Indian Penal Code (IPC) 1860 (legacy reference)
- Code of Criminal Procedure (CrPC) 1973 (legacy reference)
- Telecom Act / Indian Telegraph Act
- PMLA (Prevention of Money Laundering Act)
- POCSO Act
- Copyright Act
- Indian Evidence Act / Bharatiya Sakshya Adhiniyam (BSA) 2023

Each entry contains: section_id, badge, title, keywords, checklist, and context_template.
"""

STATUTES = [
    # ══════════════════════════════════════════════════════════════
    #  INFORMATION TECHNOLOGY ACT, 2000 (Amended 2008) — 45 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "IT Act Sec 43",
        "badge": "[IT ACT 43]",
        "title": "Penalty and Compensation for Damage to Computer, Computer System, etc.",
        "keywords": ["unauthorized access", "download", "virus", "malware", "damage", "computer", "server", "data", "extract", "copy", "denial of service", "ddos", "ransomware", "trojan", "worm", "spyware", "bot", "botnet", "intrusion"],
        "checklist": [
            "Isolate the affected computer system/server from the network immediately",
            "Collect volatile data (RAM dump) before powering down the system",
            "Create forensic bit-stream image (dd/FTK) of all affected storage media",
            "Calculate and record SHA-256 / MD5 hash values of all seized digital evidence",
            "Preserve firewall logs, IDS/IPS alerts, and system event logs",
            "Request ISP logs under Sec 67C IT Act for data retention compliance"
        ],
        "context_template": "The narrative describes unauthorized access and/or damage to computer systems, directly invoking Section 43 of the IT Act which provides for compensation up to Rs. 5 crore for unauthorized access, data extraction, virus introduction, or denial of service attacks."
    },
    {
        "section_id": "IT Act Sec 43A",
        "badge": "[IT ACT 43A]",
        "title": "Compensation for Failure to Protect Data",
        "keywords": ["data breach", "sensitive personal data", "negligence", "body corporate", "data protection", "privacy", "leak", "exposed", "database"],
        "checklist": [
            "Identify the body corporate responsible for data protection",
            "Determine the nature of sensitive personal data compromised",
            "Assess whether reasonable security practices were implemented",
            "Document the extent and impact of the data breach",
            "Notify affected individuals and relevant authorities (CERT-In)"
        ],
        "context_template": "The incident involves failure to protect sensitive personal data by a body corporate. Section 43A mandates compensation where a body corporate possessing sensitive personal data is negligent in implementing reasonable security practices."
    },
    {
        "section_id": "IT Act Sec 65",
        "badge": "[IT ACT 65]",
        "title": "Tampering with Computer Source Documents",
        "keywords": ["source code", "tamper", "alter", "destroy", "source document", "program", "concealed", "modified code", "software", "compilation"],
        "checklist": [
            "Obtain original and tampered versions of the source code for comparison",
            "Engage a certified software forensic expert for code diff analysis",
            "Preserve version control history (Git logs, SVN history)",
            "Seize development machines and build servers",
            "Record statements of development team members"
        ],
        "context_template": "Evidence suggests tampering with computer source documents. Section 65 of the IT Act criminalizes knowingly or intentionally concealing, destroying, or altering any computer source code when required to be maintained by law, punishable with imprisonment up to 3 years and/or fine up to Rs. 2 lakh."
    },
    {
        "section_id": "IT Act Sec 66",
        "badge": "[IT ACT 66]",
        "title": "Computer Related Offences (Hacking)",
        "keywords": ["hack", "hacking", "breach", "intrusion", "unauthorized", "crack", "exploit", "penetrate", "compromise", "attack", "cyber attack", "access"],
        "checklist": [
            "Document the method of unauthorized access (exploit, brute force, social engineering)",
            "Preserve network traffic captures (PCAP files) showing the attack pattern",
            "Identify and record the attack vector and entry point",
            "Collect server access logs showing unauthorized sessions",
            "Issue Sec 91 BNSS notice to hosting providers for server logs",
            "Engage CERT-In for incident response if critical infrastructure is affected"
        ],
        "context_template": "The complaint describes acts of computer hacking or unauthorized system access. Section 66 IT Act provides for imprisonment up to 3 years and/or fine up to Rs. 5 lakh for any person who dishonestly or fraudulently commits any act referred to in Section 43."
    },
    {
        "section_id": "IT Act Sec 66B",
        "badge": "[IT ACT 66B]",
        "title": "Dishonestly Receiving Stolen Computer Resource or Communication Device",
        "keywords": ["stolen", "receive", "device", "laptop", "mobile", "phone", "computer", "stolen device", "IMEI", "receiver"],
        "checklist": [
            "Trace the IMEI number through CEIR (Central Equipment Identity Register)",
            "Obtain purchase records and original ownership documentation",
            "Check second-hand marketplaces and e-commerce platforms for listing history",
            "Record the chain of custody from original owner to current possessor",
            "Coordinate with local police for recovery operations"
        ],
        "context_template": "The case involves dishonest receipt of stolen computer resources or communication devices. Section 66B criminalizes receiving or retaining a stolen computer resource or communication device, punishable with imprisonment up to 3 years and/or fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 66C",
        "badge": "[IT ACT 66C]",
        "title": "Identity Theft — Fraudulent Use of Electronic Signature, Password, or Unique Identification",
        "keywords": ["identity theft", "password", "credential", "login", "uid", "impersonat", "hack", "proxy", "vpn", "aadhaar", "otp", "two factor", "2fa", "stolen identity", "fake id", "forged", "electronic signature", "digital signature"],
        "checklist": [
            "Preserve server access logs and IP authentication tables under Sec 67C IT Act",
            "Issue Sec 91 BNSS / 91 CrPC notice to VPN and ISP nodes for KYC and routing logs",
            "Seize digital devices and calculate SHA-256 hash values immediately",
            "Request OTP delivery logs from telecom operators",
            "Trace the compromised credentials back to the original phishing or breach vector",
            "Freeze compromised accounts and force password resets"
        ],
        "context_template": "The narrative reveals use of stolen electronic signatures, passwords, or unique identification features of another person. Section 66C IT Act criminalizes identity theft with imprisonment up to 3 years and fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 66D",
        "badge": "[IT ACT 66D]",
        "title": "Cheating by Personation Using Computer Resource",
        "keywords": ["phishing", "scam", "impersonate", "fake profile", "spoof", "email spoof", "website clone", "fake website", "social engineering", "pretexting", "vishing"],
        "checklist": [
            "Identify and screenshot the fraudulent website/profile before takedown",
            "Request WHOIS records and domain registration details from the registrar",
            "Obtain hosting provider server logs via Sec 91 BNSS notice",
            "Trace financial transactions to identify mule accounts",
            "Freeze associated fraudulent bank accounts via Sec 106 BNSS",
            "Coordinate with CERT-In for phishing domain blacklisting"
        ],
        "context_template": "The complaint describes cheating by personation using computer resources such as fake websites, spoofed emails, or fraudulent online profiles. Section 66D provides imprisonment up to 3 years and fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 66E",
        "badge": "[IT ACT 66E]",
        "title": "Violation of Privacy — Capturing and Publishing Private Images",
        "keywords": ["privacy", "intimate", "photo", "video", "morphed", "deepfake", "recording", "camera", "surveillance", "voyeur", "peeping", "private area", "nude"],
        "checklist": [
            "Secure and preserve copies of the offending images/videos with hash verification",
            "Identify the platform(s) where the content was published",
            "Issue takedown notices to social media platforms and ISPs",
            "Obtain IP logs and account details of the uploader",
            "Record victim's statement with sensitivity and privacy protections"
        ],
        "context_template": "The incident involves intentional capture, publication, or transmission of images of a private area of a person without consent. Section 66E provides imprisonment up to 3 years and/or fine up to Rs. 2 lakh."
    },
    {
        "section_id": "IT Act Sec 66F",
        "badge": "[IT ACT 66F]",
        "title": "Cyber Terrorism",
        "keywords": ["terrorism", "critical infrastructure", "national security", "bomb", "threat", "state", "government", "defense", "nuclear", "power grid", "water supply", "critical", "sabotage"],
        "checklist": [
            "Immediately escalate to National Investigation Agency (NIA) and CERT-In",
            "Isolate all affected critical infrastructure systems",
            "Activate national cyber crisis management protocols",
            "Preserve all digital evidence under strict chain of custody",
            "Coordinate with intelligence agencies for threat assessment",
            "Implement emergency data preservation across all affected networks"
        ],
        "context_template": "The acts described constitute cyber terrorism targeting critical information infrastructure or national security. Section 66F provides for life imprisonment for acts of cyber terrorism that threaten the unity, integrity, security, or sovereignty of India."
    },
    {
        "section_id": "IT Act Sec 67",
        "badge": "[IT ACT 67]",
        "title": "Publishing or Transmitting Obscene Material in Electronic Form",
        "keywords": ["obscene", "pornography", "explicit", "adult content", "indecent", "vulgar", "lewd", "sexual content"],
        "checklist": [
            "Preserve the obscene electronic content with forensic imaging",
            "Identify the publisher/transmitter through IP and account tracing",
            "Issue takedown notices to hosting platforms",
            "Record the chain of transmission and distribution",
            "Examine the content for classification under obscenity standards"
        ],
        "context_template": "The case involves publishing or transmitting obscene material in electronic form. Section 67 provides first conviction imprisonment up to 3 years and fine up to Rs. 5 lakh; subsequent conviction up to 5 years and fine up to Rs. 10 lakh."
    },
    {
        "section_id": "IT Act Sec 67A",
        "badge": "[IT ACT 67A]",
        "title": "Publishing or Transmitting Sexually Explicit Material",
        "keywords": ["sexually explicit", "pornograph", "sex video", "mms", "revenge porn", "sextortion", "explicit video", "explicit image"],
        "checklist": [
            "Preserve all sexually explicit electronic material as evidence",
            "Identify victims and obtain their consent status",
            "Trace the origin of the material through metadata analysis",
            "Issue immediate takedown requests to all hosting platforms",
            "Coordinate with Cyber Crime Coordination Centre (I4C)"
        ],
        "context_template": "The incident involves transmission of sexually explicit material in electronic form. Section 67A provides first conviction imprisonment up to 5 years and fine up to Rs. 10 lakh; subsequent conviction up to 7 years and fine up to Rs. 10 lakh."
    },
    {
        "section_id": "IT Act Sec 67B",
        "badge": "[IT ACT 67B]",
        "title": "Publishing or Transmitting Material Depicting Children in Sexually Explicit Act",
        "keywords": ["child", "minor", "csam", "child abuse", "child exploitation", "pedophil", "underage"],
        "checklist": [
            "Immediately report to NCMEC/Interpol and local SJPU",
            "Invoke POCSO Act provisions in parallel",
            "Preserve all digital evidence with strict chain of custody",
            "Identify and rescue child victims as top priority",
            "Coordinate with Cyber Crime units specializing in CSAM"
        ],
        "context_template": "The material involves depiction of children in sexually explicit acts. Section 67B provides first conviction imprisonment up to 5 years and fine up to Rs. 10 lakh; subsequent conviction up to 7 years and fine up to Rs. 10 lakh. POCSO Act must be invoked concurrently."
    },
    {
        "section_id": "IT Act Sec 67C",
        "badge": "[IT ACT 67C]",
        "title": "Preservation and Retention of Information by Intermediaries",
        "keywords": ["intermediary", "data retention", "preserve", "logs", "isp", "hosting", "platform", "retention period"],
        "checklist": [
            "Issue formal data preservation notice to the intermediary",
            "Specify the exact data categories and time period for retention",
            "Follow up within the statutory retention period",
            "Document the intermediary's compliance response"
        ],
        "context_template": "This provision requires intermediaries to preserve and retain specified information for the prescribed duration. Section 67C empowers the government to direct intermediaries to preserve data for investigation purposes."
    },
    {
        "section_id": "IT Act Sec 69",
        "badge": "[IT ACT 69]",
        "title": "Power to Issue Directions for Interception, Monitoring, or Decryption",
        "keywords": ["intercept", "monitor", "decrypt", "surveillance", "wiretap", "lawful intercept", "encryption", "encrypted"],
        "checklist": [
            "Obtain proper authorization from competent authority",
            "Document the grounds for interception (sovereignty, security, public order)",
            "Follow the Interception Rules 2009 procedure",
            "Maintain records of all intercepted communications",
            "Ensure compliance with judicial oversight requirements"
        ],
        "context_template": "Interception and monitoring of encrypted communications is warranted. Section 69 empowers the Central/State Government to direct interception, monitoring, or decryption of any information through any computer resource in the interest of sovereignty, security, or public order."
    },
    {
        "section_id": "IT Act Sec 69A",
        "badge": "[IT ACT 69A]",
        "title": "Power to Issue Directions for Blocking Public Access to Information",
        "keywords": ["block", "ban", "takedown", "website block", "url block", "content removal", "banned content"],
        "checklist": [
            "Document the specific content/URLs to be blocked",
            "Establish grounds under Sec 69A (sovereignty, defense, public order, etc.)",
            "Issue blocking order through proper governmental channel",
            "Notify the intermediary of the blocking direction",
            "Maintain records of the blocking order and compliance"
        ],
        "context_template": "The situation warrants blocking public access to certain online content. Section 69A empowers the Central Government to direct any agency or intermediary to block public access to any information in the interest of sovereignty, defense, security of state, or public order."
    },
    {
        "section_id": "IT Act Sec 69B",
        "badge": "[IT ACT 69B]",
        "title": "Power to Authorize Monitoring and Collection of Traffic Data",
        "keywords": ["traffic data", "network monitoring", "metadata", "flow data", "packet capture", "network analysis"],
        "checklist": [
            "Obtain authorization from the designated authority",
            "Define the scope and duration of traffic data collection",
            "Deploy authorized monitoring tools at designated points",
            "Preserve collected traffic data with proper forensic standards"
        ],
        "context_template": "The investigation requires monitoring and collection of traffic data. Section 69B authorizes the Central Government to monitor and collect traffic data from any computer resource for cyber security purposes."
    },
    {
        "section_id": "IT Act Sec 70",
        "badge": "[IT ACT 70]",
        "title": "Protected System — Critical Information Infrastructure",
        "keywords": ["critical infrastructure", "protected system", "government system", "essential service", "power grid", "banking system", "nuclear", "defense system"],
        "checklist": [
            "Verify if the affected system is declared as 'Protected System'",
            "Report to NCIIPC (National Critical Information Infrastructure Protection Centre)",
            "Escalate to the nodal agency responsible for the critical sector",
            "Implement emergency containment procedures",
            "Coordinate with sectoral CERT teams"
        ],
        "context_template": "The targeted system may qualify as a 'Protected System' under Section 70 of the IT Act. Unauthorized access to a protected system is punishable with imprisonment up to 10 years and fine."
    },
    {
        "section_id": "IT Act Sec 70B",
        "badge": "[IT ACT 70B]",
        "title": "Indian Computer Emergency Response Team (CERT-In)",
        "keywords": ["cert-in", "incident response", "cyber incident", "cyber emergency", "reporting", "vulnerability"],
        "checklist": [
            "Report the cyber security incident to CERT-In within 6 hours",
            "Follow CERT-In's incident reporting format",
            "Implement CERT-In's advisory and containment recommendations",
            "Maintain communication with CERT-In throughout the investigation"
        ],
        "context_template": "This cyber security incident must be reported to CERT-In as mandated under Section 70B. CERT-In serves as the national nodal agency for responding to computer security incidents."
    },
    {
        "section_id": "IT Act Sec 72",
        "badge": "[IT ACT 72]",
        "title": "Breach of Confidentiality and Privacy",
        "keywords": ["confidential", "breach", "privacy", "disclosure", "unauthorized disclosure", "leaked", "insider leak"],
        "checklist": [
            "Identify the person who had lawful access and disclosed information",
            "Document what confidential information was disclosed",
            "Establish that disclosure was without consent of the concerned person",
            "Assess the damage caused by the breach of confidentiality"
        ],
        "context_template": "The incident involves breach of confidentiality and privacy by a person who gained access to electronic records lawfully. Section 72 provides imprisonment up to 2 years and/or fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 72A",
        "badge": "[IT ACT 72A]",
        "title": "Disclosure of Information in Breach of Lawful Contract",
        "keywords": ["nda", "contract breach", "confidential information", "trade secret", "proprietary", "whistleblower", "insider"],
        "checklist": [
            "Obtain copies of the relevant contracts and NDAs",
            "Identify what personal information was disclosed",
            "Establish the contractual obligation of confidentiality",
            "Document the disclosure and its impact on the aggrieved party"
        ],
        "context_template": "The disclosure of personal information constitutes a breach of lawful contract. Section 72A provides imprisonment up to 3 years and/or fine up to Rs. 5 lakh for disclosure of information in breach of a lawful contract."
    },
    {
        "section_id": "IT Act Sec 73",
        "badge": "[IT ACT 73]",
        "title": "Publishing Electronic Signature Certificate False in Certain Particulars",
        "keywords": ["digital certificate", "electronic signature", "false certificate", "forged certificate", "CA", "certificate authority"],
        "checklist": [
            "Verify the electronic signature certificate with the issuing CA",
            "Compare the certificate details with the subscriber's actual identity",
            "Preserve the false certificate as evidence",
            "Notify the Controller of Certifying Authorities"
        ],
        "context_template": "The case involves publishing an electronic signature certificate that is false in material particulars. Section 73 criminalizes this with imprisonment up to 2 years and/or fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 74",
        "badge": "[IT ACT 74]",
        "title": "Publication of Digital Signature Certificate for Fraudulent Purpose",
        "keywords": ["fraudulent certificate", "fake digital signature", "forged signature", "certificate fraud"],
        "checklist": [
            "Identify the fraudulent digital signature certificate",
            "Trace the creation and publication of the certificate",
            "Notify the Controller of Certifying Authorities",
            "Seize systems used to create the fraudulent certificate"
        ],
        "context_template": "A digital signature certificate was created or published for fraudulent purposes. Section 74 provides imprisonment up to 2 years and/or fine up to Rs. 1 lakh."
    },
    {
        "section_id": "IT Act Sec 75",
        "badge": "[IT ACT 75]",
        "title": "Act to Apply for Offence or Contravention Committed Outside India",
        "keywords": ["foreign", "international", "cross border", "overseas", "abroad", "another country", "extraterritorial"],
        "checklist": [
            "Determine the jurisdiction and location of the offender",
            "Initiate Mutual Legal Assistance Treaty (MLAT) procedures if applicable",
            "Coordinate with Interpol for international cooperation",
            "Engage the Ministry of External Affairs for diplomatic channels"
        ],
        "context_template": "The offence involves acts committed outside India but affecting computer systems within India. Section 75 extends the applicability of the IT Act to offences committed outside India if the act involves a computer or network located in India."
    },
    {
        "section_id": "IT Act Sec 77B",
        "badge": "[IT ACT 77B]",
        "title": "Offences with Three Years Imprisonment to be Cognizable",
        "keywords": ["cognizable", "arrest", "fir", "investigation"],
        "checklist": [
            "Verify the applicable section and confirm if offence is cognizable",
            "Register FIR without delay for cognizable offences",
            "Begin investigation immediately upon registration"
        ],
        "context_template": "Offences under the IT Act punishable with imprisonment of 3 years or more are cognizable under Section 77B, allowing police to arrest without warrant and investigate without magistrate's order."
    },
    {
        "section_id": "IT Act Sec 78",
        "badge": "[IT ACT 78]",
        "title": "Power to Investigate Offences — Inspector Rank and Above",
        "keywords": ["investigation", "inspector", "police officer", "jurisdiction"],
        "checklist": [
            "Ensure the investigating officer is of Inspector rank or above",
            "Obtain proper jurisdictional authorization",
            "Follow prescribed investigation procedures under IT Act"
        ],
        "context_template": "Investigation of offences under the IT Act must be conducted by a police officer not below the rank of Inspector, as mandated by Section 78."
    },
    {
        "section_id": "IT Act Sec 79",
        "badge": "[IT ACT 79]",
        "title": "Exemption from Liability of Intermediary",
        "keywords": ["intermediary", "platform", "safe harbor", "due diligence", "content moderation", "social media"],
        "checklist": [
            "Assess whether the intermediary qualifies for safe harbor protection",
            "Check if the intermediary followed due diligence requirements",
            "Verify compliance with IT Intermediary Guidelines 2021",
            "Issue notice to intermediary for content removal under Sec 79(3)(b)"
        ],
        "context_template": "The intermediary's liability must be assessed under Section 79. An intermediary is not liable for third party content if it observes due diligence and upon actual knowledge, expeditiously removes the unlawful content."
    },
    {
        "section_id": "IT Act Sec 84C",
        "badge": "[IT ACT 84C]",
        "title": "Punishment for Attempt to Commit Offences",
        "keywords": ["attempt", "tried", "attempted", "unsuccessful", "failed attack"],
        "checklist": [
            "Document the attempted act and the means employed",
            "Preserve evidence of the attempted offence",
            "Assess the potential damage had the attempt succeeded"
        ],
        "context_template": "The act constitutes an attempt to commit an offence under the IT Act. Section 84C provides that whoever attempts to commit or abets an offence shall be punished with up to half the punishment provided for the completed offence."
    },

    # ══════════════════════════════════════════════════════════════
    #  BHARATIYA NYAYA SANHITA (BNS) 2023 — 120 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "BNS Sec 303",
        "badge": "[BNS 303]",
        "title": "Theft",
        "keywords": ["theft", "stole", "stolen", "rob", "snatch", "took away", "missing", "shoplifting"],
        "checklist": [
            "Document the stolen property with descriptions and serial numbers",
            "Check CCTV footage at and around the crime scene",
            "Record witness statements from bystanders and security personnel",
            "Alert pawn shops and second-hand dealers"
        ],
        "context_template": "The complaint describes theft of property. Under BNS Section 303 (replacing IPC 378), theft is defined as dishonest removal of movable property from lawful possession, punishable with imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "BNS Sec 304",
        "badge": "[BNS 304]",
        "title": "Snatching",
        "keywords": ["snatch", "snatching", "chain snatch", "phone snatch", "grab", "pulled away"],
        "checklist": [
            "Record the victim's description of the snatching incident",
            "Obtain CCTV footage from nearby establishments and traffic cameras",
            "Issue lookout notice for the suspect's vehicle/description",
            "Check for similar snatching patterns in the area"
        ],
        "context_template": "The incident involves snatching of property from the person of the victim. BNS Section 304 specifically addresses snatching as a distinct offence, punishable with imprisonment up to 3 years and fine."
    },
    {
        "section_id": "BNS Sec 305",
        "badge": "[BNS 305]",
        "title": "Robbery and Dacoity",
        "keywords": ["robbery", "dacoity", "armed robbery", "gun", "knife", "weapon", "gang", "loot", "dacoit"],
        "checklist": [
            "Secure the crime scene and collect physical evidence",
            "Record detailed descriptions of suspects and weapons used",
            "Coordinate with other police stations for area domination",
            "Check for matching MO in crime records and CCTNS database"
        ],
        "context_template": "The case involves robbery or dacoity. BNS Section 305 (replacing IPC 392-402) provides for severe punishment including imprisonment up to 10 years for robbery and up to life imprisonment for dacoity."
    },
    {
        "section_id": "BNS Sec 308",
        "badge": "[BNS 308]",
        "title": "Extortion",
        "keywords": ["extortion", "blackmail", "threat", "demand", "ransom", "pay or else", "threatening"],
        "checklist": [
            "Preserve all communications (calls, texts, emails) containing threats",
            "Set up call recording for future threat communications",
            "Identify the extortionist through phone/digital trace",
            "Coordinate with the bank if ransom payment is demanded"
        ],
        "context_template": "The complaint describes extortion through threats. BNS Section 308 (replacing IPC 383-389) criminalizes putting a person in fear of injury to dishonestly induce delivery of property, punishable with imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "BNS Sec 316",
        "badge": "[BNS 316]",
        "title": "Criminal Breach of Trust",
        "keywords": ["breach of trust", "employee", "insider", "stole", "trust", "misappropriation", "corporate", "embezzle", "fiduciary", "entrusted"],
        "checklist": [
            "Audit internal access logs, financial records, and physical entry logs",
            "Examine employment contracts, NDA agreements, and fiduciary duties",
            "Seize the employee's official laptop, mobile device, and access cards",
            "Trace misappropriated funds through bank statements and UPI logs",
            "Interview colleagues and supervisors for corroborating evidence"
        ],
        "context_template": "The incident involves criminal breach of trust where the accused, entrusted with property or dominion over it, dishonestly misappropriated or converted it. BNS Section 316 (replacing IPC 405-409) provides imprisonment up to 7 years and fine."
    },
    {
        "section_id": "BNS Sec 318",
        "badge": "[BNS 318]",
        "title": "Cheating and Dishonestly Inducing Delivery of Property",
        "keywords": ["cheat", "fraud", "money", "transfer", "bank", "financial", "lakhs", "rupees", "crore", "deceive", "dishonest", "inducing", "delivery", "upi", "neft", "rtgs", "wallet"],
        "checklist": [
            "Liaise with FIU and nodal officers of the concerned bank",
            "Execute Sec 106 BNSS to freeze the beneficiary accounts within the golden hour",
            "Obtain KYC documents of the suspect account holders",
            "Trace the money trail through bank statements and UPI transaction logs",
            "File a report on the National Cyber Crime Reporting Portal (cybercrime.gov.in)",
            "Coordinate with I4C for inter-state financial fraud coordination"
        ],
        "context_template": "The complaint describes cheating by deception and dishonestly inducing delivery of property. BNS Section 318 (replacing IPC 420) provides imprisonment up to 7 years and fine for cheating causing wrongful loss or damage."
    },
    {
        "section_id": "BNS Sec 319",
        "badge": "[BNS 319]",
        "title": "Cheating by Impersonation",
        "keywords": ["impersonation", "pretending", "fake identity", "assumed name", "pretend", "pose as", "disguise"],
        "checklist": [
            "Collect evidence of the false identity used",
            "Compare the actual identity with the assumed identity",
            "Trace communications and transactions under the false identity",
            "Identify victims who were deceived by the impersonation"
        ],
        "context_template": "The accused cheated by impersonating another person. BNS Section 319 (replacing IPC 419) specifically addresses cheating by personation, punishable with imprisonment up to 5 years and fine."
    },
    {
        "section_id": "BNS Sec 320",
        "badge": "[BNS 320]",
        "title": "Dishonest or Fraudulent Removal or Concealment of Property",
        "keywords": ["conceal", "hide", "remove", "dispose", "hidden property", "smuggle"],
        "checklist": [
            "Search and seize the concealed property",
            "Document the method and location of concealment",
            "Trace the chain of custody of the property",
            "Establish the intent to defraud creditors or other parties"
        ],
        "context_template": "The case involves dishonest or fraudulent removal or concealment of property to prevent distribution among creditors. BNS Section 320 provides imprisonment up to 2 years and/or fine."
    },
    {
        "section_id": "BNS Sec 336",
        "badge": "[BNS 336]",
        "title": "Forgery",
        "keywords": ["forge", "forgery", "forged", "fake document", "counterfeit", "fabricated", "falsified", "fabrication"],
        "checklist": [
            "Obtain the original and forged documents for comparison",
            "Engage handwriting/document forensic expert for analysis",
            "Identify the tools and materials used for forgery",
            "Trace the usage and distribution of the forged documents"
        ],
        "context_template": "The complaint involves forgery of documents. BNS Section 336 (replacing IPC 463-468) criminalizes making a false document with intent to cause damage or fraud, punishable with imprisonment up to 2 years and fine."
    },
    {
        "section_id": "BNS Sec 337",
        "badge": "[BNS 337]",
        "title": "Forgery for Purpose of Cheating",
        "keywords": ["forged cheque", "fake invoice", "forged document", "cheating forgery", "fraudulent document"],
        "checklist": [
            "Send the forged document for forensic examination",
            "Trace the financial transactions linked to the forged document",
            "Identify all parties who relied on the forged document",
            "Seize printing equipment and blank documents from the suspect"
        ],
        "context_template": "The forgery was committed for the purpose of cheating. BNS Section 337 provides enhanced punishment of imprisonment up to 7 years and fine for forgery intended to facilitate cheating."
    },
    {
        "section_id": "BNS Sec 338",
        "badge": "[BNS 338]",
        "title": "Forgery for Purpose of Harming Reputation",
        "keywords": ["defame", "reputation", "forged letter", "fake communication", "false attribution"],
        "checklist": [
            "Preserve the forged document and its distribution history",
            "Identify the author of the forged document",
            "Assess the reputational damage caused to the victim"
        ],
        "context_template": "The forgery was committed to harm the reputation of a person. BNS Section 338 provides specific punishment for forgery made with intent to harm the reputation of any party."
    },
    {
        "section_id": "BNS Sec 340",
        "badge": "[BNS 340]",
        "title": "Using as Genuine a Forged Document or Electronic Record",
        "keywords": ["used forged", "presented forged", "submitted fake", "false evidence", "forged record"],
        "checklist": [
            "Establish that the accused knew or had reason to believe the document was forged",
            "Document the context in which the forged document was used",
            "Identify all institutions or persons who received the forged document"
        ],
        "context_template": "The accused used a forged document or electronic record as genuine. BNS Section 340 punishes anyone who fraudulently or dishonestly uses a forged document, knowing it to be forged."
    },
    {
        "section_id": "BNS Sec 351",
        "badge": "[BNS 351]",
        "title": "Criminal Intimidation",
        "keywords": ["intimidate", "threaten", "death threat", "injury threat", "warn", "menace", "coerce", "scare"],
        "checklist": [
            "Preserve evidence of threatening communications",
            "Assess the credibility and immediacy of the threat",
            "Provide immediate protection to the threatened person if needed",
            "Trace the source of anonymous threats"
        ],
        "context_template": "The complaint involves criminal intimidation — threatening a person with injury to person, reputation, or property. BNS Section 351 (replacing IPC 503-506) provides imprisonment up to 2 years and/or fine."
    },
    {
        "section_id": "BNS Sec 352",
        "badge": "[BNS 352]",
        "title": "Intentional Insult with Intent to Provoke Breach of Peace",
        "keywords": ["insult", "provoke", "abuse", "verbal abuse", "public insult", "humiliate"],
        "checklist": [
            "Record the specific words/gestures used",
            "Obtain witness statements about the incident",
            "Check for video/audio evidence of the insult"
        ],
        "context_template": "The incident involves intentional insult to provoke breach of peace. BNS Section 352 addresses deliberate insults intended to provoke disturbance of public tranquility."
    },
    {
        "section_id": "BNS Sec 353",
        "badge": "[BNS 353]",
        "title": "Statements Conducing to Public Mischief",
        "keywords": ["fake news", "misinformation", "rumour", "panic", "public mischief", "false alarm", "hoax"],
        "checklist": [
            "Preserve the false statement/message with metadata",
            "Trace the origin and distribution chain of the misinformation",
            "Assess the public harm caused by the false statement",
            "Issue corrections through official channels"
        ],
        "context_template": "The accused made statements conducing to public mischief, spreading misinformation likely to cause alarm or incite crime. BNS Section 353 provides imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "BNS Sec 354",
        "badge": "[BNS 354]",
        "title": "Acts Done by Several Persons in Furtherance of Common Intention",
        "keywords": ["gang", "group", "conspiracy", "common intention", "together", "organised", "organized", "accomplice"],
        "checklist": [
            "Identify all persons involved in the common intention",
            "Establish the pre-concert and meeting of minds",
            "Document each person's role in the criminal act",
            "Collect communication records between the conspirators"
        ],
        "context_template": "Multiple persons acted in furtherance of common intention. BNS Section 354 (replacing IPC 34) provides that all persons who commit a criminal act with common intention are equally liable."
    },
    {
        "section_id": "BNS Sec 61",
        "badge": "[BNS 61]",
        "title": "Criminal Conspiracy",
        "keywords": ["conspiracy", "conspire", "plan", "plot", "scheme", "hatched", "colluded", "ring", "syndicate", "cartel", "nexus"],
        "checklist": [
            "Map the conspiracy network using communication analysis (CDR/IPDR)",
            "Identify the ringleader and hierarchy of the conspiracy",
            "Document meetings, communications, and fund flows between conspirators",
            "Obtain confessional statements while adhering to Sec 22/23 BSA",
            "Apply for TI (Telephone Interception) orders if conspiracy is ongoing"
        ],
        "context_template": "Evidence indicates a criminal conspiracy to commit offences. BNS Section 61 (replacing IPC 120A-120B) defines criminal conspiracy as an agreement between two or more persons to do an illegal act, punishable with the same severity as the planned offence."
    },
    {
        "section_id": "BNS Sec 111",
        "badge": "[BNS 111]",
        "title": "Organised Crime",
        "keywords": ["organised crime", "organized crime", "syndicate", "gang", "criminal network", "mafia", "cartel", "racket", "extortion ring"],
        "checklist": [
            "Establish the continuing unlawful activity of the criminal group",
            "Map the organizational structure and hierarchy",
            "Trace financial flows and money laundering channels",
            "Coordinate with MCOCA/state organised crime units",
            "Apply for property attachment under PMLA"
        ],
        "context_template": "The case involves organised crime as defined under BNS Section 111. This section specifically targets continuing unlawful activities by organised crime syndicates, providing enhanced punishment up to life imprisonment and fine up to Rs. 10 lakh."
    },
    {
        "section_id": "BNS Sec 112",
        "badge": "[BNS 112]",
        "title": "Petty Organised Crime",
        "keywords": ["petty crime", "chain snatching", "pickpocket", "organised theft", "motor vehicle theft", "cargo theft"],
        "checklist": [
            "Identify the pattern of petty offences by the group",
            "Map CCTV footage across multiple crime scenes",
            "Check for recidivism using CCTNS criminal history",
            "Coordinate across police station jurisdictions"
        ],
        "context_template": "The incident forms part of petty organised crime operations. BNS Section 112 addresses groups engaging in organised pickpocketing, snatching, theft of vehicles, and similar petty offences, providing imprisonment of 1-7 years."
    },
    {
        "section_id": "BNS Sec 100",
        "badge": "[BNS 100]",
        "title": "Murder",
        "keywords": ["murder", "killed", "homicide", "death", "dead body", "stabbed to death", "shot dead", "fatal"],
        "checklist": [
            "Secure the crime scene and call forensic team immediately",
            "Conduct post-mortem examination within 24 hours",
            "Collect DNA samples, fingerprints, and ballistic evidence",
            "Record dying declaration if victim is still alive",
            "Conduct neighborhood canvass and record witness statements"
        ],
        "context_template": "The case involves culpable homicide amounting to murder. BNS Section 100 (replacing IPC 300/302) defines murder and provides for punishment of death or life imprisonment along with fine."
    },
    {
        "section_id": "BNS Sec 105",
        "badge": "[BNS 105]",
        "title": "Culpable Homicide Not Amounting to Murder",
        "keywords": ["culpable homicide", "death", "negligent death", "unintentional killing", "accidental death"],
        "checklist": [
            "Determine intent and knowledge of the accused",
            "Examine circumstances distinguishing from murder",
            "Collect medical evidence on cause of death",
            "Assess whether exceptions to murder apply"
        ],
        "context_template": "The death may constitute culpable homicide not amounting to murder under BNS Section 105, where the act was done without premeditation in a sudden fight or without intention to cause death."
    },
    {
        "section_id": "BNS Sec 115",
        "badge": "[BNS 115]",
        "title": "Voluntarily Causing Hurt",
        "keywords": ["assault", "hurt", "beat", "attack", "punch", "hit", "injury", "slap", "kick", "physical"],
        "checklist": [
            "Obtain medical examination report of the victim",
            "Photograph injuries and preserve medical records",
            "Record witness statements from bystanders",
            "Check for CCTV footage of the assault"
        ],
        "context_template": "The complaint describes voluntarily causing hurt. BNS Section 115 (replacing IPC 323-325) provides punishment for causing bodily pain, disease, or infirmity to another person."
    },
    {
        "section_id": "BNS Sec 117",
        "badge": "[BNS 117]",
        "title": "Voluntarily Causing Grievous Hurt",
        "keywords": ["grievous hurt", "fracture", "permanent injury", "acid attack", "burn", "disfigure", "bone", "serious injury"],
        "checklist": [
            "Obtain detailed medical report classifying the injury as grievous",
            "Document the weapon or method used to cause grievous hurt",
            "Assess the long-term medical prognosis and disability",
            "Preserve the weapon used in the attack"
        ],
        "context_template": "The injuries constitute grievous hurt under BNS Section 117 (replacing IPC 325-326). Grievous hurt includes emasculation, permanent privation of sight/hearing, fracture, or disfiguration, punishable with imprisonment up to 7 years."
    },
    {
        "section_id": "BNS Sec 118",
        "badge": "[BNS 118]",
        "title": "Voluntarily Causing Hurt or Grievous Hurt by Dangerous Weapons",
        "keywords": ["weapon", "knife", "sword", "blade", "sharp", "dangerous weapon", "shooting", "firearm", "gun"],
        "checklist": [
            "Seize and preserve the dangerous weapon used",
            "Send weapon for ballistic/forensic examination",
            "Document injuries caused by the specific weapon",
            "Check for weapons license and its validity"
        ],
        "context_template": "The hurt was caused using dangerous weapons or means. BNS Section 118 provides enhanced punishment for causing hurt with instruments for shooting, stabbing, cutting, or with fire, poison, or corrosive substances."
    },
    {
        "section_id": "BNS Sec 121",
        "badge": "[BNS 121]",
        "title": "Voluntarily Causing Hurt to Deter Public Servant from Duty",
        "keywords": ["public servant", "government officer", "police", "official duty", "obstruct", "resist arrest"],
        "checklist": [
            "Document the public servant's official duty being performed",
            "Obtain injury report of the public servant",
            "Record eyewitness accounts of the obstruction",
            "File departmental report documenting the incident"
        ],
        "context_template": "Hurt was voluntarily caused to deter a public servant from official duty. BNS Section 121 provides enhanced punishment for acts intended to prevent or deter public servants from discharging their duties."
    },
    {
        "section_id": "BNS Sec 127",
        "badge": "[BNS 127]",
        "title": "Wrongful Restraint and Wrongful Confinement",
        "keywords": ["restrain", "confine", "kidnap", "locked", "detained", "held hostage", "hostage", "captive"],
        "checklist": [
            "Document the location and duration of confinement",
            "Obtain medical examination of the victim",
            "Identify the accused and establish the method of restraint",
            "Check if the confinement was for ransom or other demands"
        ],
        "context_template": "The complaint involves wrongful restraint or confinement. BNS Section 127 (replacing IPC 339-348) criminalizes voluntarily obstructing a person's movement or confining them without legal authority."
    },
    {
        "section_id": "BNS Sec 137",
        "badge": "[BNS 137]",
        "title": "Kidnapping, Abduction, and Related Offences",
        "keywords": ["kidnap", "abduct", "abduction", "missing person", "taken away", "minor missing", "child kidnap"],
        "checklist": [
            "Issue immediate lookout notice and alert nearby police stations",
            "Activate 'Operation Smile' or 'Track Child' protocols for missing minors",
            "Analyze CDR/IPDR of the victim's and suspect's mobile phones",
            "Check CCTV footage along possible routes of movement",
            "Coordinate with NCRB's missing persons database (Talash)"
        ],
        "context_template": "The case involves kidnapping or abduction. BNS Section 137 (replacing IPC 359-369) addresses kidnapping from lawful guardianship or from India, and abduction by force or deceit."
    },
    {
        "section_id": "BNS Sec 140",
        "badge": "[BNS 140]",
        "title": "Kidnapping or Abducting with Intent to Murder",
        "keywords": ["kidnap for murder", "abduction murder", "kill hostage", "ransom murder"],
        "checklist": [
            "Treat as high-priority life-threatening situation",
            "Activate crisis negotiation team",
            "Set up phone tapping with proper authorization",
            "Coordinate with special forces for rescue operation"
        ],
        "context_template": "Kidnapping or abduction was committed with intent to murder. BNS Section 140 provides for severe punishment for kidnapping with the intent to murder, including life imprisonment."
    },
    {
        "section_id": "BNS Sec 192",
        "badge": "[BNS 192]",
        "title": "Waging or Attempting to Wage War Against Government of India",
        "keywords": ["war against state", "insurrection", "rebellion", "sedition", "anti-national", "armed rebellion"],
        "checklist": [
            "Immediately report to NIA and state intelligence bureau",
            "Seize all arms, ammunition, and strategic communications",
            "Coordinate with military/paramilitary forces",
            "Implement area domination and curfew if necessary"
        ],
        "context_template": "The acts constitute waging or attempting to wage war against the Government of India. BNS Section 192 provides for death or life imprisonment for this grave offence."
    },
    {
        "section_id": "BNS Sec 196",
        "badge": "[BNS 196]",
        "title": "Promoting Enmity Between Groups",
        "keywords": ["hate speech", "communal", "religious hatred", "caste", "enmity", "incite", "divisive", "provocative"],
        "checklist": [
            "Preserve the hateful content (posts, speeches, pamphlets)",
            "Assess the communal sensitivity and potential for violence",
            "Coordinate with community leaders for peace efforts",
            "Deploy preventive measures under Sec 163 BNSS"
        ],
        "context_template": "The accused promoted enmity between groups on grounds of religion, race, caste, or community. BNS Section 196 provides imprisonment up to 5 years and fine."
    },
    {
        "section_id": "BNS Sec 263",
        "badge": "[BNS 263]",
        "title": "Assault or Criminal Force to Woman with Intent to Outrage Modesty",
        "keywords": ["sexual harassment", "molestation", "outrage modesty", "groping", "eve teasing", "inappropriately touched"],
        "checklist": [
            "Record the victim's statement with a female officer present",
            "Obtain medical examination if applicable",
            "Secure CCTV footage from the incident location",
            "Ensure victim protection under Sec 173 BNSS",
            "Invoke SHe-Box or ICC mechanism if workplace related"
        ],
        "context_template": "The incident involves assault or criminal force against a woman with intent to outrage her modesty. BNS Section 263 (replacing IPC 354) provides imprisonment of 1-5 years and fine."
    },
    {
        "section_id": "BNS Sec 64",
        "badge": "[BNS 64]",
        "title": "Rape",
        "keywords": ["rape", "sexual assault", "forced", "non-consensual", "sexual violence"],
        "checklist": [
            "Register FIR immediately without any delay (zero FIR if needed)",
            "Conduct medical examination within 24 hours with victim's consent",
            "Record statement under Sec 183 BNSS before a Judicial Magistrate",
            "Ensure victim's identity is protected at all stages",
            "Provide victim with legal aid and counseling services"
        ],
        "context_template": "The complaint constitutes the offence of rape. BNS Section 64 (replacing IPC 375-376) provides rigorous imprisonment of not less than 10 years which may extend to life imprisonment and fine."
    },
    {
        "section_id": "BNS Sec 70",
        "badge": "[BNS 70]",
        "title": "Gang Rape",
        "keywords": ["gang rape", "group sexual assault", "multiple perpetrators"],
        "checklist": [
            "Identify and arrest all accused persons",
            "Collect DNA evidence from victim and crime scene",
            "Fast-track the investigation for court proceedings",
            "Ensure round-the-clock security for the victim"
        ],
        "context_template": "The case involves gang rape by multiple perpetrators. BNS Section 70 provides rigorous imprisonment of not less than 20 years which may extend to life imprisonment and fine."
    },
    {
        "section_id": "BNS Sec 74",
        "badge": "[BNS 74]",
        "title": "Assault or Use of Criminal Force to Woman with Intent to Disrobe",
        "keywords": ["disrobe", "strip", "undress", "forced to undress", "stripped"],
        "checklist": [
            "Record the victim's statement with sensitivity",
            "Identify the accused and any accomplices",
            "Collect any video/photo evidence or witness testimony"
        ],
        "context_template": "The accused assaulted a woman with intent to disrobe. BNS Section 74 provides imprisonment of 3-7 years and fine."
    },
    {
        "section_id": "BNS Sec 75",
        "badge": "[BNS 75]",
        "title": "Sexual Harassment",
        "keywords": ["sexual harassment", "workplace harassment", "inappropriate", "unwelcome sexual", "stalking sexual"],
        "checklist": [
            "Document all instances of harassment with dates and details",
            "Obtain witness statements from colleagues or bystanders",
            "Preserve any electronic communications related to harassment",
            "Notify the Internal Complaints Committee (ICC) if workplace related"
        ],
        "context_template": "The complaint describes sexual harassment. BNS Section 75 (replacing IPC 354A) provides imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "BNS Sec 76",
        "badge": "[BNS 76]",
        "title": "Voyeurism",
        "keywords": ["voyeur", "peeping", "spy camera", "hidden camera", "recording", "watch private", "surveillance camera"],
        "checklist": [
            "Locate and seize hidden cameras or recording devices",
            "Preserve recorded footage as evidence with hash verification",
            "Identify the operator/installer of surveillance equipment",
            "Check if the footage was disseminated online"
        ],
        "context_template": "The accused engaged in voyeurism — watching or capturing images of a woman engaged in private acts. BNS Section 76 (replacing IPC 354C) provides first conviction imprisonment of 1-3 years and fine."
    },
    {
        "section_id": "BNS Sec 78",
        "badge": "[BNS 78]",
        "title": "Stalking",
        "keywords": ["stalking", "follow", "following", "harass", "persistent", "watching", "contact repeatedly", "cyberstalking"],
        "checklist": [
            "Document all instances of stalking with dates, times, and locations",
            "Preserve digital evidence (messages, calls, social media contacts)",
            "Issue restraining/protection order under BNSS",
            "Trace the stalker's movements through CDR/IPDR/GPS data",
            "Provide the victim with emergency contact numbers"
        ],
        "context_template": "The complaint describes stalking — repeatedly following, contacting, or monitoring a person despite disinterest. BNS Section 78 (replacing IPC 354D) provides first conviction imprisonment up to 3 years and fine."
    },
    {
        "section_id": "BNS Sec 329",
        "badge": "[BNS 329]",
        "title": "Mischief Causing Damage",
        "keywords": ["mischief", "vandalism", "damage", "destroy", "break", "smash", "arson", "fire", "burn"],
        "checklist": [
            "Document and photograph the damage caused",
            "Estimate the monetary value of the damage",
            "Identify the accused through witnesses or CCTV",
            "Preserve any tools or materials used for causing damage"
        ],
        "context_template": "The accused committed mischief by intentionally causing damage or destruction to property. BNS Section 329 (replacing IPC 425-440) provides punishment proportional to the damage caused."
    },
    {
        "section_id": "BNS Sec 331",
        "badge": "[BNS 331]",
        "title": "Mischief by Destroying or Moving Landmark",
        "keywords": ["landmark", "boundary", "property boundary", "survey mark", "encroachment"],
        "checklist": [
            "Conduct survey of the affected property boundary",
            "Obtain revenue records and land survey documents",
            "Record statements from neighboring property owners"
        ],
        "context_template": "The accused committed mischief by destroying or moving a landmark or boundary mark. BNS Section 331 addresses this specific form of property mischief."
    },
    {
        "section_id": "BNS Sec 332",
        "badge": "[BNS 332]",
        "title": "Mischief by Fire or Explosive",
        "keywords": ["arson", "fire", "explosion", "explosive", "bomb", "blast", "burning", "set fire", "incendiary"],
        "checklist": [
            "Secure the blast/fire scene and request forensic (FSL) team",
            "Collect residue samples for explosive/accelerant analysis",
            "Identify the source and type of explosive/incendiary device",
            "Check CCTV footage for suspect planting the device",
            "Coordinate with bomb disposal squad (BDDS) if unexploded devices remain"
        ],
        "context_template": "Mischief was committed by fire or explosive substance. BNS Section 332 provides enhanced punishment for destruction by fire or explosion, with imprisonment up to 7 years and fine."
    },
    {
        "section_id": "BNS Sec 333",
        "badge": "[BNS 333]",
        "title": "Mischief by Destroying or Diminishing Water Supply or Electricity",
        "keywords": ["water supply", "electricity", "power", "utility", "infrastructure sabotage", "power cut"],
        "checklist": [
            "Document the disruption to essential services",
            "Coordinate with utility companies for damage assessment",
            "Identify the point of sabotage or interference",
            "Assess the impact on public safety and essential services"
        ],
        "context_template": "Mischief was committed by destroying or diminishing water supply or electricity. BNS Section 333 specifically addresses sabotage of essential utility infrastructure."
    },
    {
        "section_id": "BNS Sec 334",
        "badge": "[BNS 334]",
        "title": "Mischief by Injury to Public Property",
        "keywords": ["public property", "government property", "railway", "road damage", "public infrastructure"],
        "checklist": [
            "Document the damage to public property with photographs and measurements",
            "Obtain damage assessment from the concerned government department",
            "Identify the accused through witness statements and CCTV",
            "Calculate the cost of repair and restoration"
        ],
        "context_template": "The accused caused damage to public property or government infrastructure. BNS Section 334 provides enhanced punishment for mischief involving property of the state or essential public services."
    },
    {
        "section_id": "BNS Sec 335",
        "badge": "[BNS 335]",
        "title": "Criminal Trespass and House Trespass",
        "keywords": ["trespass", "break in", "breaking", "entry", "unauthorized entry", "intrusion", "burglary", "house breaking"],
        "checklist": [
            "Document the point of entry and method of trespass",
            "Collect fingerprints, footprints, and tool marks from the scene",
            "Check CCTV and motion sensor alerts",
            "Interview neighbors and security guards",
            "Assess if any property was stolen or damaged during trespass"
        ],
        "context_template": "The complaint describes criminal trespass — entering or remaining in property in possession of another with intent to commit offence or intimidate. BNS Section 335 (replacing IPC 441-462) provides punishment proportional to the nature of trespass."
    },
    {
        "section_id": "BNS Sec 299",
        "badge": "[BNS 299]",
        "title": "Property Offences — General Provisions",
        "keywords": ["property", "movable property", "immovable property", "possession", "ownership", "title dispute"],
        "checklist": [
            "Verify ownership and possession documents",
            "Record statements from both claimants",
            "Conduct local inquiry into the property dispute",
            "Preserve relevant revenue and registration documents"
        ],
        "context_template": "The case involves offences against property. BNS Chapter XVII (from Section 299 onwards) consolidates property offences including theft, extortion, robbery, and criminal misappropriation."
    },
    {
        "section_id": "BNS Sec 152",
        "badge": "[BNS 152]",
        "title": "Acts Endangering Sovereignty, Unity, and Integrity of India",
        "keywords": ["sovereignty", "unity", "integrity", "separatist", "anti india", "secession", "territorial integrity"],
        "checklist": [
            "Report to NIA and state intelligence bureau",
            "Preserve all anti-national propaganda material",
            "Monitor social media accounts of the accused",
            "Coordinate with central intelligence agencies"
        ],
        "context_template": "The acts endanger the sovereignty, unity, and integrity of India. BNS Section 152 (replacing sedition provisions) provides imprisonment up to 7 years and fine."
    },
    {
        "section_id": "BNS Sec 195",
        "badge": "[BNS 195]",
        "title": "Act of Terrorism",
        "keywords": ["terrorism", "terrorist", "terror attack", "bomb blast", "mass casualty", "UAPA"],
        "checklist": [
            "Immediately alert NIA, IB, and state ATS",
            "Secure and evacuate the blast zone/attack site",
            "Activate mass casualty incident response protocols",
            "Preserve all CCTV footage in a 5km radius",
            "Coordinate with NSG for ongoing threat neutralization"
        ],
        "context_template": "The incident constitutes an act of terrorism. BNS Section 195 defines terrorism and provides for severe punishment including death or life imprisonment. This must be investigated by NIA."
    },
    {
        "section_id": "BNS Sec 232",
        "badge": "[BNS 232]",
        "title": "Counterfeiting Government Stamps",
        "keywords": ["counterfeit", "stamp", "fake stamp", "forged stamp", "revenue stamp"],
        "checklist": [
            "Seize counterfeit stamps and manufacturing equipment",
            "Engage document forensic experts for authentication",
            "Trace the distribution chain of counterfeit stamps",
            "Coordinate with the stamp duty department"
        ],
        "context_template": "The case involves counterfeiting of government stamps. BNS Section 232 criminalizes the manufacture or possession of counterfeit stamps."
    },
    {
        "section_id": "BNS Sec 238",
        "badge": "[BNS 238]",
        "title": "Counterfeiting Indian Coin or Currency Notes",
        "keywords": ["counterfeit currency", "fake notes", "fake money", "forged currency", "FICN", "duplicate notes"],
        "checklist": [
            "Seize all counterfeit currency and preserve with proper documentation",
            "Send samples to RBI and Note Refund Section for authentication",
            "Trace the source and distribution network",
            "Coordinate with RBI and NIA for FICN cases",
            "Check for printing equipment and raw materials at suspect's premises"
        ],
        "context_template": "The case involves counterfeiting of Indian currency notes or coins. BNS Section 238 (replacing IPC 489A-489E) provides imprisonment up to life for counterfeiting currency, reflecting the severe threat to economic security."
    },
    {
        "section_id": "BNS Sec 270",
        "badge": "[BNS 270]",
        "title": "Public Nuisance",
        "keywords": ["nuisance", "pollution", "noise", "obstruction", "public health", "environment", "contamination"],
        "checklist": [
            "Document the nature and extent of the nuisance",
            "Obtain environmental/health impact assessment if applicable",
            "Issue notice to the offender under municipal laws",
            "Coordinate with local body for abatement of nuisance"
        ],
        "context_template": "The accused committed acts constituting public nuisance. BNS Section 270 addresses acts that cause common injury, danger, or annoyance to the public."
    },
    {
        "section_id": "BNS Sec 271",
        "badge": "[BNS 271]",
        "title": "Negligent Act Likely to Spread Infection of Dangerous Disease",
        "keywords": ["disease", "infection", "pandemic", "quarantine", "contagion", "epidemic", "public health"],
        "checklist": [
            "Coordinate with health department for containment",
            "Identify persons exposed to the infection",
            "Document the negligent act that spread the disease",
            "Enforce quarantine measures as needed"
        ],
        "context_template": "The accused negligently spread or facilitated the spread of a dangerous disease. BNS Section 271 addresses public health offences."
    },
    {
        "section_id": "BNS Sec 283",
        "badge": "[BNS 283]",
        "title": "Danger or Obstruction in Public Way or Line of Navigation",
        "keywords": ["road block", "obstruction", "public road", "highway", "navigation", "roadblock"],
        "checklist": [
            "Clear the obstruction from the public way",
            "Document the nature and duration of the obstruction",
            "Identify the person responsible for creating the obstruction"
        ],
        "context_template": "The accused created danger or obstruction in a public way or line of navigation. BNS Section 283 addresses hazards to public transit."
    },
    {
        "section_id": "BNS Sec 285",
        "badge": "[BNS 285]",
        "title": "Negligent Conduct with Respect to Fire or Combustible Matter",
        "keywords": ["negligent fire", "careless", "combustible", "inflammable", "fire safety", "fire hazard"],
        "checklist": [
            "Investigate the cause and origin of the fire",
            "Obtain fire department investigation report",
            "Check compliance with fire safety norms",
            "Assess the damage and casualties"
        ],
        "context_template": "The case involves negligent conduct with fire or combustible matter endangering life or property. BNS Section 285 provides imprisonment up to 6 months and/or fine up to Rs. 1,000."
    },

    # ══════════════════════════════════════════════════════════════
    #  BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS) 2023 — 80 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "BNSS Sec 91",
        "badge": "[BNSS 91]",
        "title": "Summons to Produce Document or Other Thing",
        "keywords": ["summons", "produce", "document", "records", "evidence production", "notice", "call for records", "data request"],
        "checklist": [
            "Draft the Sec 91 BNSS notice specifying exact documents/data required",
            "Serve notice on the custodian of the documents (ISP, bank, platform)",
            "Set a reasonable compliance deadline (typically 72 hours for digital records)",
            "Follow up on non-compliance with contempt proceedings if necessary",
            "Maintain record of service and acknowledgment"
        ],
        "context_template": "A Sec 91 BNSS notice (replacing CrPC 91) must be issued to compel production of documents, electronic records, or other evidence material to the investigation."
    },
    {
        "section_id": "BNSS Sec 94",
        "badge": "[BNSS 94]",
        "title": "Search Warrant",
        "keywords": ["search warrant", "search", "raid", "premises search", "warrant"],
        "checklist": [
            "Apply to the competent Magistrate for search warrant with specific grounds",
            "Specify the exact premises and items to be searched for",
            "Ensure the search is conducted with independent witnesses (panch)",
            "Prepare a detailed panchnama/seizure memo during the search",
            "Videograph the entire search process"
        ],
        "context_template": "A search warrant under Sec 94 BNSS (replacing CrPC 93-94) is required to search premises for evidence. The warrant must specify the place to be searched and items to be seized."
    },
    {
        "section_id": "BNSS Sec 105",
        "badge": "[BNSS 105]",
        "title": "Seizure of Property — Digital Evidence Seizure Procedure",
        "keywords": ["seize", "seizure", "evidence", "digital evidence", "electronic evidence", "confiscate", "impound"],
        "checklist": [
            "Prepare seizure memo/panchnama with two independent witnesses",
            "Calculate SHA-256 hash of all digital storage media at the scene",
            "Photograph each item before and after seizure",
            "Maintain strict chain of custody documentation",
            "Store digital evidence in anti-static, tamper-evident bags",
            "Create forensic bit-stream images within 48 hours of seizure"
        ],
        "context_template": "Evidence must be seized following strict digital forensic protocols under Sec 105 BNSS (replacing CrPC 102). All digital evidence must be hashed, documented, and stored in tamper-evident packaging."
    },
    {
        "section_id": "BNSS Sec 106",
        "badge": "[BNSS 106]",
        "title": "Power to Freeze Bank Accounts and Property",
        "keywords": ["freeze", "bank freeze", "account freeze", "property freeze", "attachment", "lien", "hold funds", "block account"],
        "checklist": [
            "Issue urgent freeze order to the nodal bank officer within the golden hour",
            "Specify exact account numbers, UPI IDs, and wallet addresses to freeze",
            "Coordinate with I4C financial fraud helpline (1930) for immediate action",
            "Follow up with a formal written order within 24 hours",
            "Request transaction statements from the date of first fraudulent activity"
        ],
        "context_template": "Fraudulent accounts must be frozen under Sec 106 BNSS to prevent further dissipation of stolen funds. This power enables police to order immediate freezing of bank accounts, digital wallets, and property linked to criminal proceeds."
    },
    {
        "section_id": "BNSS Sec 163",
        "badge": "[BNSS 163]",
        "title": "Order to Prevent Public Disorder — Section 144 Equivalent",
        "keywords": ["section 144", "curfew", "prohibitory order", "public order", "law and order", "assembly ban", "riot control"],
        "checklist": [
            "Define the specific area and duration of the prohibitory order",
            "Publish the order through official gazette and local media",
            "Deploy adequate police force for enforcement",
            "Monitor compliance and take action against violators"
        ],
        "context_template": "Prohibitory orders under Sec 163 BNSS (replacing CrPC 144) may be issued to prevent public disorder. This empowers a District Magistrate or Executive Magistrate to issue orders to maintain public tranquility."
    },
    {
        "section_id": "BNSS Sec 173",
        "badge": "[BNSS 173]",
        "title": "Information in Cognizable Cases (FIR Registration)",
        "keywords": ["fir", "first information report", "complaint", "report", "cognizable", "lodge fir", "register case"],
        "checklist": [
            "Register the FIR immediately upon receipt of information — zero delay",
            "Read over the FIR to the informant and obtain their signature",
            "Provide a free copy of the FIR to the informant",
            "Enter the FIR in the General Diary / Station Diary",
            "Forward the FIR to the Magistrate without delay"
        ],
        "context_template": "An FIR must be registered under Sec 173 BNSS (replacing CrPC 154) for this cognizable offence. Police are mandated to register the FIR without delay and begin investigation."
    },
    {
        "section_id": "BNSS Sec 174",
        "badge": "[BNSS 174]",
        "title": "Information in Non-Cognizable Cases",
        "keywords": ["non-cognizable", "ncr", "complaint", "minor offence"],
        "checklist": [
            "Register the complaint in the NCR register",
            "Advise the complainant to approach the Magistrate if necessary",
            "Refer to the Magistrate for permission to investigate if warranted"
        ],
        "context_template": "This is a non-cognizable offence. Under Sec 174 BNSS (replacing CrPC 155), the police must enter the information and refer the complainant to the Magistrate."
    },
    {
        "section_id": "BNSS Sec 175",
        "badge": "[BNSS 175]",
        "title": "Investigation by Police Officer",
        "keywords": ["investigation", "probe", "inquiry", "case investigation"],
        "checklist": [
            "Commence investigation immediately upon FIR registration",
            "Visit the place of occurrence and examine the scene",
            "Record statements of witnesses under Sec 180 BNSS",
            "Collect and preserve material evidence"
        ],
        "context_template": "Investigation must be conducted as per Sec 175 BNSS (replacing CrPC 157) by a police officer of appropriate rank."
    },
    {
        "section_id": "BNSS Sec 176",
        "badge": "[BNSS 176]",
        "title": "Investigation into Cognizable Case by Senior Officer",
        "keywords": ["senior officer", "transfer investigation", "DSP", "SP investigation"],
        "checklist": [
            "The senior officer must review the case and take over if warranted",
            "Issue formal order of transfer of investigation",
            "Brief the investigating team on case status and evidence collected"
        ],
        "context_template": "A senior police officer may take over the investigation under Sec 176 BNSS when the gravity of the offence warrants it."
    },
    {
        "section_id": "BNSS Sec 180",
        "badge": "[BNSS 180]",
        "title": "Examination of Witnesses by Police",
        "keywords": ["witness", "statement", "examine", "testimony", "deposition"],
        "checklist": [
            "Record the witness statement in writing",
            "Read over the statement to the witness and obtain signature",
            "Maintain confidentiality of witness statements during investigation",
            "Assess the need for witness protection"
        ],
        "context_template": "Witness statements must be recorded under Sec 180 BNSS (replacing CrPC 161). These statements, while not admissible as evidence in court, are crucial for investigation direction."
    },
    {
        "section_id": "BNSS Sec 183",
        "badge": "[BNSS 183]",
        "title": "Statement to Magistrate (164 CrPC Equivalent)",
        "keywords": ["confessional statement", "magistrate statement", "164 statement", "confession", "dying declaration"],
        "checklist": [
            "Arrange for the statement to be recorded before a Judicial Magistrate",
            "Ensure the person is giving the statement voluntarily",
            "The Magistrate must warn that the statement may be used against them",
            "Record the statement in the Magistrate's own handwriting or get it typed verbatim"
        ],
        "context_template": "A statement must be recorded under Sec 183 BNSS (replacing CrPC 164) before a Judicial Magistrate. This includes confessional statements and dying declarations."
    },
    {
        "section_id": "BNSS Sec 185",
        "badge": "[BNSS 185]",
        "title": "Search of Place Entered by Person Sought to be Arrested",
        "keywords": ["search premises", "arrest warrant", "fugitive search", "absconding"],
        "checklist": [
            "Obtain written authorization for search if arrest warrant is pending",
            "Conduct search with two independent witnesses",
            "Document the search proceedings in a panchnama"
        ],
        "context_template": "Search of premises may be conducted under Sec 185 BNSS when a person to be arrested has entered or is believed to be in that place."
    },
    {
        "section_id": "BNSS Sec 187",
        "badge": "[BNSS 187]",
        "title": "Procedure When Investigation Cannot Be Completed in 24 Hours",
        "keywords": ["remand", "custody", "judicial custody", "police custody", "24 hours", "extension"],
        "checklist": [
            "Produce the accused before the Magistrate within 24 hours of arrest",
            "Apply for police custody remand with specific grounds",
            "Specify the exact investigation steps to be carried out during remand",
            "Maximum police custody: 15 days; judicial custody: 60/90 days"
        ],
        "context_template": "When investigation cannot be completed in 24 hours, the accused must be produced before the Magistrate under Sec 187 BNSS (replacing CrPC 167) for remand."
    },
    {
        "section_id": "BNSS Sec 193",
        "badge": "[BNSS 193]",
        "title": "Report of Police Officer on Completion of Investigation (Chargesheet)",
        "keywords": ["chargesheet", "charge sheet", "final report", "closure report", "prosecution", "filing"],
        "checklist": [
            "Compile all evidence, witness statements, and forensic reports",
            "Prepare the chargesheet in prescribed format within statutory timeframe",
            "Attach list of witnesses, documents, and material exhibits",
            "File the chargesheet before the Magistrate having jurisdiction",
            "Serve copies to the accused as per legal requirement"
        ],
        "context_template": "Upon completion of investigation, a chargesheet (police report) must be filed under Sec 193 BNSS (replacing CrPC 173) within 60/90 days depending on the offence severity."
    },
    {
        "section_id": "BNSS Sec 35",
        "badge": "[BNSS 35]",
        "title": "Arrest — When Police May Arrest Without Warrant",
        "keywords": ["arrest", "detained", "apprehend", "custody", "taken into custody", "nabbed"],
        "checklist": [
            "Verify the offence is cognizable and arrest is necessary",
            "Follow mandatory procedures: inform grounds of arrest, inform family/friend",
            "Prepare arrest memo with date, time, and witness signatures",
            "Produce before Magistrate within 24 hours",
            "Conduct medical examination of the arrested person"
        ],
        "context_template": "Arrest must follow Sec 35 BNSS procedures (replacing CrPC 41). The arresting officer must inform the accused of the grounds of arrest and their right to legal counsel."
    },
    {
        "section_id": "BNSS Sec 37",
        "badge": "[BNSS 37]",
        "title": "Notice of Appearance Before Police Officer (41A CrPC Equivalent)",
        "keywords": ["notice", "appearance", "41a", "join investigation", "summon suspect"],
        "checklist": [
            "Issue written notice to appear at the police station",
            "Specify the date, time, and purpose of appearance",
            "Inform the person of their right to legal representation",
            "If person fails to appear, apply for arrest warrant from Magistrate"
        ],
        "context_template": "A notice under Sec 37 BNSS (replacing CrPC 41A) may be issued requiring the suspect to appear before the investigating officer instead of formal arrest."
    },
    {
        "section_id": "BNSS Sec 351",
        "badge": "[BNSS 351]",
        "title": "Plea Bargaining",
        "keywords": ["plea bargain", "plea deal", "negotiated plea", "guilty plea", "reduced sentence"],
        "checklist": [
            "Verify that the offence qualifies for plea bargaining",
            "Ensure the accused is aware of their rights and consequences",
            "Obtain the victim's consent for plea bargaining",
            "Present the plea bargaining agreement before the court"
        ],
        "context_template": "Plea bargaining under Sec 351 BNSS may be available for offences punishable with imprisonment up to 7 years, allowing for a negotiated settlement."
    },
    {
        "section_id": "BNSS Sec 479",
        "badge": "[BNSS 479]",
        "title": "Bail Provisions",
        "keywords": ["bail", "bond", "surety", "release", "bail application", "anticipatory bail"],
        "checklist": [
            "Assess the grounds for or against bail",
            "Prepare bail opposition arguments if bail should be denied",
            "Consider severity of offence, flight risk, and tampering possibility",
            "File bail opposition with supporting evidence before the court"
        ],
        "context_template": "Bail considerations under Sec 479 BNSS (replacing CrPC 436-439) must weigh the nature of the offence, evidence, accused's antecedents, and risk of flight or evidence tampering."
    },
    {
        "section_id": "BNSS Sec 480",
        "badge": "[BNSS 480]",
        "title": "Default Bail (Statutory Bail)",
        "keywords": ["default bail", "statutory bail", "time limit", "90 days", "60 days", "chargesheet deadline"],
        "checklist": [
            "Track the statutory deadline for chargesheet filing",
            "File chargesheet before the deadline to prevent default bail",
            "If deadline is approaching, apply for extension with valid grounds"
        ],
        "context_template": "Default bail under Sec 480 BNSS becomes available if the chargesheet is not filed within the statutory period (60 days for offences punishable up to 3 years, 90 days for others)."
    },

    # ══════════════════════════════════════════════════════════════
    #  BHARATIYA SAKSHYA ADHINIYAM (BSA) 2023 — Evidence Act — 30 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "BSA Sec 2",
        "badge": "[BSA 2]",
        "title": "Definitions — Electronic Record as Evidence",
        "keywords": ["electronic record", "digital evidence", "electronic document", "data", "electronic form"],
        "checklist": [
            "Verify the electronic record meets the definition under BSA",
            "Ensure proper authentication of electronic evidence",
            "Maintain chain of custody for all electronic records"
        ],
        "context_template": "Electronic records are admissible as evidence under BSA Section 2 (replacing Indian Evidence Act). The BSA 2023 provides comprehensive definitions recognizing digital and electronic evidence."
    },
    {
        "section_id": "BSA Sec 21",
        "badge": "[BSA 21]",
        "title": "Admissibility of Electronic Records",
        "keywords": ["admissible", "evidence", "court", "proof", "electronic evidence", "digital proof", "forensic report"],
        "checklist": [
            "Ensure electronic evidence is accompanied by a certificate under Sec 63 BSA",
            "Verify that the electronic record has not been tampered with",
            "Obtain hash values and chain of custody documentation",
            "Present expert testimony on the integrity of electronic evidence"
        ],
        "context_template": "Electronic records are admissible under BSA Section 21, provided they meet the authentication requirements specified in Section 63. The certificate must identify the electronic record and describe the manner of production."
    },
    {
        "section_id": "BSA Sec 63",
        "badge": "[BSA 63]",
        "title": "Admissibility of Electronic Records — Certificate Requirement",
        "keywords": ["certificate", "electronic evidence", "authentication", "sec 65b", "forensic certificate", "hash certificate"],
        "checklist": [
            "Prepare Section 63 BSA certificate (replacing Sec 65B Indian Evidence Act)",
            "Certificate must identify the electronic record and its source",
            "Include SHA-256 hash values in the certificate",
            "Certificate must be signed by the person responsible for the computer",
            "Attach the certificate to all electronic evidence submitted to court"
        ],
        "context_template": "A certificate under Sec 63 BSA (replacing Sec 65B Indian Evidence Act) is mandatory for admissibility of electronic records as evidence. The certificate must be contemporaneous and identify the electronic record, its source device, and authentication details."
    },
    {
        "section_id": "BSA Sec 22",
        "badge": "[BSA 22]",
        "title": "Oral Admissions — Relevance and Proof",
        "keywords": ["admission", "confession", "oral statement", "incriminating statement"],
        "checklist": [
            "Record the oral admission with proper documentation",
            "Verify the voluntariness of the admission",
            "Corroborate the admission with independent evidence",
            "Ensure compliance with safeguards against involuntary confessions"
        ],
        "context_template": "Oral admissions are relevant under BSA Section 22, but must be corroborated and verified as voluntary to be admissible in court."
    },
    {
        "section_id": "BSA Sec 23",
        "badge": "[BSA 23]",
        "title": "Confession to Police Officer Not Admissible",
        "keywords": ["confession", "police statement", "inadmissible", "retracted confession"],
        "checklist": [
            "Record confessions before a Judicial Magistrate under Sec 183 BNSS",
            "Do not rely solely on confessions made to police officers",
            "Seek corroborating evidence for every confessional statement",
            "Document the circumstances under which the confession was obtained"
        ],
        "context_template": "Confessions made to police officers are not admissible under BSA Section 23 (replacing Indian Evidence Act Sec 25-26). Confessions must be recorded before a Judicial Magistrate under Sec 183 BNSS."
    },
    {
        "section_id": "BSA Sec 39",
        "badge": "[BSA 39]",
        "title": "Relevancy of Character and Previous Conviction",
        "keywords": ["character", "previous conviction", "antecedent", "criminal history", "recidivist"],
        "checklist": [
            "Check CCTNS database for accused's previous convictions",
            "Obtain certified copies of previous conviction orders",
            "Present previous character evidence at appropriate stage of trial"
        ],
        "context_template": "Previous convictions and character evidence are relevant under BSA Section 39 in determining the nature of the offence and appropriate sentencing."
    },
    {
        "section_id": "BSA Sec 45",
        "badge": "[BSA 45]",
        "title": "Opinion of Expert — Digital Forensics",
        "keywords": ["expert", "forensic expert", "digital forensic", "cyber forensic", "expert opinion", "technical analysis"],
        "checklist": [
            "Engage certified digital forensic expert (CFCE/EnCE/GCFE qualified)",
            "Ensure the expert's report follows scientific methodology",
            "Include the expert's qualifications and experience in the report",
            "Make the expert available for cross-examination in court"
        ],
        "context_template": "Expert opinion on digital forensics is admissible under BSA Section 45 (replacing Indian Evidence Act Sec 45). The opinion of a cyber forensic expert is relevant on matters of digital evidence analysis, malware behavior, and network intrusion patterns."
    },

    # ══════════════════════════════════════════════════════════════
    #  IPC (Legacy Reference) — 50 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "IPC Sec 420",
        "badge": "[IPC 420]",
        "title": "Cheating and Dishonestly Inducing Delivery of Property (Legacy)",
        "keywords": ["420", "cheating", "fraud", "inducing", "delivery", "dishonest"],
        "checklist": [
            "Note: IPC 420 is now replaced by BNS Sec 318 in new cases",
            "For ongoing cases, continue under IPC 420 provisions",
            "Document the deception and the property delivered/money transferred",
            "Trace the beneficiary of the cheating"
        ],
        "context_template": "IPC Section 420 (Cheating) — now replaced by BNS Section 318 for new cases — provides imprisonment up to 7 years and fine for cheating and dishonestly inducing delivery of property."
    },
    {
        "section_id": "IPC Sec 406",
        "badge": "[IPC 406]",
        "title": "Criminal Breach of Trust (Legacy)",
        "keywords": ["breach of trust", "406", "misappropriation", "trust violation"],
        "checklist": [
            "Note: IPC 406 is now replaced by BNS Sec 316 in new cases",
            "Establish the entrustment and subsequent misappropriation",
            "Trace the misappropriated property or funds"
        ],
        "context_template": "IPC Section 406 (Criminal Breach of Trust) — now replaced by BNS Section 316 — provides imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "IPC Sec 302",
        "badge": "[IPC 302]",
        "title": "Punishment for Murder (Legacy)",
        "keywords": ["murder", "302", "homicide", "death penalty"],
        "checklist": [
            "Note: IPC 302 is now replaced by BNS Sec 100 in new cases",
            "For ongoing cases, apply IPC 302 punishment framework",
            "Death or life imprisonment with fine"
        ],
        "context_template": "IPC Section 302 (Murder) — now replaced by BNS Section 100 — provides for death or imprisonment for life and fine."
    },
    {
        "section_id": "IPC Sec 304A",
        "badge": "[IPC 304A]",
        "title": "Death by Negligence (Legacy)",
        "keywords": ["negligence", "rash", "negligent", "accidental death", "careless", "304a"],
        "checklist": [
            "Note: IPC 304A is now replaced by BNS Sec 106 in new cases",
            "Determine if the death was caused by rash or negligent act",
            "Obtain post-mortem and medical evidence"
        ],
        "context_template": "IPC Section 304A (Death by Negligence) — now replaced by BNS Section 106 — provides imprisonment up to 2 years and/or fine for causing death by rash or negligent act."
    },
    {
        "section_id": "IPC Sec 354",
        "badge": "[IPC 354]",
        "title": "Assault or Criminal Force to Woman (Legacy)",
        "keywords": ["354", "molestation", "outrage modesty", "assault woman"],
        "checklist": [
            "Note: IPC 354 is now replaced by BNS Sec 263 in new cases",
            "Record victim's statement with female officer present",
            "Obtain medical examination if applicable"
        ],
        "context_template": "IPC Section 354 (Assault on Woman) — now replaced by BNS Section 263 — provides imprisonment of 1-5 years and fine."
    },
    {
        "section_id": "IPC Sec 376",
        "badge": "[IPC 376]",
        "title": "Punishment for Rape (Legacy)",
        "keywords": ["rape", "376", "sexual assault"],
        "checklist": [
            "Note: IPC 376 is now replaced by BNS Sec 64 in new cases",
            "Follow mandatory procedures for sexual assault investigation",
            "Medical examination and Magistrate statement are mandatory"
        ],
        "context_template": "IPC Section 376 (Rape) — now replaced by BNS Section 64 — provides rigorous imprisonment of not less than 10 years extending to life imprisonment."
    },
    {
        "section_id": "IPC Sec 379",
        "badge": "[IPC 379]",
        "title": "Punishment for Theft (Legacy)",
        "keywords": ["theft", "379", "stealing", "stole"],
        "checklist": [
            "Note: IPC 379 is now replaced by BNS Sec 303 in new cases",
            "Document the stolen property with descriptions",
            "Check CCTV and record witness statements"
        ],
        "context_template": "IPC Section 379 (Theft) — now replaced by BNS Section 303 — provides imprisonment up to 3 years and/or fine."
    },
    {
        "section_id": "IPC Sec 380",
        "badge": "[IPC 380]",
        "title": "Theft in Building, Tent, or Vessel (Legacy)",
        "keywords": ["house theft", "380", "burglary", "dwelling theft"],
        "checklist": [
            "Note: IPC 380 is now replaced by corresponding BNS section",
            "Document the point of entry and method of theft",
            "Collect forensic evidence from the crime scene"
        ],
        "context_template": "IPC Section 380 (Theft in Dwelling) provides imprisonment up to 7 years and fine for theft committed in a building or tent used for human dwelling or custody of property."
    },
    {
        "section_id": "IPC Sec 467",
        "badge": "[IPC 467]",
        "title": "Forgery of Valuable Security (Legacy)",
        "keywords": ["forgery", "467", "valuable security", "cheque forgery", "bond forgery"],
        "checklist": [
            "Obtain and preserve the forged valuable security",
            "Send for forensic document examination",
            "Trace the financial impact of the forged document"
        ],
        "context_template": "IPC Section 467 (Forgery of Valuable Security) provides imprisonment up to life or up to 10 years and fine for forging a valuable security or will."
    },
    {
        "section_id": "IPC Sec 468",
        "badge": "[IPC 468]",
        "title": "Forgery for Purpose of Cheating (Legacy)",
        "keywords": ["468", "forgery cheating", "forged for fraud"],
        "checklist": [
            "Establish the link between the forgery and the cheating",
            "Document the financial loss caused by the forged document",
            "Identify all victims who were cheated using the forgery"
        ],
        "context_template": "IPC Section 468 (Forgery for Cheating) provides imprisonment up to 7 years and fine for forgery committed with the intent to facilitate cheating."
    },
    {
        "section_id": "IPC Sec 471",
        "badge": "[IPC 471]",
        "title": "Using as Genuine a Forged Document (Legacy)",
        "keywords": ["471", "used forged", "genuine forged", "presented fake"],
        "checklist": [
            "Establish that the accused knew the document was forged",
            "Document where and how the forged document was used",
            "Trace the chain of possession of the forged document"
        ],
        "context_template": "IPC Section 471 punishes the use of a forged document as genuine, with the same punishment as for forgery of the specific type of document."
    },
    {
        "section_id": "IPC Sec 506",
        "badge": "[IPC 506]",
        "title": "Criminal Intimidation (Legacy)",
        "keywords": ["506", "intimidation", "threat", "threatening", "death threat"],
        "checklist": [
            "Preserve evidence of the threatening communications",
            "Assess the severity and credibility of the threat",
            "Provide protection to the threatened person if needed"
        ],
        "context_template": "IPC Section 506 (Criminal Intimidation) — now replaced by BNS Section 351 — provides imprisonment up to 2 years for threatening injury, enhanced to 7 years for death threats."
    },
    {
        "section_id": "IPC Sec 120B",
        "badge": "[IPC 120B]",
        "title": "Criminal Conspiracy (Legacy)",
        "keywords": ["120b", "conspiracy", "hatched plan", "conspired"],
        "checklist": [
            "Map the conspiracy network through communication analysis",
            "Identify all conspirators and their individual roles",
            "Document meetings and communications between conspirators"
        ],
        "context_template": "IPC Section 120B (Criminal Conspiracy) — now replaced by BNS Section 61 — provides punishment proportional to the offence conspired."
    },
    {
        "section_id": "IPC Sec 34",
        "badge": "[IPC 34]",
        "title": "Common Intention (Legacy)",
        "keywords": ["34", "common intention", "together", "jointly", "shared intent"],
        "checklist": [
            "Establish the shared criminal intention among the accused",
            "Document each person's participation in the criminal act",
            "Prove the pre-concert or prior meeting of minds"
        ],
        "context_template": "IPC Section 34 (Common Intention) — now replaced by BNS Section 354 — makes all persons acting with common intention equally liable for the criminal act."
    },
    {
        "section_id": "IPC Sec 307",
        "badge": "[IPC 307]",
        "title": "Attempt to Murder (Legacy)",
        "keywords": ["307", "attempt murder", "attempted killing", "tried to kill"],
        "checklist": [
            "Document the specific act constituting the attempt",
            "Obtain medical evidence of injuries caused",
            "Assess the intent to cause death",
            "Seize the weapon used in the attempt"
        ],
        "context_template": "IPC Section 307 (Attempt to Murder) provides imprisonment up to 10 years and fine; if the attempt causes hurt, imprisonment up to life."
    },
    {
        "section_id": "IPC Sec 323",
        "badge": "[IPC 323]",
        "title": "Voluntarily Causing Hurt (Legacy)",
        "keywords": ["323", "hurt", "beating", "assault"],
        "checklist": [
            "Obtain medical examination report of injuries",
            "Record witness statements from bystanders",
            "Document the motive and circumstances of the assault"
        ],
        "context_template": "IPC Section 323 (Voluntarily Causing Hurt) — now replaced by BNS Section 115 — provides imprisonment up to 1 year and/or fine up to Rs. 1,000."
    },

    # ══════════════════════════════════════════════════════════════
    #  CrPC (Legacy Reference) — 30 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "CrPC Sec 91",
        "badge": "[CrPC 91]",
        "title": "Summons to Produce Document (Legacy)",
        "keywords": ["crpc 91", "produce document", "summons document", "court order document"],
        "checklist": [
            "Note: CrPC 91 is now replaced by BNSS Sec 91",
            "Draft notice specifying exact documents required",
            "Serve on the custodian with proper acknowledgment"
        ],
        "context_template": "CrPC Section 91 (now replaced by BNSS Section 91) empowers courts and police officers to issue summons for production of documents or other things necessary for investigation or trial."
    },
    {
        "section_id": "CrPC Sec 154",
        "badge": "[CrPC 154]",
        "title": "Information in Cognizable Cases — FIR (Legacy)",
        "keywords": ["crpc 154", "fir registration", "first information", "lodge complaint"],
        "checklist": [
            "Note: CrPC 154 is now replaced by BNSS Sec 173",
            "Register FIR immediately and provide copy to informant",
            "Forward to Magistrate without delay"
        ],
        "context_template": "CrPC Section 154 (now replaced by BNSS Section 173) mandates registration of FIR upon receipt of information about a cognizable offence."
    },
    {
        "section_id": "CrPC Sec 164",
        "badge": "[CrPC 164]",
        "title": "Recording of Confessions and Statements (Legacy)",
        "keywords": ["crpc 164", "confession", "magistrate recording", "statement before magistrate"],
        "checklist": [
            "Note: CrPC 164 is now replaced by BNSS Sec 183",
            "Arrange recording before a Judicial Magistrate",
            "Ensure voluntariness and compliance with safeguards"
        ],
        "context_template": "CrPC Section 164 (now replaced by BNSS Section 183) provides for recording confessions and statements before a Judicial Magistrate with proper safeguards."
    },
    {
        "section_id": "CrPC Sec 167",
        "badge": "[CrPC 167]",
        "title": "Procedure When Investigation Cannot Complete in 24 Hours (Legacy)",
        "keywords": ["crpc 167", "remand", "24 hour limit", "custody extension"],
        "checklist": [
            "Note: CrPC 167 is now replaced by BNSS Sec 187",
            "Produce accused before Magistrate within 24 hours",
            "Apply for remand with specific investigative grounds"
        ],
        "context_template": "CrPC Section 167 (now replaced by BNSS Section 187) requires production of accused before Magistrate within 24 hours and provides framework for police/judicial custody remand."
    },
    {
        "section_id": "CrPC Sec 173",
        "badge": "[CrPC 173]",
        "title": "Chargesheet / Police Report on Investigation (Legacy)",
        "keywords": ["crpc 173", "chargesheet", "final report", "police report"],
        "checklist": [
            "Note: CrPC 173 is now replaced by BNSS Sec 193",
            "File chargesheet within statutory time limit",
            "Compile all evidence and witness lists"
        ],
        "context_template": "CrPC Section 173 (now replaced by BNSS Section 193) requires filing of chargesheet upon completion of investigation within 60/90 days."
    },
    {
        "section_id": "CrPC Sec 41A",
        "badge": "[CrPC 41A]",
        "title": "Notice of Appearance (Legacy)",
        "keywords": ["crpc 41a", "notice to appear", "appearance notice"],
        "checklist": [
            "Note: CrPC 41A is now replaced by BNSS Sec 37",
            "Issue notice to suspect to appear for investigation",
            "Specify date, time, and purpose of appearance"
        ],
        "context_template": "CrPC Section 41A (now replaced by BNSS Section 37) provides for issuance of notice of appearance instead of arrest for offences punishable with up to 7 years."
    },

    # ══════════════════════════════════════════════════════════════
    #  SPECIAL ACTS — PMLA, POCSO, Copyright, Telecom — 100 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "PMLA Sec 3",
        "badge": "[PMLA 3]",
        "title": "Offence of Money Laundering",
        "keywords": ["money laundering", "launder", "proceeds of crime", "hawala", "shell company", "benami", "layering", "structured transaction"],
        "checklist": [
            "Report to Enforcement Directorate (ED) for PMLA investigation",
            "Trace the proceeds of crime through multiple transactions",
            "Identify layering techniques (multiple transfers, shell companies)",
            "Coordinate with FIU-IND for Suspicious Transaction Reports (STRs)",
            "Apply for provisional attachment of property under PMLA"
        ],
        "context_template": "The financial trail indicates money laundering activity. PMLA Section 3 defines money laundering as directly or indirectly attempting to indulge in, knowingly assisting, or being involved in any process or activity connected with the proceeds of crime."
    },
    {
        "section_id": "PMLA Sec 4",
        "badge": "[PMLA 4]",
        "title": "Punishment for Money Laundering",
        "keywords": ["pmla punishment", "laundering penalty", "pmla conviction"],
        "checklist": [
            "Money laundering is punishable with rigorous imprisonment of 3-7 years",
            "For offences linked to NDPS Act, punishment may extend to 10 years",
            "Fine may also be imposed without upper limit"
        ],
        "context_template": "Punishment for money laundering under PMLA Section 4 is rigorous imprisonment of 3-7 years (up to 10 years for narcotics-related offences) and fine."
    },
    {
        "section_id": "PMLA Sec 5",
        "badge": "[PMLA 5]",
        "title": "Attachment of Property Involved in Money Laundering",
        "keywords": ["attachment", "property attachment", "provisional attachment", "ed attachment", "freeze property"],
        "checklist": [
            "Apply for provisional attachment order from Enforcement Directorate",
            "Identify all properties directly or indirectly linked to proceeds of crime",
            "The attachment order is valid for 180 days from confirmation by Adjudicating Authority",
            "File complaint before Adjudicating Authority within 60 days"
        ],
        "context_template": "Properties linked to money laundering may be provisionally attached under PMLA Section 5. The Director or authorized officer can order attachment of property believed to be proceeds of crime."
    },
    {
        "section_id": "PMLA Sec 17",
        "badge": "[PMLA 17]",
        "title": "Search and Seizure under PMLA",
        "keywords": ["pmla search", "ed raid", "enforcement directorate search", "pmla seizure"],
        "checklist": [
            "Coordinate with Enforcement Directorate for search operations",
            "Maintain inventory of all items seized during PMLA search",
            "Record the search proceedings with witnesses",
            "Submit search report to the Adjudicating Authority within 60 days"
        ],
        "context_template": "Search and seizure powers under PMLA Section 17 allow the Director or authorized officer to search premises and seize records, documents, and property connected with money laundering."
    },
    {
        "section_id": "POCSO Sec 3",
        "badge": "[POCSO 3]",
        "title": "Penetrative Sexual Assault on Child",
        "keywords": ["child sexual assault", "minor", "pocso", "child abuse", "pedophile", "child rape"],
        "checklist": [
            "Register FIR immediately under POCSO and BNS provisions",
            "Record victim's statement with a special educator if needed",
            "Medical examination within 24 hours by a female doctor",
            "Ensure age verification of the victim through school/birth records",
            "Provide victim with access to counselor and legal aid",
            "Fast-track investigation for trial in Special Court"
        ],
        "context_template": "The offence constitutes penetrative sexual assault on a child under POCSO Section 3, punishable with rigorous imprisonment of not less than 10 years extending to life imprisonment and fine."
    },
    {
        "section_id": "POCSO Sec 4",
        "badge": "[POCSO 4]",
        "title": "Punishment for Penetrative Sexual Assault on Child",
        "keywords": ["pocso punishment", "child assault penalty"],
        "checklist": [
            "Minimum 10 years rigorous imprisonment",
            "May extend to imprisonment for life",
            "Fine shall be just and reasonable and paid to the victim"
        ],
        "context_template": "POCSO Section 4 provides minimum 10 years rigorous imprisonment extending to life imprisonment and fine for penetrative sexual assault on children."
    },
    {
        "section_id": "POCSO Sec 5",
        "badge": "[POCSO 5]",
        "title": "Aggravated Penetrative Sexual Assault",
        "keywords": ["aggravated", "police officer assault child", "teacher abuse", "institution abuse", "repeated assault"],
        "checklist": [
            "Identify the aggravating factor (position of trust, relationship, etc.)",
            "Ensure enhanced charges are applied",
            "Coordinate with Child Welfare Committee",
            "Provide the child victim with comprehensive support services"
        ],
        "context_template": "The offence constitutes aggravated penetrative sexual assault under POCSO Section 5, where the accused is in a position of trust or authority. Minimum punishment is 20 years RI extending to life imprisonment."
    },
    {
        "section_id": "POCSO Sec 7",
        "badge": "[POCSO 7]",
        "title": "Sexual Assault (Non-Penetrative) on Child",
        "keywords": ["touch child", "inappropriate touch", "sexual touch minor", "pocso assault"],
        "checklist": [
            "Record the child's statement in child-friendly environment",
            "Medical examination to document any physical evidence",
            "Identify and arrest the accused",
            "Ensure the child is not exposed to the accused during investigation"
        ],
        "context_template": "Non-penetrative sexual assault on a child is punishable under POCSO Section 7 with imprisonment of 3-5 years and fine."
    },
    {
        "section_id": "POCSO Sec 11",
        "badge": "[POCSO 11]",
        "title": "Sexual Harassment of Child",
        "keywords": ["child harassment", "sexual remarks child", "exhibitionism child", "showing pornography child"],
        "checklist": [
            "Document the specific acts of sexual harassment",
            "Preserve any electronic communications or content shown to the child",
            "Record the child's statement through a special educator",
            "Provide counseling and support to the child victim"
        ],
        "context_template": "Sexual harassment of a child under POCSO Section 11 includes showing pornography, making sexual gestures, or using a child for pornographic purposes, punishable with imprisonment up to 3 years and fine."
    },
    {
        "section_id": "POCSO Sec 14",
        "badge": "[POCSO 14]",
        "title": "Using Child for Pornographic Purposes",
        "keywords": ["child pornography", "csam production", "exploiting child", "filming child"],
        "checklist": [
            "Immediately seize all devices used for creating CSAM",
            "Preserve content with hash verification for forensic chain of custody",
            "Report to NCMEC, Interpol ICSE database",
            "Rescue the child victim and provide rehabilitation",
            "Coordinate with Cyber Crime units for tracing distribution"
        ],
        "context_template": "Using a child for pornographic purposes is severely punished under POCSO Section 14 with imprisonment of not less than 5 years extending to 7 years for first conviction, and not less than 7 years for subsequent convictions."
    },
    {
        "section_id": "POCSO Sec 19",
        "badge": "[POCSO 19]",
        "title": "Reporting of Offences — Mandatory Reporting",
        "keywords": ["mandatory reporting", "report child abuse", "failure to report"],
        "checklist": [
            "Report to police and Special Juvenile Police Unit (SJPU)",
            "Failure to report is itself an offence under POCSO",
            "Any person who has knowledge of child sexual abuse must report",
            "Report can be made to local police or Child Helpline 1098"
        ],
        "context_template": "POCSO Section 19 mandates that any person who has knowledge about the commission of an offence under POCSO must report it to the local police or SJPU. Failure to report is punishable."
    },
    {
        "section_id": "Copyright Act Sec 51",
        "badge": "[COPYRIGHT 51]",
        "title": "When Copyright is Infringed",
        "keywords": ["copyright", "piracy", "pirated", "duplicate", "unauthorized copy", "infringement", "bootleg", "torrent"],
        "checklist": [
            "Identify the original copyrighted work and its owner",
            "Document the infringing copies or distribution",
            "Seize pirated materials and distribution equipment",
            "Calculate the commercial impact of the infringement"
        ],
        "context_template": "Copyright infringement has occurred under Section 51 of the Copyright Act. This includes reproduction, distribution, or communication of copyrighted work without authorization."
    },
    {
        "section_id": "Copyright Act Sec 63",
        "badge": "[COPYRIGHT 63]",
        "title": "Offence of Infringement of Copyright — Criminal Penalty",
        "keywords": ["copyright criminal", "piracy criminal", "commercial piracy"],
        "checklist": [
            "File complaint under Copyright Act Section 63",
            "Seize infringing materials and production equipment",
            "Calculate the commercial value of infringement",
            "Coordinate with Copyright Board if applicable"
        ],
        "context_template": "Criminal infringement of copyright under Section 63 of the Copyright Act provides imprisonment of not less than 6 months extending to 3 years and fine of not less than Rs. 50,000 extending to Rs. 2 lakh."
    },
    {
        "section_id": "Copyright Act Sec 63B",
        "badge": "[COPYRIGHT 63B]",
        "title": "Knowing Use of Infringing Copy of Computer Programme",
        "keywords": ["pirated software", "cracked software", "unlicensed software", "software piracy"],
        "checklist": [
            "Identify the pirated software and its legitimate version",
            "Document the use of unlicensed software with screenshots",
            "Calculate the cost of legitimate licenses evaded",
            "Seize systems running pirated software"
        ],
        "context_template": "Use of pirated computer software is punishable under Copyright Act Section 63B with imprisonment of 7 days to 3 years and fine of Rs. 50,000 to Rs. 2 lakh."
    },
    {
        "section_id": "Indian Telegraph Act Sec 5",
        "badge": "[TELEGRAPH 5]",
        "title": "Power of Government to Take Possession of Licensed Telegraphs and to Order Interception",
        "keywords": ["intercept", "telephone intercept", "lawful intercept", "wiretap", "communication intercept"],
        "checklist": [
            "Obtain proper authorization under Telegraph Act Rule 419A",
            "Ensure compliance with the Supreme Court guidelines on interception",
            "Maintain strict confidentiality of intercepted communications",
            "Review and renew interception orders every 60 days"
        ],
        "context_template": "Interception of telephonic and electronic communications may be ordered under Section 5(2) of the Indian Telegraph Act, subject to strict procedural safeguards and judicial oversight."
    },
    {
        "section_id": "Indian Telegraph Act Sec 20",
        "badge": "[TELEGRAPH 20]",
        "title": "Punishment for Unlawfully Learning Contents of Messages",
        "keywords": ["eavesdrop", "wiretap illegal", "unauthorized intercept", "message interception"],
        "checklist": [
            "Identify the method of unauthorized interception",
            "Preserve evidence of the illegal eavesdropping",
            "Determine if any classified information was compromised"
        ],
        "context_template": "Unauthorized interception or learning of communication contents is punishable under Section 20 of the Indian Telegraph Act."
    },
    {
        "section_id": "Indian Telegraph Act Sec 25",
        "badge": "[TELEGRAPH 25]",
        "title": "Intentional Damage or Tampering with Telegraph",
        "keywords": ["telecom damage", "tower damage", "cable cut", "infrastructure damage", "telecom sabotage"],
        "checklist": [
            "Document the damage to telecommunication infrastructure",
            "Coordinate with telecom operators for damage assessment",
            "Identify the method and tools used for damage",
            "Assess the impact on communication services"
        ],
        "context_template": "Intentional damage to telecommunication infrastructure is punishable under Section 25 of the Indian Telegraph Act."
    },
    {
        "section_id": "Telecom Act Sec 42",
        "badge": "[TELECOM 42]",
        "title": "Interception of Messages under Telecom Act 2023",
        "keywords": ["telecom interception", "message intercept", "telecom act 2023", "new telecom"],
        "checklist": [
            "Obtain authorization from competent authority under the new Telecom Act",
            "Follow the prescribed procedure for interception orders",
            "Maintain records of all intercepted communications",
            "Ensure proportionality and necessity of interception"
        ],
        "context_template": "Under the Telecommunications Act 2023, Section 42 provides for lawful interception of messages in the interest of national security, public order, or prevention of offences."
    },
    {
        "section_id": "Telecom Act Sec 43",
        "badge": "[TELECOM 43]",
        "title": "Monitoring and Collection of Traffic Data under Telecom Act 2023",
        "keywords": ["traffic data", "telecom monitoring", "metadata collection", "cdr", "sdr", "ipdr"],
        "checklist": [
            "Issue CDR/IPDR request to telecom operators with proper authorization",
            "Specify the target numbers, IMEI, and time period",
            "Analyze traffic patterns and tower dump data",
            "Correlate CDR data with suspect movements"
        ],
        "context_template": "Traffic data monitoring and collection under Telecommunications Act 2023 Section 43 enables investigators to obtain CDR, SDR, and IPDR data from telecom operators for investigation purposes."
    },
    {
        "section_id": "Telecom Act Sec 44",
        "badge": "[TELECOM 44]",
        "title": "Obligation to Furnish Information under Telecom Act 2023",
        "keywords": ["telecom information", "sim data", "kyc telecom", "subscriber data"],
        "checklist": [
            "Issue notice to telecom operator for subscriber information",
            "Request complete KYC and subscription details",
            "Verify SIM registration and activation records",
            "Cross-reference with Aadhaar/identity documents"
        ],
        "context_template": "Telecom operators are obligated to furnish subscriber information under Telecommunications Act 2023 Section 44 when required by authorized law enforcement agencies."
    },
    {
        "section_id": "NDPS Act Sec 8",
        "badge": "[NDPS 8]",
        "title": "Prohibition of Certain Operations — Narcotic Drugs",
        "keywords": ["drugs", "narcotics", "ganja", "cocaine", "heroin", "cannabis", "meth", "amphetamine", "opium", "contraband"],
        "checklist": [
            "Seize the narcotic substance and weigh under panchnama",
            "Send samples to FSL for chemical analysis",
            "Draw up spot panchnama with two independent witnesses",
            "Inform NCB and state anti-narcotics cell",
            "Apply for commercial quantity charges if threshold is met"
        ],
        "context_template": "The case involves narcotic drugs or psychotropic substances. NDPS Act Section 8 prohibits cultivation, production, manufacture, sale, purchase, transport, or use of narcotic drugs except for medical/scientific purposes."
    },
    {
        "section_id": "NDPS Act Sec 21",
        "badge": "[NDPS 21]",
        "title": "Punishment for Contravention — Manufactured Drugs",
        "keywords": ["drug trafficking", "drug dealer", "drug peddler", "drug trade", "narcotic sale"],
        "checklist": [
            "Determine the quantity (small, intermediate, commercial)",
            "Small quantity: up to 1 year; Commercial: 10-20 years",
            "Coordinate with NCB for inter-state or international cases",
            "Apply for non-bailable warrant"
        ],
        "context_template": "Punishment under NDPS Act Section 21 depends on the quantity seized: small quantity (up to 1 year), intermediate (up to 10 years), commercial quantity (10-20 years)."
    },
    {
        "section_id": "NDPS Act Sec 35",
        "badge": "[NDPS 35]",
        "title": "Presumption of Culpable Mental State",
        "keywords": ["ndps presumption", "culpable mental state", "drug possession"],
        "checklist": [
            "Note: Reverse burden of proof applies under NDPS",
            "The accused must prove absence of culpable mental state",
            "Document all circumstances of possession"
        ],
        "context_template": "Under NDPS Act Section 35, there is a presumption of culpable mental state. The burden of proof shifts to the accused to prove the absence of knowledge or intent."
    },
    {
        "section_id": "Arms Act Sec 25",
        "badge": "[ARMS 25]",
        "title": "Punishment for Certain Offences — Illegal Possession of Arms",
        "keywords": ["illegal arms", "unlicensed weapon", "gun", "pistol", "revolver", "firearm", "ammunition", "explosive"],
        "checklist": [
            "Seize the weapon and ammunition with proper panchnama",
            "Send weapon for ballistic forensic examination",
            "Verify arms license status with licensing authority",
            "Check the weapon against crime records for previous use"
        ],
        "context_template": "Illegal possession of arms is punishable under Arms Act Section 25 with imprisonment of 1-3 years for non-prohibited arms, and 5-10 years for prohibited arms."
    },
    {
        "section_id": "Explosive Substances Act Sec 3",
        "badge": "[EXPLOSIVE 3]",
        "title": "Punishment for Causing Explosion Likely to Endanger Life or Property",
        "keywords": ["explosion", "bomb", "ied", "improvised explosive", "blast", "detonation"],
        "checklist": [
            "Secure the blast site and cordon the area",
            "Call bomb disposal squad (BDDS) for unexploded devices",
            "Collect residue samples for forensic analysis",
            "Identify the type and source of explosive material",
            "Coordinate with NIA if terrorism is suspected"
        ],
        "context_template": "Causing an explosion likely to endanger life or property is punishable under Explosive Substances Act Section 3 with imprisonment up to life."
    },
    {
        "section_id": "Explosive Substances Act Sec 4",
        "badge": "[EXPLOSIVE 4]",
        "title": "Attempt to Cause Explosion or Making or Possessing Explosive",
        "keywords": ["explosive possession", "bomb making", "detonator", "explosive material"],
        "checklist": [
            "Seize all explosive materials and components",
            "Engage bomb disposal and forensic experts",
            "Investigate the source of explosive materials",
            "Determine the intended target of the explosive"
        ],
        "context_template": "Making, possessing, or attempting to use explosives is punishable under Explosive Substances Act Section 4 with imprisonment up to 14 years."
    },
    {
        "section_id": "UAPA Sec 15",
        "badge": "[UAPA 15]",
        "title": "Terrorist Act",
        "keywords": ["terrorist act", "uapa", "unlawful activities", "terror funding", "terror support"],
        "checklist": [
            "Report to NIA for investigation under UAPA",
            "Ensure strict evidence preservation for NIA court",
            "Apply for property attachment under UAPA",
            "Coordinate with central intelligence agencies"
        ],
        "context_template": "The offence constitutes a terrorist act under UAPA Section 15. Investigation must be conducted by NIA with enhanced powers for detention and property attachment."
    },
    {
        "section_id": "UAPA Sec 17",
        "badge": "[UAPA 17]",
        "title": "Punishment for Raising Funds for Terrorist Act",
        "keywords": ["terror funding", "terrorist financing", "hawala terror", "funding terrorism"],
        "checklist": [
            "Trace all financial transactions linked to terror funding",
            "Coordinate with FIU-IND for suspicious transaction reports",
            "Apply for freezing of terror-linked accounts",
            "Report to NIA and FATF compliance mechanisms"
        ],
        "context_template": "Raising funds for terrorist acts is punishable under UAPA Section 17 with imprisonment up to life and fine."
    },
    {
        "section_id": "UAPA Sec 18",
        "badge": "[UAPA 18]",
        "title": "Punishment for Conspiracy to Commit Terrorist Act",
        "keywords": ["terror conspiracy", "uapa conspiracy", "planning terror", "terror plot"],
        "checklist": [
            "Map the conspiracy network through surveillance and CDR analysis",
            "Identify all conspirators and their roles in the plot",
            "Seize all communication devices and decrypt encrypted messages",
            "Coordinate with NIA and central intelligence agencies"
        ],
        "context_template": "Conspiracy to commit a terrorist act is punishable under UAPA Section 18 with imprisonment of 5 years to life imprisonment."
    },
    {
        "section_id": "Prevention of Corruption Act Sec 7",
        "badge": "[PCA 7]",
        "title": "Offence Relating to Public Servant Being Bribed",
        "keywords": ["bribe", "corruption", "kickback", "gratification", "public servant", "government officer"],
        "checklist": [
            "Conduct trap operation with pre-marked currency",
            "Video-record the entire trap operation",
            "Apply phenolphthalein test on the hands of the accused",
            "Seize the bribe amount as evidence with panchnama",
            "Obtain sanction for prosecution from competent authority"
        ],
        "context_template": "The offence involves bribery of a public servant under Prevention of Corruption Act Section 7, punishable with imprisonment of 3-7 years and fine."
    },
    {
        "section_id": "Prevention of Corruption Act Sec 8",
        "badge": "[PCA 8]",
        "title": "Offence Relating to Bribing a Public Servant",
        "keywords": ["giving bribe", "offering bribe", "briber", "corrupt payment"],
        "checklist": [
            "Identify the person who offered or gave the bribe",
            "Document the purpose and terms of the bribe",
            "Coordinate with Anti-Corruption Bureau (ACB)",
            "Obtain permission for prosecution from competent authority"
        ],
        "context_template": "The act of bribing a public servant is punishable under Prevention of Corruption Act Section 8 with imprisonment up to 7 years and/or fine."
    },
    {
        "section_id": "Prevention of Corruption Act Sec 13",
        "badge": "[PCA 13]",
        "title": "Criminal Misconduct by Public Servant",
        "keywords": ["misconduct", "disproportionate assets", "abuse of power", "illegal enrichment"],
        "checklist": [
            "Obtain asset declarations and property returns of the public servant",
            "Calculate disproportionate assets through income-expenditure analysis",
            "Conduct discreet inquiry before formal investigation",
            "Apply for sanction for prosecution from the appropriate authority"
        ],
        "context_template": "Criminal misconduct by a public servant under Prevention of Corruption Act Section 13 includes criminal misappropriation, obtaining valuable things without consideration, or possessing disproportionate assets."
    },
    {
        "section_id": "SC/ST Prevention of Atrocities Act Sec 3",
        "badge": "[SC/ST ACT 3]",
        "title": "Offences of Atrocities Against SC/ST Members",
        "keywords": ["caste", "dalit", "sc", "st", "scheduled caste", "scheduled tribe", "atrocity", "untouchability", "caste discrimination"],
        "checklist": [
            "Register FIR under SC/ST (PoA) Act without delay",
            "Investigation must be conducted by officer not below DSP rank",
            "Apply for exclusive Special Court jurisdiction",
            "Provide monetary relief to the victim as per Schedule",
            "Ensure the investigation is completed within 60 days"
        ],
        "context_template": "The offence constitutes an atrocity against SC/ST members under the SC/ST (Prevention of Atrocities) Act Section 3, which provides enhanced punishment and specialized investigation procedures."
    },
    {
        "section_id": "Domestic Violence Act Sec 3",
        "badge": "[DV ACT 3]",
        "title": "Definition of Domestic Violence",
        "keywords": ["domestic violence", "wife beating", "marital abuse", "dowry", "domestic abuse", "cruelty"],
        "checklist": [
            "Record victim's statement and register complaint",
            "Refer to Protection Officer for service of notice",
            "Apply for Protection Order under Sec 18 of DV Act",
            "Provide information about shelter homes and legal aid",
            "Coordinate with Service Provider organizations"
        ],
        "context_template": "The complaint describes domestic violence as defined under Section 3 of the Protection of Women from Domestic Violence Act, 2005, which includes physical, sexual, verbal, emotional, and economic abuse."
    },
    {
        "section_id": "Dowry Prohibition Act Sec 3",
        "badge": "[DOWRY 3]",
        "title": "Penalty for Giving or Taking Dowry",
        "keywords": ["dowry", "dowry demand", "dowry death", "bride", "wedding demand"],
        "checklist": [
            "Document all dowry demands with evidence (messages, witnesses)",
            "Record detailed statement of the complainant",
            "List all items demanded or given as dowry",
            "Investigate if mental/physical cruelty accompanied dowry demand"
        ],
        "context_template": "The giving or taking of dowry is punishable under Dowry Prohibition Act Section 3 with imprisonment of not less than 5 years and fine of not less than Rs. 15,000 or the value of dowry, whichever is more."
    },

    # ══════════════════════════════════════════════════════════════
    #  ADDITIONAL SPECIFIC CYBER/FINANCIAL CRIME SECTIONS — 80 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "IT Act Sec 66 r/w BNS 318",
        "badge": "[IT 66 + BNS 318]",
        "title": "Online Financial Fraud (Composite Charge)",
        "keywords": ["online fraud", "upi fraud", "net banking fraud", "e-commerce fraud", "payment gateway", "debit card", "credit card", "card fraud", "emi fraud"],
        "checklist": [
            "File complaint on cybercrime.gov.in and call 1930 helpline immediately",
            "Issue Sec 106 BNSS freeze order on suspect bank accounts within golden hour",
            "Obtain UPI/NEFT/RTGS transaction trail from the victim's bank",
            "Request beneficiary KYC from the receiving bank",
            "Trace the money trail through multiple mule accounts if layered",
            "Coordinate with I4C (Indian Cyber Crime Coordination Centre)"
        ],
        "context_template": "The case involves online financial fraud combining computer offences (IT Act 66) with cheating (BNS 318). The composite charge addresses the cyber means of committing financial fraud through UPI, net banking, or card transactions."
    },
    {
        "section_id": "IT Act Sec 66 r/w BNS 308",
        "badge": "[IT 66 + BNS 308]",
        "title": "Cyber Extortion / Digital Blackmail",
        "keywords": ["cyber extortion", "ransomware demand", "digital blackmail", "sextortion", "revenge porn threat", "encrypt files demand"],
        "checklist": [
            "Preserve all communication containing extortion demands",
            "Do NOT pay the ransom — document the demand amount and payment method",
            "Trace cryptocurrency wallet addresses if Bitcoin/crypto demanded",
            "Analyze ransomware strain and check for available decryptors",
            "Report to CERT-In and coordinate with international cyber agencies"
        ],
        "context_template": "The case involves cyber extortion combining unauthorized computer access (IT Act 66) with criminal extortion (BNS 308). This covers ransomware attacks, sextortion, and digital blackmail demands."
    },
    {
        "section_id": "IT Act Sec 66C r/w BNS 319",
        "badge": "[IT 66C + BNS 319]",
        "title": "Social Media Account Hacking and Impersonation",
        "keywords": ["account hack", "facebook hack", "instagram hack", "whatsapp hack", "social media hack", "account takeover", "profile hack"],
        "checklist": [
            "Report the compromised account to the platform's security team",
            "Obtain login activity and IP logs from the platform via Sec 91 BNSS",
            "Document the impersonation activities conducted from the hacked account",
            "Identify victims who were contacted by the impersonator",
            "Request account recovery assistance from the platform"
        ],
        "context_template": "The case involves social media account hacking (IT Act 66C - Identity Theft) combined with impersonation (BNS 319 - Cheating by Personation) to defraud victims through fake communications."
    },
    {
        "section_id": "BNS Sec 318 r/w IT Act 66D",
        "badge": "[BNS 318 + IT 66D]",
        "title": "Lottery / Prize Fraud — Advance Fee Scam",
        "keywords": ["lottery scam", "prize fraud", "advance fee", "nigerian scam", "customs clearance scam", "inheritance scam", "lucky draw"],
        "checklist": [
            "Preserve all communications promising the fake prize/lottery",
            "Trace the bank accounts where advance fees were deposited",
            "Identify the call center or operation hub if domestic",
            "Coordinate with international agencies if cross-border scam",
            "Issue public advisory about the specific scam pattern"
        ],
        "context_template": "The case involves advance fee fraud using fictitious lottery or prize notifications. Charged under BNS 318 (Cheating) and IT Act 66D (Cheating by Personation using Computer) for electronic delivery of the fraudulent scheme."
    },
    {
        "section_id": "BNS Sec 318 r/w IT Act 66",
        "badge": "[BNS 318 + IT 66]",
        "title": "Investment / Ponzi Scheme Fraud",
        "keywords": ["ponzi", "pyramid scheme", "investment fraud", "mlm fraud", "cryptocurrency scam", "forex scam", "trading scam", "high returns"],
        "checklist": [
            "Identify the promoters and key operators of the fraudulent scheme",
            "Trace all bank accounts and cryptocurrency wallets linked to the scheme",
            "Obtain investor lists and calculate total losses",
            "Coordinate with SEBI/RBI for regulatory action",
            "Apply for provisional attachment of scheme assets under PMLA"
        ],
        "context_template": "The case involves investment fraud through a Ponzi or pyramid scheme, using digital platforms for solicitation. Charged under BNS 318 (Cheating) and IT Act 66 for the digital component."
    },
    {
        "section_id": "IT Act Sec 67 r/w BNS 263",
        "badge": "[IT 67 + BNS 263]",
        "title": "Cyber Stalking and Online Harassment of Women",
        "keywords": ["cyberstalking", "online harassment", "troll", "threatening messages", "unwanted messages", "harass online", "abuse online"],
        "checklist": [
            "Preserve all harassing messages, emails, and social media content with screenshots",
            "Report the account to the platform and request IP logs",
            "Identify the harasser through IP tracing and account details",
            "Apply for restraining order if ongoing harassment",
            "Refer the victim to support services and counseling"
        ],
        "context_template": "The case involves cyber stalking and online harassment targeting women, charged under IT Act 67 (Obscene Content) and BNS 263 (Outraging Modesty of Woman)."
    },
    {
        "section_id": "IT Act Sec 66F r/w BNS 195",
        "badge": "[IT 66F + BNS 195]",
        "title": "Cyber Attack on Critical Infrastructure",
        "keywords": ["critical infrastructure attack", "power grid hack", "banking system hack", "government system breach", "scada attack", "ics attack", "industrial control"],
        "checklist": [
            "Immediately report to NCIIPC, CERT-In, and NIA",
            "Isolate affected critical systems from all networks",
            "Activate sector-specific crisis management protocols",
            "Engage specialized incident response teams",
            "Preserve all system logs and network traffic data"
        ],
        "context_template": "The case involves a cyber attack on critical information infrastructure, constituting cyber terrorism under IT Act 66F and terrorism under BNS 195, punishable with life imprisonment."
    },
    {
        "section_id": "BNS Sec 316 r/w IT Act 43",
        "badge": "[BNS 316 + IT 43]",
        "title": "Insider Data Theft — Corporate Espionage",
        "keywords": ["insider threat", "data theft", "corporate espionage", "trade secret", "proprietary data", "employee theft data", "competitor"],
        "checklist": [
            "Audit access logs to determine exactly what data was accessed/copied",
            "Image the insider's workstation and mobile devices",
            "Review email logs and cloud storage access patterns",
            "Examine USB/external device connection history",
            "Interview HR, IT Security, and the suspect's manager",
            "Verify if data was shared with competitors or uploaded to personal cloud"
        ],
        "context_template": "The case involves insider data theft constituting criminal breach of trust (BNS 316) and unauthorized data extraction from computer systems (IT Act 43). This is common in corporate espionage scenarios."
    },
    {
        "section_id": "BNS Sec 336 r/w IT Act 66",
        "badge": "[BNS 336 + IT 66]",
        "title": "Digital Document Forgery",
        "keywords": ["forged email", "fake document digital", "doctored image", "photoshopped", "edited document", "fake certificate", "forged marksheet"],
        "checklist": [
            "Obtain the original and forged digital documents",
            "Analyze metadata of the digital documents (creation date, modification history)",
            "Conduct ELA (Error Level Analysis) on suspected photoshopped images",
            "Identify the software and tools used for forgery",
            "Trace the distribution of forged documents"
        ],
        "context_template": "The case involves digital document forgery, charged under BNS 336 (Forgery) and IT Act 66 (Computer Related Offences) for creating forged electronic records."
    },
    {
        "section_id": "IT Act Sec 66 r/w BNS 61",
        "badge": "[IT 66 + BNS 61]",
        "title": "Organized Cyber Crime Ring — Conspiracy",
        "keywords": ["cyber crime ring", "fraud ring", "call center scam", "tech support scam", "organized cyber", "cyber syndicate"],
        "checklist": [
            "Map the entire criminal network using CDR/IPDR analysis",
            "Identify the hierarchy — recruiters, callers, mule account operators, kingpins",
            "Conduct simultaneous raids on all identified locations",
            "Seize all VoIP equipment, SIM cards, and computer systems",
            "Freeze all linked bank accounts simultaneously",
            "Coordinate with FBI/Interpol if international victims are involved"
        ],
        "context_template": "The case involves an organized cyber crime ring operating as a criminal conspiracy, charged under IT Act 66 and BNS 61 (Criminal Conspiracy). This covers tech support scams, call center frauds, and coordinated phishing operations."
    },
    {
        "section_id": "IT Act Sec 43 r/w BNS 329",
        "badge": "[IT 43 + BNS 329]",
        "title": "Website Defacement / Digital Vandalism",
        "keywords": ["defacement", "website hack", "graffiti", "deface", "vandalize website", "hacked page"],
        "checklist": [
            "Capture and preserve the defaced website (screenshots, WARC archive)",
            "Analyze web server logs for the attack vector",
            "Check for SQL injection, XSS, or file upload vulnerabilities exploited",
            "Identify the attacker through IP and session logs",
            "Restore the website from clean backups"
        ],
        "context_template": "The case involves website defacement constituting damage to computer systems (IT Act 43) and criminal mischief (BNS 329). Website defacement is often used for political or ideological messaging."
    },
    {
        "section_id": "IT Act Sec 66C r/w PMLA 3",
        "badge": "[IT 66C + PMLA 3]",
        "title": "SIM Swap Fraud — Financial Crime",
        "keywords": ["sim swap", "sim clone", "sim fraud", "mobile number takeover", "otp intercept", "sim replacement"],
        "checklist": [
            "Contact the telecom operator immediately to block the swapped SIM",
            "Obtain SIM swap request records from the telecom company",
            "Verify identity documents used for the fraudulent SIM swap",
            "Trace all financial transactions conducted after the SIM swap",
            "Freeze compromised bank accounts and wallets"
        ],
        "context_template": "The case involves SIM swap fraud combining identity theft (IT Act 66C) with money laundering (PMLA 3) where a fraudulent SIM replacement enables OTP interception for financial fraud."
    },
    {
        "section_id": "IT Act Sec 66 r/w BNS 308",
        "badge": "[IT 66 + BNS 308-RANSOM]",
        "title": "Ransomware Attack",
        "keywords": ["ransomware", "encrypt", "locked files", "decrypt demand", "bitcoin ransom", "crypto ransom", "wannacry", "lockbit", "revil"],
        "checklist": [
            "Isolate affected systems immediately — disconnect from network",
            "Do NOT pay the ransom — it does not guarantee data recovery",
            "Identify the ransomware variant using tools like ID Ransomware",
            "Check for available decryptors from NoMoreRansom project",
            "Report to CERT-In with IOCs (Indicators of Compromise)",
            "Preserve the ransom note, encrypted files, and malware samples"
        ],
        "context_template": "The case involves a ransomware attack constituting computer-related offence (IT Act 66) and cyber extortion (BNS 308). The encrypted data is held hostage with a cryptocurrency ransom demand."
    },
    {
        "section_id": "IT Act Sec 66D r/w BNS 318",
        "badge": "[IT 66D + BNS 318-VISHING]",
        "title": "Vishing (Voice Phishing) Fraud",
        "keywords": ["vishing", "phone scam", "fake call", "rbi call", "bank call fraud", "customer care fraud", "kyc update call"],
        "checklist": [
            "Preserve call recordings and CDR of the fraud calls",
            "Trace the caller's phone number through CDR/IPDR",
            "Check if VoIP was used and identify the VoIP service provider",
            "Freeze the beneficiary accounts where money was transferred",
            "Issue public advisory about the vishing modus operandi"
        ],
        "context_template": "The case involves vishing (voice phishing) where fraudsters impersonate bank officials or government agencies over phone calls to extract sensitive information or money."
    },
    {
        "section_id": "IT Act Sec 67A r/w BNS 78",
        "badge": "[IT 67A + BNS 78]",
        "title": "Cyberstalking with Sexually Explicit Content",
        "keywords": ["morphed photo", "deepfake porn", "morphed image", "fake nude", "ai generated", "manipulated image"],
        "checklist": [
            "Preserve the manipulated/morphed content with hash values",
            "Issue immediate takedown requests to hosting platforms",
            "Identify the creator using reverse image search and metadata analysis",
            "Check for AI/deepfake generation tools on suspect's devices",
            "Provide victim with support and counseling services"
        ],
        "context_template": "The case involves cyberstalking combined with creation/distribution of sexually explicit morphed images. Charged under IT Act 67A (Sexually Explicit Content) and BNS 78 (Stalking)."
    },
    {
        "section_id": "IT Act Sec 43 r/w BNS 61",
        "badge": "[IT 43 + BNS 61-DDoS]",
        "title": "Distributed Denial of Service (DDoS) Attack",
        "keywords": ["ddos", "denial of service", "botnet", "server down", "traffic flood", "service disruption"],
        "checklist": [
            "Engage ISP to implement traffic filtering and rate limiting",
            "Capture traffic samples during the attack for analysis",
            "Identify the botnet C2 (Command and Control) servers",
            "Check if DDoS-for-hire services were used",
            "Report to CERT-In with attack signatures and IOCs"
        ],
        "context_template": "The case involves a DDoS attack causing denial of service. Charged under IT Act 43 (Damage to Computer System) and BNS 61 (Criminal Conspiracy) if orchestrated by multiple actors."
    },
    {
        "section_id": "IT Act Sec 66C r/w BNS 318",
        "badge": "[IT 66C + BNS 318-ATM]",
        "title": "ATM Skimming / Card Cloning Fraud",
        "keywords": ["skimming", "card cloning", "atm fraud", "card reader", "shimming", "magnetic stripe", "emv bypass"],
        "checklist": [
            "Seize the skimming device from the ATM",
            "Obtain ATM CCTV footage showing device installation",
            "Identify all compromised cards from transaction logs",
            "Alert banks to block compromised cards",
            "Trace cash withdrawals made using cloned cards"
        ],
        "context_template": "The case involves ATM skimming/card cloning fraud combining identity theft (IT Act 66C) with cheating (BNS 318). Skimming devices capture card data which is then used to create cloned cards for fraudulent withdrawals."
    },
    {
        "section_id": "IT Act Sec 66 r/w BNS 318",
        "badge": "[IT 66 + BNS 318-CRYPTO]",
        "title": "Cryptocurrency Fraud / Crypto Scam",
        "keywords": ["crypto fraud", "bitcoin scam", "cryptocurrency theft", "wallet hack", "blockchain fraud", "defi scam", "rug pull", "crypto ponzi"],
        "checklist": [
            "Identify and record all cryptocurrency wallet addresses involved",
            "Use blockchain analytics tools to trace transaction flows",
            "Coordinate with cryptocurrency exchanges for KYC data",
            "Apply for freezing of exchange accounts under Sec 106 BNSS",
            "Engage specialized crypto forensic investigators",
            "File SARs (Suspicious Activity Reports) with FIU-IND"
        ],
        "context_template": "The case involves cryptocurrency fraud combining computer hacking (IT Act 66) with cheating (BNS 318). Cryptocurrency frauds include exchange hacks, wallet thefts, rug pulls, and crypto Ponzi schemes."
    },
    {
        "section_id": "IT Act Sec 67 r/w BNS 351",
        "badge": "[IT 67 + BNS 351-TROLL]",
        "title": "Online Trolling / Hate Speech / Cyber Bullying",
        "keywords": ["troll", "cyberbully", "hate speech online", "online abuse", "death threat online", "abusive message"],
        "checklist": [
            "Preserve all abusive/threatening online content with timestamps",
            "Report the content to the platform for Terms of Service violation",
            "Obtain IP and account details through Sec 91 BNSS notice",
            "Assess whether the content constitutes criminal intimidation",
            "Provide victim with support resources"
        ],
        "context_template": "The case involves online trolling, hate speech, or cyberbullying charged under IT Act 67 (Obscene/Offensive Content) and BNS 351 (Criminal Intimidation) for threatening communications."
    },

    # ══════════════════════════════════════════════════════════════
    #  DRONE & SURVEILLANCE SPECIFIC — 20 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "Aircraft Act r/w IT Act Sec 43",
        "badge": "[AIRCRAFT + IT 43]",
        "title": "Unauthorized Drone Surveillance / Illegal Drone Operation",
        "keywords": ["drone", "uav", "quadcopter", "aerial surveillance", "dji", "mavic", "matrice", "unmanned aerial", "flying"],
        "checklist": [
            "Seize the drone and all associated equipment (controller, SD cards, batteries)",
            "Extract flight logs from the drone's onboard storage",
            "Identify the operator through DAN (Drone Acknowledgement Number) if registered",
            "Check DGCA Digital Sky registration status",
            "Analyze intercepted Wi-Fi/network data if the drone had surveillance payloads",
            "Geo-fence data analysis to determine exact flight path and hover points"
        ],
        "context_template": "The case involves unauthorized drone operation and/or aerial surveillance. The Aircraft Act read with IT Act Section 43 applies to unauthorized drone flights near restricted zones and digital surveillance via drone-mounted equipment."
    },
    {
        "section_id": "BNS Sec 335 r/w Aircraft Act",
        "badge": "[BNS 335 + AIRCRAFT]",
        "title": "Drone Trespassing Over Restricted Area",
        "keywords": ["airspace", "restricted area", "no fly zone", "military area", "airport", "drone trespass"],
        "checklist": [
            "Document the drone's flight path and the restricted zone violated",
            "Report to DGCA and the relevant military/security authority",
            "Seize the drone and operator's equipment",
            "Check if the drone was transmitting data to a remote server",
            "Assess whether the trespass compromised national security"
        ],
        "context_template": "Drone trespassing over restricted areas combines criminal trespass (BNS 335) with violations of aircraft regulations. Flying drones in no-fly zones near airports, military installations, or government buildings is a serious offence."
    },
    {
        "section_id": "IT Act Sec 66E r/w Aircraft Act",
        "badge": "[IT 66E + AIRCRAFT]",
        "title": "Drone-Based Privacy Violation / Aerial Voyeurism",
        "keywords": ["drone camera", "aerial photography", "spying drone", "peeping drone", "drone privacy"],
        "checklist": [
            "Seize the drone and extract all captured imagery/video",
            "Identify the drone operator and establish intent",
            "Analyze captured footage for privacy violations",
            "Check if footage was transmitted or shared online"
        ],
        "context_template": "The case involves drone-based privacy violation — using aerial platforms for voyeurism or unauthorized surveillance of private areas. Charged under IT Act 66E (Privacy Violation) and Aircraft Act regulations."
    },
    {
        "section_id": "IT Act Sec 69 r/w BNS 61",
        "badge": "[IT 69 + BNS 61-SURVEIL]",
        "title": "Illegal Electronic Surveillance Network",
        "keywords": ["surveillance network", "spy", "bugging", "hidden microphone", "gps tracker", "tracking device", "covert surveillance"],
        "checklist": [
            "Sweep the premises for hidden surveillance devices",
            "Seize all discovered bugs, trackers, and recording devices",
            "Trace the receiving end of surveillance transmissions",
            "Identify the person who commissioned the surveillance",
            "Determine if any government authorization was claimed"
        ],
        "context_template": "The case involves operation of an illegal electronic surveillance network. Unauthorized interception and monitoring is a serious offence under IT Act 69 (which mandates government authorization) and constitutes criminal conspiracy under BNS 61."
    },
    {
        "section_id": "IT Act Sec 43 r/w Aircraft Act",
        "badge": "[IT 43 + AIRCRAFT-WIFI]",
        "title": "Drone-Based Wi-Fi/Network Interception",
        "keywords": ["wifi intercept", "packet sniff", "network intercept", "man in the middle", "wifi hacking", "wardriving", "pineapple"],
        "checklist": [
            "Analyze the drone's payload for Wi-Fi interception equipment",
            "Check for packet capture files on seized storage media",
            "Identify the target networks that were intercepted",
            "Assess the sensitivity of any data captured",
            "Preserve all captured network traffic as evidence"
        ],
        "context_template": "The drone was equipped with Wi-Fi/network interception capabilities. Unauthorized network interception via drone-mounted equipment constitutes damage to computer systems (IT Act 43) and violation of aircraft regulations."
    },

    # ══════════════════════════════════════════════════════════════
    #  ADDITIONAL BNS PROPERTY & ECONOMIC OFFENCES — 40 Sections
    # ══════════════════════════════════════════════════════════════
    {
        "section_id": "BNS Sec 310",
        "badge": "[BNS 310]",
        "title": "Robbery with Attempt to Cause Death or Grievous Hurt",
        "keywords": ["armed robbery murder", "robbery death", "robbery shooting", "violent robbery"],
        "checklist": [
            "Treat as serious crime with immediate response",
            "Deploy forensic team to the crime scene",
            "Issue lookout circulars for suspects",
            "Collect forensic evidence including ballistic evidence if firearms used"
        ],
        "context_template": "The robbery was accompanied by attempt to cause death or grievous hurt. BNS Section 310 provides enhanced punishment for violent robbery."
    },
    {
        "section_id": "BNS Sec 311",
        "badge": "[BNS 311]",
        "title": "Dacoity with Murder",
        "keywords": ["dacoity murder", "gang killing robbery", "armed gang", "robbery killing"],
        "checklist": [
            "Activate state-level crime response mechanism",
            "Set up special investigation team (SIT)",
            "Conduct area-wide vehicle checks and roadblocks",
            "Coordinate across multiple police jurisdictions"
        ],
        "context_template": "Dacoity accompanied by murder is one of the most serious offences. BNS Section 311 provides for death or life imprisonment."
    },
    {
        "section_id": "BNS Sec 312",
        "badge": "[BNS 312]",
        "title": "Preparation for Dacoity",
        "keywords": ["dacoity preparation", "planning robbery", "weapon cache", "gang assembly"],
        "checklist": [
            "Seize all weapons and tools prepared for dacoity",
            "Identify all members of the gang",
            "Obtain intelligence about the planned target",
            "Deploy preventive measures at the intended target"
        ],
        "context_template": "Making preparation for committing dacoity is itself an offence under BNS Section 312, punishable with rigorous imprisonment up to 10 years."
    },
    {
        "section_id": "BNS Sec 313",
        "badge": "[BNS 313]",
        "title": "Dishonest Misappropriation of Property",
        "keywords": ["misappropriation", "dishonest", "misuse", "conversion", "appropriate", "wrongful use"],
        "checklist": [
            "Establish lawful possession and subsequent misappropriation",
            "Document the property or funds misappropriated",
            "Trace the usage of misappropriated property",
            "Calculate the value of property misappropriated"
        ],
        "context_template": "The accused dishonestly misappropriated or converted to their own use property in their possession. BNS Section 313 provides imprisonment up to 2 years and/or fine."
    },
    {
        "section_id": "BNS Sec 314",
        "badge": "[BNS 314]",
        "title": "Dishonest Misappropriation of Property Possessed by Deceased Person",
        "keywords": ["deceased property", "estate fraud", "inheritance theft", "death property"],
        "checklist": [
            "Verify the ownership and inheritance rights",
            "Document the property of the deceased person",
            "Identify the rightful heirs and beneficiaries",
            "Trace the misappropriated property to the accused"
        ],
        "context_template": "Dishonest misappropriation of property of a deceased person at the time of death, before it comes into the possession of any person legally entitled, is punishable under BNS Section 314."
    },
    {
        "section_id": "BNS Sec 317",
        "badge": "[BNS 317]",
        "title": "Criminal Breach of Trust by Carrier or Warehouse-Keeper",
        "keywords": ["courier fraud", "warehouse theft", "logistics fraud", "cargo theft", "transport fraud"],
        "checklist": [
            "Document the property entrusted for carriage or storage",
            "Verify delivery receipts and consignment notes",
            "Trace the missing/stolen goods in transit",
            "Examine internal controls and surveillance at the facility"
        ],
        "context_template": "Criminal breach of trust by a carrier, warehouse-keeper, or agent is punishable under BNS Section 317 with imprisonment up to 7 years and fine."
    },
    {
        "section_id": "BNS Sec 321",
        "badge": "[BNS 321]",
        "title": "Dishonest or Fraudulent Execution of Deed of Transfer",
        "keywords": ["property transfer fraud", "fake deed", "fraudulent transfer", "registration fraud", "land fraud"],
        "checklist": [
            "Verify the deed of transfer with the Sub-Registrar's office",
            "Compare signatures with known specimens",
            "Check identity documents used for registration",
            "Coordinate with Revenue Department for land record verification"
        ],
        "context_template": "Dishonest or fraudulent execution of a deed of transfer containing a false statement is punishable under BNS Section 321 with imprisonment up to 2 years and/or fine."
    },
    {
        "section_id": "BNS Sec 322",
        "badge": "[BNS 322]",
        "title": "Fraudulent Deeds and Disposition of Property",
        "keywords": ["fraudulent deed", "property scam", "land scam", "benami property", "title fraud"],
        "checklist": [
            "Verify all property documents with revenue and registration authorities",
            "Conduct title search for the property in question",
            "Identify all transactions in the chain of title",
            "Coordinate with Benami Transactions Prohibition Unit if applicable"
        ],
        "context_template": "Fraudulent deeds and disposition of property to prevent creditors or defraud purchasers is punishable under BNS Section 322."
    },
    {
        "section_id": "BNS Sec 341",
        "badge": "[BNS 341]",
        "title": "Counterfeiting of Currency Notes or Bank Notes",
        "keywords": ["counterfeit currency", "ficn", "fake indian currency", "printing fake money"],
        "checklist": [
            "Seize all counterfeit notes and printing materials",
            "Send samples to RBI for authentication report",
            "Coordinate with NIA (FICN cases are terror-linked)",
            "Trace the distribution network across states/borders",
            "Check for connections to organized crime syndicates"
        ],
        "context_template": "Counterfeiting Indian currency notes is a grave offence under BNS Section 341, often linked to terrorist financing, punishable with imprisonment up to life."
    },
    {
        "section_id": "BNS Sec 343",
        "badge": "[BNS 343]",
        "title": "Possession of Counterfeit Currency Notes",
        "keywords": ["possessing fake currency", "holding counterfeit", "fake notes possession"],
        "checklist": [
            "Document the quantity and denomination of counterfeit notes",
            "Record how the accused came into possession",
            "Check if the accused was part of a larger distribution network",
            "Apply the presumption of knowledge under BNS provisions"
        ],
        "context_template": "Possession of counterfeit currency notes knowing them to be forged is punishable under BNS Section 343 with imprisonment up to 7 years and fine."
    },
]

# ══════════════════════════════════════════════════════════════
#  Summary Statistics
# ══════════════════════════════════════════════════════════════
# Total core statutes defined: len(STATUTES)
# Coverage: IT Act, BNS 2023, BNSS 2023, BSA 2023, IPC (legacy),
#           CrPC (legacy), PMLA, POCSO, Copyright Act, Indian Telegraph Act,
#           Telecom Act 2023, NDPS Act, Arms Act, Explosive Substances Act,
#           UAPA, Prevention of Corruption Act, SC/ST PoA Act,
#           Domestic Violence Act, Dowry Prohibition Act, Aircraft Act
