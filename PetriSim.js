'use strict'

class Command {
    constructor(name, object_setter, object_getter) {
        this.name = name;
        this.callbackChange = object_setter;
        if (arguments.length == 3)
        {
            this.placeholderGetter = object_getter;
        }
        else
        {
            this.placeholderGetter = function () {return "";};
        }
        this.display();
    }
    
    display () {
        var name = this.name;
        var object_setter = this.callbackChange;
        var object_getter = this.placeholderGetter;
        var panel = document.getElementById("commands");
        panel.appendChild(document.createElement("br"));
        var span_name = document.createElement("span");
        span_name.innerText = name;
        panel.appendChild(span_name);
        var input_field = document.createElement("input");
        input_field.placeholder = object_getter();
        input_field.addEventListener("change", function (e) {
            object_setter(input_field.value);
        });
        panel.appendChild(input_field);
    }
}

class CommandButton extends Command {
    display () {
        var name = this.name;
        var object_setter = this.callbackChange;
        var panel = document.getElementById("commands");
        panel.appendChild(document.createElement("br"));
        var but = document.createElement("button");
        but.innerText = name;
        panel.appendChild(but);
        but.addEventListener("click", function (e) {
            object_setter();
        });
    }
}

/*
    class Transition()
        * incoming
        * outgoing
        * saveID
*/
class Transition {
    constructor () {
        this.incoming = [];
        this.outgoing = [];
        this.saveID = NaN;
        this.name = "";
    }
    
    setName (name) {
        this.name = name;
    }
    
    getName () {
        return this.name;
    }
    
    connectInput (boundNT) {
        this.incoming.push(boundNT);
    }
    
    connectOutput (boundTN) {
        this.outgoing.push(boundTN);
    }
    
    process () {
        if (this.incoming.length > 0)
        {
            var factor = Math.floor(this.incoming[0].getNode().getTokensTable()[0]/this.incoming[0].getWeight());
            for (var i=0; i<this.incoming.length && factor > 0; i++)
            {
                var f = Math.floor(this.incoming[i].getNode().getTokensTable()[0]/this.incoming[i].getWeight());
                if (f < factor)
                {
                    factor = f;
                }
            }
            if (factor > 0)
            {
                for (var i=0; i<this.incoming.length; i++)
                {
                    this.incoming[i].getNode().drawTokens(factor*this.incoming[i].getWeight());
                }
                for (var i=0; i<this.outgoing.length; i++)
                {
                    this.outgoing[i].getNode().addTokens(factor*this.outgoing[i].getWeight());
                }
            }
        }
    }
    
    setSaveID (id) {
        this.saveID = id;
    }
    
    getSaveID () {
        return this.saveID;
    }
    
    removeBound (bound) {
        if (this.incoming.indexOf(bound) > -1)
        {
            this.incoming = tablePop(this.incoming, bound);
        }
        else if (this.outgoing.indexOf(bound) > -1)
        {
            this.outgoing = tablePop(this.outgoing, bound);
        }
    }
}

/*
    class TransitionDisplay(transition, application [, angle, x, y])
        * transition
        * application
        * angle
        * x
        * y
        * incoming
        * outgoing
*/
class TransitionDisplay {
    constructor (transition, application, angle, x, y) {
        this.transition = transition;
        this.angle = angle | 0;
        this.x = x | 10;
        this.y = y | 10;
        this.appli = application;
        this.button = false;
        this.incoming = [];
        this.outgoing = [];
        this.radius = 20;
    }
    
    getTransition () {
        return this.transition;
    }
    
    connectInput(boundNT) {
        this.incoming.push(boundNT);
    }
    
    connectOutput(boundTN) {
        this.outgoing.push(boundTN);
    }
    
    isSelected () {
        return this.appli.selectedTransition == this;
    }
    
