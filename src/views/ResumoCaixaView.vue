<template><div class="page-container"><h2>Resumo do Caixa</h2><p>Em desenvolvimento</p></div></template>
<script setup>import{reactive,onMounted}from'vue';import api from'../services/api';const resumo=reactive({});async function fetchResumo(){try{const{data}=await api.get('/entradas/');Object.assign(resumo,data)}catch(e){console.error('Erro:',e)}};onMounted(fetchResumo)</script>
<style scoped>.page-container{background:white;padding:24px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}</style>

