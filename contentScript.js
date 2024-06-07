// Wait for the page to fully load
window.addEventListener("load", function () {
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

  // Function to get duration in seconds from HH:MM:SS format
  function getDurationInSeconds(duration) {
    const parts = duration.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds += parts[0] * 3600; // hours
      seconds += parts[1] * 60; // minutes
      seconds += parts[2]; // seconds
    } else if (parts.length === 2) {
      seconds += parts[0] * 60; // minutes
      seconds += parts[1]; // seconds
    }
    return seconds;
  }

  // Function to check if the playlist panel is visible
  function isPlaylistVisible() {
    const playlistPanel = document.querySelector(
      "#secondary #secondary-inner ytd-playlist-panel-renderer:last-of-type"
    );
    return playlistPanel && !playlistPanel.hasAttribute("hidden");
  }

  // Function to create the duration element
  function createDurationElement(
    totalDuration,
    watchedDuration,
    remainingDuration
  ) {
    const durationElement = document.createElement("div");
    durationElement.id = "playlist-duration-element";
    durationElement.classList.add("playlist-duration");

    const textContainer = document.createElement("div"); // Create a wrapper div for text elements
    textContainer.classList.add("text-container");

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("progress-container");

    const totalText = document.createElement("p");
    totalText.textContent = `Total: ${formatTime(totalDuration)}`;
    totalText.classList.add("total-duration");

    const watchedText = document.createElement("p");
    watchedText.textContent = `Watched: ${formatTime(watchedDuration)}`;
    watchedText.classList.add("watched-duration");

    const remainingText = document.createElement("p");
    remainingText.textContent = `Remaining: ${formatTime(remainingDuration)}`;
    remainingText.classList.add("remaining-duration");

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar");

    progressBar.style.width = `${(watchedDuration / totalDuration) * 100}%`;

    // Append text elements to the text container
    textContainer.appendChild(totalText);
    textContainer.appendChild(watchedText);
    textContainer.appendChild(remainingText);

    progressContainer.appendChild(progressBar);

    // Append the text container and progress bar as siblings
    durationElement.appendChild(textContainer);
    durationElement.appendChild(progressContainer);

    return durationElement;
  }

  // Function to calculate durations and display them
  function calculateAndDisplayDurations() {
    const playlistPanel = document.querySelector(
      "#secondary #secondary-inner ytd-playlist-panel-renderer:last-of-type"
    );
    if (!playlistPanel) {
      return; // Playlist panel not found, exit the function
    }
    const videos = playlistPanel.querySelectorAll(
      "ytd-playlist-panel-video-renderer"
    );

    let totalDuration = 0;
    let watchedDuration = 0;

    videos.forEach((video) => {
      const durationElement = video.querySelector(
        "badge-shape .badge-shape-wiz__text"
      );
      if (durationElement) {
        const durationText = durationElement.textContent.trim();
        const durationSeconds = getDurationInSeconds(durationText);
        totalDuration += durationSeconds;

        const progressBar = video.querySelector(
          "ytd-thumbnail-overlay-resume-playback-renderer #progress"
        );
        if (progressBar) {
          const watchedPercentage = parseFloat(progressBar.style.width) / 100;
          const watchedSeconds = durationSeconds * watchedPercentage;
          watchedDuration += watchedSeconds;
        }
      }
    });

    const remainingDuration = totalDuration - watchedDuration;

    let durationElement = document.querySelector("#playlist-duration-element");
    if (!durationElement) {
      durationElement = createDurationElement(
        totalDuration,
        watchedDuration,
        remainingDuration
      );
      const headerElement = playlistPanel.querySelector("#container .header");
      if (headerElement) {
        headerElement.appendChild(durationElement);
      }
    } else {
      const totalText = durationElement.querySelector("p.total-duration");
      totalText.textContent = `Total: ${formatTime(totalDuration)}`;

      const watchedText = durationElement.querySelector("p.watched-duration");
      watchedText.textContent = `Watched: ${formatTime(watchedDuration)}`;

      const remainingText = durationElement.querySelector(
        "p.remaining-duration"
      );
      remainingText.textContent = `Remaining: ${formatTime(remainingDuration)}`;

      const pgb = durationElement.querySelector(".progress-bar");
      pgb.style.width = `${(watchedDuration / totalDuration) * 100}%`;
    }
  }

  // Observe for changes in the DOM to detect when the playlist becomes visible
  const observer = new MutationObserver(() => {
    if (isPlaylistVisible()) {
      calculateAndDisplayDurations();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial check in case the playlist is already visible on page load
  if (isPlaylistVisible()) {
    calculateAndDisplayDurations();
  }
});
