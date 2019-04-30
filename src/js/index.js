var numSocket = new Rete.Socket('Number value');

var VueNumControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointermove.stop=""/>',
  data() {
    return {
      value: 0,
    }
  },
  methods: {
    change(e){
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
};

class NumControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

class NumComponent extends Rete.Component {

    constructor(){
        super("Number");
    }

    builder(node) {
        var out1 = new Rete.Output('num', "Number", numSocket);

        return node
            .addControl(new NumControl(this.editor, 'num'))
            .addOutput(out1);
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
    }
}

class AddComponent extends Rete.Component {
    constructor(){
        super("Add");
    }

    builder(node) {
        var inp1 = new Rete.Input('num1',"Number", numSocket);
        var inp2 = new Rete.Input('num2', "Number2", numSocket);
        var out = new Rete.Output('num', "Number", numSocket);

        inp1.addControl(new NumControl(this.editor, 'num1'))
        inp2.addControl(new NumControl(this.editor, 'num2'))

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'preview', true))
            .addOutput(out);
    }

    worker(node, inputs, outputs) {
        var n1 = inputs['num1'].length?inputs['num1'][0]:node.data.num1;
        var n2 = inputs['num2'].length?inputs['num2'][0]:node.data.num2;
        var sum = n1 + n2;
        
        this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(sum);
        outputs['num'] = sum;
    }
}

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

const yafeFlowSpec = {
    tasks: {
        sqr1: {
            requires: ['c1'],
            provides: ['c1^2'],
            resolver: {
                name: 'sqr',
                params: { x: 'c1' },
                results: { result: 'c1^2' },
            },
        },
        sqr2: {
            requires: ['c2'],
            provides: ['c2^2'],
            resolver: {
                name: 'sqr',
                params: { x: 'c2' },
                results: { result: 'c2^2' },
            },
        },
        sum: {
            requires: ['c1^2', 'c2^2'],
            provides: ['sum'],
            resolver: {
                name: 'sum',
                params: { x: 'c1^2', y: 'c2^2' },
                results: { result: 'sum' },
            },
        },
        sqrt: {
            requires: ['sum'],
            provides: ['result'],
            resolver: {
                name: 'sqrt',
                params: { x: 'sum' },
                results: { result: 'result' },
            },
        },
    },
};

let reteFlowSpec = {
    "id": "retejs@0.1.0",
    "nodes": {
        "t2": {
            "id": 2,
            "data": {
                "num": 2
            },
            "inputs": {},
            "outputs": {
                "num": {
                    "connections": [{
                        "node": "t6",
                        "input": "num1",
                        "data": {}
                    }]
                }
            },
            "position": [0, 0],
            "name": "Number"
        },
        "t4": {
            "id": 4,
            "data": {
                "num": 0
            },
            "inputs": {},
            "outputs": {
                "num": {
                    "connections": [{
                        "node": "t6",
                        "input": "num2",
                        "data": {}
                    }]
                }
            },
            "position": [0, 200],
            "name": "Number"
        },
        "t6": {
            "id": 6,
            "data": {
                "preview": 0,
                "num1": 0,
                "num2": 0
            },
            "inputs": {
                "num1": {
                    "connections": [{
                        "node": "t2",
                        "output": "num",
                        "data": {}
                    }]
                },
                "num2": {
                    "connections": [{
                        "node": "t4",
                        "output": "num",
                        "data": {}
                    }]
                }
            },
            "outputs": {
                "num": {
                    "connections": []
                }
            },
            "position": [300, 0],
            "name": "Add"
        }
    }
};

const elkFlow = yafeToElkFlowSpec(yafeFlowSpec);

const elk = new ELK();

elk.layout(elkFlow)
    .then(function () {

        console.log(elkFlow);

        const reteFlow = loadFlow();

        applyPosition(reteFlow, elkFlow);
        console.log(reteFlow);

        renderFlow(reteFlow);

    })
    .catch(console.error);
