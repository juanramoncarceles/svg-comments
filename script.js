const svg = document.getElementById('canvas');

const settings = {
  width: '180',
  height: '140',
  cornerRadius: '10',
  dragPtRadius: '8',
  rectFill: '#bef0e1',
  rectStroke: '#acacac',
  handlesFill: '#579c9e',
  iconsFill: '#494949'
}



class BoxComment {
  constructor(svg, settings, point) {
    this.settings = settings;
    this.svg = svg;
    this.mousemoveHandler = this.mousemoveHandler.bind(this);
    this.mouseupHandler = this.mouseupHandler.bind(this);
    this.enableComment = this.enableComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.createComment(point);
    this.enableComment();
  }

  placed = false;

  svgNS = "http://www.w3.org/2000/svg";

  transformRegExp = /translate\((-*\d*(?:\.\d+){0,1})px,\s*(-*\d*(?:\.\d+){0,1})/;

  id = uuidv4();

  // commentedElement;  // This will be the SVG element to be commented, maybe more than one element
  allowDrag = false;
  commentWrapper;
  mainRect;
  reszRPt;
  reszLPt;
  reszTPt;
  reszBPt;
  movePt;
  optionsBtn;
  optionsContainer;
  deleteBtn;
  textContent;
  startPt;
  startW;
  startH;
  startTransform;
  activeHandle;
  startOptionsTransform;
  reszPtStartX;
  reszPtStartY;
  // An auxiliary SVG group to hide everything but the rectangle when the comment is minimized
  auxGroup;

  createComment(point) {
    this.commentWrapper = document.createElementNS(this.svgNS, 'g');
    this.commentWrapper.style.transform = `translate(${point.x - this.settings.width / 2}px,${point.y - this.settings.height / 2}px) scale(0.1)`;
    this.commentWrapper.style.transformOrigin = `${this.settings.width / 2}px ${this.settings.height}px`;
    this.commentWrapper.innerHTML = '<polygon style="opacity:0;" points="-25 -10 -10 -25 15 0 0 15" />';
    this.commentWrapper.classList.add('commentWrapper');
    // The main rectangle
    this.mainRect = document.createElementNS(this.svgNS, 'rect');
    this.mainRect.setAttribute('x', '0');
    this.mainRect.setAttribute('y', '0');
    this.mainRect.setAttribute('rx', this.settings.cornerRadius);
    this.mainRect.setAttribute('ry', this.settings.cornerRadius);
    this.mainRect.setAttribute('width', this.settings.width);
    this.mainRect.setAttribute('height', this.settings.height);
    this.mainRect.setAttribute('style', `fill:${this.settings.rectFill};stroke:${this.settings.rectStroke};`);
    this.commentWrapper.appendChild(this.mainRect);
    // The aux svg group
    this.auxGroup = document.createElementNS(this.svgNS, 'g');
    this.auxGroup.setAttribute('style', 'display:none;');
    // The handles group
    const handlesGroup = document.createElementNS(this.svgNS, 'g');
    handlesGroup.classList.add('reszHandles');
    handlesGroup.setAttribute('style', 'fill:' + this.settings.handlesFill + ';');
    // The right handle
    this.reszRPt = document.createElementNS(this.svgNS, 'circle');
    this.reszRPt.setAttribute('cx', this.settings.width);
    this.reszRPt.setAttribute('cy', this.settings.height / 2);
    this.reszRPt.setAttribute('r', this.settings.dragPtRadius);
    this.reszRPt.setAttribute('style', 'cursor:e-resize');
    this.reszRPt.addEventListener('mousedown', e => {
      this.allowDrag = true;
      this.startPt = getRelativeCoords(e, this.svg);
      this.startW = this.mainRect.width.baseVal.value;
      this.reszPtStartX = this.reszRPt.cx.baseVal.value;
      this.startOptionsTransform = this.optionsContainer.style.transform.match(this.transformRegExp);
      this.activeHandle = 'r';
    });
    // The left handle
    this.reszLPt = document.createElementNS(this.svgNS, 'circle');
    this.reszLPt.setAttribute('cx', '0');
    this.reszLPt.setAttribute('cy', this.settings.height / 2);
    this.reszLPt.setAttribute('r', this.settings.dragPtRadius);
    this.reszLPt.setAttribute('style', 'cursor:w-resize');
    this.reszLPt.addEventListener('mousedown', e => {
      this.allowDrag = true;
      this.startPt = getRelativeCoords(e, this.svg);
      this.startW = this.mainRect.width.baseVal.value;
      this.reszPtStartX = this.reszRPt.cx.baseVal.value;
      this.startTransform = this.commentWrapper.style.transform.match(this.transformRegExp);
      this.startOptionsTransform = this.optionsContainer.style.transform.match(this.transformRegExp);
      this.activeHandle = 'l';
    });
    // The top hanlde
    this.reszTPt = document.createElementNS(this.svgNS, 'circle');
    this.reszTPt.setAttribute('cx', this.settings.width / 2);
    this.reszTPt.setAttribute('cy', '0');
    this.reszTPt.setAttribute('r', this.settings.dragPtRadius);
    this.reszTPt.setAttribute('style', 'cursor:n-resize');
    this.reszTPt.addEventListener('mousedown', e => {
      this.allowDrag = true;
      this.startPt = getRelativeCoords(e, this.svg);
      this.startH = this.mainRect.height.baseVal.value;
      this.reszPtStartY = this.reszBPt.cy.baseVal.value;
      this.startTransform = this.commentWrapper.style.transform.match(this.transformRegExp);
      this.activeHandle = 't';
    });
    // The bottom handle
    this.reszBPt = document.createElementNS(this.svgNS, 'circle');
    this.reszBPt.setAttribute('cx', this.settings.width / 2);
    this.reszBPt.setAttribute('cy', this.settings.height);
    this.reszBPt.setAttribute('r', this.settings.dragPtRadius);
    this.reszBPt.setAttribute('style', 'cursor:s-resize');
    this.reszBPt.addEventListener('mousedown', e => {
      this.allowDrag = true;
      this.startPt = getRelativeCoords(e, this.svg);
      this.startH = this.mainRect.height.baseVal.value;
      this.reszPtStartY = this.reszBPt.cy.baseVal.value;
      this.activeHandle = 'b';
    });
    // Append all the handles to the group and the group to the comment
    handlesGroup.appendChild(this.reszRPt);
    handlesGroup.appendChild(this.reszLPt);
    handlesGroup.appendChild(this.reszTPt);
    handlesGroup.appendChild(this.reszBPt);
    this.auxGroup.appendChild(handlesGroup);
    // The move handle
    this.movePt = document.createElementNS(this.svgNS, 'g');
    this.movePt.classList.add('commentMove');
    this.movePt.setAttribute('style', 'transform:translate(-24px,-24px);cursor:move;');
    this.movePt.addEventListener('mousedown', e => {
      this.allowDrag = true;
      this.startPt = getRelativeCoords(e, this.svg);
      this.startTransform = this.commentWrapper.style.transform.match(this.transformRegExp);
      this.activeHandle = 'm';
    });
    // The contents of the move handle are added with innerHTML temporarily
    this.movePt.innerHTML = '<circle style="opacity:0" cx="12" cy="12" r="12" /><polygon style="fill:#494949;" points="12 0 7 5 10 5 10 10 5 10 5 7 0 12 5 17 5 14 10 14 10 19 7 19 12 24 17 19 14 19 14 14 19 14 19 17 24 12 19 7 19 10 14 10 14 5 17 5" />';
    this.auxGroup.appendChild(this.movePt);
    // The options button
    this.optionsBtn = document.createElementNS(this.svgNS, 'circle');
    this.optionsBtn.setAttribute('class', 'commentOptBtn');
    this.optionsBtn.setAttribute('style', 'cursor:pointer;fill:#acacac;stroke:#808080;');
    this.optionsBtn.setAttribute('cx', '165');
    this.optionsBtn.setAttribute('cy', '15');
    this.optionsBtn.setAttribute('r', '6');
    this.optionsBtn.addEventListener('click', () => this.optionsContainer.classList.toggle('displayNone'));
    this.auxGroup.appendChild(this.optionsBtn);
    // The options container
    this.optionsContainer = document.createElementNS(this.svgNS, 'g');
    this.optionsContainer.classList.add('displayNone', 'commentOptions');
    this.optionsContainer.setAttribute('style', `transform:translate(153px,-63px);fill:${this.settings.iconsFill};`);
    this.optionsContainer.innerHTML = '<rect style="opacity:0;" x="-3" y="0" width="30" height="65" />';
    this.auxGroup.appendChild(this.optionsContainer);
    // The delete button
    this.deleteBtn = document.createElementNS(this.svgNS, 'g');
    this.deleteBtn.setAttribute('style', 'cursor:pointer;transform:translateY(33px);');
    this.deleteBtn.innerHTML = '<rect style="opacity:0;" x="0" y="0" width="24" height="24" /><path d="M22,4.25H16.75V2.5A2.2534,2.2534,0,0,0,14.5.25h-5A2.2534,2.2534,0,0,0,7.25,2.5V4.25H2a.75.75,0,0,0,0,1.5H3.25V21A2.7485,2.7485,0,0,0,6,23.75H18A2.7485,2.7485,0,0,0,20.75,21V5.75H22a.75.75,0,0,0,0-1.5ZM8.75,2.5a.7555.7555,0,0,1,.75-.75h5a.7555.7555,0,0,1,.75.75V4.25H8.75ZM19.25,21A1.25,1.25,0,0,1,18,22.25H6A1.25,1.25,0,0,1,4.75,21V5.75h14.5Z" /><path d="M12,19.75a.75.75,0,0,1-.75-.75V10a.75.75,0,0,1,1.5,0v9A.75.75,0,0,1,12,19.75Z" /><path d="M16,19.75a.75.75,0,0,1-.75-.75V10a.75.75,0,0,1,1.5,0v9A.75.75,0,0,1,16,19.75Z" /><path d="M8,19.75A.75.75,0,0,1,7.25,19V10a.75.75,0,0,1,1.5,0v9A.75.75,0,0,1,8,19.75Z" />';
    this.deleteBtn.addEventListener('click', this.deleteComment);
    this.optionsContainer.appendChild(this.deleteBtn);
    // The text element
    this.textContent = document.createElementNS(this.svgNS, 'text');
    this.textContent.setAttribute('style', 'font-size:15px;font-family:sans-serif;transform:translate(25px,40px);');
    this.textContent.innerHTML = '<tspan x="0" dy="0">Add a comment...</tspan>';
    this.auxGroup.appendChild(this.textContent);
    this.commentWrapper.appendChild(this.auxGroup);
    this.svg.appendChild(this.commentWrapper);
  }

  // Currently each time a comment is enabled the mousemove and mouseup listeners are added to the svg canvas and
  // those are removed when the comment is disabled. Another option would be to have them always and share them
  enableComment() {
    this.svg.addEventListener('mousemove', this.mousemoveHandler); // TODO Just allow one comment to be enabled simultaneously, otherwise several event listeners would be added
    this.svg.addEventListener('mouseup', this.mouseupHandler);
    this.mainRect.removeEventListener('click', this.enableComment);
    this.auxGroup.style.display = 'unset';
    this.commentWrapper.style.transform = this.commentWrapper.style.transform.replace(/scale\(-*\d*\.*\d+\)/, 'scale(1)');
    this.mainRect.style.cursor = 'unset';
    activeComment = this;
  }

  disableComment() {
    this.svg.removeEventListener('mousemove', this.mousemoveHandler);
    this.svg.removeEventListener('mouseup', this.mouseupHandler);
    this.mainRect.addEventListener('click', this.enableComment);
    this.auxGroup.style.display = 'none';
    this.commentWrapper.style.transform = this.commentWrapper.style.transform.replace(/scale\(-*\d*\.*\d+\)/, 'scale(0.1)');
    this.mainRect.style.cursor = 'pointer';
  }


  mousemoveHandler(e) {
    if (this.allowDrag && this.activeHandle === 'm') {
      const deltaX = getRelativeCoords(e, this.svg).x - this.startPt.x;
      const deltaY = getRelativeCoords(e, this.svg).y - this.startPt.y;
      this.commentWrapper.style.transform = `translate(${Number(this.startTransform[1]) + deltaX}px, ${Number(this.startTransform[2]) + deltaY}px) scale(1)`;
    } else if (this.allowDrag && this.activeHandle === 'r') {
      const deltaX = getRelativeCoords(e, this.svg).x - this.startPt.x;
      this.mainRect.setAttribute('width', this.startW + deltaX);
      this.reszRPt.setAttribute('cx', this.reszPtStartX + deltaX);
      this.reszTPt.setAttribute('cx', this.mainRect.width.baseVal.value / 2);
      this.reszBPt.setAttribute('cx', this.mainRect.width.baseVal.value / 2);
      this.optionsBtn.setAttribute('cx', this.startW + deltaX - 15);
      this.optionsContainer.style.transform = `translate(${Number(this.startOptionsTransform[1]) + deltaX}px, ${this.startOptionsTransform[2]}px)`;
      this.commentWrapper.style.transformOrigin = `${this.mainRect.width.baseVal.value / 2}px ${this.mainRect.height.baseVal.value}px`;
    } else if (this.allowDrag && this.activeHandle === 'b') {
      const deltaY = getRelativeCoords(e, this.svg).y - this.startPt.y;
      this.mainRect.setAttribute('height', this.startH + deltaY);
      this.reszBPt.setAttribute('cy', this.reszPtStartY + deltaY);
      this.reszRPt.setAttribute('cy', this.mainRect.height.baseVal.value / 2);
      this.reszLPt.setAttribute('cy', this.mainRect.height.baseVal.value / 2);
      this.commentWrapper.style.transformOrigin = `${this.mainRect.width.baseVal.value / 2}px ${this.mainRect.height.baseVal.value}px`;  // Calulate new bottom center 
    } else if (this.allowDrag && this.activeHandle === 'l') {
      const deltaX = getRelativeCoords(e, this.svg).x - this.startPt.x;
      this.mainRect.setAttribute('width', this.startW - deltaX);
      this.reszTPt.setAttribute('cx', this.mainRect.width.baseVal.value / 2);
      this.reszBPt.setAttribute('cx', this.mainRect.width.baseVal.value / 2);
      this.reszRPt.setAttribute('cx', this.reszPtStartX - deltaX);
      this.optionsBtn.setAttribute('cx', this.startW - deltaX - 15);
      this.optionsContainer.style.transform = `translate(${Number(this.startOptionsTransform[1]) - deltaX}px, ${this.startOptionsTransform[2]}px)`;
      this.commentWrapper.style.transform = `translate(${Number(this.startTransform[1]) + deltaX}px, ${this.startTransform[2]}px) scale(1)`;
      this.commentWrapper.style.transformOrigin = `${this.mainRect.width.baseVal.value / 2}px ${this.mainRect.height.baseVal.value}px`;
    } else if (this.allowDrag && this.activeHandle === 't') {
      const deltaY = getRelativeCoords(e, this.svg).y - this.startPt.y;
      this.mainRect.setAttribute('height', this.startH - deltaY);
      this.reszRPt.setAttribute('cy', this.mainRect.height.baseVal.value / 2);
      this.reszLPt.setAttribute('cy', this.mainRect.height.baseVal.value / 2);
      this.reszBPt.setAttribute('cy', this.reszPtStartY - deltaY);
      this.commentWrapper.style.transform = `translate(${this.startTransform[1]}px, ${Number(this.startTransform[2]) + deltaY}px) scale(1)`;
      this.commentWrapper.style.transformOrigin = `${this.mainRect.width.baseVal.value / 2}px ${this.mainRect.height.baseVal.value}px`;
    }
  }

  mouseupHandler() {
    this.allowDrag = false;
  }

  deleteComment() {
    this.svg.removeEventListener('mousemove', this.mousemoveHandler);
    this.svg.removeEventListener('mouseup', this.mouseupHandler);
    comments.splice(comments.findIndex(o => o.id === this.id), 1);
    this.commentWrapper.remove();
    // If it is the last comment then remove the main event listener that checks for click outs
    if (comments.length === 0) {
      document.querySelector('body').removeEventListener('click', clickOutHandler);
    }
  }

}


let activeComment;

const comments = [];

// Store here the clickOutHandler for the comments so it can be removed if there are no comments in the document
let clickOutHandler;


document.getElementById('comment-tool').addEventListener('click', () => {
  let placeComment;
  svg.addEventListener('click', placeComment = e => {
    activeComment = new BoxComment(svg, settings, getRelativeCoords(e, svg));
    comments.push(activeComment);
    // There is a problem, the click to place the comment is received also by the body listener eventhough it is added later
    // this makes it small by disabling it since it is interpreted as a click out. To avoid this one option is e.stopPropagation()
    // but since it is not a good practice I used a property of the comment called 'placed' with a boolean value of false at start
    // which makes it avoid the disableComment() once in onClickOutHideComments() and set it to true forever since it has been placed
    // e.stopPropagation();
    if (comments.length === 1) {
      document.querySelector('body').addEventListener('click', clickOutHandler = e => onClickOutHideComments(e));
    }
    svg.removeEventListener('click', placeComment);
  });
});

function onClickOutHideComments(e) {
  // TODO activeComment is the enabled one, what to do if more than one can be enabled?
  if (activeComment && activeComment.placed && !e.target.closest('.commentWrapper')) {
    activeComment.disableComment(); // TODO This would be a forEach if more than one comment would be allowed to be enabled at once
    activeComment = undefined;
  } else if (activeComment) {
    console.log('Comment placed.');
    activeComment.placed = true;
  }
}



// const textContent = document.getElementById('textContent');
// const textBoxW = textContent.getBBox().width;
// const textBoxH = textContent.getBBox().height;
// console.log(textBoxW, textBoxH);



function getRelativeCoords(evt, svgDoc) {
  const originPt = svgDoc.createSVGPoint();
  originPt.x = evt.clientX;
  originPt.y = evt.clientY;
  // The cursor point, translated into svg coordinates
  return originPt.matrixTransform(svgDoc.getScreenCTM().inverse());
}

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}




document.getElementById('testShape').addEventListener('click', e => svg.appendChild(createBBox(e)));


function createBBox(e, offset = 5, fillet = 5) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', e.target.getBBox().x - offset);
  rect.setAttribute('y', e.target.getBBox().y - offset);
  rect.setAttribute('width', e.target.getBBox().width + offset * 2);
  rect.setAttribute('height', e.target.getBBox().height + offset * 2);
  rect.setAttribute('rx', fillet);
  rect.setAttribute('ry', fillet);
  rect.setAttribute('style', 'fill:none;stroke:#000;');
  return rect;
}
