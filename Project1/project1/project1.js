/*
README --- CS 470 --- Project1 --- Roy Conboy
All the code is my own and I did not collaborate with anyone on this project.

-simplify -- implemented
-together -- implemented
-chains -- implemented

There is a problem with the output for the command sequence:
node project1.js -math -chains "MATH 220"

It seems the output gets messed up near the bottom half, don't know why but most of it 
is output correctly. Simplify also outputs correctly and doesn't have this problem.

Also, The output for these functions is also differing between on blue and that of my IDE 
so I tailored it to that of the output on blue.
*/

const csbs = require('./CS-BS_course_requisites_v2_pp.json');
const math = require('./MATH-BS_course_requisites_pp.json');


const usage = (scriptName) => {
        const usageCases = [
        `usage: node ${scriptName} departmentOption scriptOption`,
        `\tdepartmentOption is one of -cs or -math`,
        "\tscriptOption is one of:",
        "\t\t-chains courseID",
        "\t\t-simplify",
        "\t\t-together courseID1 courseID2",
        "You will have to use double quotes around course ID if it contains a space.",
        'For example: "CS 470"'
    ]

    usageCases.forEach(line => console.log(line));
    process.exit(1);
}

const checkDepartmentOption = (scriptName, userProvidedDeptOption) => {
  if(userProvidedDeptOption !== "-cs" && userProvidedDeptOption !== "-math") {
      console.log(`${userProvidedDeptOption} is not a valid department option.`);
      usage(scriptName); // will not return
  }
}

const checkScriptOption = (scriptName, scriptOption, restOfArgs) => {
  const options = ["-simplify", "-chains", "-together" ];

  if( options.indexOf(scriptOption) === -1) {
      console.log(`${scriptOption} is not a valid script option.`);
      usage(scriptName);  // will not return
  }

  if(scriptOption === '-together' && restOfArgs.length !== 2) {
      console.log(`Script option -together require two course IDs.`)
      usage(scriptName);
  }
}

const checkUserProvidedCourseIDs = (coursesPrereqObject, twoCourseIDs) => {
  twoCourseIDs.forEach((courseID, idx) => {
      if(! coursesPrereqObject[courseID]) {
          console.log(`${courseID} is not a valid courseID.`);
          process.exit(2);
      }
  })
}

function findPreReqs(arr, innerObject) {
  // innerObject is coursesObject[innerKey]["course_pre_reqs"]
  for (let innerKey2 in innerObject){
    let innerObject3 = innerObject[innerKey2];
    for (let innerKey3 in innerObject3){
      if (innerKey3 === "courses"){
        let innerObject4 = innerObject3[innerKey3];
        for (let innerKey4 in innerObject4){
          let innerObject5 = innerObject4[innerKey4];
          for (let innerKey5 in innerObject5){
            //console.log(innerKey5);
            arr.push(innerKey5);
          }
        }
      }
    } 
  } 
  return arr;
}

function hasElement(array1, array2, ele1, ele2) {
  for (let i in array1){
    if (array1[i].includes(ele2)){
      return true;
    }
  }
  for (let i in array2){
    if (array2[i].includes(ele1)){
      return true;
    }
  }
  return false;
}

// needed a function to print and one to return... 
// ran out of time as this is clearly an awful solution.

function findPaths2(course, arr, result = []) {
  let simple = makeSimple(coursesObject);
  if (simple[course].length === 0) { 
    //console.log([...arr, course]);
    result.push([...arr, course]);
  } 
  else {
    for (const prereq of simple[course]) {
      findPaths2(prereq, [...arr, course], result);
    }
  }
  return result;
}

function findPaths(course, arr, result = []) {
  let simple = makeSimple(coursesObject);
  if (simple[course].length === 0) { 
    console.log([...arr, course]);
    //result.push([...arr, course]);
  } 
  else {
    for (const prereq of simple[course]) {
      findPaths(prereq, [...arr, course], result);
    }
  }
  //return result;
}



const processChains = (coursesObject, restOfArgs) => {
  const paths = findPaths(restOfArgs[0], [], []); 
  return paths;
}


const processTogether = (coursesObject, restOfArgs) => {
  
  let chain1 = findPaths2(restOfArgs[0], [], []);
  let chain2 = findPaths2(restOfArgs[1], [], []);

  if (hasElement(chain1, chain2, restOfArgs[0], restOfArgs[1]) === true){
    console.log(`${restOfArgs[0]} and ${restOfArgs[1]} cannot be taken concurrently`);
  } else console.log(`${restOfArgs[0]} and ${restOfArgs[1]} can be taken concurrently`);
}



const makeSimple = coursesObject => {
  const simple = {};
  for (let innerKey in coursesObject){
    let innerObject = coursesObject[innerKey]["course_pre_reqs"];
    let arr = [];
    findPreReqs(arr, innerObject);
    simple[innerKey] = arr;
  } 
  return simple;
}

const processSimplify = coursesObject => {
  const simple = {};
  for (let innerKey in coursesObject){
    let innerObject = coursesObject[innerKey]["course_pre_reqs"];
    let arr = [];
    findPreReqs(arr, innerObject);
    simple[innerKey] = arr;
  } 
  console.log(simple);
}


console.log(`Number of command components is ${process.argv.length}.`);
if(process.argv.length < 4) {
    // process.argv[0] contains the path to the node interpreter
    // process.argv[1] contains the name of the script.
    // we need at least two additional arguments.

    usage(process.argv[1]);
}

const scriptNameIdx = 1, departmentOptionIdx = 2, scriptOptionIdx = 3, restOfArgsIdx = 4;

const argv = process.argv, argc = process.argv.length;
checkDepartmentOption(argv[scriptNameIdx], argv[departmentOptionIdx]);
const departmentJSONObject = argv[departmentOptionIdx] === '-cs' ? csbs : math;
const coursesObject = departmentJSONObject["courses"];
if(! coursesObject) {
    console.log(`The JSON for the ${argv[departmentOptionIdx]} doesn't have "courses" attribute name.`)
    process.exit(1);
}

const cs252 = coursesObject['CS 252'];


checkScriptOption(argv[1], argv[3], argv.slice(restOfArgsIdx));

switch (argv[scriptOptionIdx]) {
    case "-together":
        checkUserProvidedCourseIDs(coursesObject, argv.slice(restOfArgsIdx));
        processTogether(coursesObject, argv.slice(restOfArgsIdx));
        break;
    case "-simplify":
        processSimplify(coursesObject);
        break;
    case "-chains":
        processChains(coursesObject, argv.slice(restOfArgsIdx));
        break;
    default:
        console.log('We do not expect to get here!');
}




