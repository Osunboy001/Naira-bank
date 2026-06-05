const BASE_URL = 'http://localhost:3000/api/v1';

const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

let selectedImage = null;

//  LOAD USER 
async function loadUser() {
  if (!userId) {
    alert('No user ID found in URL');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/user/${userId}`, {
      credentials: 'include'
    });

    const text = await res.text();

    if (!res.ok) {
      console.log('Server response:', text);
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = JSON.parse(text);

    const user = data.user;
    if (!user) throw new Error('User not found in response');

    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('account').value = user.accountnumber || '';

    const profileImg = document.getElementById('profileImg');

    profileImg.src = user.profilePicture
      ? `http://localhost:3000${user.profilePicture}`
      : 'https://via.placeholder.com/150';;

  } catch (err) {
    console.error('Load user error:', err);
    alert(err.message);
  }
}

// MAGE PREVIEW 
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be less than 5MB');
    return;
  }

  selectedImage = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('profileImg').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// -------------------- UPDATE USER --------------------
async function updateUser() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message');

  if (!name || !email) {
    message.textContent = 'Please fill all fields';
    message.style.color = 'red';
    return;
  }

  try {
    console.log("updateUser hit");

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    if (selectedImage) {
      formData.append('profilePicture', selectedImage);
    }

    const res = await fetch(`${BASE_URL}/admin/user/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    const text = await res.text();

    if (!res.ok) {
      console.log('Server error:', text);
      throw new Error('Failed to update user');
    }

    const data = JSON.parse(text);

    message.textContent = 'User updated successfully';
    message.style.color = 'green';

    selectedImage = null;

    setTimeout(loadUser, 800);
    window.location.href = 'http://localhost:3000/admin.html'

  } catch (err) {
    console.error('Update error:', err);
    message.textContent = err.message;
    message.style.color = 'red';
  }
}

loadUser();