    display(canvas) {
        var len = 30;
        var thickness = 6;
        var x1, x2, y1, y2;
        var ctx = canvas.getContext("2d");
        x1 = this.x - len*Math.cos(Math.PI*this.angle/180);
        y1 = this.y - len*Math.sin(Math.PI*this.angle/180);
        x2 = this.x + len*Math.cos(Math.PI*this.angle/180);
        y2 = this.y + len*Math.sin(Math.PI*this.angle/180);
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        if (this.isSelected())
        {
            ctx.strokeStyle = "red";
        }
        else
        {
            ctx.strokeStyle = "black";
        }
        ctx.stroke();
        for (var i=0; i<this.outgoing.length; i++)
        {
            this.outgoing[i].display(canvas);
        }
        if (this.incoming.length == 1)
        {
            this.incoming[0].display(canvas);
        }
        else
        {
            for (var i=0; i<this.incoming.length; i++)
            {
                var xi = ((i+1)/(this.incoming.length+1))*(x2-x1)+x1;
                var yi = ((i+1)/(this.incoming.length+1))*(y2-y1)+y1;
                var to = [xi, yi];
                this.incoming[i].display(canvas , to);
            }
        }

        if (this.getTransition().getName() != "")
        {
            ctx.fillText(
                    this.getTransition().getName(),
                    Math.min(x1, x2)-5,
                    Math.min(y1, y2)-5);
        }
    }
    
    removeBound (bound) {
        if (this.incoming.indexOf(bound) > -1)
        {
            this.incoming = tablePop(this.incoming, bound);
        }
        else if (this.outgoing.indexOf(bound) > -1)
        {
            this.outgoing = tablePop(this.outgoing, bound);
        }
    }
    
    getX () {
        return this.x;
    }
    
    getY () {
        return this.y;
    }
    
    getAngle () {
        return this.angle;
    }
    
    getName () {
        return this.getTransition().getName();
    }
    
    commandSetX (x) {
        this.x = parseFloat(x);
    }
    
    commandSetY (y) {
        this.y = parseFloat(y);
    }
    
    commandSuppr () {
        this.appli.removeTransition(this);
    }
    
    commandSetAngle(alpha) {
        this.angle = parseFloat(alpha);
    }
    
    commandSetName(name) {
        this.getTransition().setName(name);
    }
    
    onSelected_handle () {
        var commands = document.getElementById("commands");
        commands.innerHTML = "";
        new Command("x", this.commandSetX.bind(this), this.getX.bind(this));
        new Command("y", this.commandSetY.bind(this), this.getY.bind(this));
        new Command("angle", this.commandSetAngle.bind(this), this.getAngle.bind(this));
        new Command("name", this.commandSetName.bind(this), this.getName.bind(this));
        new CommandButton("suppr", this.commandSuppr.bind(this));
    }

    isClicked(x, y) {
        return Math.pow((x-this.x), 2)+Math.pow((y-this.y), 2) <= this.radius * this.radius;
    }
    
    getButton() {
        return this.button;
    }
}

/*
    class Node([tokens, duration, description])
        * tokens[]
        * duration
        * description
        * saveID
*/
class Node {
    constructor(tokens, duration, description) {
        this.duration = duration | 1;
        this.tokens = tokens | [];
        if (this.tokens.length == 0)
        {
            for (var i=0; i<this.duration; i++)
            {
                this.tokens.push(0);
            }
        }
        this.description = description | "";
        this.pendingTokens = 0;
        this.saveID = NaN;
    }
    
    setDescription (d) {
        this.description = d;
    }
    
    getDescrition () {
        return this.description;
    }
    
    setDuration (d) {
        this.duration = d;
        if (this.duration != this.tokens.length)
        {
            this.tokens = [];
            for (var i=0; i<this.duration; i++)
            {
                this.tokens.push(0);
            }
        }
    }
    
    getDuration () {
        return this.duration;
    }
    
    setTokens(tokens) {
        this.tokens[this.tokens.length-1] = tokens;
    }
    
