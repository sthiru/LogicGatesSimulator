(function () {

    jsPlumbToolkit.ready(function () {

        // ------------------------ toolkit setup ------------------------------------

        // This function is what the toolkit will use to get an ID from a node.
        var idFunction = function (n) {
            return n.id;
        };

        // This function is what the toolkit will use to get the associated type from a node.
        var typeFunction = function (n) {
            return n.type;
        };

		var saveError = function(msg) {
			alert(msg) 
		};
		
        // get the various dom elements
        var mainElement = document.querySelector("#designer"),
            canvasElement = mainElement.querySelector(".canvas"),
            miniviewElement = mainElement.querySelector(".miniview"),
            nodePalette = document.querySelector("#logic-gates"),
            controls = mainElement.querySelector(".controls");

        // Declare an instance of the Toolkit, and supply the functions we will use to get ids and types from nodes.
        var toolkit = jsPlumbToolkit.newInstance({
            idFunction: idFunction,
            typeFunction: typeFunction,
            nodeFactory: function (type, data, callback) {
                            data.id = jsPlumbToolkitUtil.uuid();
                            callback(data);
            },
            beforeStartConnect:function(node, edgeType) {
                // limit edges from gates node to 1. if any other type of node, return
                return (node.data.type.endsWith("gate") && node.getEdges().length > 0) ? false : { label:"..." };
            },
			beforeConnect:function(node, edgeType) {
                // limit edges from input node to 1. if any other type of node, return
                return (node.data.type === "input" && node.getEdges().length > 0) ? false : { label:"..." };
            },
			autoSave:false,
			saveUrl:"data/logic-gates.json",
			onAutoSaveError: saveError,
			onAutoSaveSuccess:function(response) { alert("Save success") }
        });

// ------------------------ / toolkit setup ------------------------------------

// ------------------------- dialogs -------------------------------------

		

        jsPlumbToolkit.Dialogs.initialize({
            selector: ".dlg"
        });

// ------------------------- / dialogs ----------------------------------

// ------------------------ rendering ------------------------------------

        // Instruct the toolkit to render to the 'canvas' element. We pass in a view of nodes, edges and ports, which
        // together define the look and feel and behaviour of this renderer.  Note that we can have 0 - N renderers
        // assigned to one instance of the Toolkit..
        var renderer = window.renderer = toolkit.render({
            container: canvasElement,

            view: {
                nodes: {
                    "input": {
                        template: "tmplInput",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
                    },
					"AND gate": {
						template: "AND gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
					"OR gate": {
						template: "OR gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
					"NAND gate": {
						template: "NAND gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
					"NOR gate": {
						template: "NOR gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
					"XOR gate": {
						template: "XOR gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
					"NOT gate": {
						template: "NOT gate",
						events: {
                            tap: function (params) {
                                toolkit.toggleSelection(params.node);
                            }
                        }
					},
                    "output":{
                        parent:"selectable",
                        template:"tmplOutput"
                    }
                },
                // There are two edge types defined - 'yes' and 'no', sharing a common
                // parent.
                edges: {
                    "default": {
                        anchor: [ "Left", "Right" ],
                        connector: ["Flowchart", { cornerRadius: 1 } ],
                        paintStyle: { lineWidth: 2, strokeStyle: "#f76258", outlineWidth: 3, outlineColor: "transparent" },	//	paint style for this edge type.
                        hoverPaintStyle: { lineWidth: 2, strokeStyle: "rgb(67,67,67)" }, // hover paint style for this edge type.
                        events: {
                            "dblclick": function (params) {
                                jsPlumbToolkit.Dialogs.show({
                                    id: "dlgConfirm",
                                    data: {
                                        msg: "Delete Edge"
                                    },
                                    onOK: function () {
                                        toolkit.removeEdge(params.edge);
                                    }
                                });
                            }
                        },
                        overlays: [
                            [ "Arrow", { location: 0.3, width: 10, length: 10 }]
                        ]
                    }
                },

                ports: {
                    "input": {
                        edgeType: "default"
                    },
                    "output": {
                        edgeType: "default",
						isTarget: true,
						dropOptions: {
                            hoverClass: "connection-drop"
                        }
                    }
                }
            },
            // Layout the nodes using an absolute layout
            layout: {
                type: "Absolute"
            },
            events: {
                canvasClick: function (e) {
                    toolkit.clearSelection();
                },
                nodeDropped:function(info) {
                    console.log("node ", info.source.id, "dropped on ", info.target.id);
                }
            },
            miniview: {
                container: miniviewElement
            },
            lassoInvert:true,
            elementsDroppable:true,
            consumeRightClick: false,
            dragOptions: {
                filter: ".jtk-draw-handle, .node-action, .node-action i"
            }
        });
		
	toolkit.setMaxSelectedNodes({maxNodes: 1});
		
        var _updateDataset = function () {
            datasetContainer.innerHTML = _syntaxHighlight(JSON.stringify(toolkit.exportData(), null, 4));
        };

        jsPlumb.on(canvasElement, "tap", ".node-delete, .node-delete i", function () {
            var info = renderer.getObjectInfo(this);
            jsPlumbToolkit.Dialogs.show({
                id: "dlgConfirm",
                data: {
                    msg: "Delete '" + info.obj.data.type + "'"
                },
                onOK: function () {
                    toolkit.removeNode(info.obj);
                }
            });
        });

        // change a question or action's label
        jsPlumb.on(canvasElement, "tap", ".node-edit, .node-edit i", function () {
            // getObjectInfo is a method that takes some DOM element (this function's `this` is
            // set to the element that fired the event) and returns the toolkit data object that
            // relates to the element. it ascends through parent nodes until it finds a node that is
            // registered with the toolkit.
            var info = renderer.getObjectInfo(this);
            jsPlumbToolkit.Dialogs.show({
                id: "dlgText",
                data: info.obj.data,
                title: "Edit " + info.obj.data.type + " name",
                onOK: function (data) {
                    if (data.text && data.text.length > 2) {
                        // if name is at least 2 chars long, update the underlying data and
                        // update the UI.
                        toolkit.updateNode(info.obj, data);
                    }
                }
            });
        });

// ------------------------ / rendering ------------------------------------

        var _syntaxHighlight = function (json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return "<pre>" + json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            }) + "</pre>";
        };

        var datasetContainer = document.querySelector(".dataset");
        //
        // any operation that caused a data update (and would have caused an autosave), fires a dataUpdated event.
        //
        toolkit.bind("dataUpdated", _updateDataset);

// ------------------------ drag and drop new tables/views -----------------

        //
        // Here, we are registering elements that we will want to drop onto the workspace and have
        // the toolkit recognise them as new nodes.
        //
        //  typeExtractor: this function takes an element and returns to jsPlumb the type of node represented by
        //                 that element. In this application, that information is stored in the 'jtk-node-type' attribute.
        //
        //  dataGenerator: this function takes a node type and returns some default data for that node type.
        //
        renderer.registerDroppableNodes({
            droppables: nodePalette.querySelectorAll("img"),
            dragOptions: {
                zIndex: 50000,
                cursor: "move",
                clone: true
            },
            typeExtractor: function (el) {
                return el.getAttribute("title");
            },
            dataGenerator: function (type) {
                return {
                    w:120,
                    h:80
                };
            }
        });

        // Load the data.
        toolkit.load({
			type:"json",
            url: "data/flowchart-1.json",
            onload: function () {
                _updateDataset();
            }
        });

    });

})();