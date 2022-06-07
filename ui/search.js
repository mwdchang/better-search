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
        if (Object.keys(sNER).length > 0) {
          ners.push(sent.ner);
        }
      }
    });
    return found;
  });


  const totalNERMap = new Map();
  for (const ner of ners) {
    for (const [_k, v] of Object.entries(ner)) {
      // console.log(`${k}: ${v}`);
      
      for (const token of v) {
        if (totalNERMap.has(token)) {
          totalNERMap.set(token, totalNERMap.get(token) + 1);
        } else {
          totalNERMap.set(token, 1);
        }
      }
    }
    // console.log(ner);
  }

  const topNER = [...totalNERMap.entries()].sort((a, b) => b[1] - a[1]).splice(0, 8);
  // console.log(topNER);


  // Secondary search
  const indirectMatches = [];
  const topList = topNER.map(d => d[0]);
  console.log(topList, directMatches.length);

  for (const doc of corpus) {
    if (directMatches.filter(d => d.id === doc.id).length >= 1) {
      continue;
    }

    let cnt = 0;
    for (const token of topList) {
      if (doc.text.includes(token)) cnt++;
    }
    if (cnt > 4) {
      indirectMatches.push(doc);
    }
  }

  console.log(`${directMatches.length}  ${indirectMatches.length}`);
  console.log(indirectMatches.map(d => d.text));

  return directMatches;
}

export const distance = (v1, v2) => {
  let total = 0;
  for (let i = 0; i < v1.length; i++) {
    total += (v1[i] - v2[i]) * (v1[i] - v2[i]);
  }
  return Math.sqrt(total);
}