    setTokensTable(tokensTab) {
        this.tokens = tokensTab;
    }
    
    addTokens(tokens) {
        this.pendingTokens += tokens;
    }
    
    drawTokens(tokens) {
        if (this.hasTokens(tokens))
        {
            this.tokens[0] -= tokens;
            return tokens;
        }
        else
        {
            return 0;
        }
    }
    
    validateTransition () {
        if (this.tokens.length > 1)
        {
            var zero = this.tokens[0];
            // all tokens go forward of one step
            this.tokens.shift();
            // we restore the "fallen" remaining tokens
            this.tokens[0] += zero;
            // we add the newly arrived tokens
            this.tokens.push(this.pendingTokens);
        }
        else
        {
            this.tokens[0] += this.pendingTokens;
        }
        this.pendingTokens = 0;
    }
    
    getTokens() {
        return this.getTotalTokens();
    }
    
    getTokensTable() {
        return this.tokens;
    }
    
    getTotalTokens() {
        var res = 0;
        for (var i=0; i<this.tokens.length; i++)
        {
            res += this.tokens[i];
        }
        return res;
    }
    
    hasTokens(tokens) {
        return this.tokens[0] >= tokens;
    }
    
    setSaveID (id) {
        this.saveID = id;
    }
    
    getSaveID () {
        return this.saveID;
    }
}

/*
    class NodeDisplay(node, application [, x, y])
        * node
        * application
        * x
        * y
        * button
*/
class NodeDisplay {
    constructor(node, application, x, y) {
        this.node = node;
        this.x = x | 0;
        this.y = y | 0;
        this.appli = application;
        this.button = false;
        this.radius = 20;
    }
    
    getNode () {
        return this.node;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    isSelected () {
        return this.appli.selectedNode == this;
    }
    
    display (canvas) {
        var ctx = canvas.getContext('2d');
        var radius = this.radius;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2*Math.PI, false);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.lineWidth = 3;
        if (this.isSelected())
        {
            ctx.strokeStyle = "red";
        }
        else
        {
            ctx.strokeStyle = "black";
        }
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.font = "12px sans-serif";
        ctx.fillText(
            this.node.getDescrition(),
            this.x + 25,
            this.y
        );
        if (this.node.getTokens() != 0)
        {
            ctx.fillText(
                this.node.getTokens(),
                this.x-5,
                this.y+5
            );
        }
        if (this.node.getDuration() > 1)
        {
            ctx.fillText(
                this.node.getDuration(),
                this.x-10,
                this.y+35
            )
        }
    }
    
    commandSetX (x) {
        this.x = parseFloat(x);
    }
    
    commandSetY (y) {
        this.y = parseFloat(y);
    }
    
    commandSetDescription (d) {
        this.node.setDescription(d);
        if (this.button != false)
        {
            this.button.innerText = d;
        }
    }
    
    commandSetTokens (t) {
        this.node.setTokens(parseInt(t));
    }
    
    commandSetDuration (d) {
        this.node.setDuration(parseInt(d));
    }
    
    commandSuppr () {
        this.appli.removeNode(this);
    }
    
    getX () {
        return this.x;
    }
    
    getY () {
        return this.y;
    }
    
    onSelected_handle () {
        var commands = document.getElementById("commands");
        commands.innerHTML = "";
        new Command("x", this.commandSetX.bind(this), this.getX.bind(this));
        new Command("y", this.commandSetY.bind(this), this.getY.bind(this));
        new Command("description", this.commandSetDescription.bind(this));
        new Command("tokens", this.commandSetTokens.bind(this));
        new Command("duration", this.commandSetDuration.bind(this));
        new CommandButton("suppr", this.commandSuppr.bind(this));
    }
    
    getButton() {
        var b = document.createElement("button");
        b.innerText = this.getNode().getDescrition();
        b.onclick = function () {
            this.appli.selectedNode = this;
            this.appli.lastSelection = this;
            this.onSelected_handle();
        }.bind(this);
        return b;
    }
    
