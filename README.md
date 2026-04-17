Você pode adicionar este bloco logo abaixo do card de "Ocupação Horizontal" no código HTML:HTML

<div class="metric">
    <span>OCUPAÇÃO VERTICAL</span>
    <strong id="out_theta" style="color: var(--text-main);">0.0°</strong>
</div>

E no final da função calc() no JavaScript, adicione a linha para atualizar esse valor:JavaScriptdocument.getElementById('out_theta').innerText = (theta_rad * (180 / Math.PI)).toFixed(3) + '°';

É uma métrica excelente para documentação técnica, pois os órgãos ambientais muitas vezes exigem a matriz completa (Largura Angular + Altura Angular) para validar se o cálculo de intrusão geométrica está correto.

LOVABLE - AJUSTAR O FATOR DE REFRAÇÃO - MANTER O 1,13 E ADICIONAR O 1,17.


Parâmetros de Topografia e Distância (O Eixo Z)Distância até Costa (Ex: 89 km):
O que é: A distância em linha reta do observador até a primeira fileira de aerogeradores.
O que influencia: É a variável mestre. Ela pune a visibilidade em todas as frentes. Quanto maior a distância: (1) mais a Terra engole a base da torre, (2) menor o parque parece no horizonte e (3) mais a atmosfera destrói o contraste da imagem.

Elevação do Observador (Ex: 113,3 m):
O que é: A altura dos olhos de quem está olhando. No seu print, o valor de 113,3 m indica que o observador não está na praia, mas sim no topo de um morro, falésia ou num prédio alto.
O que influencia: Empurra o horizonte para longe. Quanto mais alto você está, mais tarde a curvatura da Terra começa a esconder a turbina. Se você colocar 2 metros (praia), a turbina some rápido. Se colocar 113 metros, você consegue ver turbinas muito mais distantes.

Altura da Turbina (Ex: 200 m):
O que é: A altura do nível do mar até a ponta da pá apontada para cima.
O que influencia: É o que "luta" contra a curvatura. Turbinas mais altas sobrevivem à curvatura do planeta por mais quilômetros. Define a Altura Visível final.2. 

Parâmetros de Geometria e Paisagem (O Eixo X)Largura do Parque (Ex: 1 km):
O que é: A extensão total da fileira de turbinas visível de uma ponta à outra.
O que influencia: Afeta exclusivamente o Índice de Ocupação Horizontal ($\alpha$). Um parque de 1 km a 89 km de distância ocupará uma fatia minúscula (quase invisível) do seu campo de visão de 180°. Se aumentar para 20 km, o ângulo cresce.

Área Sólida Transversal (Ex: 1500 m²):
O que é: A área "chapada" da torre e das três pás se você as visse como um desenho 2D.
O que influencia: Segundo o estudo de Bishop (2002), o olho humano não reage apenas à altura, mas à massa total do objeto. Uma turbina "gorda" é vista de mais longe do que uma fina. O modelo pega esse valor, adiciona 20% (para simular a ilusão de ótica das pás girando) e usa isso para calcular se a sua retina consegue focar no objeto.

Parâmetros Ópticos e Atmosféricos (A Opacidade)Contraste Inicial (Ex: 35%):
O que é: O quão forte a cor da turbina "grita" contra a paisagem. Turbinas brancas num mar azul-escuro têm contraste altíssimo (30% a 40%).
O que influencia: É o seu "combustível" de visibilidade. Quanto maior o contraste inicial, mais quilômetros a turbina aguenta viajar pela névoa antes de ficar invisível (chegar no limiar de 2%).

Condição Atmosférica / Extinção $\beta$ (Ex: Ar Perfeito):
O que é: A quantidade de partículas de água e poeira suspensas no ar. No seu print, está configurado como "Ar Perfeito", o que significa um $\beta = 0.00000$.
O que influencia: É o "apagador". Se estiver em Ar Perfeito, o contraste não cai nunca; a turbina só some se a Terra a engolir. Se você mudar para "Névoa Leve" (como usado por Bishop), a matemática começa a cortar o contraste drasticamente a cada quilômetro.

Coeficiente de Refração $k$ (Ex: 1.13):
O que é: A refração é o efeito que faz a luz fazer uma leve curva para baixo ao viajar pela atmosfera (por causa das diferenças de temperatura do ar).
O que influencia: O valor 1.13 "estica" o raio da Terra matematicamente. Na prática, isso faz com que você consiga enxergar objetos que estariam levemente escondidos atrás do horizonte geométrico puro. É um bônus de visibilidade que a física nos dá e que os manuais exigem que seja calculado.
