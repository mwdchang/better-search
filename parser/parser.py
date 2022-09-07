import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import json
nlp = spacy.load("en_core_web_sm")

from collections import Counter
from heapq import nlargest

from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')

# Custom entity
# https://towardsdatascience.com/custom-named-entity-recognition-using-spacy-7140ebbb3718#:~:text=SpaCy%20NER%20already%20supports%20the,%2C%20agencies%2C%20institutions%2C%20etc.

MIN_KEYWORD_LENGTH = 3

def parse_text(raw_text, doc_id=None):
    stopwords = list(STOP_WORDS)
    out = nlp(raw_text)

    # Basic stats, common words, number of sentences ... etc
    keywords = []
    for token in out:
        if token.is_stop or token.is_punct:
            continue

        candidate = token.text.strip()
        if candidate == "" or candidate.startswith("\\") == True or len(candidate) < MIN_KEYWORD_LENGTH:
            continue
        keywords.append(candidate)

    word_freq = Counter(keywords)
    max_freq = word_freq.most_common(1)[0][1]
    for word in word_freq:
        word_freq[word] = word_freq[word] / max_freq
    common_words = word_freq.most_common(5)
    num_sentences = len(list(out.sents))

    sents = []
    for sent in out.sents:
        ner = {}
        for ent in sent.ents:
            if ent.label_ in ner:
                ner[ent.label_].append(ent.text)
            else:
                ner[ent.label_] = [ent.text]

        noun_chunks = []
        for chunk in sent.noun_chunks:
            noun_chunks.append(chunk.text)

        sents.append({
            "text": sent.text,
            "vector": sent.vector.tolist(),
            "sbert_vector": model.encode([sent.text])[0].tolist(),
            "ner": ner,
            "noun_chunks": noun_chunks
        })

    # Summarize raw text
    # See: https://medium.com/analytics-vidhya/text-summarization-using-spacy-ca4867c6b744
    sent_strength = {}
    for sent in out.sents:
        for word in sent:
            if word.text in word_freq.keys():
                if sent in sent_strength.keys():
                    sent_strength[sent] += word_freq[word.text]
                else:
                    sent_strength[sent] = word_freq[word.text]

    summarized_text = nlargest(3, sent_strength, key=sent_strength.get)

    # Name-entity extraction
    ner = {}
    for ent in out.ents:
        if ent.label_ in ner:
            ner[ent.label_].append(ent.text)
        else:
            ner[ent.label_] = [ent.text]

    # Remove noisy
    if "CARDINAL" in ner:
        del ner["CARDINAL"]

    if "MONEY" in ner:
        del ner["MONEY"]

    if "PERCENT" in ner:
        del ner["PERCENT"]

    # Vector representation
    # spacCy's doc vector is just the average of word vectors, so it isn't great because of order-invariance
    vector = out.vector


    # Return as object/json
    result = {
        "id": doc_id,
        "text": raw_text,
        "sents": sents,
        # "vector":out.vector,
        "summarized_text": [s.text for s in summarized_text],
        "common_words": common_words,
        "num_sentences": num_sentences
        # "ner": ner
    }
    return result


def parse_text_2_json(raw_text, doc_id=None):
    r = parse_text(raw_text, doc_id)
    return json.dumps(r)