    isClicked(x, y) {
        return Math.pow((x-this.x), 2)+Math.pow((y-this.y), 2) <= this.radius * this.radius;
    }
}

/*
    class Bound(node, transition [, weight])
        * node
        * transition
        * value
*/
class Bound {
    constructor (node, transition, weight) {
        this.node = node;
        this.transition = transition;
        if (arguments == 2)
        {
            this.value = 1;
        }
        else
        {
            this.value = weight;
        }
    }
    
    getWeight() {
        return this.value;
    }
    
    setWeight(weight) {
        this.value = weight;
    }
    
    getNode() {
        return this.node;
    }
    
    suppr () {
        this.transition.removeBound(this);
    }
}

class BoundNT extends Bound {

}

class BoundTN extends Bound {

}

/*
    class BoundDisplay(bound, origin, end)
*/
class BoundDisplay {
    constructor (bound, origin, end) {
        this.bound = bound;
        this.origin = origin;
        this.target = end;
        this.radius = 15;
    }
    
    isSelected() {
        return this.origin.appli.selectedBound == this;
    }
    
    display(canvas, toTransition) {
        var ctx = canvas.getContext("2d");
        if (this.isSelected())
        {
            ctx.strokeStyle = "red";
        }
        else
        {
            ctx.strokeStyle = "black";
        }
        if (this.getOrientation() == "TN")
        {
            var angle = Math.atan2(this.target.getY()-this.origin.getY(),this.target.getX()-this.origin.getX());
            ctx.lineWidth = 3;
            canvas_arrow(ctx, this.origin.getX(),
                                this.origin.getY(),
                                this.target.getX()-20*Math.cos(angle),
                                this.target.getY()-20*Math.sin(angle));
        }
        else
        {
            var targ;
            if (arguments.length == 1)
            {
                targ = {
                    'x':this.target.getX(),
                    'y':this.target.getY()
                };
            }
            else
            {
                targ = {
                    'x':toTransition[0],
                    'y':toTransition[1]
                };
            }
            var angle = Math.atan2(targ.y-this.origin.getY(),targ.x-this.origin.getX());
            ctx.lineWidth = 3;
            canvas_arrow(ctx, this.origin.getX()+20*Math.cos(angle),
                                this.origin.getY()+20*Math.sin(angle),
                                targ.x,
                                targ.y);
        }
        if (this.bound.getWeight() != 1)
        {
            ctx.fillStyle = "red";
            ctx.font = "12px sans-serif";
            ctx.fillText(
                this.bound.getWeight(),
                (this.target.getX()+this.origin.getX())/2,
                (this.target.getY()+this.origin.getY())/2
            );
        }
    }
    
    commandSetWeight(weight) {
        this.bound.value = parseInt(weight);
    }
    
    commandSuppr() {
        var trans = null;
        document.getElementById("commands").innerHTML = "";
        if (this.target.constructor.name == "TransitionDisplay")
        {
            trans = this.target;
        }
        else
        {
            trans = this.origin;
        }
        trans.removeBound(this);
        this.bound.suppr();
    }
    
    getWeight () {
        return this.bound.value;
    }
    
    getOrientation () {
        if (this.origin.constructor.name == "NodeDisplay")
        {
            return "NT";
        }
        else
        {
            return "TN";
        }
    }
    
    onSelected_handle() {
        var commands = document.getElementById("commands");
        commands.innerHTML = "";
        new Command("weight", this.commandSetWeight.bind(this), this.getWeight.bind(this));
        new Command("orientation", function() {}, this.getOrientation.bind(this));
        new CommandButton("suppr", this.commandSuppr.bind(this));
    }
    
    isClicked(x, y) {
        var midx = (this.origin.getX()+this.target.getX())/2;
        var midy = (this.origin.getY()+this.target.getY())/2;
        return Math.pow((x-midx), 2)+Math.pow((y-midy), 2) <= this.radius * this.radius;
    }
    
