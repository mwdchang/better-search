import spacy
import json

nlp = spacy.load("en_core_web_sm")

raw_text = "The Indian Space Research Organisation or is the national space agency of India,headquartered in Bengaluru. It operates under Department of Space which is directly overseen by the Prime Minister of India while Chairman of ISRO acts as executive of DOS as well. "

out = nlp(raw_text)

################################################################################
# Part of speech
################################################################################
print("\nPart of Speech")
for token in out:
    print(f"{token.text}\t{token.pos_}\t{token.dep_}")



################################################################################
# Named Entities
#
# geo = Geographical Entity
# org = Organization
# per = Person
# gpe = Geopolitical Entity
# tim = Time indicator
# art = Artifact
# eve = Event
# nat = Natural Phenomenon
#
################################################################################
metadata = {}
print("\nNamed Entities")
for ent in out.ents:
    if ent.label_ in metadata:
        metadata[ent.label_].append(ent.text)
    else:
        metadata[ent.label_] = [ent.text]
    print(ent.text, ent.start_char, ent.end_char, ent.label_)

print(json.dumps(metadata))


################################################################################
# Similiarity
# See also https://stackoverflow.com/questions/52113939/spacy-strange-similarity-between-two-sentences
################################################################################
doc1 = nlp("I like salty fries and hamburgers.")
doc2 = nlp("Fast food tastes very good.")
# print(doc1, "<->", doc2, doc1.similarity(doc2))
print(len(doc1.vector))
print(len(doc2.vector))
print(len(out.vector))
