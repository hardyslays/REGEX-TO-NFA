# REGEX-TO-NFA
A web application to demonstrate conversion from regular expression to NFA and NFA to DFA.

## INTRODUCTION
I have created a website unsing vanilla JavaScript with the functionality to convert an input Regular Expression to a Non-deterministic Finite Automata, then theat Non-deterministic finite Automata to Deterministic Finite Automata. The website doesn't use any extra libraries and thus is a very light weight and basic website. The main functionality of the website was fulfilled and I have not focussed on the UI as much.

## Conversion from Regex to NFA
The process of conversion of regex to NFA is not defined anywhere properly. So I will try to defined what I have done. Firstly, I will assume that the people have wrote the regex according to the instructions I have provided on the website. I have attached a screenshot below for reference.

![regex-rules](https://github.com/HardySLAYS/REGEX-TO-NFA/blob/main/regex.png)

Now, the steps to convert Regex to NFA is:
1. Treat each terminal symbol(non-reserved keywords) as an input symbol and the keyword symbols such as { ".", "\*", "(", ")", "|", "+" } as operators between the inputs.
2. We can think of this whole regex expression as an Infix regex, so first we will be converting the infix expression as an postfix expression. This can be done in the same manner as we convert an infix mathematical expression to postfix expression, considering the input symbols as variables and the keywords as operators.
3. Now that we have a postfix operation, the magic happens. All we have to do is traverse the postfix expression while maintaining a stack of NFAs. As we traverse:
    * If we recieve an input symbol, we create a NFA with two states for that single input symbol. 
    * If we find a unary operation ("+", "\*"), we pop back the top NFA from the stack, apply that operation on the NFA and push the NFA back in the stack.
    * If we find a binary operation (".", "|"), we pop back two NFAs from the stack, apply the operation between those stacks, and push the result back in the stack.
    * We have to maintain the order of precedence.
    * If at any point, the above steps are not possible, that means that the regex input is having an error.
4. After the traversal, if we have only one NFA in our stack, it means that our conversion is successful and that NFA is our resultant NFA.

## NFA to DFA
The conversion from NFA to DFA is done using the classical sigma closure method, so I will not be explaining that here. You can probably read it on some good sites such as GeeksForGeeeks or JavaTpoint, which will provide better description than me 	:sweat_smile:	:sweat_smile:.
Both the NFA and DFA are represented in the table format on the website with no visual graph, because well, I am using vanilla JS :') .

## Prologue
I have hosted the website on Github pages if you want a sneak peak of [the website](https://hardyslays.github.io/REGEX-TO-NFA/). If you liked the project, just star the project, and if you want to further develop this website (Probably its UI lol), fork and create a pull request.

Happy coding.
