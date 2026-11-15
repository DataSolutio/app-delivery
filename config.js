/* Configuração do PedeAÍ — carregada antes do app.js
   modo "demo"     → checkout simulado (site de demonstração para donos de restaurante)
   modo "producao" → envia o pedido para a Edge Function create-order do Supabase */
window.PEDEAI_CONFIG = {
  modo: "producao",
  restaurante: "demo",                 /* slug do restaurante (tabela restaurants) */
  apiUrl: "https://plxudksracibynqogzfc.supabase.co",                          /* ex.: https://SEU-PROJETO.supabase.co */
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseHVka3NyYWNpYnlucW9nemZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNTE1ODksImV4cCI6MjEwOTgyNzU4OX0._CZ0tF6Wd_y-Fw89WS33enBTR0UrwE-chFeE9qgCy-0",                         /* chave PÚBLICA (anon). Nunca use a service_role aqui. */
  taxaEntrega: 8.9                     /* só exibição; o valor oficial vem do servidor */
};
