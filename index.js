import Enfa from '/Enfa.js';
import Stack from '/Stack.js';
import {checkKeyword, infix_to_postfix, Stringify, rename_states, reachable_states, modify_regex} from './Utils.js';

var sigma = '*';

const solve_for_nfa = (regex) => {
    var st = new Stack();

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

const regex_to_nfa = (regex) => {

    regex = modify_regex(regex);
    
    regex = infix_to_postfix(regex);

    return solve_for_nfa(regex);
}

const nfa_to_dfa = nfa => { 

    console.log("**********************************************************")
    console.log("**********************************************************")
    console.log("**********************************************************")
    
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
                    console.log(out);
                    console.log(reach);
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
    
    return dfa;
}

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

// var obj1 = regex_to_nfa('AA|AAA');
// var obj2 = nfa_to_dfa(obj1)
// console.log(obj1)
// console.log(obj2)
// console.log("hello")


document.querySelector('#convert').addEventListener('click', () => {
    document.querySelector("#nfa").style.display = "none";
    document.querySelector("#dfa").style.display = "none";

    var regex = document.querySelector("#regex-input").value;

    regex = modify_regex(regex);
    document.querySelector("#mod_regex").textContent = regex;

    var nfa = regex_to_nfa(regex);
    if(nfa == -1)alert("NFA not possible for given Regular expression. Please check the regular expression you have entered.");

    else{
        // output_nfa(nfa);
        print_nfa(nfa);
        dfa = nfa_to_dfa(nfa);
        print_dfa(dfa);
        // output_dfa(dfa);
        document.querySelector("#nfa").style.display = "block";
        document.querySelector("#dfa").style.display = "block";
    }
})



//CHECK NFA TO DFA CONVERSION FOR: a.a.a
//ADD DEAD STATES IN DFA
//RENAMING STATES ISN'T WORKING.....PROBABLY DUE TO ERROR IN CONVERSION FROM NFA TO DFA
//ERROR IN CONVERTING '.' OR CONCATENATION FROM NFA TO DFA

//CLOSE NFA AND DFA DISPLAY BY DEFAULT IN CSS