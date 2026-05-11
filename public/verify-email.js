
        // THIS IS HOW WE GET TOKEN FROM THE URL BAR
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');    // Gets from URL
        const email = urlParams.get('email');    // Gets from URL

     console.log("Sending email to:", user.email)
console.log("Using email user:", process.env.EMAIL_USER)

        async function verifyEmail() {
            try {
                // Calling the token i get from my browser URL
                const response = await fetch(`http://localhost:3000/api/v1/auth/verify-email?token=${token}&email=${email}`);
                conso
                const result = await response.json();
                
                if (response.ok) {
                    document.getElementById('loader').style.display = 'none';
                    document.getElementById('status').innerHTML = '<h1 class="success"> Email Verified Successfully!</h1>';
                    document.getElementById('message').innerHTML = '<p>You can now login to your account.</p>';
                    
                    setTimeout(() => {
                        window.location.href = 'http://localhost:3000/login-user.html';
                    }, 3000);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                document.getElementById('loader').style.display = 'none';

                document.getElementById('status').innerHTML = '<h1 class="error"> Verification Failed</h1>';

                document.getElementById('message').innerHTML = `<p>${error.message}</p><button onclick="window.location.href='http://localhost:3000/login-user.html'">Sign Up Again</button>`;
            }
        }

        if (token && email) {
            verifyEmail();
        } git
        
        else {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('status').innerHTML = '<h1 class="error"> Invalid Link</h1>';
            document.getElementById('message').innerHTML = '<p>No verification token found.</p>';
        }
  