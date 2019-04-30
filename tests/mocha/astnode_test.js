

suite('ASTNode', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "input_statement",
      "message0": "%1 %2 %3 %4",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        },
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        },
        {
          "type": "input_value",
          "name": "NAME"
        },
        {
          "type": "input_statement",
          "name": "NAME"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    },
    {
      "type": "value_input",
      "message0": "%1",
      "args0": [
        {
          "type": "input_value",
          "name": "NAME"
        }
      ],
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    },
    {
      "type": "field_input",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "NAME",
          "text": "default"
        }
      ],
      "output": null,
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    }
    ]);
    this.workspace = new Blockly.Workspace();
    this.cursor = this.workspace.cursor;
    var statementInput1 = this.workspace.newBlock('input_statement');
    var statementInput2 = this.workspace.newBlock('input_statement');
    var statementInput3 = this.workspace.newBlock('input_statement');
    var statementInput4 = this.workspace.newBlock('input_statement');
    var fieldWithOutput = this.workspace.newBlock('field_input');
    var valueInput = this.workspace.newBlock('value_input');

    statementInput1.nextConnection.connect(statementInput2.previousConnection);
    statementInput1.inputList[0].connection
        .connect(fieldWithOutput.outputConnection);
    statementInput2.inputList[1].connection
        .connect(statementInput3.previousConnection);

    this.blocks = {
      statementInput1: statementInput1,
      statementInput2: statementInput2,
      statementInput3: statementInput3,
      statementInput4: statementInput4,
      fieldWithOutput: fieldWithOutput,
      valueInput: valueInput
    };
    sinon.stub(Blockly, "getMainWorkspace").returns(new Blockly.Workspace());
  });
  teardown(function() {
    delete Blockly.Blocks['input_statement'];
    delete Blockly.Blocks['field_input'];
    delete Blockly.Blocks['value_input'];

    this.workspace.dispose();
    sinon.restore();
  });

  suite('HelperFunctions', function() {
    test('findNextEditableField_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = input.fieldRow[0];
      var nextField = input.fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field);
      var editableField = node.findNextEditableField_(field, input);
      assertEquals(editableField.getLocation(), nextField);
    });

    test('findNextEditableFieldFirst_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = input.fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field);
      var editableField = node.findNextEditableField_(field, input, true);
      assertEquals(editableField.getLocation(), input.fieldRow[0]);
    });

    test('findPreviousEditableField_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = input.fieldRow[1];
      var prevField = input.fieldRow[0];
      var node = Blockly.ASTNode.createFieldNode(prevField);
      var editableField = node.findPreviousEditableField_(field, input);
      assertEquals(editableField.getLocation(), prevField);
    });

    test('findPreviousEditableFieldLast_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = input.fieldRow[0];
      var node = Blockly.ASTNode.createFieldNode(field);
      var editableField = node.findPreviousEditableField_(field, input, true);
      assertEquals(editableField.getLocation(), input.fieldRow[1]);
    });

    test('findNextForInput_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var input2 = this.blocks.statementInput1.inputList[1];
      var connection = input.connection;
      var node = Blockly.ASTNode.createConnectionNode(connection);
      var newASTNode = node.findNextForInput_(connection, input);
      assertEquals(newASTNode.getLocation(), input2.connection);
    });

    test('findPrevForInput_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var input2 = this.blocks.statementInput1.inputList[1];
      var connection = input2.connection;
      var node = Blockly.ASTNode.createConnectionNode(connection);
      var newASTNode = node.findPrevForInput_(connection, input2);
      assertEquals(newASTNode.getLocation(), input.connection);
    });

    test('findNextForField_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      var field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field2);
      var newASTNode = node.findNextForField_(field, input);
      assertEquals(newASTNode.getLocation(), field2);
    });

    test('findPrevForField_', function() {
      var input = this.blocks.statementInput1.inputList[0];
      var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
      var field2 = this.blocks.statementInput1.inputList[0].fieldRow[1];
      var node = Blockly.ASTNode.createFieldNode(field2);
      var newASTNode = node.findPrevForField_(field2, input);
      assertEquals(newASTNode.getLocation(), field);
    });

    test('navigateBetweenStacks_Forward', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.NEXT, this.blocks.statementInput1.nextConnection);
      var newASTNode = node.navigateBetweenStacks_(true);
      assertEquals(newASTNode.getLocation(), this.blocks.statementInput4);
    });

    test('navigateBetweenStacks_Backward', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var newASTNode = node.navigateBetweenStacks_(false);
      assertEquals(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('findTopOfSubStack_', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var block = node.findTopOfSubStack_(this.blocks.statementInput4);
      assertEquals(block, this.blocks.statementInput4);
    });
    test('getOutAstNodeForBlock_', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput2);
      var newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput2);
      assertEquals(newASTNode.getLocation(), this.blocks.statementInput1);
    });
    test('getOutAstNodeForBlock_OneBlock', function() {
      var node = new Blockly.ASTNode(
          Blockly.ASTNode.types.BLOCK, this.blocks.statementInput4);
      var newASTNode = node.getOutAstNodeForBlock_(this.blocks.statementInput4);
      assertEquals(newASTNode.getLocation(), this.blocks.statementInput4);
    });
  });

  suite('NavigationFunctions', function() {
    suite('Next', function() {
      test('previousConnection', function() {
        var prevConnection = this.blocks.statementInput1.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.statementInput1);
      });
      test('block', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), nextConnection);
      });
      test('nextConnection', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var prevConnection = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), prevConnection);
      });
      test('input', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var inputConnection = this.blocks.statementInput1.inputList[1].connection;
        var node = Blockly.ASTNode.createInputNode(input);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), inputConnection);
      });
      test('output', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.fieldWithOutput);
      });
      test('field', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[1];
        var inputConnection = this.blocks.statementInput1.inputList[0].connection;
        var node = Blockly.ASTNode.createFieldNode(field);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), inputConnection);
      });
      test('isStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput1);
        var nextNode = node.next();
        assertEquals(nextNode.getLocation(), this.blocks.statementInput4);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var nextNode = node.next();
        assertEquals(nextNode.wsCoordinate_.x, 110);
        assertEquals(nextNode.getLocation(), this.workspace);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.WORKSPACE);
      });
    });

    suite('Previous', function() {
      test('previousConnectionTopBlock', function() {
        var prevConnection = this.blocks.statementInput1.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('previousConnection', function() {
        var prevConnection = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        var prevNode = node.prev();
        var nextConnection = this.blocks.statementInput1.nextConnection;
        assertEquals(prevNode.getLocation(), nextConnection);
      });
      test('block', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var prevNode = node.prev();
        var prevConnection = this.blocks.statementInput1.previousConnection;
        assertEquals(prevNode.getLocation(), prevConnection);
      });
      test('nextConnection', function() {
        var nextConnection = this.blocks.statementInput1.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.statementInput1);
      });
      test('input', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), input.fieldRow[1]);
      });
      test('output', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('field', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var prevNode = node.prev();
        assertEquals(prevNode, null);
      });
      test('isStack', function() {
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var prevNode = node.prev();
        assertEquals(prevNode.getLocation(), this.blocks.statementInput1);
        assertEquals(prevNode.getType(), Blockly.ASTNode.types.STACK);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var nextNode = node.prev();
        assertEquals(nextNode.wsCoordinate_.x, 90);
        assertEquals(nextNode.getLocation(), this.workspace);
        assertEquals(nextNode.getType(), Blockly.ASTNode.types.WORKSPACE);
      });
    });

    suite('In', function() {
      test('block', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var inNode = node.in();
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        assertEquals(inNode.getLocation(), field);
      });
      test('input', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var inNode = node.in();
        var outputConnection = this.blocks.fieldWithOutput.outputConnection;
        assertEquals(inNode.getLocation(), outputConnection);
      });
      test('blockToInput', function() {
        var input = this.blocks.valueInput.inputList[0];
        var node = Blockly.ASTNode.createBlockNode(this.blocks.valueInput);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), input.connection);
      });
      test('output', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('field', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var inNode = node.in();
        assertEquals(inNode, null);
      });
      test('isStack', function() {
        var prevConnection = this.blocks.statementInput4.previousConnection;
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), prevConnection);
        assertEquals(inNode.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('workspace', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode.createWorkspaceNode(this.workspace, coordinate);
        var inNode = node.in();
        assertEquals(inNode.getLocation(), this.workspace.getTopBlocks()[0]);
        assertEquals(inNode.getType(), Blockly.ASTNode.types.STACK);

      });
    });

    suite('Out', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "start_block",
          "message0": "",
          "nextStatement": null,
          "colour": 230,
          "tooltip": "",
          "helpUrl": ""
        },
        {
          "type": "output_next",
          "message0": "",
          "output": null,
          "colour": 230,
          "tooltip": "",
          "helpUrl": "",
          "nextStatement": null
        }]);
        var noPrevConnection = this.workspace.newBlock('start_block');
        var secondBlock = this.workspace.newBlock('input_statement');
        var outputNextBlock = this.workspace.newBlock('output_next');
        var fieldWithOutput2 = this.workspace.newBlock('field_input');

        noPrevConnection.nextConnection.connect(secondBlock.previousConnection);
        secondBlock.inputList[0].connection
            .connect(outputNextBlock.outputConnection);
        this.blocks.noPrevConnection = noPrevConnection;
        this.blocks.secondBlock = secondBlock;
        this.blocks.outputNextBlock = outputNextBlock;
        this.blocks.fieldWithOutput2 = fieldWithOutput2;
      });
      teardown(function() {
        delete this.blocks.noPrevConnection;
        delete this.blocks.secondBlock;
        delete this.blocks.outputNextBlock;
        delete this.blocks.fieldWithOutput2;
      });

      test('fromInputToBlock', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromOutputToInput', function() {
        var output = this.blocks.fieldWithOutput.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.statementInput1.inputList[0].connection);
      });
      test('fromOutputToStack', function() {
        var output = this.blocks.fieldWithOutput2.outputConnection;
        var node = Blockly.ASTNode.createConnectionNode(output);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromFieldToBlock', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.BLOCK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromStackToWorkspace', function() {
        var stub = sinon.stub(this.blocks.statementInput4,
            "getRelativeToSurfaceXY").returns({x: 10, y:10});
        var node = Blockly.ASTNode.createStackNode(this.blocks.statementInput4);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.WORKSPACE);
        chai.assert.equal(outNode.wsCoordinate_.x, 10);
        chai.assert.equal(outNode.wsCoordinate_.y, -10);
        stub.restore();
      });
      test('fromPreviousToInput', function() {
        var previous = this.blocks.statementInput3.previousConnection;
        var inputConnection = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(previous);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromPreviousToStack', function() {
        var previous = this.blocks.statementInput2.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(previous);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToInput', function() {
        var next = this.blocks.statementInput3.nextConnection;
        var inputConnection = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
      test('fromNextToStack', function() {
        var next = this.blocks.statementInput2.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromNextToStack_NoPreviousConnection', function() {
        var next = this.blocks.secondBlock.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.noPrevConnection);
      });
      /**
       * This is where there is a block with both an output connection and a
       * next connection attached to an input.
       */
      test('fromNextToInput_OutputAndPreviousConnection', function() {
        var next = this.blocks.outputNextBlock.nextConnection;
        var node = Blockly.ASTNode.createConnectionNode(next);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(),
            this.blocks.secondBlock.inputList[0].connection);
      });
      test('fromBlockToStack', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput2);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToInput', function() {
        var input = this.blocks.statementInput2.inputList[1].connection;
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput3);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), input);
      });
      test('fromTopBlockToStack', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.statementInput1);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.statementInput1);
      });
      test('fromBlockToStack_OutputConnection', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.fieldWithOutput2);
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.STACK);
        chai.assert.equal(outNode.getLocation(), this.blocks.fieldWithOutput2);
      });
      test('fromBlockToInput_OutputConnection', function() {
        var node = Blockly.ASTNode.createBlockNode(this.blocks.outputNextBlock);
        var inputConnection = this.blocks.secondBlock.inputList[0].connection;
        var outNode = node.out();
        chai.assert.equal(outNode.getType(), Blockly.ASTNode.types.INPUT);
        chai.assert.equal(outNode.getLocation(), inputConnection);
      });
    });

    suite('createFunctions', function() {
      test('createFieldNode', function() {
        var field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        var node = Blockly.ASTNode.createFieldNode(field);
        assertEquals(node.getLocation(), field);
        assertEquals(node.getType(), Blockly.ASTNode.types.FIELD);
      });
      test('createConnectionNode', function() {
        var prevConnection = this.blocks.statementInput4.previousConnection;
        var node = Blockly.ASTNode.createConnectionNode(prevConnection);
        assertEquals(node.getLocation(), prevConnection);
        assertEquals(node.getType(), Blockly.ASTNode.types.PREVIOUS);
      });
      test('createInputNode', function() {
        var input = this.blocks.statementInput1.inputList[0];
        var node = Blockly.ASTNode.createInputNode(input);
        assertEquals(node.getLocation(), input.connection);
        assertEquals(node.getType(), Blockly.ASTNode.types.INPUT);
      });
      test('createWorkspaceNode', function() {
        var coordinate = new goog.math.Coordinate(100,100);
        var node = Blockly.ASTNode
            .createWorkspaceNode(this.workspace, coordinate);
        assertEquals(node.getLocation(), this.workspace);
        assertEquals(node.getType(), Blockly.ASTNode.types.WORKSPACE);
        assertEquals(node.getWsCoordinate(), coordinate);
      });
      test('createStatementConnectionNode', function() {
        var nextConnection = this.blocks.statementInput1.inputList[1].connection;
        var inputConnection = this.blocks.statementInput1.inputList[1].connection;
        var node = Blockly.ASTNode.createConnectionNode(nextConnection);
        assertEquals(node.getLocation(), inputConnection);
        assertEquals(node.getType(), Blockly.ASTNode.types.INPUT);
      });
    });
  });
});