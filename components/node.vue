<script setup lang="ts">
const props = defineProps(["name", "function"]);
</script>

<template>
  <div
    :class="['node', 'select-none', props.function]"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
  >
    <h1>{{ props.name }}</h1>
  </div>
</template>

<style lang="scss" scoped>
.node {
  font-size: 50%;
  color: white;
  border-radius: 5px;
  padding: 1px 0.5rem;
  cursor: grab;
}

.output {
  background-color: #9512db;
}

.math {
  background-color: #db1212;
}
</style>
