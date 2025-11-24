// Card Sets
const CARD_SETS = {
    fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
    sequential: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?', '☕'],
    days: ['½', '1', '1½', '2', '2½', '3', '3½', '4', '4½', '5', '5½', '6', '6½', '7', '7½', '8', '8½', '9', '9½', '10', '10½', '?', '☕'],
    tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
    custom: []
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACUctttx9hWHrFe5Mv_YnoRWmAqy4eVYI",
  authDomain: "scrumpokergithubio.firebaseapp.com",
  databaseURL: "https://scrumpokergithubio-default-rtdb.firebaseio.com",
  projectId: "scrumpokergithubio",
  storageBucket: "scrumpokergithubio.firebasestorage.app",
  messagingSenderId: "553199759268",
  appId: "1:553199759268:web:a3d6f45f483ed3d2d51b31"
};

// Initialize Firebase
let database;
let roomRef = null;

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            console.log('Firebase initialized successfully');
            return true;
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
    return false;
}

// Application State
let appState = {
    currentUser: null,
    currentRoom: null,
    isAdmin: false,
    selectedCard: null,
    cardsRevealed: false,
    useFirebase: false
};

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const roomScreen = document.getElementById('roomScreen');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const revealBtn = document.getElementById('revealBtn');
const resetBtn = document.getElementById('resetBtn');
const cardSetSelect = document.getElementById('cardSet');
const customCardsGroup = document.getElementById('customCardsGroup');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    appState.useFirebase = initFirebase();
    setupEventListeners();
    
    // Check if there's a room code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode) {
        // Pre-fill the room ID field
        document.getElementById('roomId').value = roomCode;
        // Scroll to join room section
        document.getElementById('roomId').scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus on username field
        document.getElementById('joinUsername').focus();
    }
});

function setupEventListeners() {
    // Create Room
    createRoomBtn.addEventListener('click', createRoom);
    
    // Join Room
    joinRoomBtn.addEventListener('click', joinRoom);
    
    // Leave Room
    leaveRoomBtn.addEventListener('click', leaveRoom);
    
    // Reveal Cards
    revealBtn.addEventListener('click', revealCards);
    
    // Reset Round
    resetBtn.addEventListener('click', resetRound);
    
    // Card Set Selection
    cardSetSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customCardsGroup.style.display = 'block';
        } else {
            customCardsGroup.style.display = 'none';
        }
    });
    
    // Story Name Input
    document.getElementById('storyName').addEventListener('input', (e) => {
        if (appState.currentRoom) {
            updateStoryName(e.target.value);
        }
    });
    
    // Copy room code button
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const roomCode = document.getElementById('roomCode').textContent;
            navigator.clipboard.writeText(roomCode).then(() => {
                const originalText = copyCodeBtn.textContent;
                copyCodeBtn.textContent = '✅ Copiado!';
                setTimeout(() => {
                    copyCodeBtn.textContent = originalText;
                }, 2000);
            }).catch(() => {
                alert('Código da sala: ' + roomCode);
            });
        });
    }
    
    // Copy room link button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const roomCode = document.getElementById('roomCode').textContent;
            const baseUrl = window.location.origin + window.location.pathname;
            const roomLink = `${baseUrl}?room=${roomCode}`;
            
            navigator.clipboard.writeText(roomLink).then(() => {
                const originalText = copyLinkBtn.textContent;
                copyLinkBtn.textContent = '✅ Link Copiado!';
                setTimeout(() => {
                    copyLinkBtn.textContent = originalText;
                }, 2000);
            }).catch(() => {
                alert('Link da sala: ' + roomLink);
            });
        });
    }
}

