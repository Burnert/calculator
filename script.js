/* Chainable Prototype stuff */
// HTMLElement
HTMLElement.prototype.content = function(...content) {
	this.innerHTML = '';
	content.forEach(part => {
		if (part instanceof HTMLElement) {
			this.appendChild(part);
		}
		else {
			this.innerHTML += part;
		}
	});
	return this;
};
HTMLElement.prototype.addClass = function(aClass) {
	if (aClass) {
		this.classList.add(aClass);
	}
	return this;
};
HTMLElement.prototype.removeClass = function(aClass) {
	if (aClass) {
		this.classList.remove(aClass);
	}
	return this;
};
HTMLElement.prototype.hasClass = function(aClass) {
	return Array.from(this.classList).includes(aClass);
};
HTMLElement.prototype.onClick = function(event) {
	if (event) {
		this.addEventListener('click', event);
	}
	return this;
};
HTMLElement.prototype.addAttribute = function(attr, value) {
	if (attr && value) {
		this.setAttribute(attr, value);
	}
	return this;
};
HTMLElement.prototype.setStyle = function(styleName, value) {
	if (styleName && value) {
		if (this.style[styleName] != undefined) {
			this.style[styleName] = value;
		}
	}
	return this;
}
HTMLElement.prototype.appendTo = function(parent) {
	if (parent)  {
		parent.append(this);
	}
	return this;
}
HTMLElement.prototype.runFunc = function(func) {
	func?.(this);
	return this;
};
/* Other Prototype stuff */
// Object
Object.prototype.hasKey = function(key) { 
	return Object.keys(this)?.some(k => k == key);
}
// String
String.prototype.reverse = function() { 
	return this.split('').reverse().join('');
}


/* Helpers */

Math.mod = function(a, b) {
	return ((a % b) + b) % b;
}
function html(type) {
	return document.createElement(type);
}
function getBaseSelectButton(base) {
	return baseSelectButtons[commonBases.indexOf(base)];
}
function baseNameToNumber(base) {
	return commonBases.asNumber[commonBases.indexOf(base)];
}
function baseNumberToName(num) {
	return commonBases[commonBases.asNumber.indexOf(num)];
}
const commonBases = ['HEX', 'DEC', 'OCT', 'BIN'];
commonBases.asNumber = [16, 10, 8, 2];
function getDigitButtonsFromMap() {
	if (digitButtonCache == null) {
		digitButtonCache = [
			buttonMap2D[5][2],
			buttonMap2D[4][2],
			buttonMap2D[4][3],
			buttonMap2D[4][4],
			buttonMap2D[3][2],
			buttonMap2D[3][3],
			buttonMap2D[3][4],
			buttonMap2D[2][2],
			buttonMap2D[2][3],
			buttonMap2D[2][4],
			buttonMap2D[0][1],
			buttonMap2D[1][1],
			buttonMap2D[2][1],
			buttonMap2D[3][1],
			buttonMap2D[4][1],
			buttonMap2D[5][1],
		];
	}
	return digitButtonCache;
}
const opNames = {
	'NEG' : '-',
	'LS'  : '&Lt;',
	'RS'  : '&Gt;',
	'MOD' : '%',
	'DIV' : '&div;',
	'MUL' : '&times;',
	'SUB' : '-',
	'ADD' : '+',
	'AND' : '&and;',
	'OR'  : '&or;',
	'NOT' : '~',
	'NAND': '&barwed;',
	'NOR' : '&barvee;',
	'XOR' : '&veebar;',
	'EQ'  : '=',
};
const opButtonDisplay = {
	'NEG' : '&pm;',
	'NOT' : '&not;',
};
const symbolNames = {
	'LB': '(',
	'RB': ')',
}
const hexLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
const maxPrecisionNum = 9007199254740992;
const minPrecisionNum = -9007199254740992;
let maxNum = maxPrecisionNum;
let minNum = minPrecisionNum;
function getLastExprElement(expr) {
	return expr[expr.length - 1];
}
function getActiveBrackets(expr) {
	let i = expr.length;
	let j = 0;
	while (i--) {
		j += +(expr[i] == 'LB');
		j -= +(expr[i] == 'RB');	
	}
	return j;
}
function findCorrespondingBracket(expr, index) {
	let i = index;
	let j = 1;
	if (expr[index] == 'RB') {
		while (j) {
			if (i == 0) return undefined;
			j -= +(expr[--i] == 'LB');
			j += +(expr[i] == 'RB');	
		}
	}
	else if (expr[index] == 'LB') {
		while (j) {
			if (i == expr.length - 1) return undefined;
			j += +(expr[++i] == 'LB');
			j -= +(expr[i] == 'RB');	
		}
	}
	else {
		return undefined;
	}
	return i;
}
function stringifyExpression(expr) {
	const textArea = html('textarea')
	.appendTo(document.body);
	expr.forEach(val => {
		textArea.innerHTML += String(opNames.hasKey(val) ? opNames[val] : symbolNames.hasKey(val) ? symbolNames[val] : val);
	});
	const exprStr = textArea.innerHTML;
	textArea.remove();
	return exprStr;
}

