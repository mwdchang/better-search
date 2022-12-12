const arc = (marginLeft, y1, y2) => {
  const r = Math.abs(y2 - y1) / 2;
  return `M${marginLeft},${y1}A${r},${r * 1.1} 0,0,${y1 < y2 ? 1 : 0} ${marginLeft},${y2}`;
}

const renderArcDiagram = (svg, rawData) => {
  const len = rawData.length;
  const bound = svg.node().getBoundingClientRect();

  const marginLeft = 30;
  const H = bound.height;
  const W = bound.width;
  const padding = 20;
  const itemH = Math.floor((H - 2 * padding) / len);

  console.log('bound', bound);
  console.log('len', len);
  console.log('itemH', itemH);

  // Render links
  for (let i = 0; i < len; i++) {
    svg.append('circle')
      .attr('cx', marginLeft)
      .attr('cy', padding + i * itemH)
      .attr('r', 6)
      .attr('stroke', '#888')
      .attr('fill', '#BBE');
  }


  // Render nodes - FIXME
  for (let i = 0; i < len; i++) {
    rawData[i]._y = padding + i * itemH;
  }

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
};
