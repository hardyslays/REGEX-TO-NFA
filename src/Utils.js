//Importing stack class
import Stack from './Stack.js';

//Define sigma with '*' character
const sigma = '*';


// Function to calculate precedence of keywords in Regex
const prec = (ch) =>{
    if(ch == '*' || ch == '+')return 4;
    if(ch == '.')return 3;
    if(ch == '|')return 2;
    return 1;
}


// Check if current character of Regex is a keyword
export const checkKeyword = (ch) => {
    if(ch == '(' || ch == ')' || ch == '*' || ch == '+' || ch == '.' || ch == '|')return true;

    return false;
}


// Convert infix reex to postfix regex
export const infix_to_postfix = (regex) =>{
    var st = new Stack();
    var out = '';
    for(let i = 0; i < regex.length; i++)
    {
        if(regex[i] == '(')st.push('(');
        else if(regex[i] == ')'){
            while(!st.isempty() && st.top != '(')
            {
                out += st.pop();
            }

            if(st.isempty())return -1;
            
            st.pop();
        }
        else if(checkKeyword(regex[i])){
            while(!st.isempty() && prec(regex[i]) <= prec(st.top)){
                out += st.pop();
            }
            if(st.isempty())return -1;
            st.push(regex[i]);
        }
        else out += regex[i];
    }
    return out;
}


// To convert a "set of states" to a string, used to denote and compare "set of states" with each other
export const Stringify = arr => {
    var str = arr.sort().join("");
    return str;
}


// Function to rename complex states into normal states  
export const rename_states = (dfa, state, arr)=> {

    if(arr.indexOf(state) == -1){
        let str = 'q' + arr.length/2;
        dfa.rename_state(state, str);
        arr.push(state);
        arr.push(str);
        state = str;
    }

    dfa.inputs.forEach( via => {
        if(dfa.transition[state] != undefined && dfa.transition[state][via] != undefined){
            dfa.transition[state][via].forEach( to => {
                if(arr.indexOf(to) == -1){
                    dfa = rename_states(dfa, to, arr);
                }
            })
        }
    })

    return dfa;
}


// Function to get reachable states from one state via given input
export const reachable_states = (nfa, from, via, arr, res) => {
    if(nfa.transition[from] != undefined && nfa.transition[from]['*'] != undefined){
        nfa.transition[from]['*'].forEach( e => {
            if(arr.indexOf(e) == -1){
                arr.push(e);
                let temp = reachable_states(nfa, e, via, arr, res);
                temp.forEach( el => {
                    if(res.indexOf(el) == -1)res.push(el);
                })
            }
        })
    }

    if(nfa.transition[from] == undefined || nfa.transition[from][via] == undefined)return res;

    nfa.transition[from][via].forEach( e => {
        if(res.indexOf(e) == -1){
            res.push(e);
        }
    })


    return res;
}


// Modify regex for irregularities (the modification doesn't check for all irregularities)
export const modify_regex = regex => {
    regex = '(' + regex + ')';

    for(let i = 0; i <regex.length-1; i++)
    {
        if(!checkKeyword(regex[i]) && !checkKeyword(regex[i+1]))regex = regex.substring(0, i+1) + '.' + regex.substring(i+1);
    }

    return regex;
}