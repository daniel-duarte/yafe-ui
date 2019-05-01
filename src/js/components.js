class SqrComponent extends Rete.Component {
    constructor(){
        super("sqr");
    }

    builder(node) {
        return node
            .addInput(new Rete.Input('x', "x", numSocket))
            .addOutput(new Rete.Output('result', "result", numSocket));
    }
}

class SqrtComponent extends Rete.Component {
    constructor(){
        super("sqrt");
    }

    builder(node) {
        return node
            .addInput(new Rete.Input('x', "x", numSocket))
            .addOutput(new Rete.Output('result', "result", numSocket));
    }
}

class SumComponent extends Rete.Component {
    constructor(){
        super("sum");
    }

    builder(node) {
        return node
            .addInput(new Rete.Input('x', "x", numSocket))
            .addInput(new Rete.Input('y', "y", numSocket))
            .addOutput(new Rete.Output('result', "result", numSocket));
    }
}
