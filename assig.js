
// 1) What is JavaScript?

/*
JavaScript is a programming language used to make web pages interactive.                     
It runs in the browser and allows you to create dynamic features like dropdown menus,
 sliders, form validation, popups, and more. JavaScript works with 
 HTML (structure) and CSS (styling) to build fully functional websites.
 */

 // 2) Variables and Types 

let userAge = 20;                                                                             
let userName = "Harini";

console.log("Age:",userAge);
console.log("Name:",userName);

// 3)Comments in JavaScript

/*
This function takes a name as a parameter                                                     
and returns a personalized greeting message.
It demonstrates how to define and call functions in JavaScript.
*/

// 4) Operations

 let num1=20;                                                                                 
 let num2=16;

 console.log("Addition:" ,num1+num2);
 console.log("Subtraction:" ,num1-num2);
 console.log("Multiplication:" ,num1*num2);
 console.log("Devision:" ,num1/num2);
// 5) Data Types

let string = "Hello World";                                                                    
let number = 16;
let boolean = true;
let array = [1,3,6,7];

console.log(typeof string);
console.log(typeof number);
console.log(typeof boolean);
console.log(typeof array);

// 6) Functions in JavaScript

function greetUser(name) {                                                                     
    return "Hello " + name;
}

console.log(greetUser("Harini"));

// 7) if Else in JavaScript

let temperature = 35;                                                                          

if (temperature > 20){
    console.log("It's too hot day!");
}
else {
    console.log("Weather is good")
}

// 8) FOR LOOP

for (let i = 1; i < 6; i++) {                                                                 
    console.log(i);
}

// 9) Loose vs Strict Equality

console.log("5" == 5);    // == allows type conversion (e.g., string to number). 
console.log("5" === 5);   //=== checks both value and type (no conversion allowed)
                    