function createRoom() {
    const username = document.getElementById('username').value.trim();
    const cardSetType = document.getElementById('cardSet').value;
    const everyoneAdmin = document.getElementById('everyoneAdmin').checked;
    
    if (!username) {
        alert('Por favor, digite seu nome de usuário');
        return;
    }
    
    if (!appState.useFirebase) {
        alert('Erro: Firebase não configurado. Por favor, configure o Firebase no app.js');
        return;
    }
    
    let cards = CARD_SETS[cardSetType];
    
    if (cardSetType === 'custom') {
        const customCards = document.getElementById('customCards').value.trim();
        if (!customCards) {
            alert('Por favor, digite as cartas personalizadas');
            return;
        }
        cards = customCards.split(',').map(c => c.trim()).filter(c => c);
        cards.push('?', '☕');
    }
    
    // Generate unique room ID
    const roomId = generateRoomId();
    
    // Create room object
    const room = {
        id: roomId,
        name: roomId,
        cards: cards,
        everyoneAdmin: everyoneAdmin,
        participants: {},
        currentStory: '',
        revealed: false,
        createdAt: Date.now()
    };
    
    // Add creator as first participant
    room.participants[username] = {
        name: username,
        vote: null,
        isAdmin: true
    };
    
    console.log('=== DEBUG: Criando sala ===');
    console.log('RoomID gerado:', roomId);
    console.log('Dados da sala:', room);
    
    // Save room to Firebase
    database.ref('rooms/' + roomId).set(room)
        .then(() => {
            console.log('✅ Sala criada no Firebase com sucesso!');
            
            // Verify it was saved
            return database.ref('rooms/' + roomId).once('value');
        })
        .then((snapshot) => {
            console.log('Verificação - Sala existe?', snapshot.exists());
            console.log('Verificação - Dados:', snapshot.val());
            
            // Set current state
            appState.currentUser = username;
            appState.currentRoom = roomId;
            appState.isAdmin = true;
            
            // Show room code to user
            alert(`✅ Sala criada com sucesso!\n\nCódigo da sala: ${roomId}\n\nCompartilhe este código com sua equipe.`);
            
            // Enter room
            enterRoom(roomId);
        })
        .catch((error) => {
            console.error('❌ Erro ao criar sala:', error);
            console.error('Detalhes do erro:', error.message, error.code);
            alert(`Erro ao criar sala: ${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
        });
}

function joinRoom() {
    const username = document.getElementById('joinUsername').value.trim();
    const roomId = document.getElementById('roomId').value.trim().toUpperCase();
    
    if (!username) {
        alert('Por favor, digite seu nome de usuário');
        return;
    }
    
    if (!roomId) {
        alert('Por favor, digite o nome da sala');
        return;
    }
    
    if (!appState.useFirebase) {
        alert('Erro: Firebase não configurado. Por favor, configure o Firebase no app.js');
        return;
    }
    
    console.log('=== DEBUG: Tentando entrar na sala ===');
    console.log('RoomID:', roomId);
    console.log('Username:', username);
    console.log('Firebase ativo:', appState.useFirebase);
    console.log('Database ref:', database);
    
    // List all rooms first for debugging
    database.ref('rooms').once('value')
        .then((allRoomsSnapshot) => {
            console.log('Todas as salas disponíveis:', allRoomsSnapshot.val());
            console.log('Salas existentes:', Object.keys(allRoomsSnapshot.val() || {}));
        })
        .catch((error) => {
            console.error('Erro ao listar salas:', error);
        });
    
    // Check if room exists in Firebase
    database.ref('rooms/' + roomId).once('value')
        .then((snapshot) => {
            console.log('Resposta do Firebase para sala', roomId, ':', snapshot.exists());
            console.log('Dados da sala:', snapshot.val());
            
            if (!snapshot.exists()) {
                alert(`❌ Sala não encontrada!\n\nCódigo digitado: ${roomId}\n\nVerifique o console (F12) para mais detalhes.`);
                return;
            }
            
            const room = snapshot.val();
            
            // Add user to room
            const isAdmin = room.everyoneAdmin || Object.keys(room.participants).length === 0;
            
            const newParticipant = {
                name: username,
                vote: null,
                isAdmin: isAdmin
            };
            
            // Update room in Firebase
            database.ref('rooms/' + roomId + '/participants/' + username).set(newParticipant)
                .then(() => {
                    // Set current state
                    appState.currentUser = username;
                    appState.currentRoom = roomId;
                    appState.isAdmin = isAdmin;
                    
                    // Enter room
                    enterRoom(roomId);
                })
                .catch((error) => {
                    console.error('Error joining room:', error);
                    alert('Erro ao entrar na sala');
                });
        })
        .catch((error) => {
            console.error('Error checking room:', error);
            alert('Erro ao verificar sala');
        });
}

function enterRoom(roomId) {
    // Set up real-time listener for room data
    roomRef = database.ref('rooms/' + roomId);
    
    roomRef.on('value', (snapshot) => {
        if (!snapshot.exists()) {
            alert('Sala foi removida');
            leaveRoom();
            return;
        }
        
        const room = snapshot.val();
        
        // Update room display
        document.getElementById('roomName').textContent = `Sala: ${room.name}`;
        document.getElementById('roomCode').textContent = roomId;
        document.getElementById('participantCount').textContent = Object.keys(room.participants || {}).length;
        document.getElementById('currentStoryName').textContent = room.currentStory || '-';
        document.getElementById('storyName').value = room.currentStory || '';
        
        // Update revealed state
        appState.cardsRevealed = room.revealed;
        
        // Render participants
        renderParticipants(room);
        
        // Show stats if revealed
        if (room.revealed) {
            showVotingStats(room);
        } else {
            document.getElementById('votingStats').style.display = 'none';
        }
        
        // Update card selection UI
        if (appState.currentUser && room.participants[appState.currentUser]) {
            const myVote = room.participants[appState.currentUser].vote;
            document.querySelectorAll('.poker-card').forEach(card => {
                if (card.dataset.value === myVote) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }
    });
    
    // Hide home screen, show room screen
    homeScreen.classList.remove('active');
    roomScreen.classList.add('active');
    
    // Show/hide admin controls
    if (appState.isAdmin) {
        document.getElementById('adminControls').style.display = 'block';
    } else {
        document.getElementById('adminControls').style.display = 'none';
    }
    
    // Render cards
    roomRef.once('value').then((snapshot) => {
        const room = snapshot.val();
        renderCardOptions(room.cards);
    });
}

function leaveRoom() {
    // Remove listener
    if (roomRef) {
        roomRef.off();
        roomRef = null;
    }
    
    if (appState.currentRoom && appState.currentUser) {
        // Remove user from room in Firebase
        database.ref('rooms/' + appState.currentRoom + '/participants/' + appState.currentUser).remove()
            .then(() => {
                // Check if room is empty and delete it
                return database.ref('rooms/' + appState.currentRoom + '/participants').once('value');
            })
            .then((snapshot) => {
                if (!snapshot.exists() || Object.keys(snapshot.val() || {}).length === 0) {
                    // Delete empty room
                    return database.ref('rooms/' + appState.currentRoom).remove();
                }
            })
            .catch((error) => {
                console.error('Error leaving room:', error);
            });
    }
    
    // Reset state
    appState.currentUser = null;
    appState.currentRoom = null;
    appState.isAdmin = false;
    appState.selectedCard = null;
    appState.cardsRevealed = false;
    
    // Show home screen
    roomScreen.classList.remove('active');
    homeScreen.classList.add('active');
    
    // Clear inputs
    document.getElementById('username').value = '';
    document.getElementById('joinUsername').value = '';
    document.getElementById('roomId').value = '';
}

function renderCardOptions(cards) {
    const cardOptions = document.getElementById('cardOptions');
    cardOptions.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'poker-card';
        cardElement.textContent = card;
        cardElement.dataset.value = card;
        
        cardElement.addEventListener('click', () => {
            selectCard(card);
        });
        
        cardOptions.appendChild(cardElement);
    });
}

function selectCard(cardValue) {
    if (appState.cardsRevealed) {
        alert('Aguarde a próxima rodada para votar');
        return;
    }
    
    appState.selectedCard = cardValue;
    
    // Update UI
    document.querySelectorAll('.poker-card').forEach(card => {
        if (card.dataset.value === cardValue) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Save vote to Firebase
    database.ref('rooms/' + appState.currentRoom + '/participants/' + appState.currentUser + '/vote')
        .set(cardValue)
        .catch((error) => {
            console.error('Error saving vote:', error);
            alert('Erro ao salvar voto');
        });
}

function revealCards() {
    if (!appState.isAdmin) return;
    
    database.ref('rooms/' + appState.currentRoom + '/revealed').set(true)
        .catch((error) => {
            console.error('Error revealing cards:', error);
            alert('Erro ao revelar cartas');
        });
}

function resetRound() {
    if (!appState.isAdmin) return;
    
    // Get all participants and reset their votes
    database.ref('rooms/' + appState.currentRoom + '/participants').once('value')
        .then((snapshot) => {
            const participants = snapshot.val() || {};
            const updates = {};
            
            Object.keys(participants).forEach(username => {
                updates[username + '/vote'] = null;
            });
            
            return database.ref('rooms/' + appState.currentRoom + '/participants').update(updates);
        })
        .then(() => {
            return database.ref('rooms/' + appState.currentRoom + '/revealed').set(false);
        })
        .catch((error) => {
            console.error('Error resetting round:', error);
            alert('Erro ao resetar rodada');
        });
    
    appState.selectedCard = null;
}

function updateStoryName(storyName) {
    database.ref('rooms/' + appState.currentRoom + '/currentStory').set(storyName)
        .catch((error) => {
            console.error('Error updating story:', error);
        });
}

function renderParticipants(room) {
    const grid = document.getElementById('participantsGrid');
    grid.innerHTML = '';
    
    Object.values(room.participants).forEach(participant => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        
        const name = document.createElement('div');
        name.className = 'participant-name';
        name.textContent = participant.name;
        if (participant.isAdmin) {
            name.textContent += ' 👑';
        }
        
        const cardDisplay = document.createElement('div');
        cardDisplay.className = 'participant-card-display';
        
        if (!participant.vote) {
            cardDisplay.classList.add('no-vote');
        } else if (room.revealed) {
            cardDisplay.classList.add('revealed');
            cardDisplay.classList.add('revealing');
            cardDisplay.textContent = participant.vote;
        } else {
            cardDisplay.classList.add('hidden');
        }
        
        card.appendChild(name);
        card.appendChild(cardDisplay);
        grid.appendChild(card);
    });
}

function showVotingStats(room) {
    const votes = {};
    let totalVotes = 0;
    
    // Count votes
    Object.values(room.participants || {}).forEach(participant => {
        if (participant.vote && participant.vote !== '?' && participant.vote !== '☕') {
            votes[participant.vote] = (votes[participant.vote] || 0) + 1;
            totalVotes++;
        }
    });
    
    // Show stats
    const statsDiv = document.getElementById('votingStats');
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = '';
    
    if (totalVotes === 0) {
        statsContent.innerHTML = '<p>Nenhum voto registrado</p>';
    } else {
        // Calculate average (for numeric values)
        const numericVotes = [];
        Object.keys(votes).forEach(vote => {
            const numValue = parseFloat(vote);
            if (!isNaN(numValue)) {
                for (let i = 0; i < votes[vote]; i++) {
                    numericVotes.push(numValue);
                }
            }
        });
        
        if (numericVotes.length > 0) {
            const average = (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1);
            const avgDiv = document.createElement('div');
            avgDiv.className = 'stats-item';
            avgDiv.innerHTML = `<strong>Média:</strong> <span>${average}</span>`;
            statsContent.appendChild(avgDiv);
        }
        
        // Show vote distribution
        Object.keys(votes).sort((a, b) => {
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return a.localeCompare(b);
        }).forEach(vote => {
            const count = votes[vote];
            const percentage = ((count / totalVotes) * 100).toFixed(0);
            
            const item = document.createElement('div');
            item.className = 'stats-item';
            item.innerHTML = `
                <strong>${vote}:</strong>
                <div style="flex: 1; margin: 0 15px;">
                    <div class="stats-bar" style="width: ${percentage}%;">${count} (${percentage}%)</div>
                </div>
            `;
            statsContent.appendChild(item);
        });
    }
    
    statsDiv.style.display = 'block';
}

function startRoomUpdates() {
    // Not needed anymore - Firebase provides real-time updates
}

// Utility Functions
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