/* End Helpers */

/* Globals */

let displayElement = null;
let baseSelectElement = null;
let expressionElement = null;

let buttonMap2D = null;
let digitButtonCache = null;
let baseSelectButtons = null;
let optionButtons = null;
let clearButton = null;

let optShowSymbols = true;
let optBitNumber = 0;

let currentBase = 10;

/** Array of numbers and operations */
let fullExpression = [];
let cachedExpression = '';
let lastOperation = null;

let currentNumber = 0;
let currentNumberDisplayed = '0';

let result = null;

/** When this is true user hasn't entered anything after calling some different action */
let nextNumber = true;

/* End Globals */

/* Display */

function writeToDisplay(input) {
	displayElement.innerHTML = input;
}
function clearDisplay() {
	displayElement.innerHTML = '0';
}
function updateExpressionDisplay() {
	expressionElement.innerHTML = '';
	fullExpression.forEach(part => {
		// Operation
		if (opNames.hasKey(part)) {
			if (isOperationSingleOperand(part)) {
				expressionElement.innerHTML += ` ${opNames[part]}`;
			}
			else {
				expressionElement.innerHTML += ` ${opNames[part]} `;
			}
		}
		// Symbol (brackets)
		else if (symbolNames.hasKey(part)) {
			if (part == 'LB') expressionElement.innerHTML += `${symbolNames[part]}`;
			if (part == 'RB') expressionElement.innerHTML += `${symbolNames[part]}`;
		}
		// Number
		else {
			expressionElement.innerHTML += getBaseFromNumberFormatted(part, currentBase);
		}
	});
}
function updateBaseSelectDisplay() {
	commonBases.forEach(base => {
		const formatted = getBaseFromNumberFormatted(currentNumber, baseNameToNumber(base));
		getBaseSelectButton(base).querySelector('.number').innerHTML = formatted;
	});
}
function disableDigitButtons(base) {
	getDigitButtonsFromMap().forEach((button, index) => {
		if (index < base) {
			button.removeClass('disabled');
			return;
		}
		button.addClass('disabled');
	});
}
function updateBracketButton() {
	const activeBrackets = getActiveBrackets(fullExpression);
	buttonMap2D[1][2].querySelector('span')?.remove();
	if (activeBrackets > 0) {
		buttonMap2D[1][2].append(html('span').addClass('addition').content(activeBrackets));
	}
}
function updateEveryDisplay() {
	currentNumberDisplayed = getBaseFromNumberFormatted(currentNumber, currentBase);
	writeToDisplay(currentNumberDisplayed);
	updateExpressionDisplay();
	updateBaseSelectDisplay();
	updateBracketButton();
}

/* End Display */


/* Buttons */

// Standard buttons

/**
 * Enters a digit into the current number.
 * 
 * @param {String} input Hexadecimal digit
 * @returns {Function} Function to bind to a button
 */
function writeInput(input) {
	return () => {
		// Escape if button is disabled
		if (getDigitButtonsFromMap()[getNumberFromHexDigit(input)].hasClass('disabled')) return;
		let currentNumberStr = getBaseFromNumber(currentNumber, currentBase);
		// If 0 or didn't write anything
		if (currentNumber == 0 || nextNumber) {
			// Next to last is single operand
			// or number is undefined
			if (isOperationSingleOperand(fullExpression[fullExpression.length - 2]) ||
			currentNumber == undefined || isNaN(currentNumber)) {
				fullExpression = [];
			}
			if (!nextNumber && input == '0') return;
			currentNumberStr = input;
			nextNumber = false;
		}
		else {
			const numStr = currentNumberStr + input;
			const num = getNumberFromBase(numStr, currentBase, false);
			if (currentBase == 10 && num <= maxNum && num >= minNum) {
				currentNumberStr = numStr;
			}
			else if (currentBase != 10 && num <= maxNum + Math.pow(2, getCurrentBitNumber()) && num >= 0) {
				currentNumberStr = numStr;
			}
		}
		currentNumber = getNumberFromBase(currentNumberStr, currentBase);

		updateClearButton();
		updateEveryDisplay();
	};
}
/**
 * Changes a sign of the entered number.
 * 
 * @returns {Function} Function to bind to a button
 */
function changeSign() {
	return () => {
		currentNumber *= -1;

		nextNumber = false;

		updateEveryDisplay();
	};
}
/**
 * Called when clicked on an operation button.
 * 
 * Inserts entered number with an operation type into expression
 * 
 * @param {String} operation Operation type
 * @returns {Function} Function to bind to a button
 */
