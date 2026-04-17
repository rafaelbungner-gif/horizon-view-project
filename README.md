Você pode adicionar este bloco logo abaixo do card de "Ocupação Horizontal" no código HTML:HTML

<div class="metric">
    <span>OCUPAÇÃO VERTICAL</span>
    <strong id="out_theta" style="color: var(--text-main);">0.0°</strong>
</div>

E no final da função calc() no JavaScript, adicione a linha para atualizar esse valor:JavaScriptdocument.getElementById('out_theta').innerText = (theta_rad * (180 / Math.PI)).toFixed(3) + '°';

É uma métrica excelente para documentação técnica, pois os órgãos ambientais muitas vezes exigem a matriz completa (Largura Angular + Altura Angular) para validar se o cálculo de intrusão geométrica está correto.

LOVABLE - AJUSTAR O FATOR DE REFRAÇÃO - MANTER O 1,13 E ADICIONAR O 1,17.
