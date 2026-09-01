<!--
  LoginView.vue — porte fiel da tela de login de "Controle de Estoque.dc.html"
  (design system Industry). Apenas visual por enquanto — sem validação,
  sem v-model e sem submit real, conforme solicitado.
-->
<script setup>
const empresa = 'Fábrica Cruzeiro'
</script>

<template>
  <div class="login">
    <!-- ══ coluna esquerda — painel institucional ══ -->
    <div class="login-brand-panel">
      <div class="login-grid-overlay"></div>

      <div class="login-brand">
        <span class="login-mark">TS</span>
        <span class="login-brand-name">{{ empresa }}</span>
      </div>

      <div class="login-hero">
        <div class="login-hero-kicker">Acesso restrito · turno 24h</div>
        <h1 class="login-hero-title">Sistema de gestão de estoque</h1>
        <p class="login-hero-text">
          Controle de entrada, saída e armazenamento de produtos. Identifique-se
          para registrar movimentações — todo lançamento fica vinculado ao seu usuário.
        </p>
      </div>

      <div class="login-stats">
        <div>
          <div class="login-stat-value">04</div>
          <div class="login-stat-label">Módulos ativos</div>
        </div>
        <div>
          <div class="login-stat-value">3</div>
          <div class="login-stat-label">Galpões integrados</div>
        </div>
        <div>
          <div class="login-stat-value">v1.0</div>
          <div class="login-stat-label">Tok&amp;Stok</div>
        </div>
      </div>
    </div>

    <!-- ══ coluna direita — formulário de autenticação ══ -->
    <div class="login-form-panel">
      <div class="login-form-wrap">
        <div>
          <div class="login-form-kicker">Autenticação</div>
          <h2 class="login-form-title">Entrar no sistema</h2>
          <p class="login-form-sub">Use a matrícula corporativa e a senha do operador.</p>
        </div>

        <div class="card blueprint login-card">
          <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>

          <label class="field">
            <span>Matrícula ou e-mail</span>
            <input class="input" placeholder="operador@fabrica.com.br">
          </label>

          <label class="field">
            <span>Senha</span>
            <input class="input" type="password" placeholder="••••••••">
          </label>

          <label class="field">
            <span>Unidade</span>
            <select class="input">
              <option>Guarulhos · Matriz</option>
              <option>São Paulo · CD Norte</option>
              <option>Galpão C · Insumos</option>
            </select>
          </label>

          <div class="login-row">
            <label class="radio">
              <input type="checkbox" checked>
              <span class="dot"></span>
              Manter conectado
            </label>
            <a href="#recuperar" class="login-forgot">Esqueci minha senha</a>
          </div>

          <!-- Faixa de erro do design (condicional no protótipo original) -->
          <!--
          <div class="login-error">
            <span class="login-error-tag">Erro</span>
            <span>Informe a matrícula ou o e-mail corporativo.</span>
          </div>
          -->

          <button type="button" class="btn btn-primary btn-block login-submit">Entrar</button>
        </div>

        <div class="login-footnote">
          <span>Protótipo — qualquer credencial entra</span>
          <span class="login-footnote-right">Cruzeiro do Sul · 2026</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Todos os valores vêm dos tokens do design system Industry (public/styles.css). */
.login {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

/* — coluna esquerda — */
.login-brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-8) calc(var(--space-8) * 1.6);
  background: var(--color-accent-900);
  color: var(--color-bg);
  overflow: hidden;
}
.login-grid-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  background-image:
    repeating-linear-gradient(to right, var(--color-bg) 0 1px, transparent 1px 68px),
    repeating-linear-gradient(to bottom, var(--color-bg) 0 1px, transparent 1px 68px);
}

.login-brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.login-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-bg) 45%, transparent);
  font-family: var(--font-heading);
  font-size: 14px;
}
.login-brand-name {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.login-hero {
  position: relative;
  max-width: 520px;
}
.login-hero-kicker {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent-300);
}
.login-hero-title {
  margin: var(--space-2) 0 var(--space-4);
  font-size: 58px;
  line-height: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.login-hero-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--color-bg) 78%, transparent);
}

.login-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid color-mix(in srgb, var(--color-bg) 30%, transparent);
}
.login-stat-value {
  font-family: var(--font-heading);
  font-size: 30px;
  line-height: 1;
}
.login-stat-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent-300);
}

/* — coluna direita — */
.login-form-panel {
  display: grid;
  place-items: center;
  padding: var(--space-8);
}
.login-form-wrap {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.login-form-kicker {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent-700);
}
.login-form-title {
  margin: 2px 0 var(--space-1);
  font-size: 36px;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.login-form-sub {
  margin: 0;
  font-size: 13px;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}

.login-card {
  padding: var(--space-6);
  gap: var(--space-4);
}

.login-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.login-forgot {
  margin-left: auto;
  font-size: 12px;
}

.login-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 9%, transparent);
  font-size: 13px;
}
.login-error-tag {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent-700);
}

.login-submit {
  padding: var(--space-3);
}

.login-footnote {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 45%, transparent);
}
.login-footnote-right {
  margin-left: auto;
}
</style>
