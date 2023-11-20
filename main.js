/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
const cpuIcon = 'O'
const playerIcon = 'X'
let AIMove
// settings for liveBoard: 1 is cpuIcon, -1 is playerIcon, 0 is empty
let liveBoard = [1, -1, -1, -1, 1, 1, 1, -1, -1]
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

// UI
function renderBoard (board) {
  board.forEach(function (el, i) {
    const squareId = '#' + i.toString()
    // eval if is player el, then show player's icon
    if (el === -1) {
      $(squareId).text(playerIcon)
    } else if (el === 1) {
      $(squareId).text(cpuIcon)
    }
  })

  $('.square:contains(X)').addClass('x-marker')
  $('.square:contains(O)').addClass('o-marker')
}

function animateWinLine () {
  const idxOfArray = winningLines.map(function (winLines) {
    return winLines.map(function (winLine) {
      return liveBoard[winLine]
    }).reduce(function (prev, cur) {
      return prev + cur
    })
  })
  const squaresToAnimate = winningLines[idxOfArray.indexOf(Math.abs(3))]

  squaresToAnimate.forEach(function (el) {
    $('#' + el).css('background', 'yellowgreen')
    $('#' + el).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200)
  })
}

// MODALS
function chooseMarker () {
  $('#sign-out').click(function () {
    localStorage.removeItem('playerInfo')
    location.reload()
  })

  if (getItem('playerInfo')) {
    $('.board-stats').css('display', 'flex')
    $('#player').text(getItem('playerInfo').name)
    $('#counter-player').text(getItem('counter-player') || 0)
    $('#counter-cpu').text(getItem('counter-cpu') || 0)
    $('#plays').text(getItem('plays') || 0)
    $('#turn-name').text(`${getItem('playerInfo').name} 🧑`)
    startNewGame()
    return
  }
  $('.modal-container').css('display', 'block')
  $('.choose-modal').addClass('animated bounceInUp')

  $('.choose-modal').submit(function (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = {
      code: formData.get('code'),
      name: formData.get('name')
    }
    setItem('playerInfo', data)

    $('.choose-modal').addClass('animated bounceOutDown')
    setTimeout(function () {
      $('.modal-container').css('display', 'none')
      $('.choose-modal').css('display', 'none')
      $('.board-stats').css('display', 'flex')
      $('#player').text(getItem('playerInfo').name)
      $('#counter-player').text(getItem('counter-player') || 0)
      $('#counter-cpu').text(getItem('counter-cpu') || 0)
      $('#plays').text(getItem('plays') || 0)
      $('#turn-name').text(getItem('playerInfo').name)
      startNewGame()
      startNewGame()
    }, 700)

    $('.button-area span').off()
  })
}

function endGameMessage () {
  const result = checkVictory(liveBoard)

  $('#counter-player').text(getItem('counter-player') || 0)
  $('#counter-cpu').text(getItem('counter-cpu') || 0)

  if (getItem('plays')) {
    setItem('plays', getItem('plays') + 1)
    $('#plays').text(getItem('plays'))
  } else {
    setItem('plays', 1)
    $('#plays').text(1)
  }

  if (result === 'lose') {
    setItem('counter-player', getItem('counter-player') ? getItem('counter-player') + 1 : 1)
    $('#counter-player').text(getItem('counter-player'))
  } else if (result === 'win') {
    setItem('counter-cpu', getItem('counter-cpu') ? getItem('counter-cpu') + 1 : 1)
    $('#counter-cpu').text(getItem('counter-cpu'))
  }

  $('.end-game-modal h3').text(result === 'win' ? 'Perdiste' : 'Es un empate')

  $('.modal-container').css('display', 'block')
  $('.choose-modal').css('display', 'none')
  $('.end-game-modal').css('display', 'block').removeClass('animated bounceOutDown').addClass('animated bounceInUp')

  $('.button-area span').click(function () {
    $('.end-game-modal').removeClass('animated bounceInUp').addClass('animated bounceOutDown')

    setTimeout(function () {
      $('.modal-container').css('display', 'none')
      startNewGame()
    }, 700)
    $('.square').css('background', 'inherit')

    $('.button-area span').off()
  })
}

// GAMEPLAY
function startNewGame () {
  liveBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  $('.square').text('').removeClass('o-marker x-marker')
  renderBoard(liveBoard)
  playerTakeTurn()
}

function playerTakeTurn () {
  $('.square:empty').hover(function () {
    $(this).text(playerIcon).css('cursor', 'pointer')
  }, function () {
    $(this).text('')
  })

  $('.square:empty').click(function () {
    $(this).css('cursor', 'default')
    liveBoard[parseInt($(this).attr('id'))] = -1
    renderBoard(liveBoard)

    if (checkVictory(liveBoard)) {
      setTimeout(endGameMessage, (checkVictory(liveBoard) === 'win') ? 700 : 100)
    } else {
      $('#turn-name').text('CPU 🤖')
      setTimeout(aiTakeTurn, 1500)
    }
    $('.square').off()
  })
}

function aiTakeTurn () {
  miniMax(liveBoard, 'aiPlayer')
  liveBoard[AIMove] = 1
  renderBoard(liveBoard)
  if (checkVictory(liveBoard)) {
    animateWinLine()
    setTimeout(endGameMessage, checkVictory(liveBoard) === 'win' ? 700 : 100)
  } else {
    $('#turn-name').text(`${getItem('playerInfo').name} 🧑`)
    playerTakeTurn()
  }
}

// UTILITIES
function checkVictory (board) {
  const squaresInPlay = board.reduce(function (prev, cur) {
    return Math.abs(prev) + Math.abs(cur)
  })

  const outcome = winningLines.map(function (winLines) {
    return winLines.map(function (winLine) {
      return board[winLine]
    }).reduce(function (prev, cur) {
      return prev + cur
    })
  }).filter(function (winLineTotal) {
    return Math.abs(winLineTotal) === 3
  })

  if (outcome[0] === 3) {
    return 'win'
  } else if (outcome[0] === -3) {
    return 'lose'
  } else if (squaresInPlay === 9) {
    return 'draw'
  } else {
    return false
  }
}

function availableMoves (board) {
  return board.map(function (el, i) {
    if (!el) {
      return i
    }
  }).filter(function (e) {
    return (typeof e !== 'undefined')
  })
}

function getItem (key) {
  return JSON.parse(localStorage.getItem(key))
}

function setItem (key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// AI
function miniMax (state, player) {
  // base cases: check for an end state and if met - return the score from the perspective of the AI player.
  const rv = checkVictory(state)
  if (rv === 'win') {
    return 10
  }
  if (rv === 'lose') {
    return -10
  }
  if (rv === 'draw') {
    return 0
  }

  const moves = []
  const scores = []
  // for each of the available squares: recursively make moves and push the score + accompanying move to the moves + scores array
  availableMoves(state).forEach(function (square) {
    state[square] = (player === 'aiPlayer') ? 1 : -1
    scores.push(miniMax(state, (player === 'aiPlayer') ? 'opponent' : 'aiPlayer'))
    moves.push(square)
    state[square] = 0
  })

  // calculate and return the best score gathered from each of the available moves. track the best movein the AIMove letiable

  if (player === 'aiPlayer') {
    AIMove = moves[scores.indexOf(Math.max.apply(Math, scores))]
    return Math.max.apply(Math, scores)
  } else {
    AIMove = moves[scores.indexOf(Math.min.apply(Math, scores))]
    return Math.min.apply(Math, scores)
  }
}

renderBoard(liveBoard)
chooseMarker()
