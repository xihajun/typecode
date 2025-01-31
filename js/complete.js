let hash = window.location.hash.substring(1);

let hashBits = hash.split("/");
let repo = hashBits.slice(0, 3).join("/");
let repoName = hashBits.slice(0, 2).join("/");
let file = hashBits[hashBits.length - 1];

// Get performance data from localStorage
const wpm = localStorage.getItem('typingWPM') || '0';
const accuracy = localStorage.getItem('typingAccuracy') || '100';
const timeTaken = localStorage.getItem('typingTime') || '0';

// Format time taken
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

$("#congrats").html(`
    <div class="completion-stats">
        <h2>Congratulations, you've completed <code>${file}</code> in <code>${repoName}</code>!</h2>
        <div class="stats-container">
            <div class="stat-item">
                <span class="stat-label">Speed:</span>
                <span class="stat-value">${Math.round(wpm)} WPM</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Accuracy:</span>
                <span class="stat-value">${Math.round(accuracy)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Time:</span>
                <span class="stat-value">${formatTime(timeTaken)}</span>
            </div>
        </div>
    </div>
`);

$("#repo").attr("href", `/repo.html#${repo}`);

$("#back").click(() => {
	window.location.href = `type.html#${hash}`;
});

// Clear the performance data
localStorage.removeItem('typingWPM');
localStorage.removeItem('typingAccuracy');
localStorage.removeItem('typingTime');
