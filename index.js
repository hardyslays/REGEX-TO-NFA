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
            arr = {[via] : [to]}
            this.transition[from] = arr;
        }
        else if(arr[via] == undefined)arr[via] = [to];
        else arr[via].push(to);

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
}

var obj1 = new Enfa('a');
var obj2 = new Enfa('b');

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