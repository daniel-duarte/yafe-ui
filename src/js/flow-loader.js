function convertTask(taskSpec, taskId) {

    const resolver = taskSpec.resolver;

    const inputs = {};
    Object.keys(resolver.params).map(paramName => {
        inputs[paramName] = { connections: [] };
    });

    const outputs = {};
    Object.keys(resolver.results).map(resultName => {
        outputs[resultName] = { connections: [] };
    });

    return {
        id: taskId,
        data: {},
        inputs: inputs,
        outputs: outputs,
        position: [0, 0],
        name: resolver.name,
    };
}

function addEdges(resultSpec, inputEdges, outputEdges) {

    for (let i = 0; i < inputEdges.length; i++) {
        const edgeInSide = inputEdges[i];

        for (let j = 0; j < outputEdges.length; j++) {
            const edgeOutSide = outputEdges[j];

            resultSpec.nodes[edgeInSide.task].inputs[edgeInSide.param].connections.push({
                node: edgeOutSide.task,
                output: edgeOutSide.result,
                data: {}
            });
            resultSpec.nodes[edgeOutSide.task].outputs[edgeOutSide.result].connections.push({
                node: edgeInSide.task,
                input: edgeInSide.param,
                data: {}
            });
        }
    }
}

function convertEdges(resultSpec, edgesByReq) {

    Object.keys(edgesByReq).map(reqName => {
        const edges = edgesByReq[reqName];

        if (edges.hasOwnProperty('inputs') && edges.hasOwnProperty('outputs')) {
            addEdges(resultSpec, edges.inputs, edges.outputs);
        }
    });
}

function calculateEdgesByReq(yafeFlowSpec) {
    const edgesByReq = {};

    Object.keys(yafeFlowSpec.tasks).map(taskCode => {

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
    });

    return edgesByReq;
}

function yafeToReteFlowSpec(yafeFlowSpec) {
    const nodes = {};
    let taskId = 0;

    for (const taskCode in yafeFlowSpec.tasks) if (yafeFlowSpec.tasks.hasOwnProperty(taskCode)) {
        const taskSpec = yafeFlowSpec.tasks[taskCode];
        nodes[taskCode] = convertTask(taskSpec, taskId++);
    }

    const edgesByReq = calculateEdgesByReq(yafeFlowSpec);

    const resultSpec = {
        id: "retejs@0.1.0",
        nodes: nodes,
    };

    convertEdges(resultSpec, edgesByReq);

    return resultSpec;
}

function createComponent(componentName, inputs, outputs) {
    return new (class extends Rete.Component {
        constructor() {
            super(componentName);
        }

        builder(node) {
            inputs.map(function (inputName) {
                node.addInput(new Rete.Input(inputName, inputName, numSocket));
            });

            outputs.map(function (inputName) {
                node.addOutput(new Rete.Output(inputName, inputName, numSocket));
            });

            return node;
        }
    })();
}

function renderFlow(elementId, reteFlowSpec, componentDefs) {

    // Rete active plugins
    const plugins = [ConnectionPlugin, VueRenderPlugin, ContextMenuPlugin];

    // Rete components (created dynamically)
    const components = [];
    componentDefs.map(function (componentDef) {
        components.push(createComponent(componentDef.name, componentDef.inputs, componentDef.outputs));
    });

    // Create and setup Rete editor
    const container = document.querySelector('#' + elementId);
    const editor = new Rete.NodeEditor('retejs@0.1.0', container);
    plugins.map(plugin => {
        editor.use(plugin.default);
    });
    components.map(c => editor.register(c));

    // Load flow data and render
    editor.fromJSON(reteFlowSpec).then(() => {
         editor.view.resize();
         AreaPlugin.zoomAt(editor);
    });
}
