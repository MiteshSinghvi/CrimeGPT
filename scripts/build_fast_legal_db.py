import os
import sys
import chromadb
import ollama

def main():
    print("Initializing Pure-Ollama Offline Local RAG Database Ingestion...")
    
    # 1. Provide local dictionary of laws
    OFFLINE_LAWS_DATA = [
        {"act": "BNS 2023", "section_number": "103", "offence_title": "Murder", "description": "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine."},
        {"act": "BNS 2023", "section_number": "105", "offence_title": "Culpable homicide not amounting to murder", "description": "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine."},
        {"act": "BNS 2023", "section_number": "109", "offence_title": "Attempt to murder", "description": "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine."},
        {"act": "BNS 2023", "section_number": "111", "offence_title": "Organised crime", "description": "Any continuing unlawful activity including kidnapping, robbery, vehicle theft, extortion, land grabbing, contract killing, economic offences, cyber-crimes having severe consequences, trafficking in people, drugs, illicit goods or weapons and human trafficking pimping for prostitution or ransom by any person..."},
        {"act": "BNS 2023", "section_number": "112", "offence_title": "Petty organised crime", "description": "Whoever, being a member of a group or gang, either singly or jointly, commits any act of theft, snatching, cheating, unauthorised selling of tickets, unauthorised betting or gambling, selling of public examination question papers or any other similar criminal act, is said to commit petty organised crime."},
        {"act": "BNS 2023", "section_number": "113", "offence_title": "Terrorist act", "description": "Whoever does any act with the intent to threaten or likely to threaten the unity, integrity, sovereignty, security, or economic security of India or with the intent to strike terror or likely to strike terror in the people or any section of the people in India or in any foreign country..."},
        {"act": "BNS 2023", "section_number": "303", "offence_title": "Theft", "description": "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft."},
        {"act": "BNS 2023", "section_number": "308", "offence_title": "Extortion", "description": "Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property, or valuable security..."},
        {"act": "BNS 2023", "section_number": "318", "offence_title": "Cheating", "description": "Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property..."},
        {"act": "BNS 2023", "section_number": "319", "offence_title": "Cheating by personation", "description": "A person is said to cheat by personation if he cheats by pretending to be some other person, or by knowingly substituting one person for another, or representing that he or any other person is a person other than he or such other person really is."},
        {"act": "IT Act", "section_number": "43", "offence_title": "Penalty and Compensation for damage to computer, computer system, etc.", "description": "If any person without permission of the owner or any other person who is incharge of a computer, computer system or computer network accesses or secures access to such computer, downloads, copies or extracts any data, introduces any computer virus, damages or causes to be damaged any computer resource..."},
        {"act": "IT Act", "section_number": "65", "offence_title": "Tampering with computer source documents", "description": "Whoever knowingly or intentionally conceals, destroys or alters or intentionally or knowingly causes another to conceal, destroy or alter any computer source code used for a computer, computer programme, computer system or computer network, when the computer source code is required to be kept or maintained by law for the time being in force, shall be punishable with imprisonment up to three years, or with fine which may extend up to two lakh rupees, or with both."},
        {"act": "IT Act", "section_number": "66", "offence_title": "Computer related offences", "description": "If any person, dishonestly or fraudulently, does any act referred to in section 43, he shall be punishable with imprisonment for a term which may extend to three years or with fine which may extend to five lakh rupees or with both."},
        {"act": "IT Act", "section_number": "66C", "offence_title": "Identity theft", "description": "Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh."},
        {"act": "IT Act", "section_number": "66D", "offence_title": "Cheating by personation by using computer resource", "description": "Whoever, by means for any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees."},
        {"act": "IT Act", "section_number": "66E", "offence_title": "Violation of privacy", "description": "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without his or her consent, under circumstances violating the privacy of that person, shall be punished with imprisonment which may extend to three years or with fine not exceeding two lakh rupees, or with both."},
        {"act": "IT Act", "section_number": "67", "offence_title": "Publishing or transmitting obscene material in electronic form", "description": "Whoever publishes or transmits or causes to be published or transmitted in the electronic form, any material which is lascivious or appeals to the prurient interest or if its effect is such as to tend to deprave and corrupt persons who are likely, having regard to all relevant circumstances, to read, see or hear the matter contained or embodied in it..."}
    ]

    # 2. Setup ChromaDB client
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "local_legal_db")
    print(f"Connecting to persistent ChromaDB at: {db_path}")
    chroma_client = chromadb.PersistentClient(path=db_path)
    
    # We don't use embedding_function here; we'll embed manually using Ollama.
    collection = chroma_client.get_or_create_collection(name="indian_legal_statutes")
    
    documents = []
    embeddings = []
    ids = []
    metadatas = []
    
    print("Generating embeddings using Ollama (nomic-embed-text)...")
    for i, law in enumerate(OFFLINE_LAWS_DATA):
        text_chunk = f"Act: {law['act']}\nSection: {law['section_number']}\nTitle: {law['offence_title']}\nDescription: {law['description']}"
        print(f"Embedding Section {law['section_number']} - {law['offence_title']}...")
        
        response = ollama.embed(model='nomic-embed-text', input=text_chunk)
        
        documents.append(text_chunk)
        embeddings.append(response['embeddings'][0])
        ids.append(f"law_{law['act'].replace(' ', '_')}_{law['section_number']}_{i}")
        metadatas.append({
            "act": law['act'],
            "section": law['section_number'],
            "title": law['offence_title']
        })
        
    print("Upserting vectors into ChromaDB...")
    collection.upsert(
        documents=documents,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )
    
    print("Success! Legal DB built via pure Ollama architecture.")

if __name__ == "__main__":
    main()
