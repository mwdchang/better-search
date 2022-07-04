## Better Search
An experiment with searching relevant threads in text corpus.

### Motivation
When searching across a collection of loosely correlated text, it can be helpful be able to extract threads that may not completely obvious but is still of certain interests. Consider this:

```
Using ElasticSearch as a primary datastore instead of traditional RDMBS like Postgres has a few minor caveats. We will need to do some experiments to see if ES is a nice fit.
```

If we are just search for ElasticSearch we may just get document, but it would be great to find if we had also made any notes on the experimentations or what we had tried with other DBs. This experiment here tries to facilatate this automatically through the use of language features and other established techniques.


### Background
This is fairly similar to the idea of tagging and then searching for tag co-occurrences. But here we can make the techniques more refined and better apt at pulling out relevant threads. NLP processing can be used to generate "tags" and embeddings, and we can then define a measure of similarity between directly-matched documents and the subsequent generations of indirect-matches: e.g. topic A => topic B => topics { C, D }.


### Parser 
The parser module chunks and analyzes text, and output an indexable/searchable JSON metadata. We extract different language features as a way to measure correlation and relatedness.
- Common words
- Name entity extractions
- Embedding vector


#### Prepation
Depends on [spacy](https://spacy.io/usage)

```
pip install spacy
python -m spacy download en_core_web_sm
```


### Datasets
Diary entries from John McKinlay on his exploring expedition
- Transcribed from http://www.burkeandwills.net.au/Journals/Mckinlays_Journals/index.htm

