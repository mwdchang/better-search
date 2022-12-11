import json

# SBERT
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')

# Spacy
import spacy
nlp = spacy.load("en_core_web_sm")

def parse_text(raw_text, doc_id=None):
    out = nlp(raw_text)

    # 1. Sentence vectors
    sentences = []
    for sent in out.sents:
        sentences.append({
            "text": sent.text,
            "sbert_vector": model.encode([sent.text])[0].tolist()
        })

    # General NER extraction
    ner = {}

    for ent in out.ents:
        if ent.label_ in ner:
            ner[ent.label_].append(ent.text)
        else:
            ner[ent.label_] = [ent.text]

    # 2. Remove noisy NERs
    if "CARDINAL" in ner:
        del ner["CARDINAL"]

    if "MONEY" in ner:
        del ner["MONEY"]

    if "PERCENT" in ner:
        del ner["PERCENT"]

    for key in ner:
        ner[key] = list(set(ner[key]))


    # Return result
    result = {
        "id": doc_id,
        "sentences": sentences,
        "ner": ner
    }
    return result

def parse_text_2_json(raw_text, doc_id=None):
    r = parse_text(raw_text, doc_id)
    return json.dumps(r)
