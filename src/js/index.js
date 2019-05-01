var numSocket = new Rete.Socket('Number value');


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
