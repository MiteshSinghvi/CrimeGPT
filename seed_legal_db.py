import chromadb

def main():
    print("Initializing ChromaDB persistent client at ./local_legal_db...")
    chroma_client = chromadb.PersistentClient(path="./local_legal_db")
    
    print("Getting or creating collection 'bns_bnss_bsa_laws'...")
    collection = chroma_client.get_or_create_collection(name="bns_bnss_bsa_laws")

    documents = [
        "BNS Section 318(1) & 318(4): Cheating and dishonestly inducing delivery of property. Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine. This is often applicable in cyber fraud where money is transferred under false pretenses.",
        "BNS Section 319: Cheating by personation. A person is said to 'cheat by personation' if he cheats by pretending to be some other person, or by knowingly substituting one person for another, or representing that he or any other person is a person other than he or such other person really is. This applies heavily to digital identity fraud and catfishing. Punishment involves imprisonment up to 5 years, or fine, or both.",
        "BNS Section 78 (formerly IPC 354D): Stalking. Includes any man who follows a woman and contacts, or attempts to contact such woman to foster personal interaction repeatedly despite a clear indication of disinterest by such woman; or monitors the use by a woman of the internet, email or any other form of electronic communication. The punishment on first conviction is imprisonment up to 3 years and a fine; and on any subsequent conviction, imprisonment up to 5 years and a fine.",
        "BNS Section 308: Extortion. Putting a person in fear of injury to commit extortion. Whoever commits extortion by putting any person in fear of an injury shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both. If the fear is of death or grievous hurt, the term may extend to seven years and fine. This applies to ransomware, sextortion, and other online extortion threats.",
        "IT Act Section 66C: Identity theft. Whoever, fraudulently or dishonestly makes use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh. Relevant in hacking, phishing, and unauthorized access cases.",
        "IT Act Section 66D: Cheating by personation by using computer resource. Whoever, by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees. Extensively used in cases of fake profiles, spoofing, and online financial scams where the identity is forged."
    ]

    metadatas = [
        {"act": "BNS 2023", "section": "318", "offense_type": "Cheating and Fraud"},
        {"act": "BNS 2023", "section": "319", "offense_type": "Cheating by Personation"},
        {"act": "BNS 2023", "section": "78", "offense_type": "Cyber Stalking"},
        {"act": "BNS 2023", "section": "308", "offense_type": "Extortion"},
        {"act": "IT Act", "section": "66C", "offense_type": "Identity Theft"},
        {"act": "IT Act", "section": "66D", "offense_type": "Cheating by Personation (Digital)"}
    ]

    ids = ["bns_318", "bns_319", "bns_78", "bns_308", "it_66c", "it_66d"]

    print("Upserting documents to the database...")
    collection.upsert(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    count = collection.count()
    print(f"Success! Total documents in 'bns_bnss_bsa_laws' collection: {count}")

if __name__ == "__main__":
    main()
