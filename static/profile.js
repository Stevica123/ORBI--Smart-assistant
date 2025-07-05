const profileCircle = document.getElementById('profileCircle');
const profileDropdown = document.getElementById('profileDropdown');

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}


const username = profileCircle.getAttribute('title');
if (username) {
  const color = stringToColor(username);
  profileCircle.style.backgroundColor = color;
}

profileCircle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (profileDropdown.style.display === 'none') {
    profileDropdown.style.display = 'block';
  } else {
    profileDropdown.style.display = 'none';
  }
});

document.addEventListener('click', () => {
  profileDropdown.style.display = 'none';
});
