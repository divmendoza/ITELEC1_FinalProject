
const track = document.querySelector('.carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
const cardWidth = 320; // card width + gap
const totalCards = document.querySelectorAll('.card').length;
const visibleCards = 3;

nextBtn.addEventListener('click', () => {
  if (currentIndex < totalCards - visibleCards) {
    currentIndex++;
    track.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    track.style.transform = `translateX(-${cardWidth * currentIndex}px)`;
  }
});