function insertOperation(operation) {
	return () => {
		if (currentNumber == undefined || isNaN(currentNumber)) {
			currentNumber = 0;
			lastOperation = null;
			nextNumber = true;
		}
		// NOT or NEG, wrote something
		else if (isOperationSingleOperand(operation) && !nextNumber) {
			fullExpression.push(operation, currentNumber);
			lastOperation = null;
			nextNumber = true;
		}
		// NOT or NEG, didn't write anything
		else if (isOperationSingleOperand(operation) && nextNumber) {
			// something in expression
			if (fullExpression.length > 0) {
				const last = fullExpression.pop();
				if (typeof last == 'number') {
					// if next to last is a single operand operation wrap it in brackets
					if (isOperationSingleOperand(getLastExprElement(fullExpression))) {
						const last1 = fullExpression.pop();
						fullExpression.push(operation, 'LB', last1, last, 'RB');
					}
					else {
						fullExpression.push(operation, last);
					}
				}
				// right bracket last -> insert operation at the left bracket
				else if (last == 'RB') {
					fullExpression.push(last);
					const lbIndex = findCorrespondingBracket(fullExpression, fullExpression.length - 1);
					fullExpression.pop();
					// but wrap it in brackets if there is a singleop operation in front of it
					if (isOperationSingleOperand(fullExpression[lbIndex - 1])) {
						fullExpression.splice(lbIndex - 1, 0, operation, 'LB');
						fullExpression.push('RB', last);
					}
					else {
						fullExpression.splice(lbIndex, 0, operation);
						fullExpression.push(last);
					}
				}
				// else (some operation) just insert normally
				else {
					fullExpression.push(last, operation, currentNumber);
				}
			}
			// nothing in expression
			else {
				fullExpression.push(operation, currentNumber);
			}
		}
		// last is right bracket
		else if (getLastExprElement(fullExpression) == 'RB') {
			fullExpression.push(operation);
			lastOperation = null;
		}
		// wrote something or (last operation (pressed EQ) and nothing in expression buffer)
		else if (!nextNumber || (lastOperation && fullExpression.length == 0)) {
			fullExpression.push(currentNumber, operation);
			lastOperation = null;
			nextNumber = true;
		}
		// Didn't write anything...
		// next to last is single operand (last one must be a number this way)
		else if (isOperationSingleOperand(fullExpression[fullExpression.length - 2])) {
			fullExpression.push(operation);
		}
		// nothing in expression buffer of last is left bracket
		else if (fullExpression.length == 0 || getLastExprElement(fullExpression) == 'LB') {
			fullExpression.push(currentNumber, operation);
			lastOperation = null;
		}
		// last is a number
		else if (typeof getLastExprElement(fullExpression) == "number") {
			fullExpression.push(operation);
			lastOperation = null;
		}
		// else (should be only if last is a double operand operation)
		else {
			fullExpression.pop()
			fullExpression.push(operation);
			lastOperation = null;
		}
		currentNumber = evalExpression(fullExpression);
		cachedExpression = stringifyExpression(fullExpression);
		updateEveryDisplay();
	};
}
/**
 * Called when clicked on a bracket button.
 * 
 * Inserts a bracket into expression when it's possible.
 * 
 * @param {String} type '(' or ')' - open or close
 * @returns {Function} Function to bind to a button
 */
function insertBracket(type) {
	return () => {
		if (type == 'LB') {
			if (fullExpression.length == 0) {
				fullExpression.push('LB');
			}
			else if (isOperationDoubleOperand(getLastExprElement(fullExpression)) || getLastExprElement(fullExpression) == 'LB') {
				if (!nextNumber) {
					fullExpression.push(currentNumber);
					fullExpression.push('MUL');
				}
				fullExpression.push('LB');
			}
			else if (getLastExprElement(fullExpression) == 'RB' || typeof getLastExprElement(fullExpression) == 'number') {
				fullExpression.push('MUL');
				fullExpression.push('LB');
			}
		}
		else if (type == 'RB') {
			const activeBrackets = getActiveBrackets(fullExpression);
			// Can close bracket
			if (activeBrackets > 0) {
				if (typeof getLastExprElement(fullExpression) != 'number' && 
				isOperationDoubleOperand(getLastExprElement(fullExpression)) || getLastExprElement(fullExpression) == 'LB') {
					fullExpression.push(currentNumber);
				}
				fullExpression.push('RB');
				nextNumber = true;
			}
		}
		else {
			console.error('Wrong bracket type!');
			return;
		}
		updateEveryDisplay();
		console.log('Current expression:', fullExpression);
	};
}
/**
 * Clears entry or if clicked when the entry is 0 also clears full expression.
 * 
 * @returns {Function} Function to bind to a button
 */
