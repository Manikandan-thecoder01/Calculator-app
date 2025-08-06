// Calculator App - Optimized for Performance and Security
class Calculator {
    constructor() {
        this.display = document.getElementById("display");
        this.keys = document.getElementById("keys");
        this.currentInput = "";
        this.lastResult = null;
        
        // Use event delegation for better performance
        this.keys.addEventListener("click", this.handleButtonClick.bind(this));
        
        // Add keyboard support
        document.addEventListener("keydown", this.handleKeydown.bind(this));
        
        // Initialize display
        this.display.value = "0";
    }
    
    handleButtonClick(event) {
        const button = event.target.closest("button");
        if (!button) return;
        
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        // Add visual feedback
        button.style.transform = "scale(0.95)";
        requestAnimationFrame(() => {
            button.style.transform = "";
        });
        
        switch (action) {
            case "number":
                this.appendToDisplay(value);
                break;
            case "operator":
                this.appendToDisplay(value);
                break;
            case "decimal":
                this.handleDecimal();
                break;
            case "clear":
                this.clearDisplay();
                break;
            case "calculate":
                this.calculate();
                break;
        }
    }
    
    handleKeydown(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if (/[\d+\-*/.()=]/.test(key) || key === "Enter" || key === "Escape" || key === "Backspace") {
            event.preventDefault();
        }
        
        if (/\d/.test(key)) {
            this.appendToDisplay(key);
        } else if (["+", "-", "*", "/", "(", ")"].includes(key)) {
            this.appendToDisplay(key);
        } else if (key === ".") {
            this.handleDecimal();
        } else if (key === "Enter" || key === "=") {
            this.calculate();
        } else if (key === "Escape" || key === "c" || key === "C") {
            this.clearDisplay();
        } else if (key === "Backspace") {
            this.backspace();
        }
    }
    
    appendToDisplay(input) {
        if (this.display.value === "0" || this.display.value === "Error") {
            this.display.value = input;
        } else {
            // Prevent multiple consecutive operators
            const lastChar = this.display.value.slice(-1);
            const operators = ["+", "-", "*", "/"];
            
            if (operators.includes(input) && operators.includes(lastChar)) {
                // Replace the last operator
                this.display.value = this.display.value.slice(0, -1) + input;
            } else {
                this.display.value += input;
            }
        }
        this.currentInput = this.display.value;
    }
    
    handleDecimal() {
        const value = this.display.value;
        const segments = value.split(/[+\-*/]/);
        const currentSegment = segments[segments.length - 1];
        
        // Only add decimal if current number doesn't have one
        if (!currentSegment.includes(".")) {
            if (value === "0" || value === "Error") {
                this.display.value = "0.";
            } else {
                this.display.value += ".";
            }
            this.currentInput = this.display.value;
        }
    }
    
    clearDisplay() {
        this.display.value = "0";
        this.currentInput = "";
        this.lastResult = null;
    }
    
    backspace() {
        if (this.display.value.length > 1 && this.display.value !== "Error") {
            this.display.value = this.display.value.slice(0, -1);
        } else {
            this.display.value = "0";
        }
        this.currentInput = this.display.value;
    }
    
    // Safe expression evaluator - replaces dangerous eval()
    calculate() {
        try {
            const expression = this.display.value;
            
            // Validate expression
            if (!this.isValidExpression(expression)) {
                throw new Error("Invalid expression");
            }
            
            // Use Function constructor as a safer alternative to eval
            // Still not perfect but much safer than eval for mathematical expressions
            const result = this.safeEvaluate(expression);
            
            if (!isFinite(result)) {
                throw new Error("Invalid result");
            }
            
            // Format result to avoid floating point issues
            const formattedResult = this.formatResult(result);
            this.display.value = formattedResult;
            this.lastResult = result;
            
        } catch (error) {
            this.display.value = "Error";
            console.error("Calculation error:", error);
        }
    }
    
    isValidExpression(expr) {
        // Basic validation to prevent malicious code
        const allowedChars = /^[\d+\-*/.() ]+$/;
        if (!allowedChars.test(expr)) return false;
        
        // Check for balanced parentheses
        let openParens = 0;
        for (const char of expr) {
            if (char === "(") openParens++;
            if (char === ")") openParens--;
            if (openParens < 0) return false;
        }
        return openParens === 0;
    }
    
    safeEvaluate(expression) {
        // Replace display symbols with JavaScript operators
        const jsExpression = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/");
        
        // Create a restricted environment for evaluation
        const allowedNames = ["Math", "Number", "parseInt", "parseFloat"];
        const context = {};
        allowedNames.forEach(name => {
            context[name] = window[name];
        });
        
        // Use Function constructor with restricted context
        const func = new Function(
            ...Object.keys(context),
            `"use strict"; return (${jsExpression});`
        );
        
        return func(...Object.values(context));
    }
    
    formatResult(num) {
        // Handle floating point precision issues
        const rounded = Math.round((num + Number.EPSILON) * 100000000) / 100000000;
        
        // Convert to string and handle scientific notation
        let result = rounded.toString();
        
        // Limit decimal places for display
        if (result.includes(".") && result.split(".")[1].length > 8) {
            result = rounded.toFixed(8).replace(/\.?0+$/, "");
        }
        
        return result;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new Calculator();
});

// Fallback for older browsers or if DOMContentLoaded already fired
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new Calculator());
} else {
    new Calculator();
}