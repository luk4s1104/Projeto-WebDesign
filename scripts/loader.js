document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = fetch("../pages/components.html")
        if(!response.ok){
            throw new Error(`Erro ao buscar componentes. Status: ${response.status}`);
        }
        const htmlText = await response.text()
    } catch (error) {
        console.error("Algo deu errado enquanto fazia fecth no components.html. Erro:", error);
    }
})