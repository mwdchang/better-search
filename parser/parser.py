import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import json
nlp = spacy.load("en_core_web_sm")

from collections import Counter
from heapq import nlargest

def parse_text(raw_text):
    stopwords = list(STOP_WORDS)
    out = nlp(raw_text)

    # Basic stats, common words, number of sentences ... etc
    keywords = []
    for token in out:
        if token.is_stop or token.is_punct:
            continue
        keywords.append(token.text)

    word_freq = Counter(keywords)
    max_freq = word_freq.most_common(1)[0][1]
    for word in word_freq:
        word_freq[word] = word_freq[word] / max_freq
    common_words = word_freq.most_common(5)
    num_sentences = len(list(out.sents))

    # Summarize
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
        # print(ent.text, ent.start_char, ent.end_char, ent.label_)

    # Vector representation
    # spacCy's doc vector is just the average of word vectors, so it isn't great because of order-invariance
    vector = out.vector


    # Return as object/json
    result = {
        # "text": raw_text,
        "summarized_text": summarized_text,
        "common_words": common_words,
        "ner": ner,
        # "vector":out.vector
    }
    return result
