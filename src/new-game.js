// Event Listeners

const newGameForm = document.getElementById("new-game-form")

newGameForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const form = event.currentTarget;
	const url = form.action;

    const formData = new FormData(form);
    const newGameData = await postNewGameFormData(url, formData );
    window.location.href = `/pages/game.html?id=${newGameData.id}`
})

async function postNewGameFormData(url, formData) {
	const plainFormData = Object.fromEntries(formData.entries());
	const formDataJsonString = JSON.stringify(plainFormData);

	return $.post( url, formDataJsonString, function( data ) {
        return data.id
    }, "json");
}