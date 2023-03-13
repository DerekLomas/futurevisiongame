document.addEventListener("DOMContentLoaded", () => {
    const chatHistory = document.getElementById("chat-history");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    //const startresetbtn = document.getElementById("button1");

    chatHistory.innerHTML = "";
    sendMessage(mainPrompt);

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const send_message = chatInput.value.trim();
      if (send_message !== "") {
        displayMessageUser(`You: ${send_message}`);
        chatInput.value = "";
        sendMessage(send_message);
      }
    });

    
    /*
    // we expect this button the be clicked only when the user wants to wipe the conversation and start fresh
    startresetbtn.addEventListener("click", function() {
      // reset if some chat exists
      chatHistory.innerHTML = "";
      sendMessage(mainPrompt);
    });
    */


  function displayMessageBot(message) {
    const div = document.createElement("div");
    div.className = "chat-message-bot";
    div.innerText = message;
    chatHistory.appendChild(div);
  }

  function displayMessageUser(message) {
    const div = document.createElement("div");
    div.className = "chat-message-user";
    div.innerText = message;
    chatHistory.appendChild(div);
  }

  /*function receiveMessage(user_message, bot_message) {
        
  }*/


  function sendMessage(message) {
      

    // ugly syntax to do a simple task: extract the entire chat history for the user and the bot responses, and remove the "You" and "Bot"
      muser = [].slice.call(mbot=document.getElementsByClassName("chat-message-user")).map(i => i.innerText).map(i => i.replace("You: ",""));
      mbot = [].slice.call(mbot=document.getElementsByClassName("chat-message-bot")).map(i => i.innerText).map(i => i.replace("Bot: ",""));
      var senddata = JSON.stringify({"current_message": message, "messages_user": muser, "messages_bot": mbot});

      fetch('/.netlify/functions/getTextOpenAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: senddata
      })
      .then((response) => response.json())
      .then((received_message) => {
        // receiveMessage(message, received_message);
        displayMessageBot(`Bot: ${received_message}`);
      })
      .catch((error) => {
        console.error('Error sending message', error);
      });
  }// end of send message function
});
