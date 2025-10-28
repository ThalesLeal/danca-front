<template><div class="page-container"><h2>Saídas</h2><DataTable title="Saídas" :columns="[{key:'descricao',label:'Descrição'},{key:'valor',label:'Valor'},{key:'data',label:'Data'}]" :data="saidas.results||saidas" :pagination="{next:saidas.next,previous:saidas.previous}" @next="go(saidas.next)" @prev="go(saidas.previous)"/></div></template>
<script setup>import{reactive,onMounted}from'vue';import api from'../services/api';import DataTable from'../components/DataTable.vue';const saidas=reactive({});async function fetchSaidas(url){const{data}=await api.get(url||'/saidas/');Object.assign(saidas,data)};async function go(url){if(url)await fetchSaidas(url.replace('http://127.0.0.1:8000/api',''))};onMounted(()=>fetchSaidas())</script>
<style scoped>.page-container{display:grid;gap:24px}</style>

