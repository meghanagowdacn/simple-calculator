/* ============================================================
   CALCULATOR  –  script.js
   Handles all button clicks and math logic.
   ============================================================ */

// ── 1. Grab DOM elements we need ────────────────────────────

const resultDisplay     = document.getElementById('result');     // large number
const expressionDisplay = document.getElementById('expression'); // small top line

// All buttons by type
const numberButtons   = document.querySelectorAll('.btn-number');
const operatorButtons = document.querySelectorAll('.btn-operator');
const clearBtn        = document.getElementById('clear');
const deleteBtn       = document.getElementById('delete');
const percentBtn      = document.getElementById('percent');
const equalsBtn       = document.getElementById('equals');


// ── 2. Calculator state ─────────────────────────────────────
// We store everything we need to remember between button presses here.

let currentInput  = '0';   // What's currently shown on the big display
let previousInput = '';    // The number entered before an operator was pressed
let operator      = '';    // The chosen operator: +  -  *  /
let justCalculated = false; // Did we just press "=" ?


// ── 3. Helper – update the screen ───────────────────────────

function updateDisplay() {
  resultDisplay.textContent = currentInput;

  // Remove the error styling whenever we write normal content
  resultDisplay.classList.remove('error');

  // Shrink font automatically when the number is long
  if (currentInput.length > 9) {
    resultDisplay.style.fontSize = '1.6rem';
  } else if (currentInput.length > 6) {
    resultDisplay.style.fontSize = '2rem';
  } else {
    resultDisplay.style.fontSize = '';   // back to CSS default
  }
}

// Show the running expression in the small top line
function updateExpression(text) {
  expressionDisplay.textContent = text;
}

// Highlight which operator button is currently selected
function highlightOperator(op) {
  operatorButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.op === op);
  });
}


// ── 4. Handle number / decimal presses ──────────────────────

function pressNumber(value) {
  // After pressing "=" start fresh with the new digit
  if (justCalculated) {
    currentInput  = '';
    justCalculated = false;
    updateExpression('');
  }

  // Don't allow more than one decimal point
  if (value === '.' && currentInput.includes('.')) return;

  // Replace the initial '0' with the pressed digit (but keep '0.')
  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }

  updateDisplay();
}


// ── 5. Handle operator presses (+, -, *, /) ─────────────────

function pressOperator(op) {
  // If there's already a pending calculation, evaluate it first
  // so you can chain operations:  3 + 4 × ...  →  shows 7 first
  if (operator && previousInput !== '' && !justCalculated) {
    calculate();
  }

  previousInput  = currentInput;
  operator       = op;
  justCalculated = false;

  // Show the running expression in the small display
  // We convert internal symbols back to nice display symbols
  const displayOp = { '+':'+', '-':'−', '*':'×', '/':'÷' }[op];
  updateExpression(`${previousInput} ${displayOp}`);

  highlightOperator(op);

  // Signal that the next digit should start a new number
  currentInput = '0';
  updateDisplay();
}


// ── 6. Perform the actual calculation ───────────────────────

function calculate() {
  // Nothing to calculate if we don't have both numbers and an operator
  if (operator === '' || previousInput === '') return;

  const a = parseFloat(previousInput);  // first number
  const b = parseFloat(currentInput);   // second number
  let result;

  // Choose the right arithmetic operation
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      // Special case: dividing by zero is not allowed
      if (b === 0) {
        showError("Can't divide by 0");
        return;
      }
      result = a / b;
      break;
    default:
      return;
  }

  // Build the expression label  e.g. "12 + 3 ="
  const displayOp = { '+':'+', '-':'−', '*':'×', '/':'÷' }[operator];
  updateExpression(`${previousInput} ${displayOp} ${currentInput} =`);

  // Round floating-point noise (e.g. 0.1+0.2 = 0.30000000004)
  result = parseFloat(result.toFixed(10));

  // Update state
  currentInput   = String(result);
  previousInput  = '';
  operator       = '';
  justCalculated = true;

  highlightOperator(''); // clear the operator highlight
  updateDisplay();
}


// ── 7. Utility actions ───────────────────────────────────────

// Clear everything and return to the initial state
function clearAll() {
  currentInput   = '0';
  previousInput  = '';
  operator       = '';
  justCalculated = false;
  highlightOperator('');
  updateExpression('');
  updateDisplay();
}

// Delete the last character typed
function deleteLast() {
  if (justCalculated) return; // nothing to delete after a result
  if (currentInput.length === 1 || currentInput === '0') {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1); // remove last character
  }
  updateDisplay();
}

// Convert current number to a percentage  (e.g. 50 → 0.5)
function pressPercent() {
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;
  currentInput = String(value / 100);
  updateDisplay();
}

// Show an error message on the display
function showError(message) {
  resultDisplay.textContent = message;
  resultDisplay.classList.add('error');
  // Reset state after a moment so the user can start fresh
  setTimeout(clearAll, 1800);
}


// ── 8. Attach event listeners ────────────────────────────────
// We use addEventListener() instead of onclick= in the HTML –
// it keeps logic separate from markup and is the modern approach.

// Number buttons
numberButtons.forEach(btn => {
  btn.addEventListener('click', () => pressNumber(btn.dataset.num));
});

// Operator buttons
operatorButtons.forEach(btn => {
  btn.addEventListener('click', () => pressOperator(btn.dataset.op));
});

// Action buttons
clearBtn.addEventListener('click', clearAll);
deleteBtn.addEventListener('click', deleteLast);
percentBtn.addEventListener('click', pressPercent);
equalsBtn.addEventListener('click', calculate);


// ── 9. Keyboard support ──────────────────────────────────────
// So users can type on a physical keyboard too.

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key >= '0' && key <= '9') pressNumber(key);
  else if (key === '.')         pressNumber('.');
  else if (key === '+')         pressOperator('+');
  else if (key === '-')         pressOperator('-');
  else if (key === '*')         pressOperator('*');
  else if (key === '/')  { event.preventDefault(); pressOperator('/'); }
  else if (key === 'Enter' || key === '=')  calculate();
  else if (key === 'Backspace') deleteLast();
  else if (key === 'Escape')    clearAll();
  else if (key === '%')         pressPercent();
});