    getButton() {
        var b = document.createElement("button");
        b.innerText = "bound";
        b.onclick = function () {
            this.origin.appli.selectedBound = this;
            this.origin.appli.lastSelection = this;
            this.onSelected_handle();
        }.bind(this);
        return b;
    }
}

class PetriNet {
    constructor () {
        this.nodes = [];
        this.bounds = [];
        this.transitions = [];
    }
    
    iterate () {
        for (var i=0; i<this.transitions.length; i++)
        {
            this.transitions[i].process();
        }
        for (var i=0; i<this.nodes.length; i++)
        {
            this.nodes[i].validateTransition();
        }
    }
    
    getNodes () {
        return this.nodes;
    }
    
    addNode (node) {
        this.nodes.push(node);
    }
    
    addBound (bound) {
        this.bounds.push(bound);
    }
    
    addTransition (transition) {
        this.transitions.push(transition);
    }
    
    /*
        returns
        {
            'P': all the nodes or places of the network
            'T': all the transitions of the network
        }as places and all the transitions as transitions
        as well as the Pre matrix and the Post matrix
    */
    toAlgebra () {
        var result = {
            'P':this.nodes, // Places
            'T':this.transitions, // Transitions
            'Pre':new Array(this.transitions.length), // Previous state of the system
            'Post':new Array(this.transitions.length)  // Next state of the system
        }
        for (var i=0; i<this.transitions.length; i++)
        {
            result.Pre = new Array(this.nodes.length);
            result.Post = new Array(this.nodes.length);
            var tr = this.transitions[i];
            var trans = result.T.indexOf(tr);

            for (var j=0; j<tr.incoming.length; j++)
            {
                var node = result.P.indexOf(tr.incoming[i].getNode());
                result.Pre[trans][node] = tr.incoming[i].getWeight();
            }
            for (var j=0; j<tr.outgoing.length; j++)
            {
                var node = result.P.indexOf(tr.outgoing[i].getNode());
                result.postPre[trans][node] = tr.outgoing[i].getWeight();
            }
        }
    }
}

class App {
    constructor () {
        this.net = new PetriNet();
        this.transitions_disp = [];
        this.nodes_disp = [];
        this.selectedNode = false;
        this.selectedTransition = false;
        this.selectedBound = false;
        this.lastSelection = false;
        this.clicked = [];
        this.clickTime = 200; // in ms
        this.goinToDrag = false;
        this.dragging = false;
    }
    
    newNode () {
        let node = new Node();
        this.net.addNode(node);
        node.setDescription("node"+this.net.getNodes().length);
        let disp = new NodeDisplay(node, this);
        this.nodes_disp.push(disp);
        let listElem = disp.getButton();
        var thisApp = this;
        var nodeliste = document.getElementById("nodes");
        nodeliste.appendChild(listElem);
        nodeliste.appendChild(document.createElement("br"));
    }
    
    newTransition () {
        let trans = new Transition();
        this.net.addTransition(trans);
        let disp = new TransitionDisplay(trans, this);
        this.transitions_disp.push(disp);
        var transButton = document.createElement("button");
        transButton.innerText = this.net.transitions.length;
        disp.button = transButton;
        var thisApp = this;
        transButton.onclick = function () {
            thisApp.selectedTransition = disp;
            thisApp.lastSelection = disp;
            disp.onSelected_handle();
        }
        var transitionBox = document.getElementById("transitions");
        transitionBox.appendChild(transButton);
        transitionBox.appendChild(document.createElement("br"));
    }
    
    newBoundNT (weight) {
        var val = 1;
        if (arguments.length > 0)
        {
            val = weight;
        }
        let bound = new BoundNT(this.selectedNode.node, this.selectedTransition.transition, val);
        this.net.addBound(bound);
        this.selectedTransition.transition.connectInput(bound);
        let disp = new BoundDisplay(bound, this.selectedNode, this.selectedTransition);
        this.selectedTransition.connectInput(disp);
    }
    
