// 1. Print numbers 1 to 10  
// Write a program using a for loop to print numbers from 1 to 10.
// for (let i = 1; i <= 10; i++) {
//     console.log(i)
// }


// 2. Sum of first N numbers  
// Use a while loop to calculate the sum of the first N natural numbers.
// let number = 2;
// let i = 1;
// let sum = 0;
// while (i <= number) {
//     sum = sum + i
//     i = i + 1
// }
// console.log(sum)


// 3. Multiplication table  
// Print the multiplication table of a given number using a for loop.
// let res = 16;
// for (let i = 0; i <= 10; i++) {
//     console.log(res * i)
// }


// 4. Factorial calculation  
// Write a program using a while loop to find the factorial of a given number.
// let number = 9;
// let factorial = 2;
// let i = 1;
// while (i <= number) {
//     factorial = factorial * i
//     i = i + 1
// }
// console.log(factorial)


// 5. Reverse counting  
// Print numbers from 10 down to 1 using a for loop.
// for (let i = 10; i >= 1; i--) {
//     console.log(i);
// }

// 6. Even numbers up to N  
// Use a do-while loop to print all even numbers up to N.
// let i = 1;
// let N = 10;

// do {
//     if (i % 2 == 0) {
//         console.log(i);
//     }

//     i++;
// } while ( i <= N );

// 7. Sum of digits  
// Write a program using a while loop to calculate the sum of digits of a given number.
// let number = 123 ;
// let sum = 0;
// while (number > 0) {
//     last= number % 10;
//     sum = sum + last;
//     number= Math.floor(number / 10)
// }
// console.log(sum)


// 8. Fibonacci series  
// Generate the first 10 terms of the Fibonacci series using a for loop.
// let a = 0;
// let b = 1;

// for (let i = 1; i <= 10; i++) {
//     console.log(a);

//     let next = a + b;
//     a = b;
//     b = next;
// }


// 9. Guessing game  
// Use a do-while loop to keep asking the user for a number until they guess the correct one.
// let correctNumber = 7;
// let guess = 5;

// do {
//     console.log("Wrong! Try again.");

//     guess++;
// } while (guess !== correctNumber);

// console.log("Correct!");


// 10. Prime number check  
// Write a program using a for loop to check if a given number is prime.
// let number = 17;
// let isPrime = true;

// if (number <= 1) {
//     isPrime = false;
// }

// for (let i = 2; i < number; i++) {
//     if (number % i === 0) {
//         isPrime = false;
//         break;
//     }
// }

// if (isPrime) {
//     console.log("Prime number");
// } else {
//     console.log("Not a prime number");
// }