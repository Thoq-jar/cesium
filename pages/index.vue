<script setup lang="ts">
import {ref, type Ref} from "vue";
import Node from "~/components/node.vue";
import Editor from "~/components/editor.vue";

interface NodeDefinition {
  name: string;
  function: string;
  execute: string;
  needsInput: boolean;
  inputType: string;
}

interface WorkspaceNode extends NodeDefinition {
  input: string | null;
}

const nodeDefinitions: NodeDefinition[] = [
  {
    name: "print",
    function: "output",
    execute: `console.log(##VALUE##);\n`,
    needsInput: true,
    inputType: "string|number",
  },
  {
    name: "alert",
    function: "output",
    execute: 'alert(##VALUE##);\n',
    needsInput: true,
    inputType: "string|number",
  },
  {
    name: "count",
    function: "math",
    execute: "for(let i = 0; i < ##VALUE##; i++) {\n  console.log(i);\n}\n",
    needsInput: true,
    inputType: "number",
  },
];

const workspace: Ref<WorkspaceNode[]> = ref([]);
const showEditor = ref(false);
const compiledCode = ref("");

function validateInput(
  input: string,
  inputType: string
): {
  isValid: boolean; errorMessage?: string
} {
  const types = inputType.split("|");

  for (const type of types) {
    switch (type.trim()) {
      case "number":
        const num = Number(input);
        if (!isNaN(num) && isFinite(num)) {
          return { isValid: true };
        }
        break;
      case "string":
        if (input.trim().length > 0) {
          return { isValid: true };
        }
        break;
    }
  }

  if (types.length === 1) {
    switch (types[0].trim()) {
      case "number":
        return {
          isValid: false,
          errorMessage: "Only numbers are allowed"
        };
      case "string":
        return {
          isValid: false,
          errorMessage: "Please enter a valid string"
        };
      default:
        return {
          isValid: false,
          errorMessage: `Invalid input type: ${types[0]}`,
        };
    }
  } else {
    const typeList = types.map((t) => t.trim()).join(" or ");
    return {
      isValid: false,
      errorMessage: `Only ${typeList} values are allowed`,
    };
  }
}

function formatValueForExecution(input: string, inputType: string): string {
  const types = inputType.split("|");

  const num = Number(input);
  if (!isNaN(num) && isFinite(num) && types.includes("number")) {
    return input;
  }

  return `"${input.replace(/"/g, '\\"')}"`;
}

function onDrop(event: DragEvent): void {
  if (!event.dataTransfer) return ;
  const nodeName = event.dataTransfer.getData("text");
  const nodeDef = nodeDefinitions.find((n) => n.name === nodeName);
  if (nodeDef) {
    let input: string | null = null;
    if (nodeDef.needsInput) {
      let isValidInput = false;

      while (!isValidInput) {
        let inputType = nodeDef.inputType;
        if (nodeDef.inputType.includes("|")) {
          inputType = nodeDef.inputType.replace(/\|/g, " or ");
        }

        input = prompt(
          `Enter a ${
inputType
} for the ${
nodeDef.name
} function:`
        );
        if (input === null) return ;

        const validation = validateInput(input, nodeDef.inputType);
        if (validation.isValid) {
          isValidInput = true;
        } else {
          alert(validation.errorMessage || "Invalid input");
        }
      }
    }

    const formattedValue = input
      ? formatValueForExecution(input, nodeDef.inputType)
      : "";
    const customizedNode: WorkspaceNode = {
      ...nodeDef,
      input,
      execute: nodeDef.execute.replace("##VALUE##", formattedValue),
    };
    workspace.value.push(customizedNode);
  }
}

function compile(): string {
  return workspace.value.map((n) => n.execute).join("\n");
}
function showCode(): void {
  compiledCode.value = compile();
  showEditor.value = true;
}

function play(): void {
  const code = compile();
  eval(code);
}

function closeEditor(): void {
  showEditor.value = false;
}

function handleDragStart(event: DragEvent, nodeName: string): void {
  if (!event.dataTransfer) return ;
  event.dataTransfer.setData("text", nodeName);
}
</script>

<template>
  <div class="controls">
    <button @click="play">Run</button>
    <button @click="showCode">Compile</button>
  </div>

  <div class="node-bank">
    <Node
      v-for="node in nodeDefinitions"
      :key="node.name"
      :name="node.name"
      :function="node.function"
      :draggable="true"
      @dragstart="(e: DragEvent) => handleDragStart(e, node.name)"
    />
  </div>

  <div class="workspace" @dragover.prevent @drop="onDrop">
    <h3 class="select-none">Workspace</h3>
    <Node
      v-for="(node, index) in workspace"
      :key="index"
      :name="node.name"
      :function="node.function"
    />
  </div>

  <div v-if="showEditor" class="editor-overlay">
    <div class="editor-modal">
      <div class="editor-header">
        <h3>Compiled Code</h3>
        <button @click="closeEditor" class="close-button">×</button>
      </div>
      <Editor :contents="compiledCode"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.controls {
  margin-bottom: 10px;

  button {
    background: #444;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;

    &:hover {
      background: #666;
    }
  }
}

.node-bank {
  display: flex;
  gap: 10px;
  margin: 1rem 0;
}

.workspace {
  min-height: 200px;
  padding: 10px;
  border: 2px dashed #555;
  margin-top: 20px;
}

.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.editor-modal {
  background: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  height: 80%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;

  h3 {
    margin: 0;
    color: white;
  }
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #444;
  }
}
</style>
