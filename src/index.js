//Import Enfa class form Enfa.js module
import Enfa from '/Enfa.js';
//Import Stack class from Stack.js module
import Stack from '/Stack.js';
//Import important utils from Utils.js module
import {checkKeyword, infix_to_postfix, Stringify, rename_states, reachable_states, modify_regex} from './Utils.js';

//We will define sigma with '*' character
var sigma = '*';



//Conversion of Postfix Regular expression to Nfa
const solve_for_nfa = regex => {
    //Create a new stack to hold parts of NFAs
    var st = new Stack();

    //Traverse in Postfix regular expression and convert it into NFA

    //      Steps for conversion is:
    // ************************************
    // ************************************
    // 1. If you get a character, create a NFA for the single character and push the NFA to the stack.
    // 2. If you get a keyword (any one from * | . +):
    //  2.a. If the keyword is '*':
    //      2.a.i.  if the stack is empty, return failed conversion(-1)
    //      2.a.ii. else pop the top from stack, apply Klene closure and push back to stack
    //  2.b. If the keyword is '+':
    //      2.b.i.  if the stack is empty, return failed conversion(-1)
    //      2.b.ii. else pop the top from stack, apply Klene plus and push back to stack
    //  2.c. If keyword is '.':
    //      2.c.i   if the stack has less than 2 elements, return failed conversion(-1)
    //      2.c.ii. else pop two elements apply concatenation and push the result in stack.
    //  2.d. If keyword is '|':
    //      2.d.i   if the stack has less than 2 elements, return failed conversion(-1)
    //      2.e.ii. else pop two elements apply NFA(1)|NFA(2) and push the result in stack.
    // 3. Check the stack, if it contains exactly 1 element, return it as result, else failed conversion.
    // ************************************

    for(let i = 0; i < regex.length; i++)
    {
        if(checkKeyword(regex[i])){
            if(regex[i] == '*')
            {
                if(st.isempty())return -1;
                
                var cur = st.pop();
                cur = cur.klene_closure();
                st.push(cur);
            }
            else if(regex[i] == '+')
            {
                if(st.isempty())return -1;
                
                var cur = st.pop();
                cur = cur.klene_plus();
                st.push(cur);
            }
            else if(regex[i] == '|')
            {
                if(st.isempty())return -1;   
                var c1 = st.pop();
                if(st.isempty())return -1;   
                var c2 = st.pop();

                c2 = c2.addition(c1);
                st.push(c2);
            }
            else if(regex[i] == '.')
            {
                if(st.isempty())return -1;   
                var c2 = st.pop();
                if(st.isempty())return -1;   
                var c1 = st.pop();

                c1 = c1.concat(c2);
                st.push(c1);
            }
            else return -1;
        }
        else{
            var n = new Enfa(regex[i]);
            st.push(n);
        }
    }

    var res = st.pop();
    if(!st.isempty())return -1;
    return res;
}



//Create a wrapper function for  conversion from REGEX to NFA
const regex_to_nfa = regex => {

    //Modify regex for irregularities(it doesn't completely check for irregularities as it is out of scope of this project)
    regex = modify_regex(regex);
    
    //Convert the Infix regular expression to postfix regular expression
    regex = infix_to_postfix(regex);

    // Solve postfix regex to get resultant NFA
    return solve_for_nfa(regex);
}



//Conversion of NFA to DFA

//      Steps for conversion:
// ************************************
// ************************************
// 1. Copy the symbols(Terminals) of NFA to DFA
// 2. Create a DFA using NFA class(we will manually manage the difference between NFA and DFA)
// 3. Get the sigma closure of NFA in an array "arr"
// 4. Create two arrays, totArray: to hold array of "Stringified set of states", curArray: to hold array of "set of states" not processed for further branches
// 5. Add initial "Set of states" to curArray and its Stringified version to totArray
// 6. Rename the initial state of DFA to Initial "Stringified Set of states" of NFA
// 7. While curArray is not empty:
//      7.a. Take first element of curArray and name it as "from".
//      7.b. For each of the input symbol (except sigma) of the NFA:
//          7.b.i.  For each of the state in "Set of states" of FROM:
//              7.b.i.(i)   Get all of the reachable state from the given state via given input, and create a "set of states".
//              7.b.i.(ii)  If the resultant "set of states" is not included in totArray, add it in totArray and curArray.
//              7.b.i.(iii) If the resultant "set of states" is not empty, add a transition in DFA from "FROM set of states" via given symbols to "TO set of states".
//              7.b.i.(iv)  Remove the "FROM set of states" from curArray, as it is now processed.
// 8. Rename the complex states of DFA to simpler states
// 9. Add dead state to DFA, if required
// ************************************
const nfa_to_dfa = nfa => { 

    let symbols = nfa.inputs;
    if(symbols.indexOf('*') != -1)
    {
        symbols.splice(symbols.indexOf('*'), 1);
    }

    var dfa = new Enfa();
    
    var arr = nfa.sigma_closure();

    var tot_array = [Stringify(arr[nfa.intial_state])];
    var cur_array = [arr[nfa.intial_state]];

    dfa.rename_state('q0', Stringify(arr[nfa.intial_state]));

    while(cur_array.length)
    {
        let from = cur_array[0];
        symbols.forEach( via => {
            let to = [];
            from.forEach( f => {
                if(nfa.transition[f] != undefined)
                {
                    let out = reachable_states(nfa, f, via, [], []);
                    let reach;
                    console.log(f, ">", via);
                    out.forEach( o=> {
                        reach = reachable_states(nfa, o, sigma, [], []);
                        reach.push(o);
                        reach.forEach( el => {
                            if(to.indexOf(el) == -1)to.push(el);
                        })
                    })
                }
            })

            if(Stringify(to) != '' && tot_array.indexOf(Stringify(to)) == -1){
                tot_array.push(Stringify(to));
                cur_array.push(to);
            }
            
            if(to.length > 0){
                dfa.add_transition(Stringify(from), via, Stringify(to));
            }
        })
        cur_array.splice(0, 1);
    }

    nfa.final_states.forEach( f =>{
        tot_array.forEach( el => {
            if(el.search(f) != -1){
                if(dfa.final_states.indexOf(el) == -1){
                    dfa.final_states.push(el);
                }
            }
        })
    })
    
    dfa = rename_states(dfa, dfa.intial_state, []);
    dfa.add_dead_state();
    
    return dfa;
}



