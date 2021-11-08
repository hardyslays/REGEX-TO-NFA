// Class template to utilize Stack data structure
export default class Stack{
    constructor()
    {
        this.items =[];
        this.top = null;
    }

    push = (item) => {
        this.items.push(item);
        this.top = item;
    }
    pop = () => {
        if(this.items.length == 1)this.top = null;
        else this.top = this.items[this.items.length-2]
        return this.items.pop();
    }
    isempty = () => {
        return (this.items.length == 0);
    }
}