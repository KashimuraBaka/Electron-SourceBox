<template>
  <el-container>
    <el-main>
      <div>
        <a href="https://electron-vite.github.io" target="_blank">
          <img src="/electron-vite.svg?asset" class="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>{{ msg }}</h1>

      <div class="card">
        <el-button @click="count++">count is {{ count }}</el-button>
        <p>
          Edit
          <code>components/HelloWorld.vue</code> to test HMR
        </p>
      </div>

      <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>
        , the official Vue + Vite starter
      </p>
      <p>
        Install
        <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
        in your IDE for a better DX
      </p>
      <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('Vite + Vue')
const count = ref(0)
</script>

<style lang="scss" scoped>
.el-container .read-the-docs {
  color: #888;
}
</style>