function clearEntryAll() {
	return () => {
		if (currentNumber == 0) {
			lastOperation = null;
			fullExpression = [];
		}
		else {
			currentNumber = 0;
		}
		updateClearButton();
		updateEveryDisplay();
	};
}
/**
 * Removes the last number from entry.
 * 
 * @returns {Function} Function to bind to a button
 */
function eraseEntry() {
	return () => {
		if (currentNumber == 0) return;
		const currentNumberStr = getBaseFromNumber(currentNumber, currentBase);		
		const strErased = currentNumberStr.slice(0, currentNumberStr.length - 1);
		if (strErased.length == 0 || strErased == '-') {
			currentNumber = 0;
		}
		else {
			currentNumber = getNumberFromBase(strErased, currentBase);
		}
		updateClearButton();
		updateEveryDisplay();
	};
}
/**
 * Prints the result and clears the full expression array.
 * 
 * @returns {Function} Function to bind to a button
 */
function finishExpression() {
	return () => {
		if (!nextNumber) {
			fullExpression.push(currentNumber);
		}
		if (lastOperation) {
			if (typeof getLastExprElement(fullExpression) != 'number' && getLastExprElement(fullExpression) != 'RB') {
				fullExpression.push(currentNumber);
			}
			fullExpression.push(...lastOperation);
		}
		else if (typeof getLastExprElement(fullExpression) != 'number' && getLastExprElement(fullExpression) != 'RB') {
			fullExpression.push(currentNumber);
		}
		while (getActiveBrackets(fullExpression)) {
			fullExpression.push('RB');
		}
		fullExpression.push('EQ');

		currentNumber = evalExpression(fullExpression);
		nextNumber = true;

		updateEveryDisplay();

		// const num = fullExpression[fullExpression.length - 2];
		let num = 0;
		const exprBeforeEq = fullExpression.slice(0, fullExpression.length - 1);
		const lastOp = [];
		let hasDoubleOperandOperation = false;
		while (exprBeforeEq.length) {
			const last = exprBeforeEq.pop();
			if (last == 'RB' || last == 'LB') continue;
			if (isOperationDoubleOperand(last)) {
				hasDoubleOperandOperation = true;
				lastOp.unshift(last);
				break;
			}
			else if (isOperationSingleOperand(last)) {
				const resultFromLast = operation(last)(lastOp.shift());
				lastOp.unshift(resultFromLast);
			}
			else if (typeof last == 'number') {
				// num = last;
				lastOp.unshift(last);
			}
		}
		if (hasDoubleOperandOperation) {
			lastOperation = lastOp;
		}
		cachedExpression = stringifyExpression(fullExpression);
		fullExpression = [];
	};
}
function errCallback(id) {
	return () => console.log(`No callback specified for button "${id}"`);
}

// Base Select Buttons

function changeBaseFunction(id) {
	const base = baseNameToNumber(id);
	return () => {
		baseSelectButtons.forEach(button => button.removeClass('active'));
		getBaseSelectButton(id).addClass('active');

		currentBase = base;

		disableDigitButtons(base);
		updateEveryDisplay();

		console.log(`Switched to Base${base} (${id})`);
	};
}

// Options

function clampCurrentNumber() {
	currentNumber = toSigned(currentNumber, getCurrentBitNumber());
}
function changeNumberRange(optNumber) {
	maxNum = Math.pow(2, commonBitNumbers[optNumber] - 1) - 1;
	minNum = -Math.pow(2, commonBitNumbers[optNumber] - 1);
}
const commonBitNumbers = [32, 16, 8];
commonBitNumbers.names = ['DWORD', 'WORD', 'BYTE'];
function getCurrentBitNumber() {
	return commonBitNumbers[optBitNumber];
}
function changeBitNumber(optNumber, buttonRef) {
	buttonRef.content(commonBitNumbers.names[optNumber]).addAttribute('title', `${getCurrentBitNumber()}-bit number`);

	changeNumberRange(optNumber);
	clampCurrentNumber();
	currentNumber = toSigned(currentNumber, getCurrentBitNumber());

	updateEveryDisplay();
}
/**
 * Select the next number of bits from the collection.
 * 
 * 	'BYTE' : 8
 * 	'WORD' : 16
 * 	'DWORD' : 32
 * 	'JS53' : 53
 * 
 * 53 is a max precise number JS can show.
 * 
 * @returns {Function} Function to bind to a button
 */
function cycleBitNumber(buttonRef) {
	return () => {
		if (++optBitNumber == commonBitNumbers.length) optBitNumber = 0;
		changeBitNumber(optBitNumber, buttonRef);
	};
}
const displaySymbolsIcons = ['Bitwise', '&veebar;'];
/**
 * Changes how symbols of the bitwise buttons is displayed.
 * 
 * @param {HTMLElement} buttonRef
 * @returns {Function} Function to bind to a button
 */
