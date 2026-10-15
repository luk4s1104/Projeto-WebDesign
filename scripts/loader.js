document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch("../pages/components.html")
        if(!response.ok){
            throw new Error(`Erro ao buscar componentes. Status: ${response.status}`);
        }
        const htmlText = await response.text()
        const parser = new DOMParser();
        const docVirtual = parser.parseFromString(htmlText, "text/html");
        const TargetOnPage = document.querySelectorAll("[data-component]")
        TargetOnPage.forEach(target => {
            // Pega o ID que você digitou no HTML real (ex: "comp-header")
            const componentId = target.getAttribute("data-component");
            
            // 3. Procura a Div correspondente dentro do nosso documento virtual
            const originComponent = docVirtual.getElementById(componentId);

            if (originComponent) {
                // 4. Injeta o HTML estruturado para dentro da página do usuário
                target.innerHTML = originComponent.innerHTML;
                console.log(`Bastidores: Componente "${componentId}" injetado com sucesso!`);
            } else {
                // Se você errar a digitação de algum ID no HTML real, este aviso te protege
                console.warn(`Aviso: O componente com id "${componentId}" não existe no components.html.`);
            }
        });
    } catch (error) {
        console.error("Algo deu errado enquanto fazia fecth no components.html. Erro:", error);
    }
})