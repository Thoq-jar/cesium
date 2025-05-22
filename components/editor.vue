<script setup lang="ts">
import { onMounted, ref } from "vue";
import "monaco-editor/min/vs/editor/editor.main.css";
import(
  "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution"
);

const props = defineProps(["contents"]);
const editorContainer = ref<HTMLElement | null>(null);
const writeLocked = ref(true);
const editor = ref<any>(null);
const copySuccess = ref(false);

onMounted(async () => {
  if (process.server) return;

  const monaco = await import("monaco-editor");

  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      return new Worker(
        new URL(
          "monaco-editor/esm/vs/language/typescript/ts.worker.js",
          import.meta.url,
        ),
        { type: "module" },
      );
    },
  };

  if (editorContainer.value) {
    editor.value = monaco.editor.create(editorContainer.value, {
      value: props.contents,
      language: "typescript",
      theme: "vs-dark",
      readOnly: writeLocked.value,
      automaticLayout: true,
      codeLens: true,
      inlayHints: { enabled: "on" },
      renderValidationDecorations: "on",
      contextmenu: false,
      selectionHighlight: true,
    });
  }
});

function toggleWriteLock() {
  writeLocked.value = !writeLocked.value;
  if (editor.value) {
    editor.value.updateOptions({ readOnly: writeLocked.value });
  }
}

async function copyToClipboard() {
  try {
    const content = editor.value ? editor.value.getValue() : props.contents;
    await navigator.clipboard.writeText(content);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
}
</script>

<template>
  <div class="editor-wrapper">
    <div class="editor-controls">
      <button
        @click="toggleWriteLock"
        :class="['lock-button', writeLocked ? 'locked' : 'unlocked']"
        :title="
          writeLocked ? 'Click to unlock editing' : 'Click to lock editing'
        "
      >
        <span v-if="writeLocked">🔒</span>
        <span v-else>🔓</span>
        {{ writeLocked ? "Locked" : "Unlocked" }}
      </button>

      <button
        @click="copyToClipboard"
        :class="['copy-button', { 'copy-success': copySuccess }]"
        title="Copy code to clipboard"
      >
        <span v-if="copySuccess">✓</span>
        <span v-else>📋</span>
        {{ copySuccess ? "Copied!" : "Copy" }}
      </button>
    </div>

    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #2d2d2d;
  border-bottom: 1px solid #333;
}

.lock-button,
.copy-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.lock-button.locked {
  background: #dc3545;
  color: white;
}

.lock-button.locked:hover {
  background: #c82333;
}

.lock-button.unlocked {
  background: #28a745;
  color: white;
}

.lock-button.unlocked:hover {
  background: #218838;
}

.copy-button {
  background: #6c757d;
  color: white;
}

.copy-button:hover {
  background: #5a6268;
}

.copy-button.copy-success {
  background: #28a745;
}

.editor-container {
  height: 400px;
  width: 100%;
  border: 1px solid #333;
  flex: 1;
}
</style>
