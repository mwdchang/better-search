const arc = (marginLeft, y1, y2) => {
  const r = Math.abs(y2 - y1) / 2;
  return `M${marginLeft},${y1}A${r},${r * 1.1} 0,0,${y1 < y2 ? 1 : 0} ${marginLeft},${y2}`;
}

export const resetHighlight = (svg) => {
  svg.selectAll('circle').attr('fill', '#BBE').attr('r', 6);
};

export const highlight = (svg, id) => {
  svg.selectAll('circle').filter(d => d.id === id).attr('fill', '#f80').attr('r', 8);
};

export const resetLinks = (svg) => {
  svg.selectAll('path').remove();
};

export const links = (svg, source, targets) => {
  const marginLeft = 30;
  const src = svg.selectAll('circle').filter(d => d.id === source).data()[0];

  for (const targetId of targets) {
    const tgt = svg.selectAll('circle').filter(d => d.id === targetId).data()[0];
    console.log(src, tgt);

    svg.append('path')
      .attr('d', arc(marginLeft, src._y, tgt._y))
      .style('fill', 'none')
      .style('stroke', '#BBB');
  }
};

export const renderArcDiagram = (svg, rawData) => {
  const len = rawData.length;
  const bound = svg.node().getBoundingClientRect();

  const marginLeft = 30;
  const H = bound.height;
  const W = bound.width;
  const padding = 20;
  const itemH = Math.floor((H - 2 * padding) / len);

  // console.log('bound', bound);
  // console.log('len', len);
  // console.log('itemH', itemH);

  // Render nodes
  for (let i = 0; i < len; i++) {
    svg.append('circle')
      .datum(rawData[i])
      .attr('cx', marginLeft)
      .attr('cy', padding + i * itemH)
      .attr('r', 6)
      .attr('stroke', '#888')
      .attr('fill', '#BBE');
  }


  // Render links - FIXME
  for (let i = 0; i < len; i++) {
    rawData[i]._y = padding + i * itemH;
  }

  /*
  for (let i = 0; i < len - 2; i++) {
    svg.append('path')
      .attr('d', arc(marginLeft, rawData[i]._y, rawData[i+1]._y))
      .style('fill', 'none')
      .style('stroke', '#BBB');

    svg.append('path')
      .attr('d', arc(marginLeft, rawData[i]._y, rawData[i+2]._y))
      .style('fill', 'none')
      .style('stroke', '#BBB');

  }
  */

  // Render labels
  for (let i = 0; i < len; i++) {
    svg.append('text')
      .attr('x', marginLeft + 10)
      .attr('y', padding + 5 + i * itemH)
      .style('font-size', '80%')
      .text(rawData[i].id);
  }
};
