let newPasswordValue;
let confirmationValue;

const submitBtn = document.getElementById('update-profile');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('password-confirmation');
const validationMessage = document.getElementById('validation-message');

function validatePasswords(message, add, remove) {
    validationMessage.textContent = message;
    validationMessage.classList.add(add);
    validationMessage.classList.remove(remove);
}

confirmation.addEventListener('input', e => {
    e.preventDefault();
    newPasswordValue = newPassword.value;
    confirmationValue = confirmation.value;

    if (newPasswordValue !== confirmationValue) {
        validatePasswords('Passwords must match!', 'color-red', 'color-green');
        submitBtn.setAttribute('disabled', true);
    } else {
        validatePasswords('Passwords match!', 'color-green', 'color-red');
        submitBtn.removeAttribute('disabled');
    }
});

// form.addEventListener('submit', e => {
//     if (newPasswordValue !== confirmationValue) {
//         e.preventDefault();
//         const error = document.getElementById('error');
//         if (!error) {
//             const flashErrorH1 = document.createElement('h1');
//             flashErrorH1.classList.add("color-red");
//             flashErrorH1.setAttribute("id", "error");
//             flashErrorH1.textContent = "Password must match!";
//             const navbar = document.getElementById('navbar');
//             navbar.parentNode.insertBefore(flashErrorH1, navbar.nextSibling);
//         }
//     }
// })