    newBoundTN (weight) {
        var val = 1;
        if (arguments.length > 0)
        {
            val = weight;
        }
        let bound = new BoundTN(this.selectedNode.node, this.selectedTransition.transition, val);
        this.net.addBound(bound);
        this.selectedTransition.transition.connectOutput(bound);
        let disp = new BoundDisplay(bound, this.selectedTransition, this.selectedNode);
        this.selectedTransition.connectOutput(disp);
    }
    
    removeNode(node) {
        this.nodes_disp = tablePop(this.nodes_disp, node);
        this.net.nodes = tablePop(this.net.nodes, node.getNode());
    }
    
    removeTransition (transition) {
        this.transitions_disp = tablePop(this.transitions_disp, transition);
        this.net.transitions = tablePop(this.net.transitions, transition.getTransition());
    }
    
    display () {
        var can = document.getElementById("graph_view");
        var ctx = can.getContext("2d");
        ctx.clearRect(0, 0, can.width, can.height);
        
        for (var i=0; i<this.nodes_disp.length; i++)
        {
            this.nodes_disp[i].display(can);
        }
        for (var i=0; i<this.transitions_disp.length; i++)
        {
            this.transitions_disp[i].display(can);
        }
    }
    
    save () {
        /*
            save node display table (will save nodes)
            save transition display table
                saves transitions
            save table of links using 
        */
        var petriSave = {
            "nodes":[],
            "transitions":[],
            "boundsNT":[],
            "boundsTN":[]
        }
        for (var i=0; i<this.nodes_disp.length; i++)
        {
            // [token, duration, description, x, y]
            let node_disp = this.nodes_disp[i];
            let node = node_disp.node;
            this.nodes_disp[i].getNode().setSaveID(petriSave.nodes.length);
            petriSave.nodes.push([
                node.getTokensTable(),
                node.getDuration(),
                node.getDescrition(),
                node_disp.getX(),
                node_disp.getY()
            ]);
        }
        for (var i=0; i<this.transitions_disp.length; i++)
        {
            // [x, y, angle, name]
            let trans_disp = this.transitions_disp[i];
            let trans = trans_disp.getTransition();
            this.transitions_disp[i].getTransition().setSaveID(petriSave.transitions.length);
            petriSave.transitions.push([
                trans_disp.getX(),
                trans_disp.getY(),
                trans_disp.getAngle(),
                trans_disp.getTransition().getName()
            ]);
            // [save bounds | nodeID, transitionID, weight]
            for (var b=0; b<trans.incoming.length; b++)
            {
                let bound = trans.incoming[b];
                petriSave.boundsNT.push([
                    bound.getNode().getSaveID(),
                    trans.getSaveID(),
                    bound.getWeight()
                ]);
            }
            for (var b=0; b<trans.outgoing.length; b++)
            {
                let bound = trans.outgoing[b];
                petriSave.boundsTN.push([
                    bound.getNode().getSaveID(),
                    trans.getSaveID(),
                    bound.getWeight()
                ]);
            }
        }
        window.localStorage.setItem("PetriSim", JSON.stringify(petriSave));
    }
    
