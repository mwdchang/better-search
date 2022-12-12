// Check "Flowfield path finding"

/**
 * @param {string} searchStr
 * @param {array} corpus
 */
export const betterSearch = (searchStr, corpus) => {
  // 1. Direct matching
  const directMatches = corpus.filter(d => {
    const found = d.summarized_text.find(v => v.toLowerCase().includes(searchStr));
    // const found = d.text.toLowerCase().includes(searchStr);
    return found ? true : false;
  });

  // 2. Find the overlaps and perform secondary search
  // TODO: Should have paramter for windowing size to search
  const commonKeywordMap = (directMatches.map(d => d.common_words.map(w => w[0]))).flat().reduce((acc, k) => {
    if (acc.has(k)) {
      acc.set(k, +acc.get(k) + 1)
    } else {
      acc.set(k, 1)
    }
    return acc;
  }, new Map());

  const commonKeywords = [...commonKeywordMap.entries()].sort((a, b) => b[1] - a[1]);
  console.log(commonKeywords.splice(0, 5));
  return directMatches;
}


export const betterSearch2 = (searchStr, corpus) => {
  // 1. Direct matching across document sentences
  const matchedSentences = [];
  const matchedDocIndices = [];
  const directMatches = corpus.filter((doc, idx) => {
    let found = false;

    doc.sents.forEach(sent => {
      if (sent.text.toLowerCase().includes(searchStr)) {
        found = true;
        matchedSentences.push(sent);
      }
    });
    if (found) {
      matchedDocIndices.push(idx);
    }
    return found;
  });

  console.log(matchedDocIndices);

  // 2. Secondary matches
  for (let i = 0; i < corpus.length; i++) {
    if (matchedDocIndices.includes(i)) continue;
    const doc = corpus[i];

    for (const matchedSent of matchedSentences) {
      for (const sent of doc.sents) {
        const dist = distance(matchedSent.vector, sent.vector);
        if (dist < 1.25) {
          console.log('');
          console.log(dist);
          console.log(`>> ${i} ` + matchedSent.text);
          console.log(`<< ${i} ` + sent.text);
          console.log('');
        }
      }
    }
  }
  return directMatches;
}


export const betterSearch3 = (searchStr, corpus) => {

  const ners = [];
  const nounChunks = [];

  // 1. Direct matching
  const directMatches = corpus.filter(doc => {
    let found = false;
    doc.sents.forEach(sent => {
      if (sent.text.toLowerCase().includes(searchStr)) {
        found = true;

        const sNER = sent.ner;
        delete sNER.CARDINAL;
        delete sNER.ORDINAL;
        delete sNER.DATE;
        // console.log('--', sent.noun_chunks.filter(d => d.split(' ').length > 1));
        const testChunks = sent.noun_chunks.filter(d => d.split(' ').length > 1);
        testChunks.forEach(d => {
          nounChunks.push(d);
        });

        if (Object.keys(sNER).length > 0) {
          ners.push(sent.ner);
        }
      }
    });
    return found;
  });
  console.log('# direct matches', directMatches.length);


  // Find sentence level NER
  const totalNERMap = new Map();
  for (const ner of ners) {
    for (const [_k, v] of Object.entries(ner)) {
      for (const token of v) {
        if (totalNERMap.has(token)) {
          totalNERMap.set(token, totalNERMap.get(token) + 1);
        } else {
          totalNERMap.set(token, 1);
        }
      }
    }
  }

  const topNER = [...totalNERMap.entries()].sort((a, b) => b[1] - a[1]).splice(0, 20);
  const topNERList = topNER.map(d => d[0]);
  console.log('top ner:', topNERList);

  // Find common words for document
  const commonMap = new Map();
  for (const doc of directMatches) {
    doc.common_words.forEach(d => commonMap.set(d[0], 1));
  }
  const commonWords = [...commonMap.keys()];
  console.log('top common words', commonWords);
  

  // Secondary search
  const indirectMatches = [];

  const temp = {};

  for (const doc of corpus) {
    if (directMatches.filter(d => d.id === doc.id).length >= 1) {
      continue;
    }

    let cnt = 0;
    for (const token of topNERList) {
      if (doc.text.includes(token)) {
        cnt++;
        temp[token] = 1;
      }
    }

    for (const chunk of nounChunks) {
      if (doc.text.includes(chunk)) {
        cnt++;
        temp[chunk] = 1;
      }
    }

    // for (const token of commonWords){
    //   if (doc.text.includes(token)) cnt++;
    // }

    // Include docs above threshold coverage
    if (cnt > 4) {
      indirectMatches.push(doc);
    }
  }

  // console.log(`${directMatches.length}  ${indirectMatches.length}`);
  console.log('# secondary matches', indirectMatches.length);
  console.log(indirectMatches.map(d => d.text));

  return [directMatches, indirectMatches, Object.keys(temp)];
};

export const distance = (v1, v2) => {
  let total = 0;
  for (let i = 0; i < v1.length; i++) {
    total += (v1[i] - v2[i]) * (v1[i] - v2[i]);
  }
  return Math.sqrt(total);
};

