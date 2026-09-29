//  Object Questions
// Access object properties
// Create an object student with properties name, age, and grade. Print each property.
// const obj = {
//   name: "Ahmed",
//   lname: "Mujahid",
//   age: 22,
//   grade: "A",
// };
// console.log(obj.name)
// console.log(obj.lname)
// console.log(obj.age)
// console.log(obj.grade)

// Loop through object
// Write a program to loop through all keys and values of an object using for...in.
// const obj = {
//   name: "Ahmed",
//   lname: "Mujahid",
//   age: 22,
//   grade: "A",
// };

// for (const key in obj) {
//   console.log(key, obj[key]);
// }

// Object methods
// Create an object calculator with methods add, subtract, multiply, and divide. Demonstrate usage.

// const calculator = {
//   add(a, b) {
//     return a + b;
//   },

//   sub(a, b) {
//     return a - b;
//   },

//   mul(a, b) {
//     return a * b;
//   },
//   div(a, b) {
//     return a / b;
//   },
// };
// console.log(calculator.add(2, 9))
// console.log(calculator.sub(9, 2))
// console.log(calculator.mul(2, 9))
// console.log(calculator.div(9, 3))


// Nested objects
// Write a program to access values inside a nested object (e.g., student.address.city).
// const obj = {
//   name: "Ahmed",
//   lname: "Mujahid",
//   age: 22,

//   course:{
//     number1:"web dev",
//     number2:"mobile dev",
//   },
//   grade: "A"
// };
// console.log(obj.course.number1);

// Convert object to array
// Convert an object’s keys and values into separate arrays.
// const obj = {
//   name: "Ahmed",
//   lname: "Mujahid",
//   age: 22,
//   grade: "A",
// };

// const convert= Object.entries(obj)
// const convert1= Object.keys(obj)
// const convert2= Object.values(obj)
// console.log(convert)
// console.log(convert1)
// console.log(convert2)