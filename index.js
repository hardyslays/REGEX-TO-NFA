var sigma = '*';

class Enfa{

    constructor(input)
    {
        if(input == undefined){
            this.states = ['q0'];
            this.inputs = [];
            this.intial_state = 'q0';
            this.final_states = [];
            this.transition = {}
        }
        else{
            this.states = ['q0', 'q1'];
            this.inputs = [input];
            this.intial_state = 'q0';
            this.final_states = ['q1'];
            this.transition = {
                'q0': {
                    [input] : ['q1']
                }
            }
        }
    }

    show_transition(){
        Object.keys(this.transition).forEach(key => {
            console.log(key, ":");
            Object.keys(this.transition[key]).forEach(k => {
                console.log('\t', k, ">");
                this.transition[key][k].forEach(el => console.log('\t\t', el) );
            });
        }) 
    }

    add_transition(from, via, to){
        var arr = this.transition[from];
        if(arr == undefined){
            let temp = { [via] : [to]}
            this.transition[from] = temp;
        }
        else if(arr[via] == undefined)arr[via] = [to];
        else if(arr[via].indexOf(to) == -1){
            arr[via].push(to);
        }
        if(this.inputs.includes(via) == false) this.inputs.push(via);
        if(this.states.includes(from) == false) this.states.push(from);
        if(this.states.includes(to) == false) this.states.push(to);
    }

    get_transition(from, via)
    {
        return this.transition[from][via];
    }

    klene_plus(){
        this.final_states.forEach(f => {
            this.add_transition(f, sigma, this.intial_state);
        })

        return this;
    }
    klene_closure(){
        this.klene_plus();
        this.final_states.forEach( s=> {
            this.add_transition(this.intial_state, '*', s);
        })

        return this;
    }

    
    get_state_val_with_offset(state, offset)
    {
        var ans = (parseInt(state.substring(1)) + offset);
        state = 'q' + ans.toString();
        return state;
    }

    concat(obj){
        var offset = this.states.length;

        this.final_states.forEach(s =>{
            this.add_transition(s, sigma, this.get_state_val_with_offset(obj.intial_state, offset));
        });

        this.final_states = [];
        obj.final_states.forEach(el => this.final_states.push(this.get_state_val_with_offset(el, offset)));

        Object.keys(obj.transition).forEach(from => {
            Object.keys(obj.transition[from]).forEach(via => {
                obj.transition[from][via].forEach(to => {
                    this.add_transition(
                        this.get_state_val_with_offset(from, offset),
                        via,
                        this.get_state_val_with_offset(to, offset)
                    )
                });
            });
        })

        return this;
    }

    addition(obj){
        var offset = this.states.length+1;
        var result = new Enfa();

        result.add_transition(result.intial_state, sigma, this.get_state_val_with_offset(this.intial_state, 1));
        result.add_transition(result.intial_state, sigma, this.get_state_val_with_offset(obj.intial_state, offset));

        Object.keys(this.transition).forEach(from => {
            Object.keys(this.transition[from]).forEach(via => {
                this.transition[from][via].forEach(to => {
                    result.add_transition(
                        this.get_state_val_with_offset(from, 1),
                        via,
                        this.get_state_val_with_offset(to, 1)
                    )
                });
            });
        })

        Object.keys(obj.transition).forEach(from => {
            Object.keys(obj.transition[from]).forEach(via => {
                obj.transition[from][via].forEach(to => {
                    result.add_transition(
                        this.get_state_val_with_offset(from, offset),
                        via,
                        this.get_state_val_with_offset(to, offset)
                    )
                });
            });
        })

        this.final_states.forEach(s =>{
            result.final_states.push(this.get_state_val_with_offset(s, 1));
        });

        obj.final_states.forEach(s =>{
            result.final_states.push(this.get_state_val_with_offset(s, offset));
        });

        return result;
    }

    sigma_closure(){
        var arr = {}

        Object.keys(this.transition).forEach( from =>{
            if(this.transition[from]['*'] != undefined)
            {
                arr[from] = this.transition[from]['*'];
            }
            if(arr[from] == undefined)arr[from] = [from];
            else if(arr[from].indexOf(from) == -1)arr[from].push(from);
        })

        return arr;
    }

    rename_state(from, to)
    {
        this.states.splice(this.states.indexOf(from), 1);
        this.states.push(to);

        if(this.intial_state == from)this.intial_state = to;

        if(this.final_states.indexOf(from) != -1)
        {
            this.final_states.splice(this.final_states.indexOf(from), 1);
            this.final_states.push(to);
        }

        if(this.transition[from] != undefined)
        {
            this.transition[to] = this.transition[from];
            delete this.transition[from];
        }

        Object.keys(this.transition).forEach(f => {
            Object.keys(this.transition[f]).forEach(via => {
                    if(this.transition[f][via].indexOf(from) != -1){
                        this.transition[f][via].splice(this.transition[f][via].indexOf(from), 1);
                        this.transition[f][via].push(to);
                    }
            });
        })
    }
}

class Stack{
    constructor()
    {
        this.items =[];
        this.top = null;
    }

    push(item){
        this.items.push(item);
        this.top = item;
    }
    pop(item){
        if(this.items.length == 1)this.top = null;
        else this.top = this.items[this.items.length-2]
        return this.items.pop();
    }
    isempty(){
        return (this.items.length == 0);
    }
}

const prec = (ch) =>{
    if(ch == '*' || ch == '+')return 4;
    if(ch == '.')return 3;
    if(ch == '|')return 2;
    return 1;
}

const checkKeyword = (ch) => {
    if(ch == '(' || ch == ')' || ch == '*' || ch == '+' || ch == '.' || ch == '|')return true;

    return false;
}

const infix_to_postfix = (regex) =>{
    var st = new Stack();
    var out = '';
    for(let i = 0; i < regex.length; i++)
    {
        // console.log(out);
        // console.log(regex[i]);
        // console.log(st.top);
        // console.log("--------------------");
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
    console.log(regex)
    regex = infix_to_postfix(regex);

    return solve_for_nfa(regex);
}

const Stringify = (arr) => {
    var str = arr.sort().join("");
    return str;
}

var obj1 = regex_to_nfa('');
var obj2 = new Enfa('b');

const reachable_states = (nfa, from, via, arr, res) => {
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

const rename_states = (dfa, state, arr)=> {

    if(arr.indexOf(state) == -1){
        let str = 'q' + arr.length/2;
        console.log(state, ":", str);
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
        console.log(Stringify(from));
        symbols.forEach( via => {
            let to = [];
            from.forEach( f => {
                if(nfa.transition[f] != undefined)
                {
                    let out = reachable_states(nfa, f, via, [], []);
                    // console.log(f, ':', via);
                    // console.log(out);
                    out.forEach( o=> {

                        let reach = reachable_states(nfa, o, sigma, [], []);
                        reach.push(o);
                        reach.forEach( el => {
                            if(to.indexOf(el) == -1)to.push(el);
                        })
                    })
                }
            })
            console.log('\t',via, ':');
            console.log('\t',to);
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

//Conversion from E-nfa to dfa --- compeleted
//Testing of conversion from E-nfa to dfa remains --- done
//Renaming states in dfa remaining --- renaming done

//Adding comments to coe for better readability
//Resulting DFA is actually an NFA, so to think about that
