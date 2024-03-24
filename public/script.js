document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const video = document.getElementById("videoPlayer");

  // Prompt for username and join the room
  const username = prompt("Enter your username:");
  socket.emit("join", username);

  // Update users list
  socket.on("updateUsers", (users) => {
    document.getElementById("users").innerHTML = `Users: ${users.join(", ")}`;
  });

  // Receive and display chat messages
  socket.on("message", (data) => {
    const messages = document.getElementById("messages");
    const item = document.createElement("li");
    // item.textContent = `${data.username}: ${data.message}`;
    item.textContent = data;
    messages.appendChild(item);
  });

  // Receive and handle video control events
  socket.on("videoControl", (data) => {
    if (data.playing) {
      video.play();
    } else {
      video.pause();
    }
    video.currentTime = data.currentTime;
  });

  // Send chat message
  window.sendMessage = () => {
    const input = document.getElementById("m");
    const message = input.value.trim();
    if (message !== "") {
      socket.emit("chatMessage", message);
      input.value = "";
    }
  };

  // Update video state when playing, pausing, or seeking
  video.addEventListener("play", () => {
    const currentTime = video.currentTime;
    socket.emit("videoControl", { playing: true, currentTime });
  });

  video.addEventListener("pause", () => {
    const currentTime = video.currentTime;
    socket.emit("videoControl", { playing: false, currentTime });
  });

  // Handle file select and emit the video to the server
  window.handleFileSelect = () => {
    const file = videoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const videoData = {
          name: file.name,
          type: file.type,
          data: event.target.result,
        };
        socket.emit("uploadVideo", videoData);
      };
      reader.readAsDataURL(file);
    }
  };

  
});
