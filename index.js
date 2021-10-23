import Enfa from '/Enfa.js';
import Stack from '/Stack.js';
import {checkKeyword, infix_to_postfix, Stringify, rename_states, reachable_states} from './Utils.js';

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
    
    regex = '(' + regex + ')';

    for(let i = 0; i <regex.length-1; i++)
    {
        if(!checkKeyword(regex[i]) && !checkKeyword(regex[i+1]))regex = regex.substring(0, i+1) + '.' + regex.substring(i+1);
    }
    regex = infix_to_postfix(regex);

    return solve_for_nfa(regex);
}

const nfa_to_dfa = (nfa) => {
    
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
                    out.forEach( o=> {

                        let reach = reachable_states(nfa, o, sigma, [], []);
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


            if(to.length > 0)dfa.add_transition(Stringify(from), via, Stringify(to));
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

var obj1 = regex_to_nfa('AA|AAA');
var obj2 = nfa_to_dfa(obj1)
console.log(obj1)
console.log(obj2)
console.log("hello")

// Conversion from E-nfa to dfa --- compeleted
//Testing of conversion from E-nfa to dfa remains --- done
//Renaming states in dfa remaining --- renaming done

//Adding comments to coe for better readability
//Resulting DFA is actually an NFA, so to think about that
