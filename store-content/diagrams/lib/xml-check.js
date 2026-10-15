/*
 * Minimal XML well-formedness checker for the SVG we generate (no DTDs, no
 * CDATA, no processing instructions expected). Used by validate.js and the tests.
 * Not a general XML parser: it checks tag balance, attribute syntax/quoting,
 * duplicate attributes, entity references and stray markup characters.
 */
'use strict';

var NAME = /^[A-Za-z_][A-Za-z0-9_.:-]*$/;
var ENTITY = /&(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9A-Fa-f]+);/g;

function checkText(s, where, errors) {
  if (s.indexOf('<') >= 0) errors.push('raw "<" in ' + where);
  var stripped = s.replace(ENTITY, '');
  if (stripped.indexOf('&') >= 0) errors.push('bad entity / raw "&" in ' + where);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s)) errors.push('control character in ' + where);
}

function parseAttrs(src, tagName, errors) {
  var attrs = {};
  var re = /\s+([^\s=\/>]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  var consumed = '';
  var m;
  while ((m = re.exec(src))) {
    var name = m[1];
    if (!NAME.test(name)) errors.push('bad attribute name "' + name + '" on <' + tagName + '>');
    if (Object.prototype.hasOwnProperty.call(attrs, name)) errors.push('duplicate attribute "' + name + '" on <' + tagName + '>');
    var val = m[3] !== undefined ? m[3] : m[4];
    checkText(val, 'attribute ' + name + ' of <' + tagName + '>', errors);
    attrs[name] = val;
    consumed += m[0];
  }
  // Anything left over (other than whitespace) is malformed attribute syntax.
  var rest = src.replace(re, '').trim();
  if (rest) errors.push('malformed attributes on <' + tagName + '>: ' + rest.slice(0, 40));
  return attrs;
}

/**
 * Returns { errors: [...], root: name|null, texts: [{parent, text}], elements: n }.
 */
function checkXml(str) {
  var errors = [];
  var stack = [];
  var texts = [];
  var root = null;
  var count = 0;
  var i = 0;
  var rootClosed = false;
  while (i < str.length) {
    var lt = str.indexOf('<', i);
    var chunk = lt < 0 ? str.slice(i) : str.slice(i, lt);
    if (chunk) {
      if (stack.length === 0 && chunk.trim()) errors.push('text outside the root element');
      checkText(chunk, 'text content', errors);
      if (stack.length) texts.push({ parent: stack[stack.length - 1], text: chunk });
    }
    if (lt < 0) break;
    var gt = str.indexOf('>', lt);
    if (gt < 0) { errors.push('unterminated tag at ' + lt); break; }
    var tag = str.slice(lt + 1, gt);
    i = gt + 1;
    if (tag.charAt(0) === '!' || tag.charAt(0) === '?') { errors.push('unexpected declaration/comment <' + tag.slice(0, 20)); continue; }
    if (tag.charAt(0) === '/') {
      var closeName = tag.slice(1).trim();
      var open = stack.pop();
      if (open !== closeName) errors.push('mismatched </' + closeName + '>, expected </' + open + '>');
      if (stack.length === 0) rootClosed = true;
      continue;
    }
    var selfClose = tag.charAt(tag.length - 1) === '/';
    var body = selfClose ? tag.slice(0, -1) : tag;
    var nm = /^([^\s\/>]+)/.exec(body);
    if (!nm || !NAME.test(nm[1])) { errors.push('bad tag name in <' + tag.slice(0, 20)); continue; }
    if (rootClosed) errors.push('more than one root element');
    if (root === null) root = nm[1];
    count++;
    parseAttrs(body.slice(nm[1].length), nm[1], errors);
    if (!selfClose) stack.push(nm[1]);
    else if (stack.length === 0) rootClosed = true;
  }
  if (stack.length) errors.push('unclosed elements: ' + stack.join(', '));
  if (root === null) errors.push('no root element');
  return { errors: errors, root: root, texts: texts, elements: count };
}

module.exports = { checkXml: checkXml };