//Function to print resultant NFA in html body
const print_nfa = nfa => {

    console.log(nfa);

    document.querySelector("#nfa_transitions").innerHTML = "";

    var states_arr = nfa.states.toString();
    document.querySelector("#nfa_states").innerHTML = states_arr;

    states_arr = nfa.inputs.toString();
    document.querySelector("#nfa_inputs").innerHTML = states_arr;

    states_arr = nfa.intial_state;
    document.querySelector("#nfa_initial_state").innerHTML = states_arr;

    states_arr = nfa.final_states.toString();
    document.querySelector("#nfa_final_states").innerHTML = states_arr;

    var transition_table = document.querySelector("#nfa_transitions");
    var thead = document.createElement('thead');
    states_arr = document.createElement('th');
    states_arr.innerHTML = 'STATES';
    thead.appendChild(states_arr);
    
    nfa.inputs.forEach( e => {
        var inp = document.createElement('th');
        inp.innerHTML = e;
        thead.appendChild(inp);
    })

    transition_table.appendChild(thead);

    nfa.states.forEach( from => {
        var row = document.createElement("tr");
        states_arr = document.createElement("td");
        
        states_arr.innerHTML = from;
        row.appendChild(states_arr);

        row.appendChild(states_arr);
        
        nfa.inputs.forEach( via => {
            states_arr = document.createElement("td");
            if(nfa.transition[from] == undefined || nfa.transition[from][via] == undefined)states_arr.innerHTML = '-----';
            else states_arr.innerHTML = nfa.transition[from][via];

            row.appendChild(states_arr);
        })

        transition_table.appendChild(row);
    })
}



//Function to print resultant NFA in html body
const print_dfa = dfa => {

    console.log(dfa);

    document.querySelector("#dfa_transitions").innerHTML = "";

    var states_arr = dfa.states.toString();
    document.querySelector("#dfa_states").innerHTML = states_arr;

    states_arr = dfa.inputs.toString();
    document.querySelector("#dfa_inputs").innerHTML = states_arr;

    states_arr = dfa.intial_state;
    document.querySelector("#dfa_initial_state").innerHTML = states_arr;

    states_arr = dfa.final_states.toString();
    document.querySelector("#dfa_final_states").innerHTML = states_arr;

    var transition_table = document.querySelector("#dfa_transitions");
    var thead = document.createElement('thead');
    states_arr = document.createElement('th');
    states_arr.innerHTML = 'STATES';
    thead.appendChild(states_arr);

    dfa.inputs.forEach( e => {
        let inp = document.createElement('th');
        inp.innerHTML = e;
        thead.appendChild(inp);
    })

    transition_table.appendChild(thead);

    dfa.states.forEach( from => {
        var row = document.createElement("tr");
        states_arr = document.createElement("td");
        
        states_arr.innerHTML = from;
        row.appendChild(states_arr);
        
        dfa.inputs.forEach( via => {
            states_arr = document.createElement("td");
            if(dfa.transition[from] == undefined || dfa.transition[from][via] == undefined)states_arr.innerHTML = '-----';
            else states_arr.innerHTML = dfa.transition[from][via];

            row.appendChild(states_arr);
        })

        transition_table.appendChild(row);
    })
}



// Event listener for onClick event of submit button, which converts given regex to NFA then to DFA and then prints both NFA anf DFA to the HTML body
document.querySelector('#convert').addEventListener('click', () => {
    document.querySelector("#nfa").style.display = "none";
    document.querySelector("#dfa").style.display = "none";

    var regex = document.querySelector("#regex-input").value;

    regex = modify_regex(regex);
    document.querySelector("#mod_regex").textContent = regex;

    var nfa = regex_to_nfa(regex);
    if(nfa == -1)alert("NFA not possible for given Regular expression. Please check the regular expression you have entered.");

    else{
        print_nfa(nfa);
        dfa = nfa_to_dfa(nfa);
        print_dfa(dfa);
        document.querySelector("#nfa").style.display = "block";
        document.querySelector("#dfa").style.display = "block";
    }
})