function cycleDisplaySymbols(buttonRef) {
	return () => {
		// TODO: Add logic gate symbols
		optShowSymbols = !optShowSymbols;
		[
			buttonMap2D[0][0],
			buttonMap2D[1][0],
			buttonMap2D[2][0],
			buttonMap2D[3][0],
			buttonMap2D[4][0],
			buttonMap2D[5][0],
		].forEach((button, index) => {
			button.content(optShowSymbols ? buttonMap2D.objects[index][0].displayAs : buttonMap2D.objects[index][0].id)
				.setStyle('font-size', optShowSymbols ? '28px' : '22px');
		});
		buttonRef.content(displaySymbolsIcons[+optShowSymbols])
			.setStyle('font-size', optShowSymbols ? '20px' : '16px');
	};
}

function copyToClipboard(str) {
	const el = html('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};
function copyCurrentNumber(info) {
	return e => {
		copyToClipboard(getBaseFromNumber(currentNumber, currentBase));
		showInfoBox(info, { x: e.clientX, y: e.clientY });
	};
}
function copyExpression(info) {
	return e => {
		copyToClipboard(cachedExpression);
		showInfoBox(info, { x: e.clientX, y: e.clientY });
	}
}

// Visual

function showInfoBox(box, position) {
	box.setStyle('display', 'flex');
	box.setStyle('left', `${position.x}px`).setStyle('top', `${position.y}px`);
	setTimeout(() => {
		box.setStyle('opacity', '1');
	}, 10);
	setTimeout(() => {
		box.setStyle('opacity', '0');
		setTimeout(() => {
			box.setStyle('display', 'none');
		}, 300);
	}, 2000);
}
function updateClearButton() {
	clearButton.content(currentNumber != 0 ? 'CE' : 'C');
}

/* End Buttons */

/* Math */

const singleOperandOperations = ['NOT', 'NEG'];
function isOperationSingleOperand(name) {
	return singleOperandOperations.some(val => val == name);
}
const doubleOperandOperations = ['LS', 'RS', 'MOD', 'DIV', 'MUL', 'SUB', 'ADD', 'AND', 'OR', 'NAND', 'NOR', 'XOR'];
function isOperationDoubleOperand(name) {
	return doubleOperandOperations.some(val => val == name);
}
function operation(op) {
	switch (op) {
	case 'NEG': 
		return (b) => -b;
	case 'ADD':
		return (a, b) => a + b;
	case 'SUB':
		return (a, b) => a - b;
	case 'MUL':
		return (a, b) => a * b;
	case 'DIV':
		return (a, b) => Math.trunc(a / b);
	case 'MOD':
		return (a, b) => Math.mod(a, b);
	case 'AND':
		return (a, b) => a & b;
	case 'OR':
		return (a, b) => a | b;
	case 'NOT':
		return (b) => ~b;
	case 'NAND':
		return (a, b) => ~(a & b);
	case 'NOR':
		return (a, b) => ~(a | b);
	case 'XOR':
		return (a, b) => a ^ b;
	case 'LS':
		return (a, b) => a << b;
	case 'RS':
		return (a, b) => a >>> b;
	}
	return null;
}
const operationOrder = [
	['LS', 'RS'],
	['MOD'],
	['MUL', 'DIV'],
	['ADD', 'SUB'],
	['AND', 'OR', 'NAND', 'NOR', 'XOR'],
];
/**
 * Evaluates expression array to a single result.
 * 
 * @param {Array} expr Expression array (numbers and operations)
 */
function evalExpression(expr) {
	let expression = [...expr];
	console.log('Current expression:', expression);

	const evalGroup = (groupExpr, debug = false) => {
		// Evaluate single operand functions
		const evalSingleOperand = (index, op) => {
			// TODO: fix single operand ops in brackets
			// if operation isn't placed right at the end
			if (index < groupExpr.length - 1) {
				let value = 0;
				let numIndex = -1;
				// if a group is right after it
				if (groupExpr[index + 1] == 'LB') {
					const expr1 = [...groupExpr];
					const exprEnd = findCorrespondingBracket(expr1, index + 1);
					if (exprEnd == undefined) {
						if (isOperationDoubleOperand(getLastExprElement(expr1))) {
							expr1.pop();
						}
						while (getActiveBrackets(expr1)) {
							expr1.push('RB');
						}
						exprEnd = expr.length - 1;
					}
					const expr2 = expr1.slice(index + 2, exprEnd);
					const groupResult = evalGroup(expr2);
					groupExpr.splice(index + 1, exprEnd - index);
					value = operation(op)(groupResult);
				}
				// if a number is after it
				else {
					value = operation(op)(groupExpr[index + 1]);
				}
				groupExpr.splice(index, 1);
				numIndex = index
				return [value, numIndex];
			}
			return undefined;
		};
		while (true) {
			const index = groupExpr.findIndex(val => isOperationSingleOperand(val));
			if (index == -1) break;
			const [value, numIndex] = evalSingleOperand(index, groupExpr[index]);
			groupExpr[numIndex] = value;
			groupExpr = groupExpr.filter(value => value != '#DELETE');
		}

		if (debug) console.log('GroupExpr after singleOp stage:', groupExpr);

		// Do all calculations in order
		operationOrder.forEach(orderOps => {
			const orderOps1 = [...orderOps];
			while (orderOps1.length) {
				const orderOp = orderOps1.shift();
				// Found current operation in expression
				while (groupExpr.indexOf(orderOp) > -1) {
					const opIndex = groupExpr.indexOf(orderOp);
					// Expr group on the left
					if (groupExpr[opIndex - 1] == 'RB') {
						const nestedExprStart = findCorrespondingBracket(groupExpr, opIndex - 1);
						const nestedExpr = groupExpr.slice(nestedExprStart, opIndex);
						const nestedResult = evalGroup(nestedExpr);
						groupExpr.splice(nestedExprStart, opIndex, nestedResult);
					}
					// Expr group on the right
					if (groupExpr[opIndex + 1] == 'LB') {
						const nestedExprEnd = findCorrespondingBracket(groupExpr, opIndex + 1);
						if (nestedExprEnd == undefined) {
							break;
						}
						const nestedExpr = groupExpr.slice(opIndex + 1, nestedExprEnd + 1);
						const nestedResult = evalGroup(nestedExpr);
						groupExpr.splice(opIndex + 1, nestedExprEnd + 1, nestedResult);
					}
					// If there is a number on both sides
					if (groupExpr[opIndex - 1] != 'RB' && groupExpr[opIndex + 1] != 'LB' &&
					typeof groupExpr[opIndex - 1] == 'number' && typeof groupExpr[opIndex + 1] == 'number') {
						const opResult = operation(groupExpr[opIndex])(groupExpr[opIndex - 1], groupExpr[opIndex + 1]);
						groupExpr.splice(opIndex - 1, 3, opResult);
					}
					else {
						break;
					}
				}
			}
		});

		if (debug) console.log('GroupExpr after order stage:', groupExpr);

		let result = 0;

		let first = true;
		let currentOperation = null;
		let last = null;

		while (groupExpr.length) {
			const part = groupExpr.shift();
			if (typeof last == 'number' && typeof part == 'number') {
				// Log error
				console.error('2 numbers side-by-side are not allowed in an expression!', [last, part, ...groupExpr]);
				return undefined;
			}
			last = part;
			// Eval group recursively
			if (part == 'LB') {
				const expr1 = [part, ...groupExpr];
				let groupEnd = findCorrespondingBracket(expr1, 0);
				if (groupEnd == undefined) {
					if (isOperationDoubleOperand(getLastExprElement(expr1))) {
						expr1.pop();
					}
					expr1.push('RB');
					groupEnd = expr.length - 1
				}
				// Cut out the group without the brackets
				const expr2 = expr1.slice(1, groupEnd);
				const groupResult = evalGroup(expr2);
				groupExpr.splice(0, groupEnd);
				if (currentOperation) {
					result = toSigned(currentOperation(result, groupResult), getCurrentBitNumber());
					currentOperation = null;
				}
				else if (first) {
					result = toSigned(groupResult, getCurrentBitNumber());
				}
			}
			else if (currentOperation) {
				result = toSigned(currentOperation(result, part), getCurrentBitNumber());
				currentOperation = null;
			}
			else if (typeof part == 'number') {
				result += part;
			}
			else if (part != 'LB') {
				currentOperation = operation(part);
			}
			first = false;
		}
		return result;
	};

	const result = evalGroup(expression, true);
	
	console.log(`Result: ${result}`);
	return result;
}

/* End Math */

/* Conversion Functions */

function isHexDigit(digit) {
	return !isNaN(digit) || isHexLetterDigit(digit);
}
function isHexLetterDigit(digit) {
	return hexLetters.includes(String(digit).toUpperCase());
}
function getNumberFromHexDigit(hex) {
	const dict = {
		'A': 0xA,
		'B': 0xB,
		'C': 0xC,
		'D': 0xD,
		'E': 0xE,
		'F': 0xF,
	};
	const number = dict[String(hex).toUpperCase()];
	if (!number) {
		const integer = parseInt(hex);
		if (isNaN(integer)) return null;
		return integer;
	}
	return number;
}
function getHexDigitFromNumber(num) {
	if (num > 15) return null;
	if (num < 10) return String(num);
	return hexLetters[num - 10];
}
function getNumberFromHex(hex) {
	return getNumberFromBase(hex, 16);
}
function getNumberFromOct(oct) {
	return getNumberFromBase(oct, 8);
}
function getNumberFromBin(bin) {
	return getNumberFromBase(bin, 2);
}
function getNumberFromBase(baseNum, base, convert = true) {
	let numStr = String(baseNum);
	let negative = false;
	if (numStr[0] == '-') {
		numStr = numStr.slice(1, numStr.length);
		negative = true;
	}
	let number = 0;
	let i = numStr.length;
	while (i--) {
		number += getNumberFromHexDigit(numStr[i]) * Math.pow(base, numStr.length - i - 1);
	}
	if (negative) number *= -1;

	if (convert) 	return toSigned(number, getCurrentBitNumber());
	else			return number;
}
/**
 * Returns a number representation in a specified base.
 * 
 * @returns {String}
 */
function getBaseFromNumber(num, base) {
	if (isNaN(num) || !base) return null;
	if (base == 10) return String(num);
	let num1 = toUnsigned(num, getCurrentBitNumber());
	if (num1 < 0) return 'ERROR';
	let numStr = '';
	do {
		const remainder = num1 % base;
		numStr += getHexDigitFromNumber(remainder);
		num1 = Math.floor(num1 / base);
	} while (num1 != 0);
	return numStr.reverse();
}
function getBaseFromNumberFormatted(num, base) {
	return formatBase(getBaseFromNumber(num, base), base);
}
function formatBase(numStr, base) {
	if (numStr == null || numStr == '') return '<span class="undef">#undef</span>';
	const negative = base == 10 && numStr[0] == '-';
	if (negative) {
		numStr = numStr.slice(1, numStr.length);
	}
	let formatted = '';
	// Binary
	if (base == 2) {
		if (numStr == '0') return '0';
		const numReversed = numStr.split('').reverse();
		for (let i = 0; i < numReversed.length % 4; i++) {
			numReversed.push('0');
		}
		const numSpaced = numReversed.map((digit, index) => {
			if (index % 4 == 3 && index != numReversed.length - 1) {
				return ' ' + digit;
			}
			return digit;
		}).reverse().join('');
		formatted = numSpaced;
	}
	// Octal
	else if (base == 8) {
		const numSpaced = numStr.split('').reverse().map((digit, index) => {
			if (index % 3 == 2 && index != numStr.length - 1) {
				return ' ' + digit;
			}
			return digit;
		}).reverse().join('');
		formatted = numSpaced;
	}
	// Decimal
	else if (base == 10) {
		const numSpaced = numStr.split('').reverse().map((digit, index) => {
			if (index % 3 == 2 && index != numStr.length - 1) {
				return ',' + digit;
			}
			return digit;
		}).reverse().join('');
		formatted = numSpaced;
	}
	// Hexadecimal
	else if (base == 16) {
		const numSpaced = numStr.split('').reverse().map((digit, index) => {
			if (index % 4 == 3 && index != numStr.length - 1) {
				return ' ' + digit;
			}
			return digit;
		}).reverse().join('');
		formatted = numSpaced;
	}
	if (formatted == '') {
		formatted = numStr;
	}
	return (negative ? '-' : '') + formatted;
}
function toSigned(number, bitNumber) {
	if (!bitNumber) return null;
	return Math.mod(number + Math.pow(2, bitNumber - 1), Math.pow(2, bitNumber)) - Math.pow(2, bitNumber - 1);
}
function toUnsigned(number, bitNumber) {
	if (!bitNumber) return null;
	return number < 0 ? Math.mod(number + Math.pow(2, bitNumber), Math.pow(2, bitNumber)) : Math.mod(number, Math.pow(2, bitNumber));
}

/* End Conversion Functions */

/* Behaviour Object Creators */

/**
 * @param {String} id Id of the button
 * @param {String} disp String to display on the button
 * @param {Function} cb Function to call when button is clicked
 * @param {String} color Color of the button
 * @returns Button object
 */
function buttonObj(id, disp, cb, color = 'default') {
	return {
		id: id,
		displayAs: disp,
		callback: cb,
		color: color,
	};
}

/* End Behaviour Object Creators */

function mapButtons(buttons) {
	return buttons.map(row => row.map(id => {
		// Numbers
		if (isHexDigit(id)) {
			return buttonObj(id, id, writeInput(id), 'black');
		}
		switch (id) {
		// . (unused)
		case 'DOT':
			return null;
		// +/-
		case 'NEG':
			return buttonObj(id, opButtonDisplay[id], insertOperation(id), 'black');
		// =
		case 'EQ':
			return buttonObj(id, '=', finishExpression(), 'primary');
		// C / CE
		case 'CL':
			return buttonObj(id, 'C', clearEntryAll());
		// "Backspace"
		case 'ER':
			return buttonObj(id, '&loarr;', eraseEntry());
		// (
		case 'LB':
			return buttonObj(id, '(', insertBracket('LB'));
		// )
		case 'RB':
			return buttonObj(id, ')', insertBracket('RB'));
		}
		return buttonObj(id, opButtonDisplay.hasKey(id) ? opButtonDisplay[id] : opNames.hasKey(id) ? opNames[id] : id, insertOperation(id));
	}));
}

document.addEventListener('DOMContentLoaded', e => {
	const inputSection		= document.querySelector('.input-section');
	const optionsSection	= document.querySelector('.options-section');
	const baseSection		= document.querySelector('.base-section');

	expressionElement	= document.querySelector('.display .expression');
	displayElement		= document.querySelector('.display .number-input');
	baseSelectElement	= baseSection;

	const buttonIds = [
		['AND',  'A', 'LS', 'RS',  'CL',  'ER'],
		['OR',   'B', 'LB', 'RB',  'MOD', 'DIV'],
		['NOT',  'C', '7',  '8',   '9',   'MUL'],
		['NAND', 'D', '4',  '5',   '6',   'SUB'],
		['NOR',  'E', '1',  '2',   '3',   'ADD'],
		['XOR',  'F', '0',  'DOT', 'NEG',  'EQ'],
	];
	const buttonObjs = mapButtons(buttonIds);
	// Create button components from behaviour object array
	buttonMap2D = buttonObjs.map(row => {
		const rowDiv = html('div')
			.addClass('button-row')
			.appendTo(inputSection);
		return row.map(button => {
			if (!button) return;
			const tooltips = {
				'LS'  : 'Arithmetic Bitshift Left',
				'RS'  : 'Arithmetic Bitshift Right',
				'MOD' : 'Modulo',
				'AND' : 'AND',
				'OR'  : 'OR',
				'NOT' : 'NOT',
				'NAND': 'NAND',
				'NOR' : 'NOR',
				'XOR' : 'XOR',
			};
			return html('div')
				.addClass('calc-button')
				.addClass(button.displayAs == '0' ? 'double' : null)
				.addClass(`bg-${button.color}`)
				.addAttribute('title', Object.keys(tooltips).some(val => val == button.id) ? tooltips[button.id] : null)
				.onClick(button.callback)
				.content(button.displayAs)
				.appendTo(rowDiv);
		});
	});
	buttonMap2D.objects = buttonObjs;
	clearButton = buttonMap2D[0][4];

	baseSelectButtons = commonBases.map(id => buttonObj(id, id, changeBaseFunction(id), 'transparent')).map(selectBt => {
		return html('div')
			.addClass('base-select-button')
			.addClass(`bg-${selectBt.color}`)
			.onClick(selectBt.callback)
			.content(
				html('div')
				.addClass('active-marker')
				.addClass('bg-primary-simple'),
				html('span')
				.addClass('base')
				.content(selectBt.displayAs),
				html('span')
				.addClass('number')
			)
			.appendTo(baseSection);
	});
	changeBaseFunction(baseNumberToName(currentBase))();

	const optionsMap = ['ShowSymbols', 'BitNumber', 'sp', 'sp', 'sp', 'Copy'];
	optionButtons = optionsMap.map(id => {
		switch (id) {
		case 'ShowSymbols':
			return html('div')
			.addClass('option-button')
			.addClass('bg-transparent')
			.addAttribute('title', 'Change Bitwise Display')
			.runFunc(button => button.onClick(cycleDisplaySymbols(button)))
			.content(displaySymbolsIcons[1])
			.appendTo(optionsSection);
		case 'BitNumber':
			return html('div')
			.addClass('option-button')
			.addClass('bg-transparent')
			.addAttribute('title', `${commonBitNumbers[optBitNumber]}-bit number`)
			.runFunc(button => button.onClick(cycleBitNumber(button)))
			.content(commonBitNumbers.names[optBitNumber])
			.appendTo(optionsSection);
		case 'Copy':
			const infoCopy = html('div')
			.addClass('info-floating')
			.content('Copied to clipboard!')
			.appendTo(document.body);
			const infoExpr = html('div')
			.addClass('info-floating')
			.content('Copied expression to clipboard!')
			.appendTo(document.body);
			return html('div')
			.addClass('option-double-container')
			.content(
				html('div')
				.addClass('option-button')
				.addClass('half')
				.addClass('bg-transparent')
				.addAttribute('title', 'Copy to clipboard')
				.runFunc(button => button.onClick(copyCurrentNumber(infoCopy)))
				.content(
					html('i')
					.addClass('icon-docs'),
				),
				html('div')
				.addClass('option-button')
				.addClass('half')
				.addClass('bg-transparent')
				.addAttribute('title', 'Copy expression')
				.runFunc(button => button.onClick(copyExpression(infoExpr)))
				.content(
					html('span')
					.addClass('icon-hashtag')
				)
			).appendTo(optionsSection);
		case 'sp':
			return html('div')
			.addClass('option-spacer')
			.appendTo(optionsSection);
		}
	});
	changeNumberRange(optBitNumber);

	clearDisplay();
});