    load () {
        var toLoad = JSON.parse(window.localStorage.getItem("PetriSim"));
        // resets the app's fields
        this.net = new PetriNet();
        this.transitions_disp = [];
        this.nodes_disp = [];
        this.selectedNode = false;
        this.selectedTransition = false;
        this.selectedBound = false;
        this.lastSelection = false;
        // restore the nodes & display
        for (var i=0; i<toLoad.nodes.length; i++)
        {
            var cara = toLoad.nodes[i];
            //[token, duration, description, x, y]
            this.newNode();
            let node_disp = this.nodes_disp[this.nodes_disp.length-1];
            node_disp.getNode().setDuration(cara[1]);
            node_disp.getNode().setDescription(cara[2]);
            // handle old and new saves
            if (typeof(cara[0]) == typeof([]))
            {
                node_disp.getNode().setTokensTable(cara[0]);
            }
            else
            {
                node_disp.getNode().setTokens(cara[0]);
            }
            node_disp.commandSetX(cara[3]);
            node_disp.commandSetY(cara[4]);
        }
        for (var i=0; i<toLoad.transitions.length; i++)
        {
            var cara = toLoad.transitions[i];
            // [x, y, angle, name]
            this.newTransition();
            let trans_disp = this.transitions_disp[this.transitions_disp.length-1];
            trans_disp.commandSetX(cara[0]);
            trans_disp.commandSetY(cara[1]);
            trans_disp.commandSetAngle(cara[2]);
            trans_disp.commandSetName(cara[3]);
        }
        for (var i=0; i<toLoad.boundsNT.length; i++)
        {
            var cara = toLoad.boundsNT[i];
            // [save bounds | nodeID, transitionID, weight]
            this.selectedNode = this.nodes_disp[cara[0]];
            this.selectedTransition = this.transitions_disp[cara[1]];
            this.newBoundNT(cara[2]);
        }
        for (var i=0; i<toLoad.boundsTN.length; i++)
        {
            var cara = toLoad.boundsTN[i];
            // [save bounds | nodeID, transitionID, weight]
            this.selectedNode = this.nodes_disp[cara[0]];
            this.selectedTransition = this.transitions_disp[cara[1]];
            this.newBoundTN(cara[2]);
        }
    }
    
    toString () {
        this.save();
        document.getElementById("export").innerText = window.localStorage.getItem("PetriSim");
        document.getElementById("export").focus = true;
    }
    
    fromString () {
        var txt = prompt("collez la sauvegarde à importer");
        window.localStorage.setItem("PetriSim", txt);
        this.load();
    }

    onMouseDown_handle (e) {
        var canvas = document.getElementById("graph_view");
        var canvas_rect = canvas.getClientRects()[0]
        var x = e.clientX - canvas_rect.left;
        var y = e.clientY - canvas_rect.top;
        this.clicked = [];
        this.dragging = false;
        for (var i=0; i<this.nodes_disp.length; i++)
        {
            if (this.nodes_disp[i].isClicked(x, y))
            {
                this.clicked.push(this.nodes_disp[i]);
            }
        }
        for (var i=0; i<this.transitions_disp.length; i++)
        {
            if (this.transitions_disp[i].isClicked(x, y))
            {
                this.clicked.push(this.transitions_disp[i]);
            }
            for (var l=0; l<this.transitions_disp[i].incoming.length; l++)
            {
                var bound = this.transitions_disp[i].incoming[l];
                if(bound.isClicked(x, y))
                {
                    this.clicked.push(bound);
                }
            }
            for (var l=0; l<this.transitions_disp[i].outgoing.length; l++)
            {
                var bound = this.transitions_disp[i].outgoing[l];
                if(bound.isClicked(x, y))
                {
                    this.clicked.push(bound);
                }
            }
        }
        if (this.clicked.length == 1)
        {
            this.lastSelection = this.clicked[0];
            setTimeout(function () {
                this.dragging = true;
            }.bind(this), this.clickTime);
        }
        else if (this.clicked.length > 1)
        {
            var wrap = document.getElementById("selection");
            wrap.style.display = "block";
            var container = wrap.children[1];
            container.innerHTML = "";
            for (var i=0; i<this.clicked.length; i++)
            {
                container.appendChild(this.clicked[i].getButton());
            }
        }
        //console.log(this.clicked);
    }
    
