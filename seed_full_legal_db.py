import chromadb
import requests
import uuid

FALLBACK_DATA = [
    {"act": "BNS 2023", "section_number": "103", "offence_title": "Murder", "description": "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine."},
    {"act": "BNS 2023", "section_number": "105", "offence_title": "Culpable homicide not amounting to murder", "description": "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine."},
    {"act": "BNS 2023", "section_number": "109", "offence_title": "Attempt to murder", "description": "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine."},
    {"act": "BNS 2023", "section_number": "115", "offence_title": "Voluntarily causing hurt", "description": "Whoever does any act with the intention of thereby causing hurt to any person, or with the knowledge that he is likely thereby to cause hurt to any person, and does thereby cause hurt to any person, is said voluntarily to cause hurt."},
    {"act": "BNS 2023", "section_number": "117", "offence_title": "Voluntarily causing grievous hurt", "description": "Whoever voluntarily causes hurt, if the hurt which he intends to cause or knows himself to be likely to cause is grievous hurt, and if the hurt which he causes is grievous hurt, is said voluntarily to cause grievous hurt."},
    {"act": "BNS 2023", "section_number": "143", "offence_title": "Kidnapping", "description": "Kidnapping is of two kinds: kidnapping from India, and kidnapping from lawful guardianship."},
    {"act": "BNS 2023", "section_number": "144", "offence_title": "Abduction", "description": "Whoever by force compels, or by any deceitful means induces, any person to go from any place, is said to abduct that person."},
    {"act": "BNS 2023", "section_number": "303", "offence_title": "Theft", "description": "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft."},
    {"act": "BNS 2023", "section_number": "305", "offence_title": "Theft in dwelling house, etc.", "description": "Whoever commits theft in any building, tent or vessel, which building, tent or vessel is used as a human dwelling, or used for the custody of property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine."},
    {"act": "BNS 2023", "section_number": "308", "offence_title": "Extortion", "description": "Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property, or valuable security..."},
    {"act": "BNS 2023", "section_number": "309", "offence_title": "Robbery", "description": "In all robbery there is either theft or extortion. Theft is robbery if, in order to the committing of the theft, or in committing the theft, or in carrying away or attempting to carry away property obtained by the theft, the offender, for that end, voluntarily causes or attempts to cause to any person death or hurt or wrongful restraint..."},
    {"act": "BNS 2023", "section_number": "310", "offence_title": "Dacoity", "description": "When five or more persons conjointly commit or attempt to commit robbery, or where the whole number of persons conjointly committing or attempting to commit robbery..."},
    {"act": "BNS 2023", "section_number": "314", "offence_title": "Dishonest misappropriation of property", "description": "Whoever dishonestly misappropriates or converts to his own use any movable property, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both."},
    {"act": "BNS 2023", "section_number": "316", "offence_title": "Criminal breach of trust", "description": "Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged..."},
    {"act": "BNS 2023", "section_number": "318", "offence_title": "Cheating", "description": "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property..."},
    {"act": "BNS 2023", "section_number": "319", "offence_title": "Cheating by personation", "description": "A person is said to cheat by personation if he cheats by pretending to be some other person, or by knowingly substituting one person for another, or representing that he or any other person is a person other than he or such other person really is."},
    {"act": "BNS 2023", "section_number": "335", "offence_title": "Forgery", "description": "Whoever makes any false document or false electronic record or part of a document or electronic record, with intent to cause damage or injury, to the public or to any person, or to support any claim or title..."},
    {"act": "BNS 2023", "section_number": "351", "offence_title": "Criminal intimidation", "description": "Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person..."},
    {"act": "BNS 2023", "section_number": "352", "offence_title": "Intentional insult with intent to provoke breach of the peace", "description": "Whoever intentionally insults, and thereby gives provocation to any person, intending or knowing it to be likely that such provocation will cause him to break the public peace..."},
    {"act": "BNS 2023", "section_number": "64", "offence_title": "Rape", "description": "A man is said to commit rape if he penetrates his penis, to any extent, into the vagina, mouth, urethra or anus of a woman or makes her to do so with him or any other person..."},
    {"act": "BNS 2023", "section_number": "74", "offence_title": "Assault or use of criminal force to woman with intent to outrage her modesty", "description": "Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty..."},
    {"act": "BNS 2023", "section_number": "75", "offence_title": "Sexual harassment", "description": "A man committing any of the following acts—(i) physical contact and advances involving unwelcome and explicit sexual overtures; or (ii) a demand or request for sexual favours; or (iii) showing pornography against the will of a woman; or (iv) making sexually coloured remarks, shall be guilty of the offence of sexual harassment."},
    {"act": "BNS 2023", "section_number": "76", "offence_title": "Assault or use of criminal force to woman with intent to disrobe", "description": "Whoever assaults or uses criminal force to any woman or abets such act with the intention of disrobing or compelling her to be naked..."},
    {"act": "BNS 2023", "section_number": "77", "offence_title": "Voyeurism", "description": "Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed either by the perpetrator or by any other person..."},
    {"act": "BNS 2023", "section_number": "78", "offence_title": "Stalking", "description": "Any man who follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest by such woman; or monitors the use by a woman of the internet, email or any other form of electronic communication..."},
    {"act": "BNS 2023", "section_number": "111", "offence_title": "Organised crime", "description": "Any continuing unlawful activity including kidnapping, robbery, vehicle theft, extortion, land grabbing, contract killing, economic offences, cyber-crimes having severe consequences, trafficking in people, drugs, illicit goods or weapons and human trafficking pimping for prostitution or ransom by any person..."},
    {"act": "BNS 2023", "section_number": "112", "offence_title": "Petty organised crime", "description": "Whoever, being a member of a group or gang, either singly or jointly, commits any act of theft, snatching, cheating, unauthorised selling of tickets, unauthorised betting or gambling, selling of public examination question papers or any other similar criminal act, is said to commit petty organised crime."},
    {"act": "BNS 2023", "section_number": "113", "offence_title": "Terrorist act", "description": "Whoever does any act with the intent to threaten or likely to threaten the unity, integrity, sovereignty, security, or economic security of India or with the intent to strike terror or likely to strike terror in the people or any section of the people in India or in any foreign country..."},
    {"act": "BNS 2023", "section_number": "324", "offence_title": "Mischief", "description": "Whoever with intent to cause, or knowing that he is likely to cause, wrongful loss or damage to the public or to any person, causes the destruction of any property, or any such change in any property or in the situation thereof as destroys or diminishes its value or utility, or affects it injuriously, commits mischief."},
    {"act": "BNS 2023", "section_number": "329", "offence_title": "Criminal trespass", "description": "Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property..."},
    {"act": "IT Act", "section_number": "43", "offence_title": "Penalty and Compensation for damage to computer, computer system, etc.", "description": "If any person without permission of the owner or any other person who is incharge of a computer, computer system or computer network accesses or secures access to such computer, downloads, copies or extracts any data, introduces any computer virus, damages or causes to be damaged any computer resource..."},
    {"act": "IT Act", "section_number": "65", "offence_title": "Tampering with computer source documents", "description": "Whoever knowingly or intentionally conceals, destroys or alters or intentionally or knowingly causes another to conceal, destroy or alter any computer source code used for a computer, computer programme, computer system or computer network, when the computer source code is required to be kept or maintained by law for the time being in force, shall be punishable with imprisonment up to three years, or with fine which may extend up to two lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "66", "offence_title": "Computer related offences", "description": "If any person, dishonestly or fraudulently, does any act referred to in section 43, he shall be punishable with imprisonment for a term which may extend to three years or with fine which may extend to five lakh rupees or with both."},
    {"act": "IT Act", "section_number": "66B", "offence_title": "Punishment for dishonestly receiving stolen computer resource or communication device", "description": "Whoever dishonestly receives or retains any stolen computer resource or communication device knowing or having reason to believe the same to be stolen computer resource or communication device, shall be punished with imprisonment of either description for a term which may extend to three years or with fine which may extend to rupees one lakh or with both."},
    {"act": "IT Act", "section_number": "66C", "offence_title": "Identity theft", "description": "Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh."},
    {"act": "IT Act", "section_number": "66D", "offence_title": "Cheating by personation by using computer resource", "description": "Whoever, by means for any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees."},
    {"act": "IT Act", "section_number": "66E", "offence_title": "Violation of privacy", "description": "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without his or her consent, under circumstances violating the privacy of that person, shall be punished with imprisonment which may extend to three years or with fine not exceeding two lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "66F", "offence_title": "Cyber terrorism", "description": "Whoever with intent to threaten the unity, integrity, security or sovereignty of India or to strike terror in the people or any section of the people by denying or cause the denial of access to any person authorized to access computer resource or attempting to penetrate or access a computer resource without authorisation or exceeding authorised access..."},
    {"act": "IT Act", "section_number": "67", "offence_title": "Publishing or transmitting obscene material in electronic form", "description": "Whoever publishes or transmits or causes to be published or transmitted in the electronic form, any material which is lascivious or appeals to the prurient interest or if its effect is such as to tend to deprave and corrupt persons who are likely, having regard to all relevant circumstances, to read, see or hear the matter contained or embodied in it..."},
    {"act": "IT Act", "section_number": "67A", "offence_title": "Publishing or transmitting of material containing sexually explicit act, etc., in electronic form", "description": "Whoever publishes or transmits or causes to be published or transmitted in the electronic form any material which contains sexually explicit act or conduct shall be punished on first conviction with imprisonment of either description for a term which may extend to five years and with fine which may extend to ten lakh rupees."},
    {"act": "IT Act", "section_number": "67B", "offence_title": "Punishment for publishing or transmitting of material depicting children in sexually explicit act, etc., in electronic form", "description": "Whoever publishes or transmits or causes to be published or transmitted material in any electronic form which depicts children engaged in sexually explicit act or conduct; or creates text or digital images, collects, seeks, browses, downloads, advertises, promotes, exchanges or distributes material in any electronic form depicting children in obscene or indecent or sexually explicit manner..."},
    {"act": "IT Act", "section_number": "69", "offence_title": "Power to issue directions for interception or monitoring or decryption of any information through any computer resource", "description": "Where the Central Government or a State Government or any of its officers specially authorised by the Central Government or the State Government, as the case may be, in this behalf may, if satisfied that it is necessary or expedient so to do, in the interest of the sovereignty or integrity of India, defense of India, security of the State, friendly relations with foreign States or public order or for preventing incitement to the commission of any cognizable offence relating to above or for investigation of any offence..."},
    {"act": "IT Act", "section_number": "69A", "offence_title": "Power to issue directions for blocking for public access of any information through any computer resource", "description": "Where the Central Government or any of its officers specially authorised by it in this behalf is satisfied that it is necessary or expedient so to do, in the interest of sovereignty and integrity of India, defence of India, security of the State, friendly relations with foreign States or public order or for preventing incitement to the commission of any cognizable offence relating to above, it may subject to the provisions of sub-section (2), for reasons to be recorded in writing, by order, direct any agency of the Government or intermediary to block for access by the public or cause to be blocked for access by the public any information generated, transmitted, received, stored or hosted in any computer resource."},
    {"act": "IT Act", "section_number": "70", "offence_title": "Protected system", "description": "The appropriate Government may, by notification in the Official Gazette, declare any computer resource which directly or indirectly affects the facility of Critical Information Infrastructure, to be a protected system. Any person who secures access or attempts to secure access to a protected system in contravention of the provisions of this section shall be punished with imprisonment of either description for a term which may extend to ten years and shall also be liable to fine."},
    {"act": "IT Act", "section_number": "71", "offence_title": "Penalty for misrepresentation", "description": "Whoever makes any misrepresentation to, or suppresses any material fact from, the Controller or the Certifying Authority for obtaining any licence or Electronic Signature Certificate, as the case may be, shall be punished with imprisonment for a term which may extend to two years, or with fine which may extend to one lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "72", "offence_title": "Penalty for breach of confidentiality and privacy", "description": "Save as otherwise provided in this Act or any other law for the time being in force, any person who, in pursuance of any of the powers conferred under this Act, rules or regulations made thereunder, has secured access to any electronic record, book, register, correspondence, information, document or other material without the consent of the person concerned discloses such electronic record, book, register, correspondence, information, document or other material to any other person shall be punished with imprisonment for a term which may extend to two years, or with fine which may extend to one lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "72A", "offence_title": "Punishment for disclosure of information in breach of lawful contract", "description": "Save as otherwise provided in this Act or any other law for the time being in force, any person including an intermediary who, while providing services under the terms of lawful contract, has secured access to any material containing personal information about another person, with the intent to cause or knowing that he is likely to cause wrongful loss or wrongful gain discloses, without the consent of the person concerned, or in breach of a lawful contract, such material to any other person, shall be punished with imprisonment for a term which may extend to three years, or with fine which may extend to five lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "73", "offence_title": "Penalty for publishing Electronic Signature Certificate false in certain particulars", "description": "No person shall publish a Electronic Signature Certificate or otherwise make it available to any other person with the knowledge that the Certifying Authority listed in the certificate has not issued it; or the subscriber listed in the certificate has not accepted it; or the certificate has been revoked or suspended..."},
    {"act": "IT Act", "section_number": "74", "offence_title": "Publication for fraudulent purpose", "description": "Whoever knowingly creates, publishes or otherwise makes available a Electronic Signature Certificate for any fraudulent or unlawful purpose shall be punished with imprisonment for a term which may extend to two years, or with fine which may extend to one lakh rupees, or with both."},
    {"act": "IT Act", "section_number": "84B", "offence_title": "Abetment of offences", "description": "Whoever abets any offence shall, if the act abetted is committed in consequence of the abetment, and no express provision is made by this Act for the punishment of such abetment, be punished with the punishment provided for the offence under this Act."}
]

def fetch_external_data():
    urls_to_try = [
        "https://raw.githubusercontent.com/datasets/indian-legal/master/bns_2023.json",
        "https://datasets-server.huggingface.co/rows?dataset=GSMS-B%2Findian-legal-sections-bns-bnss-bsa-2023&config=default&split=train&offset=0&length=100"
    ]
    
    for url in urls_to_try:
        try:
            print(f"Attempting to fetch data from: {url}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("Successfully fetched external dataset!")
                
                # Adapt huggingface format if needed
                if "rows" in data:
                    rows = data["rows"]
                    extracted = []
                    for row in rows:
                        row_data = row.get("row", {})
                        extracted.append({
                            "act": row_data.get("act", "BNS 2023"),
                            "section_number": str(row_data.get("section", "Unknown")),
                            "offence_title": row_data.get("title", "Unknown Title"),
                            "description": row_data.get("description", "")
                        })
                    if len(extracted) > 0:
                        return extracted
                
                return data
        except Exception as e:
            print(f"Failed to fetch from {url}: {e}")
            
    print("All external fetches failed. Using robust offline fallback dataset.")
    return None

def main():
    print("Starting comprehensive database upgrade...")
    
    # 1. Try to fetch external data
    dataset = fetch_external_data()
    
    if not dataset or len(dataset) < 10:
        print(f"Using built-in fallback dataset with {len(FALLBACK_DATA)} provisions.")
        dataset = FALLBACK_DATA
        
    print(f"Total provisions to index: {len(dataset)}")
    
    # 2. Connect to ChromaDB
    print("Initializing ChromaDB persistent client at ./local_legal_db...")
    chroma_client = chromadb.PersistentClient(path="./local_legal_db")
    
    # 3. Clear old collection and recreate
    collection_name = "bns_bnss_bsa_laws"
    try:
        chroma_client.delete_collection(name=collection_name)
        print(f"Deleted old collection '{collection_name}'.")
    except Exception as e:
        print(f"Collection '{collection_name}' did not exist or could not be deleted.")
        
    print(f"Creating new collection '{collection_name}'...")
    collection = chroma_client.create_collection(name=collection_name)
    
    # 4. Format and batch insert
    documents = []
    metadatas = []
    ids = []
    
    for idx, item in enumerate(dataset):
        # Format text
        doc_text = f"{item.get('act', 'Unknown Act')} Section {item.get('section_number', 'Unknown')}: {item.get('offence_title', 'Unknown Title')}. {item.get('description', '')}"
        documents.append(doc_text)
        
        # Format metadata
        meta = {
            "act": item.get("act", "Unknown Act"),
            "section": str(item.get("section_number", "Unknown")),
            "offense_type": item.get("offence_title", "Unknown Title")
        }
        metadatas.append(meta)
        
        # Unique ID
        doc_id = f"legal_prov_{uuid.uuid4().hex[:8]}"
        ids.append(doc_id)
        
    # Batch insert in chunks of 50 to avoid any limits
    batch_size = 50
    for i in range(0, len(documents), batch_size):
        end = min(i + batch_size, len(documents))
        print(f"Inserting batch {i+1} to {end}...")
        collection.upsert(
            documents=documents[i:end],
            metadatas=metadatas[i:end],
            ids=ids[i:end]
        )
        
    count = collection.count()
    print(f"\n==============================================")
    print(f"DATABASE UPGRADE COMPLETE")
    print(f"Total legal provisions successfully indexed: {count}")
    print(f"==============================================")

if __name__ == "__main__":
    main()
