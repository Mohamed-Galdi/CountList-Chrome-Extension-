document.addEventListener("DOMContentLoaded", function () {
  // Function to format time in HH:MM:SS
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Function to update durations
  function updateDurations(result) {
    const totalElement = document.getElementById("total-duration");
    const watchedElement = document.getElementById("watched-duration");
    const remainingElement = document.getElementById("remaining-duration");

    const estimatedDurations = {
      1.25: {
        total: document.getElementById("estimated-total-1-25"),
        watched: document.getElementById("estimated-watched-1-25"),
        remaining: document.getElementById("estimated-remaining-1-25"),
      },
      1.5: {
        total: document.getElementById("estimated-total-1-5"),
        watched: document.getElementById("estimated-watched-1-5"),
        remaining: document.getElementById("estimated-remaining-1-5"),
      },
      1.75: {
        total: document.getElementById("estimated-total-1-75"),
        watched: document.getElementById("estimated-watched-1-75"),
        remaining: document.getElementById("estimated-remaining-1-75"),
      },
      2: {
        total: document.getElementById("estimated-total-2"),
        watched: document.getElementById("estimated-watched-2"),
        remaining: document.getElementById("estimated-remaining-2"),
      },
    };

    if (result.totalDuration !== undefined) {
      totalElement.textContent = `Total: ${formatTime(result.totalDuration)}`;
    }
    if (result.watchedDuration !== undefined) {
      watchedElement.textContent = `Watched: ${formatTime(
        result.watchedDuration
      )}`;
    }
    if (result.remainingDuration !== undefined) {
      remainingElement.textContent = `Remaining: ${formatTime(
        result.remainingDuration
      )}`;

      // Calculate and display estimated durations for different speeds
      for (const speed in estimatedDurations) {
        const speedFloat = parseFloat(speed);
        estimatedDurations[speed].total.textContent = ` ${formatTime(
          result.totalDuration / speedFloat
        )}`;
        estimatedDurations[speed].watched.textContent = ` ${formatTime(
          result.watchedDuration / speedFloat
        )}`;
        estimatedDurations[
          speed
        ].remaining.textContent = ` ${formatTime(
          result.remainingDuration / speedFloat
        )}`;
      }
    }
  }

  // Check if the current tab's URL is a YouTube URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    const url = new URL(activeTab.url);

    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      // Retrieve values from Chrome storage and update durations
      chrome.storage.local.get(
        [
          "totalDuration",
          "watchedDuration",
          "remainingDuration",
          "playlistVisible",
        ],
        function (result) {
          if (result.playlistVisible) {
            updateDurations(result);
          } else {
            document.body.innerHTML =
              "<p>No playlist is currently open. Please open a YouTube playlist to see the durations.</p>";
          }
        }
      );
    } else {
      // Display a message indicating that the user needs to be on YouTube
      document.body.innerHTML =
        "<p>Please open a YouTube playlist to see the durations.</p>";
    }
  });
});
