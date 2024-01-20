window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("new-game-button")
    .addEventListener("click", async () => {
      const chatResponse = await axios.get("http://localhost:5000/api/chat");
      console.log("chatResponse is: ", chatResponse);
    });
});