    onClick_handle (e) {
        if (this.lastSelection)
        {
            this.lastSelection.onSelected_handle();
        }
        if (this.lastSelection.constructor.name == "NodeDisplay")
        {
            this.selectedNode = this.lastSelection;
        }
        else if (this.lastSelection.constructor.name == "TransitionDisplay")
        {
            this.selectedTransition = this.lastSelection;
        }
        else if (this.lastSelection.constructor.name == "BoundDisplay")
        {
            this.selectedBound = this.lastSelection;
        }
        this.clicked = [];
    }
    
    onMouseMove_handle (e) {
        if (this.clicked.length > 0 && this.dragging)
        {
            var elem = this.clicked[0];
            if (elem.constructor.name == "NodeDisplay" || elem.constructor.name == "TransitionDisplay")
            {
                var canvas = document.getElementById("graph_view");
                var pos = canvas.getClientRects()[0];
                var x = e.clientX - pos.left;
                var y = e.clientY - pos.top;
                elem.commandSetX(x);
                elem.commandSetY(y);
                elem.display(canvas);
            }
        }
    }
    
    onMouseUp_handle (e) {
        this.dragging = false;
    }

    hideItems () {
        var items = document.getElementById("items");
        if (items.style.display == "none")
        {
            items.style.display = "block";
        }
        else
        {
            items.style.display = "none";
        }
    }
}

function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    context.stroke();
}

function tablePop(a, elem)
{
    var index, b, c
    index = a.indexOf(elem);
    b = a.slice(index);
    c = a.reverse().slice(a.length-index);
    b.shift();
    a = b.concat(c);
    return a;
}

var testRegression = function () {
    var a;
    console.log("testing node creation");
    app.newNode();
    a=0;
    console.log("testing node methods");
    app.net.nodes[a].setTokens(3);
    app.net.nodes[a].setDuration(1);
    app.net.nodes[a].setDescription("miam!");
    app.nodes_disp[a].commandSetX("150");
    app.nodes_disp[a].commandSetY("150");

    app.newNode();
    a=1;
    app.net.nodes[a].setTokens(5);
    app.net.nodes[a].setDuration(10);
    app.net.nodes[a].setDescription("lapin");
    app.nodes_disp[a].commandSetX("100");
    app.nodes_disp[a].commandSetY("250");
    
    console.log("testing Transition creation");
    app.newTransition();
    a=0
    console.log("testing TRansition methods");
    app.transitions_disp[a].commandSetX("50");
    app.transitions_disp[a].commandSetY("75");
    app.transitions_disp[a].commandSetAngle("-45");
    
    app.selectedNode = app.nodes_disp[0];
    app.selectedTransition = app.transitions_disp[0];
    console.log("testing bound creation");
    app.newBoundNT();
    
    app.selectedNode = app.nodes_disp[1];
    app.selectedTransition = app.transitions_disp[0];
    app.newBoundTN();
    console.log("testing bounds methods");
    app.transitions_disp[0].transition.outgoing[0].setWeight(3);
}

var hideSelection = function () {
    document.getElementById("selection").style.display = "none";
}

if (window.localStorage.getItem("PetriSim"))
{
    setTimeout(function () {app.load();}, 1000);
}
else
{
    var petriSave = {
        "nodes":[],
        "transitions":[],
        "boundsNT":[],
        "boundsTN":[]
    }
    window.localStorage.setItem("PetriSim", JSON.stringify(petriSave));
    setTimeout(function () {app.load();}, 1000);
}

document.addEventListener("loadend", function () {

});

var app = new App();
setInterval(function () {
    app.display();
    var canvas = document.getElementById("graph_view");
    canvas.addEventListener("click", function (e) {
        app.onClick_handle(e);
    });
    canvas.addEventListener("mousedown", function (e) {
        app.onMouseDown_handle(e);
    });
    canvas.addEventListener("mousemove", function (e) {
        app.onMouseMove_handle(e);
    });
    document.addEventListener("mouseup", function (e) {
        app.onMouseUp_handle(e);
    });
}, 1000);