export const cosineSim = (A,B) => {
    let dotproduct=0;
    let mA=0;
    let mB=0;
    for(let i = 0; i < A.length; i++) { 
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    return (dotproduct)/((mA)*(mB)); 
}

/**
 * Given
 * [
 *   {
 *     person: [tokenX, tokenY]
 *     org: [...]
 *   },
 *   {
 *     org: [...],
 *     ...
 *   }
 * ]     
 *
 * Transform to 
 *   [tokenA, tokenB ...]
 */
const extractTopNER = (ners) => {
  // Find sentence level NER
  const totalNERMap = new Map();
  for (const ner of ners) {
    for (const [_k, v] of Object.entries(ner)) {
      for (const token of v) {
        if (totalNERMap.has(token)) {
          totalNERMap.set(token, totalNERMap.get(token) + 1);
        } else {
          totalNERMap.set(token, 1);
        }
      }
    }
  }

  const topNER = [...totalNERMap.entries()].sort((a, b) => b[1] - a[1]).splice(0, 20);
  return topNER.map(d => d[0]);
};



export const betterSearch4 = (searchStr, corpus) => {
  // 1. Direct matching
  const directMatches = corpus.filter(doc => {
    let found = false;
    doc.sents.forEach(sent => {
      if (sent.text.toLowerCase().includes(searchStr)) {
        found = true;
      }
    });
    return found;
  });


  console.log('');
  console.log('======== Better search 4 ========');
  console.log('# total docs', corpus.length);
  console.log('# direct matches', directMatches.length);


  // 2. For each direct match, find similar documents
  const dupeMap = new Map();
  for (const doc of directMatches) {
    dupeMap.set(doc.id, 1);
  }
  const availableDocs = corpus.filter(d => ! dupeMap.has(d.id));

  console.log('# remaining for secondary search', availableDocs.length);

  const level2Map = {};

  for (const doc of directMatches) {
    const nounChunks = [];
    const ners = [];

    level2Map[doc.id] = [];

    // Extract the language properties for the matched doc
    doc.sents.forEach(sent => {
      if (sent.text.toLowerCase().includes(searchStr)) {
        const sNER = sent.ner;
        delete sNER.CARDINAL;
        delete sNER.ORDINAL;
        delete sNER.DATE;
        const testChunks = sent.noun_chunks.filter(d => d.split(' ').length > 1);
        testChunks.forEach(d => {
          nounChunks.push(d);
        });

        if (Object.keys(sNER).length > 0) {
          ners.push(sent.ner);
        }
      }
    });

    const topNERs = extractTopNER(ners);

    // Search through remaining available for similarity
    for (const candidateDoc of availableDocs) {
      let cnt = 0;
      const matchedTokens = [];
      for (const token of topNERs) {
        if (candidateDoc.text.includes(token)) {
          cnt++;
          matchedTokens.push(token);
        }
      }

      for (const chunk of nounChunks) {
        if (candidateDoc.text.includes(chunk)) {
          cnt++;
          matchedTokens.push(chunk);
        }
      }

      if (cnt > 2) {
        console.log('\tFound secondary', doc.id);

        level2Map[doc.id].push({
          doc: candidateDoc,
          matchedTokens: matchedTokens
        });
      }
    }
  }

  return [directMatches, level2Map];
};


export const betterSearch5 = (searchStr, corpus) => {
  // 1. Direct matching
  const directMatches = corpus.filter(doc => {
    let found = false;
    doc.sents.forEach(sent => {
      if (sent.text.toLowerCase().includes(searchStr)) {
        found = true;
      }
    });
    return found;
  });

  console.log('');
  console.log('======== Better search 4 ========');
  console.log('# total docs', corpus.length);
  console.log('# direct matches', directMatches.length);


  // 2. For each direct match, find similar documents
  const dupeMap = new Map();
  for (const doc of directMatches) {
    dupeMap.set(doc.id, 1);
  }
  const availableDocs = corpus.filter(d => ! dupeMap.has(d.id));

  console.log('# remaining for secondary search', availableDocs.length);

  const level2Map = {};

  for (const doc of directMatches) {
    for (const docSent of doc.sents) {

      // Check pairwise document sentences
      for (const candidateDoc of availableDocs) {
        const similarSents = [];
        // console.log(`> ${doc.id} ${docSent.text}`)
        for (const candidateDocSent of candidateDoc.sents) {
          const score = cosineSim(docSent.sbert_vector, candidateDocSent.sbert_vector);

          if (score > 0.35) {
            // console.log(`\t${candidateDoc.id} ${score.toFixed(3)} ${candidateDocSent.text}`);
            similarSents.push({
              source: docSent.text,
              target: candidateDocSent.text
            });
          }
        }
      
        if (similarSents.length >= 1) {
          if (!level2Map[doc.id]) {
            level2Map[doc.id] = []
          }
          level2Map[doc.id].push({
            doc: candidateDoc,
            similarSents: similarSents
          });
        }
      }
    }
  }
  return [directMatches, level2Map];
};


/**
 *
 * @param {string} searchText
 * @param {array} corpus
 * @param {object} options
 * @param {number} options.sentenceNeighbourhood
 **/
export const doSearch = (searchText, corpus, options) => {
  const mainMatches = [];

  // 1. First round of matches, directly match against text
  corpus.forEach(doc => {
    const nextCandidates = new Set();
    const matches = new Set();

    for (let i = 0; i < doc.sentences.length; i++) {
      if (doc.sentences[i].text.toLowerCase().includes(searchText)) {
        matches.add(i);
        const start = Math.max(0, i - options.sentenceNeighbourhood);
        const end = Math.min(i + options.sentenceNeighbourhood + 1, doc.sentences.length);

        for (let j = start; j < end; j++) {
          nextCandidates.add(j);
        }
      }
    }
    console.log('nextCandidates', Array.from(nextCandidates));

    mainMatches.push({
      id: doc.id,
      matched: Array.from(matches),
      candidates: Array.from(nextCandidates)
    });
  });


  // 2. Search over candidates to pull out threads

  console.log('!!!', mainMatches);
};



// https://www.kaggle.com/code/thebrownviking20/topic-modelling-with-spacy-and-scikit-learn/notebook
