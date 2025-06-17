// Family Vacation Voting System
class VacationVoting {
    constructor() {
        this.votes = this.loadVotes();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
    // Form submission
    const form = document.getElementById('voting-form');
    form.addEventListener('submit', (e) => this.handleVoteSubmission(e));

    // Results controls
    document.getElementById('view-votes-btn').addEventListener('click', () => this.showAllVotes());
    document.getElementById('view-summary-btn').addEventListener('click', () => this.showSummary());
    document.getElementById('reset-votes-btn').addEventListener('click', () => this.resetVotes());
    document.getElementById('vote-again-btn').addEventListener('click', () => this.showVotingForm());

    // ADD THIS NEW SECTION: Radio button selection handling for better browser compatibility
    document.querySelectorAll('.option-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove selected class from all cards in this group
            document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
                r.closest('.option-card').classList.remove('selected');
            });
            // Add selected class to this card
            this.closest('.option-card').classList.add('selected');
        });
    });
}

    handleVoteSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        // Validate that name is provided
        const voterName = formData.get('voterName');
        if (!voterName || voterName.trim() === '') {
            this.showMessage('Please enter your name before voting!', 'error');
            return;
        }

        // Get age if provided (optional since your HTML doesn't have age field yet)
        const voterAge = formData.get('voterAge') || 'Not specified';

        const vote = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            voterName: voterName.trim(),
            voterAge: voterAge,
            destination: formData.get('destination'),
            accommodation: formData.get('accommodation'),
            activity: formData.get('activity'),
            climate: formData.get('climate')
        };

        // Validate that all required fields are selected
        if (!vote.destination || !vote.accommodation || !vote.activity || !vote.climate) {
            this.showMessage('Please make a selection for all categories!', 'error');
            return;
        }

        // Check if voter has already voted
        const existingVoteIndex = this.votes.findIndex(v => v.voterName.toLowerCase() === vote.voterName.toLowerCase());

        if (existingVoteIndex !== -1) {
            if (confirm(`${vote.voterName} has already voted. Do you want to update their vote?`)) {
                this.votes[existingVoteIndex] = vote;
            } else {
                return;
            }
        } else {
            this.votes.push(vote);
        }

        this.saveVotes();

        // Show success message first
        this.showMessage(`Thank you, ${vote.voterName}! Your vote has been recorded.`, 'success');

        // Reset form
        e.target.reset();

        // Wait a moment then show results
        setTimeout(() => {
            this.showResults();
            this.showSummary();
        }, 1500);
    }

    showVotingForm() {
        document.getElementById('voting-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'none';
    }

    showResults() {
        document.getElementById('voting-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';
    }

    showAllVotes() {
        this.setActiveButton('view-votes-btn');
        const content = document.getElementById('results-content');

        if (this.votes.length === 0) {
            content.innerHTML = '<div class="no-votes">No votes have been cast yet.</div>';
            return;
        }

        let html = '';
        this.votes.forEach(vote => {
            html += `
                <div class="vote-item">
                    <h4>🗳️ ${vote.voterName}'s Vote</h4>
                    ${vote.voterAge && vote.voterAge !== 'Not specified' ? `<p><strong>Age:</strong> ${vote.voterAge}</p>` : ''}
                    <div class="vote-details">
                        <div class="vote-detail">
                            <span><strong>Destination:</strong></span>
                            <span>${this.formatOption(vote.destination)}</span>
                        </div>
                        <div class="vote-detail">
                            <span><strong>Accommodation:</strong></span>
                            <span>${this.formatOption(vote.accommodation)}</span>
                        </div>
                        <div class="vote-detail">
                            <span><strong>Activity:</strong></span>
                            <span>${this.formatOption(vote.activity)}</span>
                        </div>
                        <div class="vote-detail">
                            <span><strong>Weather:</strong></span>
                            <span>${this.formatOption(vote.climate)}</span>
                        </div>
                        <div class="vote-detail">
                            <span><strong>Voted:</strong></span>
                            <span>${new Date(vote.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        content.innerHTML = html;
    }

    showSummary() {
        this.setActiveButton('view-summary-btn');
        const content = document.getElementById('results-content');

        if (this.votes.length === 0) {
            content.innerHTML = '<div class="no-votes">No votes have been cast yet.</div>';
            return;
        }

        const summary = this.calculateSummary();
        let html = '';

        // Show voter count
        html += `
            <div class="summary-item">
                <h4>👥 Total Voters</h4>
                <div style="text-align: center; font-size: 2em; color: #667eea; font-weight: bold;">
                    ${this.votes.length} ${this.votes.length === 1 ? 'person' : 'people'} voted!
                </div>
            </div>
        `;

        // Categories with their display names and emojis
        const categories = {
            destination: { name: '🏖️ Where do you want to go?', options: this.getDestinationOptions() },
            accommodation: { name: '🏠 Where do you want to sleep?', options: this.getAccommodationOptions() },
            activity: { name: '🎈 What do you want to do for fun?', options: this.getActivityOptions() },
            climate: { name: '☀️ What weather do you like?', options: this.getClimateOptions() }
        };

        Object.keys(categories).forEach(category => {
            const categoryData = summary[category];
            const sortedOptions = Object.entries(categoryData)
                .sort(([,a], [,b]) => b - a);

            html += `
                <div class="summary-item">
                    <h4>${categories[category].name}</h4>
                    <div class="summary-options">
            `;

            sortedOptions.forEach(([option, count], index) => {
                const isWinner = index === 0 && count > 0;
                const percentage = this.votes.length > 0 ? Math.round((count / this.votes.length) * 100) : 0;
                html += `
                    <div class="summary-option ${isWinner ? 'winner' : ''}">
                        <span>${this.formatOption(option)}</span>
                        <span class="vote-count">${count} (${percentage}%)</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        // Add overall recommendation
        const recommendation = this.generateRecommendation(summary);
        html += `
            <div class="summary-item">
                <h4>🎯 Recommended Vacation</h4>
                <div style="padding: 15px; background: #667eea; color: white; border-radius: 8px; text-align: center;">
                    ${recommendation}
                </div>
            </div>
        `;

        content.innerHTML = html;
    }

    calculateSummary() {
        const summary = {
            destination: {},
            accommodation: {},
            activity: {},
            climate: {}
        };

        // Initialize all options with 0 counts
        this.getDestinationOptions().forEach(opt => summary.destination[opt] = 0);
        this.getAccommodationOptions().forEach(opt => summary.accommodation[opt] = 0);
        this.getActivityOptions().forEach(opt => summary.activity[opt] = 0);
        this.getClimateOptions().forEach(opt => summary.climate[opt] = 0);

        // Count votes
        this.votes.forEach(vote => {
            summary.destination[vote.destination]++;
            summary.accommodation[vote.accommodation]++;
            summary.activity[vote.activity]++;
            summary.climate[vote.climate]++;
        });

        return summary;
    }

    generateRecommendation(summary) {
        const topChoices = {};

        Object.keys(summary).forEach(category => {
            const sorted = Object.entries(summary[category])
                .sort(([,a], [,b]) => b - a);
            topChoices[category] = sorted[0][0];
        });

        const destination = this.formatOption(topChoices.destination);
        const accommodation = this.formatOption(topChoices.accommodation);
        const activity = this.formatOption(topChoices.activity);
        const climate = this.formatOption(topChoices.climate);

        return `🎉 Your family wants to go to ${destination.replace(/🏖️|⛰️|🏙️|🌾|🏞️/g, '').trim()} and stay in ${accommodation.replace(/🏨|🏡|⛺|🏕️|🚢/g, '').trim().toLowerCase()}! You want to ${activity.replace(/😌|🚀|🏛️|🦋|🍕/g, '').trim().toLowerCase()} in ${climate.replace(/🌴|🌤️|🧥|🍂/g, '').trim().toLowerCase()} weather! 🌟`;
    }

    resetVotes() {
        if (confirm('Are you sure you want to reset all votes? This cannot be undone.')) {
            this.votes = [];
            this.saveVotes();
            this.showSummary();
            this.showMessage('All votes have been reset.', 'info');
        }
    }

    setActiveButton(activeId) {
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(activeId).classList.add('active');
    }

    formatOption(option) {
        const formatMap = {
            // Destinations
            'beach': '🏖️ Beach',
            'mountains': '⛰️ Mountains',
            'city': '🏙️ Big City',
            'countryside': '🌾 Farm Country',
            'national-park': '🏞️ Nature Park',
            // Accommodations
            'hotel': '🏨 Hotel',
            'rental': '🏡 House',
            'camping': '⛺ Camping',
            'cabin': '🏕️ Cabin',
            'cruise': '🚢 Cruise Ship',
            // Activities
            'relaxation': '😌 Relax',
            'adventure': '🚀 Adventure',
            'cultural': '🏛️ Museums',
            'nature': '🦋 Animals',
            'food': '🍕 Yummy Food',
            // Climate
            'tropical': '🌴 Hot & Sunny',
            'temperate': '🌤️ Warm',
            'cool': '🧥 Cool',
            'seasonal': '🍂 Changing',
            // Budget (keeping original since kids don't vote on this)
            'budget': 'Budget-Friendly',
            'moderate': 'Moderate',
            'luxury': 'Luxury',
            'splurge': 'Special Splurge'
        };

        return formatMap[option] || option;
    }

    getDestinationOptions() {
        return ['beach', 'mountains', 'city', 'countryside', 'national-park'];
    }

    getAccommodationOptions() {
        return ['hotel', 'rental', 'camping', 'cabin', 'cruise'];
    }

    getActivityOptions() {
        return ['relaxation', 'adventure', 'cultural', 'nature', 'food'];
    }

    getClimateOptions() {
        return ['tropical', 'temperate', 'cool', 'seasonal'];
    }

    getBudgetOptions() {
        return ['budget', 'moderate', 'luxury', 'splurge'];
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            left: 20px;
            margin: 0 auto;
            max-width: 400px;
            padding: 20px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            font-size: 1.2em;
            text-align: center;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-50px);
            transition: all 0.4s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            info: '#4299e1'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageEl);

        // Animate in
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-50px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 400);
        }, 4000);
    }

    saveVotes() {
        // Since we can't use localStorage in artifacts, we'll store in memory
        // In a real implementation, this would save to localStorage or a server
        console.log('Votes saved:', this.votes);
    }

    loadVotes() {
        // Since we can't use localStorage in artifacts, we'll return empty array
        // In a real implementation, this would load from localStorage or a server
        return [];
    }

    updateDisplay() {
        // Initialize display
        if (this.votes.length > 0) {
            this.showResults();
            this.showSummary();
        }
    }
}

// Initialize the voting system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VacationVoting();
});