// Define sigma with '*'
var sigma = '*';



// Class template for Enfa
export default class Enfa{

    // Constructor for a single character input(also covers no input giving default NFA with one initial state and no final state)
    constructor(input)
    {
        if(input === undefined){
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

    // Util function for dev purposes
    show_transition(){
        Object.keys(this.transition).forEach(key => {
            console.log(key, ":");
            Object.keys(this.transition[key]).forEach(k => {
                console.log('\t', k, ">");
                this.transition[key][k].forEach(el => console.log('\t\t', el) );
            });
        }) 
    }

    // Function to add a new transition having "FROM state", via input, "TO state" parameters
    add_transition(from, via, to){
        if(this.transition[from] === undefined){
            var temp = { [via] : [to]}
            this.transition[from] = temp;
        }
        else if(this.transition[from][via] == undefined)this.transition[from][via] = [to];
        else if(this.transition[from][via].indexOf(to) == -1){
            this.transition[from][via].push(to);
        }
        if(this.inputs.includes(via) == false) this.inputs.push(via);
        if(this.states.includes(from) == false) this.states.push(from);
        if(this.states.includes(to) == false) this.states.push(to);
    }

    // Util function for dev purposes
    get_transition(from, via)
    {
        return this.transition[from][via];
    }

    // Applying Klene_plus on current E-NFA
    klene_plus(){
        this.final_states.forEach(f => {
            this.add_transition(f, sigma, this.intial_state);
        })

        return this;
    }

    // Applying Klene_closure on current E-NFA
    klene_closure(){
        this.klene_plus();
        this.final_states.forEach( s=> {
            this.add_transition(this.intial_state, '*', s);
        })

        return this;
    }

    // Util function for dev purposes
    get_state_val_with_offset(state, offset)
    {
        var ans = (parseInt(state.substring(1)) + offset);
        state = 'q' + ans.toString();
        return state;
    }

    // Function to apply concatenation of two NFAs 
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

    // Function to apply or operation between two NFAs i.e. result = NFA(1) | NFA(2)
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


    // Function to get sigma_closure of given NFA
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

    // Function to rename a state of NFA
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
            this.transition[to] = Object.assign({}, this.transition[from]);
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

    // Function to add dead state (Function to be used for DFA)
    add_dead_state(){
        var ok = false;

        this.inputs.forEach( via => {
            this.states.forEach(from => {
                if(this.transition[from] == undefined || this.transition[from][via] == undefined){
                    this.add_transition(from, via, "dead");
                    ok = true;
                }
            })
        })

        if(ok){
            this.inputs.forEach( via => {
                this.add_transition("dead", via, "dead");
            })

            this.rename_state("dead", `q${this.states.length-1}`);
        }
    }
}