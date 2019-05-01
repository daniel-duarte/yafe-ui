function convertTask(taskCode, taskSpec, taskId) {

    const inputs = {};
    for (const paramName in taskSpec.resolver.params) if (taskSpec.resolver.params.hasOwnProperty(paramName)) {
        inputs[paramName] = {
            connections: []
        };
    }

    const outputs = {};
    for (const resultName in taskSpec.resolver.results) if (taskSpec.resolver.results.hasOwnProperty(resultName)) {
        outputs[resultName] = {
            connections: []
        };
    }

    return {
        id: taskId,
        data: {},
        inputs: inputs,
        outputs: outputs,
        position: [0, 0],
        name: taskSpec.resolver.name,
    };
}

function addEdges(resultSpec, inputEdges, outputEdges) {

    for (let i = 0; i < inputEdges.length; i++) {
        const edgeInSide = inputEdges[i];
        for (let j = 0; j < outputEdges.length; j++) {
            const edgeOutSide = outputEdges[j];

            // console.log(edgeOutSide, '->', edgeInSide);
            resultSpec.nodes[edgeInSide.task].inputs[edgeInSide.param].connections.push({
                "node": edgeOutSide.task,
                "output": edgeOutSide.result,
                "data": {}
            });
            resultSpec.nodes[edgeOutSide.task].outputs[edgeOutSide.result].connections.push({
                "node": edgeInSide.task,
                "input": edgeInSide.param,
                "data": {}
            });
        }
    }
}

function convertEdges(resultSpec, edgesByReq) {
    for (const reqName in edgesByReq) if (edgesByReq.hasOwnProperty(reqName)) {
        const edges = edgesByReq[reqName];

        if (edges.hasOwnProperty('inputs') && edges.hasOwnProperty('outputs')) {
            addEdges(resultSpec, edges.inputs, edges.outputs);
        }
    }
}

function calculateEdgesByReq(yafeFlowSpec) {
    const edgesByReq = {};

    for (const taskCode in yafeFlowSpec.tasks) if (yafeFlowSpec.tasks.hasOwnProperty(taskCode)) {
        const taskSpec = yafeFlowSpec.tasks[taskCode];

        for (const paramName in taskSpec.resolver.params) if (taskSpec.resolver.params.hasOwnProperty(paramName)) {
            const reqName = taskSpec.resolver.params[paramName];
            if (!edgesByReq.hasOwnProperty(reqName)) { edgesByReq[reqName] = {}; }
            if (!edgesByReq[reqName].hasOwnProperty('inputs')) { edgesByReq[reqName].inputs = []; }

            edgesByReq[reqName].inputs.push({
                task: taskCode,
                param: paramName
            });
        }

        for (const resultName in taskSpec.resolver.results) if (taskSpec.resolver.results.hasOwnProperty(resultName)) {
            const reqName = taskSpec.resolver.results[resultName];
            if (!edgesByReq.hasOwnProperty(reqName)) { edgesByReq[reqName] = {}; }
            if (!edgesByReq[reqName].hasOwnProperty('outputs')) { edgesByReq[reqName].outputs = []; }

            edgesByReq[reqName].outputs.push({
                task: taskCode,
                result: resultName
            });
        }
    }

    return edgesByReq;
}

function yafeToReteFlowSpec(yafeFlowSpec) {
    const nodes = {};
    let taskId = 0;

    for (const taskCode in yafeFlowSpec.tasks) if (yafeFlowSpec.tasks.hasOwnProperty(taskCode)) {
        const taskSpec = yafeFlowSpec.tasks[taskCode];
        nodes[taskCode] = convertTask(taskCode, taskSpec, taskId++);
    }

    const edgesByReq = calculateEdgesByReq(yafeFlowSpec);

    const resultSpec = {
        "id": "retejs@0.1.0",
        "nodes": nodes,
    };

    convertEdges(resultSpec, edgesByReq);

    return resultSpec;
}

function loadFlow() {
    return yafeToReteFlowSpec(yafeFlowSpec, reteFlowSpec);
}

async function renderFlow(reteFlowSpec) {

    const components = [
        new SqrComponent(),
        new SqrtComponent(),
        new SumComponent(),
    ];

    const container = document.querySelector('#rete');

    const editor = new Rete.NodeEditor('retejs@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin.default);
    editor.use(ContextMenuPlugin.default);

    components.map(c => editor.register(c));

    editor.fromJSON(reteFlowSpec).then(() => {
        editor.view.resize();
        AreaPlugin.zoomAt(editor);
    });
}
